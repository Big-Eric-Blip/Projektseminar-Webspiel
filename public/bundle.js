(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//constant variables
const url = "ws://127.0.0.1:3000";
const Renderer = require('../View/Renderer');

//dynamic variables
let currentGame = {
    gameId: "",
    playerId: "",
    gameState: "PRE_GAME", //also available: LOBBY, GAME_RUNNING, GAME_OVER
    currentTokenId: '',
    playerColor: "",
    playerName: "", //also available: LOBBY, GAME_RUNNING, GAME_OVER
    winners: []
}
let availableGameActions = [];
let renderer;
const messages = [];
let players = [];
let dieColor;
let socket = null;
let isSocketOpen = false;
let mute = false;

function initWebSocketConnection() {
    socket = new WebSocket(url);

    // Connect to server
    socket.addEventListener('open', function (event) {
        isSocketOpen = true;
    });

    // Handle incoming messages
    socket.addEventListener('message', fromServerMessage);

    // Error handling on connection
    socket.addEventListener('error', function (error) {
        console.error('Connection Error:', error);
        isSocketOpen = false;
    });

    // Close connection
    socket.addEventListener('close', function (event) {
        isSocketOpen = false;
    });
}

function fromServerMessage(event) {
    const message = JSON.parse(event.data);
    switch (message.type) {
        case 'createGame':
            handleCreateGameResponse(message);
            break;
        case 'joinGame':
            handleJoinGameResponse(message);
            break;
        case 'playerJoined':
            handlePlayerJoinedResponse(message);
            break;
        case 'aPlayerLeftGame':
            handleAPlayerLeftGame(message);
            break;
        case 'leftGame':
            handleLeftGame(message);
            break;
        case 'gameStarted':
            handleGameStarted(message);
            break;
        case 'pickedColor':
            handlePickedColor(message)
            break;
        case 'colorTaken':
            handleColorTaken(message)
            break;
        case 'nameTaken':
            handleNameTaken(message)
            break;
        case 'newPlayer':
            handleNewPlayer(message)
            break;
        case 'message':
            handleServerMessage(message);
            break;
        case 'updateGame':
            handleGameUpdate(message);
            break;
        case 'chatMessage':
            handleIncomingChatMessages(message);
            break;
        default:
            console.log(`Client: Sorry, we are out of ${message.type}.`);
    }
}

function sendMessage(message) {
    if (!socket || !isSocketOpen) {
        console.log('Socket not open. Initializing WebSocket...');
        initWebSocketConnection();

        // Wait for the socket to open before sending the message
        socket.addEventListener('open', function () {
            socket.send(JSON.stringify(message));
        }, {once: true});
    } else {
        socket.send(JSON.stringify(message));
    }
}


document.addEventListener('DOMContentLoaded', function () {
    // <id of the button being clicked>: name of the function below
    const buttonFunctions = {
        //Create Game
        createGamePopupButton: openCreateGamePopup,
        closeCreateGamePopupButton: closeCreateGamePopup,
        createGameButton: createGame,
        openRulesPopupButton: openRulesPopup,
        closeRulePopupButton: closeRulePopup,
        openRulesPopupIngameButton: openRulesPopup,
        //Join Game
        joinGamePopupButton: openJoinGamePopup,
        closeJoinGamePopupButton: closeJoinGamePopup,
        joinGameButton: joinGame,
        closeGameOverPopup: closeGameOver,

        //Succesfull Join
        startJoinedGameButton: startJoinedGame,
        cancelButton: cancel,
        muteMusicButton: muteMusic,

        //Lobby
        startGameButton: startGame,
        leaveGameButton: leaveGame,
        landingPageButton: returnToLandingPage,

        //Game Buttons
        rollDiceButton: rollDice,

        // Copy Game ID
        copyGameIdButton: copyGameIdToClipboard,

        // Send a chat message
        sendButton: sendChatMessage
    };

    const buttons = document.querySelectorAll('.server-communication-button');

    buttons.forEach(button => {
        const buttonFunction = buttonFunctions[button.id];
        if (buttonFunction) {
            button.addEventListener('click', buttonFunction);
        } else {
            console.error(`Button or function for button with id "${button.id}" not found.`);
        }
    });
});

function muteMusic() {
    const audioElement = document.getElementById('elevator');
    const muteButton = document.getElementById('muteMusicButton');
    
    if (audioElement.muted) {
        audioElement.muted = false;
        muteButton.textContent = 'Mute';}
        else{audioElement.muted = true;
            muteButton.textContent = 'Unmute';}

    }




function openJoinGamePopup() {
    document.getElementById('joinGamePopup').style.display = 'block';
}

function closeJoinGamePopup() {
    document.getElementById('joinGamePopup').style.display = 'none';
}

function closeGameOver() {
    document.getElementById('gameOverPopup').style.display = 'none';
}

function openCreateGamePopup() {
    document.getElementById('createGamePopup').style.display = 'block';
    const createGameForm = document.getElementById('createGameForm')
    createGameForm.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
}

function closeRulePopup() {
    document.getElementById('rulesPopup').style.display = 'none';
}

function closeCreateGamePopup() {
    document.getElementById('createGameErrorMessage').textContent = '';
    document.getElementById('createGamePopup').style.display = 'none';
}

function openRulesPopup() {
    document.getElementById('rulesPopup').style.display = 'block';
}

function cancel() {
    leaveGame()
    document.getElementById('succesfullJoinPopup').style.display = 'none';
    setGameState("PRE_GAME")
    document.getElementById('myCanvas').style.display = 'none';
}

function copyGameIdToClipboard() {
    const gameIdText = currentGame.gameId;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(gameIdText).then(() => {
            showCopyNotification();
        }).catch(err => {
            console.error('Fehler beim Kopieren der Game ID: ', err);
        });
    } else {
        console.error('Clipboard API nicht verfügbar.');
    }
}

function showCopyNotification() {
    const notificationElement = document.getElementById('copyNotification');
    notificationElement.style.display = 'block';
    setTimeout(() => {
        notificationElement.style.display = 'none';
    }, 2000);
}


function createGame() {
    const selectedColor = document.querySelector('input[name="playerColor"]:checked').value;
    const playerName = document.getElementById('adminNameInput').value;
    dieColor = document.querySelector('input[name="dieOptionServer"]:checked').value;
    changeRollDiceImage("./pictures/" + dieColor + ".png")


    if (playerName != '') {
        setGameState("LOBBY")
        document.getElementById('createGamePopup').style.display = 'none';

        sendMessage({
            type: 'createGame',
            boardType: "default",
            playerName: playerName,
            playerColor: selectedColor
        });

    } else {
        document.getElementById('createGameErrorMessage').textContent = 'Do not forget to Enter a Name!'
        makeTextBlink('createGameErrorMessage')
    }

    //the game state influences the CSS of the game

}

// Function to change the roll dice button image
function changeRollDiceImage(newSrc) {
    const rollDiceButtonImg = document.querySelector('#rollDiceButton img');
    if (rollDiceButtonImg) {
        rollDiceButtonImg.src = newSrc;
    }
}

function audioOn() {
    const muteMusic = document.getElementById('muteMusicButton');
    const elevator = document.getElementById('elevator');
    elevator.play();
    muteMusic.textContent = 'Mute';

}

window.onbeforeunload = function() {
    return "If you close this window, you will leave the game. Are you sure?";
 };

function makeTextBlink(elementId) {
    const element = document.getElementById(elementId);
    let blinkCount = 0;

    const blinkInterval = setInterval(() => {
        if (blinkCount >= 5) {
            clearInterval(blinkInterval);
        } else {
            if (element.style.color === 'black') {
                element.style.color = 'red';
            } else {
                element.style.color = 'black';
            }
            blinkCount++;
        }
    }, 100);
    blinkCount = 0
}

function returnToLandingPage() {
    muteMusic()
    setGameState('PRE_GAME')
}

function startGame() {
    setGameState('GAME_RUNNING')
    sendMessage({
        type: 'startGame',
        gameId: currentGame.gameId
    });

}

function leaveGame() {
    players = [];
    if (currentGame.playerColor == 'blue') {
        document.getElementById('blueOption').querySelector('input').disabled = false
        document.getElementById('blueImage').src = "pictures/figureBlue.png"
    } else if (currentGame.playerColor == 'yellow') {
        document.getElementById('yellowOption').querySelector('input').disabled = false
        document.getElementById('yellowImage').src = "pictures/figureYellow.png"
    } else if (currentGame.playerColor == 'green') {
        document.getElementById('greenOption').querySelector('input').disabled = false
        document.getElementById('greenImage').src = "pictures/figureGreen.png"
    } else if (currentGame.playerColor == 'red') {
        document.getElementById('redOption').querySelector('input').disabled = false
        document.getElementById('redImage').src = "pictures/figureRed.png"
    }
    setGameState('GAME_OVER')
    sendMessage({
        type: 'leaveGame',
        gameId: currentGame.gameId
    });
}

function setGameState(state) {
    switch (state) {
        case "PRE_GAME":
            setPreGame();
            break
        case "LOBBY":
            setLobby();
            break
        case "GAME_RUNNING":
            setGameRunning();
            break
        case "GAME_OVER":
            endGame();
            break
        default:
            console.log("The game state " + state + " is not available")
    }
}

function setPreGame() {
    currentGame.gameState = "PRE_GAME"
    const gameOverElements = document.querySelectorAll('.game-over')
    const preGameElements = document.querySelectorAll('.pre-game')
    gameOverElements.forEach((element) => element.style.display = 'none')
    preGameElements.forEach((element) => element.style.display = 'flex')
    //if necessary reset body attributes
    document.getElementById('body').style.backgroundColor = '#f7ca4d'
    document.getElementById('body').style.marginTop = '100px'
    document.getElementById('main-area').style.marginLeft = '0'

}

function setLobby() {
    currentGame.gameState = "LOBBY"
    const preGameElements = document.querySelectorAll('.pre-game')
    preGameElements.forEach((element) => element.style.display = 'none')
    const lobbyElements = document.querySelectorAll('.lobby')
    lobbyElements.forEach((element) => element.style.display = 'flex')
    document.getElementById('body').style.backgroundColor = 'azure'
    document.getElementById('body').style.marginTop = '20px'
    document.getElementById('main-area').style.marginLeft = '40px'
    attachListenerToChatInput()
    audioOn();
}

function setGameRunning() {
    currentGame.gameState = "GAME_RUNNING"
    const lobbyElements = document.querySelectorAll('.lobby')
    const gameRunningElements = document.querySelectorAll('.game-running')
    lobbyElements.forEach((element) => element.style.display = 'none')
    gameRunningElements.forEach((element) => element.style.display = 'flex')
}

function endGame() {
    displayLeaveGameMessage()
    currentGame.gameState = "GAME_OVER"
    const lobbyElements = document.querySelectorAll('.lobby')
    const gameRunningElements = document.querySelectorAll('.game-running')
    const gameOverElements = document.querySelectorAll('.game-over')
    lobbyElements.forEach((element) => element.style.display = 'none')
    gameRunningElements.forEach((element) => element.style.display = 'none')
    gameOverElements.forEach((element) => element.style.display = 'flex')
}

function displayLeaveGameMessage() {
    if (currentGame.gameState === "LOBBY") {
        // Don't show the game id when the game has already startedd
        addMessageToChat('You left the game.\n Game id: ' + currentGame.gameId)
    } else {
        addMessageToChat('You left the game.')
    }
}

function handleCreateGameResponse(response) {
    currentGame.gameId = response.gameId;
    currentGame.playerId = response.playerId;
    currentGame.playerName = response.playerName;
    currentGame.playerColor = response.playerColor;
    players.push({name: response.playerName, color: response.playerColor, playerId: response.playerId})
    renderPlayerPanels()

    addMessageToChat("Nice. You've created a game. Send the game id to your friends to join your game: "
        + currentGame.gameId)
    initRenderer(response)
}

function joinGame() {
    const inputField = document.getElementById('joinGameInputId');
    currentGame.gameId = inputField.value;
    sendMessage({
        type: 'joinGame',
        gameId: currentGame.gameId
    });

}

function handleColorTaken(response) {
    if (response.color == "blue") {
        document.getElementById('blueOption').querySelector('input').disabled = true
        document.getElementById('blueImage').src = "pictures/figureBlueCross.png"
    }

    if (response.color == "yellow") {
        document.getElementById('yellowOption').querySelector('input').disabled = true
        document.getElementById('yellowImage').src = "pictures/figureYellowCross.png"
    }

    if (response.color == "green") {
        document.getElementById('greenOption').querySelector('input').disabled = true
        document.getElementById('greenImage').src = "pictures/figureGreenCross.png"
    }

    if (response.color == "red") {
        document.getElementById('redOption').querySelector('input').disabled = true
        document.getElementById('redImage').src = "pictures/figureRedCross.png"

    }
    document.getElementById('joinGameErrorMessage').textContent = 'This color is already taken! Please choose another one.'
    makeTextBlink('joinGameErrorMessage')
}

function handleNameTaken(response) {
    document.getElementById('joinGameErrorMessage').textContent = 'This name is already taken! Please choose another one.'
    makeTextBlink('joinGameErrorMessage')
}

function handleJoinGameResponse(response) {
    if (response.playerId) {

        document.getElementById('joinGamePopup').style.display = 'none'
        document.getElementById('succesfullJoinPopup').style.display = 'block'
        const successfullJoinForm = document.getElementById('successfullJoinForm')
        successfullJoinForm.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
        });

        //Make taken colors unavailable
        if (response.takenColors.includes("blue")) {
            document.getElementById('blueOption').querySelector('input').disabled = true
            document.getElementById('blueImage').src = "pictures/figureBlueCross.png"
        }

        if (response.takenColors.includes("yellow")) {
            document.getElementById('yellowOption').querySelector('input').disabled = true
            document.getElementById('yellowImage').src = "pictures/figureYellowCross.png"
        }

        if (response.takenColors.includes("green")) {
            document.getElementById('greenOption').querySelector('input').disabled = true
            document.getElementById('greenImage').src = "pictures/figureGreenCross.png"
        }

        if (response.takenColors.includes("red")) {
            document.getElementById('redOption').querySelector('input').disabled = true
            document.getElementById('redImage').src = "pictures/figureRedCross.png"

        }
        players.push(...response.players)
        renderPlayerPanels();
        currentGame.playerId = response.playerId;
        setGameState('LOBBY');
        document.getElementById('startGameButton').style.display = 'none';
        document.getElementById('leaveGameButton').style.display = 'block';
        document.getElementById('openRulesPopupIngameButton').style.display = 'block';
        addMessageToChat("Send the game id to your friends to join your game: " + currentGame.gameId)
        initRenderer(response)


    } else {
        let serverResponseText = document.getElementById("joinGamePopupServerResponse");
        serverResponseText.innerHTML = response.message;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    renderer = new Renderer("myCanvas");
});

function initRenderer(response) {
    renderer = new Renderer("myCanvas");

    renderer.canvas.addEventListener('click', function (e) {
        onCanvasClick(e)
    })
    renderer.fields = response.fields;
    renderer.drawFields();
    renderer.drawTokens();
}

function startJoinedGame() {
    const selectedColorElement = document.querySelector('input[name="clientColor"]:checked');
    const selectedColor = selectedColorElement ? selectedColorElement.value : null;
    const playerName = document.getElementById('clientNameInput').value;
    const dieColorElement = document.querySelector('input[name="dieOptionClient"]:checked');
    dieColor = dieColorElement ? dieColorElement.value : null;

    if (dieColor) {
        changeRollDiceImage("./pictures/" + dieColor + ".png");
    }

    if (playerName !== '' && selectedColor !== null) {
        sendMessage({
            type: 'tryPickColor',
            gameId: currentGame.gameId,
            playerColor: selectedColor,
            playerName: playerName,
            playerId: currentGame.playerId
        });
    } else {
        let errorMessage = 'Do not forget to ';
        if (playerName === '') {
            errorMessage += 'Enter a Name ';
        }
        if (selectedColor === null) {
            if (playerName === '') {
                errorMessage += 'and ';
            }
            errorMessage += 'Pick an available Color!';
        }
        document.getElementById('joinGameErrorMessage').textContent = errorMessage;
        makeTextBlink('joinGameErrorMessage');
    }
}

function handleNewPlayer(response) {
    players.push({name: response.name, color: response.color, playerId: response.playerId})
    renderPlayerPanels();
    if (currentGame.playerColor == '') {
        if (response.color == "blue") {
            document.getElementById('blueOption').querySelector('input').disabled = true
            document.getElementById('blueImage').src = "pictures/figureBlueCross.png"
        } else if (response.color == "yellow") {
            document.getElementById('yellowOption').querySelector('input').disabled = true
            document.getElementById('yellowImage').src = "pictures/figureYellowCross.png"
        } else if (response.color == "green") {
            document.getElementById('greenOption').querySelector('input').disabled = true
            document.getElementById('greenImage').src = "pictures/figureGreenCross.png"
        } else if (response.color == "red") {
            document.getElementById('redOption').querySelector('input').disabled = true
            document.getElementById('redImage').src = "pictures/figureRedCross.png"
        }

    }
}

function handlePickedColor(response) {
    currentGame.playerName = response.playerName
    currentGame.playerColor = response.playerColor
    renderPlayerPanels();
    document.getElementById('succesfullJoinPopup').style.display = 'none'
}

/**
 * Checks the eligibility of the player clicking on the die symbol and if the player is eligible for the action
 * ROLL_DIE, a message is sent to the server communicating the action. Otherwise, an error message is printed
 * to the chat.
 */
function rollDice() {
    //check if action allowed
    if (isPlayerEligibleForGameAction('ROLL_DIE')) {
        sendMessage({type: 'rollDice', gameId: currentGame.gameId});
    } else {
        //send message to the chat
        addMessageToChat("It's not your turn to roll the dice")
    }

}

/**
 * Checks if the player of this session is eligible to complete
 * a given action at this stage of the game
 * @param {string} action the action the player wants to perform
 * @return {boolean}
 */
function isPlayerEligibleForGameAction(action) {
    for (let i = 0; i < availableGameActions.length; i++) {
        if (currentGame.playerId === availableGameActions[i].playerId) {
            if (availableGameActions[i].action === action) {
                return true
            }
        }
    }
    return false
}

/**
 * Checks whether the player currently has any available game actions
 * @return {boolean}
 */
function isPlayerEligible() {
    for (let i = 0; i < availableGameActions.length; i++) {
        if (currentGame.playerId === availableGameActions[i].playerId) {
            return true
        }
    }
    return false
}

function isGameActionNone() {
    if (availableGameActions.length === 1) {
        if (availableGameActions[0].action === 'NONE') {
            return true
        }
    }
    return false
}

/**
 * Checks whose turn it is and returns the playerId
 * @return {string} the playerId of the player whose turn it is
 */
function whoseTurnIsIt() {
    return availableGameActions[0].playerId
}

/**
 * Checks whether the current player can move a given token
 * if the player is not eligible or the token can't be moved, this is logged to the console
 * @param {string} tokenId the token to be moved
 * @return {object|boolean} the game action if it can be executed, false else
 */
function validateMoveToken(tokenId) {
    if (isPlayerEligible()) {
        for (let i = 0; i < availableGameActions.length; i++) {
            if (availableGameActions[i].tokenId === tokenId) {
                return availableGameActions[i]
            }
        }
        return false
    } else {
        return false
    }
}

/**
 * Sends a message to the server to initiate the execution of the chosen game action (all except ROLL_DIE)
 * @param {object} gameAction
 * @param {string} tokenId
 */
function chooseGameAction(gameAction, tokenId) {
    sendMessage({
        type: 'action_' + gameAction.action, //for example: action_LEAVE_HOUSE
        tokenId: tokenId,
        playerId: currentGame.playerId,
        gameId: currentGame.gameId,
        fieldId: gameAction.fieldId
    })
}


function renderPlayersTurn() {
    stopBlinking()
    for (let i = 0; i < players.length; i++) {
        document.getElementById(`player-panel${i + 1}`).style.backgroundColor = "transparent";
    }

    for (let i = 0; i < players.length; i++) {
        if (players[i].playerId === availableGameActions[0].playerId) {
            if (players[i].color === "green") {
                document.getElementById(`player-panel${i + 1}`).style.backgroundColor = "lightgreen";
            } else if (players[i].color === "red") {
                document.getElementById(`player-panel${i + 1}`).style.backgroundColor = "lightcoral";
            } else if (players[i].color === "blue") {
                document.getElementById(`player-panel${i + 1}`).style.backgroundColor = "lightblue";
            } else if (players[i].color === "yellow") {
                document.getElementById(`player-panel${i + 1}`).style.backgroundColor = "lightgoldenrodyellow";
            }
            if (players[i].name === currentGame.playerName) {
                startBlinking()
            }
        }
    }
}

function startBlinking() {
    const button = document.getElementById('rollDiceButton');
    button.classList.add('blinking-border');
}

function stopBlinking() {
    const button = document.getElementById('rollDiceButton');
    button.classList.remove('blinking-border');
}

function renderPlayerPanels() {    
    
    for (let i = 0; i < 4; i++) {
        const panel = document.getElementById(`player-panel${i + 1}`);
        if (panel) {
            // Hide the panel
            panel.style.display = 'none';
        }
    }

    players = players.filter(player => player.name !== undefined);

    for (let i = 0; i < players.length; i++) {
        const panel = document.getElementById(`player-panel${i + 1}`);
        const pictureDiv = panel.querySelector('.player-panel-picture');
        const nameDiv = panel.querySelector('.player-panel-name h2');

        // Update picture
        const img = pictureDiv.querySelector('img');
        img.src = "pictures/figure" + players[i].color + ".png";
        img.alt = `Image ${i + 1}`;

        // Update text
        if (players[i].name === currentGame.playerName) {
            nameDiv.textContent = players[i].name + " - You";
        } else {
            nameDiv.textContent = players[i].name;
        }

        // Show the panel   
        panel.style.display = 'flex';
    }
}


function dieAnimation(final) {
    const images = [
        'pictures/' + dieColor + '1.png',
        'pictures/' + dieColor + '2.png',
        'pictures/' + dieColor + '3.png',
        'pictures/' + dieColor + '4.png',
        'pictures/' + dieColor + '5.png',
        'pictures/' + dieColor + '6.png'
    ];
    let currentIndex = 0;
    const intervalTime = 100; // Time between image changes in milliseconds
    const totalDuration = 1000; // Total duration of the animation in milliseconds

    const intervalId = setInterval(() => {
        changeRollDiceImage(images[currentIndex]);
        currentIndex = (currentIndex + 1) % images.length;
    }, intervalTime);

    setTimeout(() => {
        clearInterval(intervalId);
        changeRollDiceImage('pictures/' + dieColor + final + '.png');
    }, totalDuration);
}


function moveToken(tokenId) {
    //Can this token be moved?
    let validatedAction = validateMoveToken(tokenId)
    //if yes
    if (validatedAction) {
        chooseGameAction(validatedAction, tokenId)
    } else {
        addMessageToChat("This token cannot be moved.")
    }
}


function handleGameUpdate(message) {
    if (message.status !== currentGame.gameState) {
        setGameState(message.status)
    }
    //update available game actions
    let tokens = JSON.parse(message.tokens)
    if (message.winners) {
        tokenToRenderer(tokens);
        let winners = JSON.parse(message.winners)
        winners.forEach(winner => {
            currentGame.winners.push({
                playerName: winner.playerName, moveCounter: winner.moveCounter
            })
        })
        displayGameOver(winners);
        addMessageToChat(message.message)
        tokenToRenderer(tokens);
    } else {
        let gameActions = JSON.parse(message.gameActions)
        updateGameActions(gameActions)
        renderPlayersTurn()
        // if the server calculated that you have no gameActions
        if (message.dieValue) {
            dieAnimation(message.dieValue)
        }
        if (isGameActionNone()) {
            addMessageToChat("You have no available game action. It's the next player's turn.")
        } else {
            if(message.message && message.message !== '') {
                addMessageToChat(message.message)
            }
            tokenToRenderer(tokens);
        }
    }
}

function displayGameOver(winners) {
    //document.getElementById('gameOverPopup').style.display = 'block';        
    let gameOverPopup = document.getElementById('gameOverPopup');
    let winnersList = document.getElementById('winnersList');
    winnersList.innerHTML = '';
    winners.forEach(winner => {
        let winnerMessage = document.createElement('p');
        winnerMessage.textContent = `Player ${winner.playerName} needed ${winner.moveCounter} moves to reach the goal.`;
        winnerMessage.style.fontSize = "1.2 em";
        winnersList.appendChild(winnerMessage);

    });
    gameOverPopup.style.display = "block"
}

function tokenToRenderer(tokens) {
    renderer.tokens = [];
    tokens.forEach(token => {
        let xCoord = getTokenXCoord(token.fieldId);
        let yCoord = getTokenYCoord(token.fieldId);
        renderer.tokens.push({tn: token.tokenId, x: xCoord, y: yCoord, color: token.color})
    })

    renderer.drawFields();
    renderer.drawTokens();

}

function getTokenXCoord(fieldId) {
    for (let i = 0; i < renderer.fields.length; i++) {
        if (renderer.fields[i].fieldId === fieldId) {
            return renderer.fields[i].xCoord
        }
    }
}

function getTokenYCoord(fieldId) {
    for (let i = 0; i < renderer.fields.length; i++) {
        if (renderer.fields[i].fieldId === fieldId) {
            return renderer.fields[i].yCoord
        }
    }
}


function updateGameActions(gameActions) {
    //clear out previously available game actions
    availableGameActions = []
    //add gameActions from the message
    gameActions.forEach(gameAction => {
        availableGameActions.push({
            playerId: gameAction.playerId, action: gameAction.action, tokenId: gameAction.tokenId,
            amount: gameAction.amount, fieldId: gameAction.fieldId
        })
    })
}

function handlePlayerJoinedResponse(message) {
    addMessageToChat("A new player joined your game. There are now " + message.numberOfPlayers +
        " players in your game.")
}

function handleAPlayerLeftGame(message) {
    addMessageToChat(message.nameOfLeavingPlayer + ' (' + message.colorOfLeavingPlayer +
        ' player) left the game.\n' + (message.numberOfPlayers === 1 ? "You are the only player in the game." :
            ' There are now ' + message.numberOfPlayers + ' players in your game.'))

        players = players.filter(player => player.name !== message.nameOfLeavingPlayer);
        renderPlayerPanels()

}

function handleLeftGame(message) {
    currentGame.gameId = ""
    addMessageToChat('You left the game.\n Game id: ' + message.gameId)
}

function handleGameStarted(message) {
    handleGameUpdate(message)
    renderPlayersTurn()
    setGameState("GAME_RUNNING")
}

function handleServerMessage(response) {
    console.log(response.message)
}

function onCanvasClick(event) {

    const rect = renderer.canvas.getBoundingClientRect();
    const scaleX = renderer.canvas.width / rect.width;
    const scaleY = renderer.canvas.height / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const clickPoint = {x: clickX, y: clickY};

    renderer.tokens.forEach(token => {
        // Die Position des Tokens entsprechend der aktuellen Skalierung berücksichtigen
        const tokenSize = 50 * renderer.scale;
        const tokenX = token.x;
        const tokenY = token.y;

        // Überprüfen, ob der Klick innerhalb des Bereichs des Tokens liegt
        if (
            clickPoint.x >= tokenX - tokenSize / 2 &&
            clickPoint.x <= tokenX + tokenSize / 2 &&
            clickPoint.y >= tokenY - tokenSize / 2 &&
            clickPoint.y <= tokenY + tokenSize / 2
        ) {
            currentGame.currentTokenId = token.tn
            moveToken(token.tn)
        }
    });
}

/**
 * Adds a message to the chat array
 * @param {string} message to display in chat
 * @param {string} type style of the message, possible are 'incoming', 'outgoing' and 'server'
 * @param {string} playerColor color of the player which wrote a message
 * @return {void}
 */
function addMessageToChat(message, type = 'server', playerColor = undefined) {
    if (message === "") {
        return
    }
    message = breakLongWordsInMessages(message);
    messages.push({text: message, type, playerColor});
    displayMessages();
}

/**
 * Breaks very long messages into smaller ones to make the chat more readable
 * */
function breakLongWordsInMessages(text) {
    return text.split(' ').map(word => {
        if (word.length > 10) {
            return word.match(/.{1,13}/g).join(' ');
        }
        return word;
    }).join(' ');
}

/**
 * applies the new message to the chat
 */
function displayMessages() {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = ''; // Clear the container
    const chatContainer = document.getElementById('chat-container');

    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(msg.type);
        messageElement.textContent = msg.text;
        if (msg.type === 'incoming' || msg.type === 'outgoing') {
            if (msg.playerColor) {
                messageElement.style.borderColor = msg.playerColor;
            }
        }
        messagesContainer.appendChild(messageElement);
    });

    // Scroll to the bottom of the chat
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


/**
 * Adds the text in chat input field to the chat
 * */
function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (message) {
        sendMessage({
            type: 'chatMessage',
            gameId: currentGame.gameId,
            chatMessage: message
        })
        addMessageToChat(message, 'outgoing', currentGame.playerColor);
        chatInput.value = '';
    }
}

/**
 * Inputs in the chat input field can be sent with the enter button
 * */
function attachListenerToChatInput() {
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            sendChatMessage();
        }
    });
}

/**
 * Handles a message from another player
 * */
function handleIncomingChatMessages(message) {
    if (message.playerColor !== currentGame.playerColor) {
        addMessageToChat(message.chatMessage, 'incoming', message.playerColor)
    }
}
},{"../View/Renderer":2}],2:[function(require,module,exports){
class Renderer {
    constructor(canvasID) {
        this.scale = 1;
        this.tokens = [];
        this.fields = [];
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext("2d");
        this.images = this.loadImages();
        this.drawFields();
        this.drawTokens();
    }


    drawFields() {
        let ctx = this.ctx;
        let size = 45 * this.scale;
        this.fields.forEach((field) => {
            ctx.beginPath();
            ctx.fillStyle = field.color;
            ctx.arc(field.xCoord * this.scale, field.yCoord * this.scale, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    loadImages() {
        let images = {};
        images['red'] = new Image();
        images['red'].src = 'pictures/figureRed.png';
        images['blue'] = new Image();
        images['blue'].src = 'pictures/figureBlue.png';
        images['green'] = new Image();
        images['green'].src = 'pictures/figureGreen.png';
        images['yellow'] = new Image();
        images['yellow'].src = 'pictures/figureYellow.png';
        return images;
    }

    drawTokens() {
        let ctx = this.ctx;
        let size = 50 * this.scale;
        this.tokens.forEach((token) => {
            let img = this.images[token.color];
            ctx.drawImage(
                img,
                token.x * this.scale - size / 2,
                token.y * this.scale - size / 2,
                size,
                size);
        });
    }
}

module.exports = Renderer;
},{}],3:[function(require,module,exports){
const client = require('./Communication/client');
const board =  require('./View/Renderer');

},{"./Communication/client":1,"./View/Renderer":2}]},{},[3]);
