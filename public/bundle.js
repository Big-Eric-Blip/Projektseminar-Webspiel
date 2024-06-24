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
    playerName: "" //also available: LOBBY, GAME_RUNNING, GAME_OVER
}
let availableGameActions = [];

let dieColor;

let socket = null;
let isSocketOpen = false;

function initWebSocketConnection() {
    socket = new WebSocket(url);

    // Connect to server
    socket.addEventListener('open', function (event) {
        console.log('Connection established.');
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
        console.log('Connection closed.');
        isSocketOpen = false;
    });
}

function fromServerMessage(event) {
    const message = JSON.parse(event.data);
    console.log('Message from server:', message);
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
        case 'message':
            handleServerMessage(message);
            break;
        case 'updateGame':
            handleGameUpdate(message);
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

        //Join Game
        joinGamePopupButton: openJoinGamePopup,
        closeJoinGamePopupButton: closeJoinGamePopup,
        joinGameButton: joinGame,

        //Succesfull Join
        startJoinedGameButton: startJoinedGame,
        cancelButton: cancel,

        //Lobby
        startGameButton: startGame,
        leaveGameButton: leaveGame,
        landingPageButton: returnToLandingPage,

        //Game Buttons
        rollDiceButton: rollDice,

         // Copy Game ID
         copyGameIdButton: copyGameIdToClipboard,
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

function openJoinGamePopup() {
    document.getElementById('joinGamePopup').style.display = 'block';
}

function closeJoinGamePopup() {
    document.getElementById('joinGamePopup').style.display = 'none';
}

function openCreateGamePopup() {
    document.getElementById('createGamePopup').style.display = 'block';
}

function closeCreateGamePopup() {
    document.getElementById('createGameErrorMessage').textContent = '';
    document.getElementById('createGamePopup').style.display = 'none';
}

function cancel() {
    //ToDo checken
    leaveGame()
    document.getElementById('succesfullJoinPopup').style.display = 'none';
    setGameState("PRE_GAME")
    document.getElementById('myCanvas').style.display = 'none';
}

function copyGameIdToClipboard() {
    const gameIdElement = document.getElementById('gameId');
    const gameIdText = gameIdElement.textContent.split(": ")[1]; 

    if (navigator.clipboard) {
        navigator.clipboard.writeText(gameIdText).then(() => {
            console.log('Game ID wurde in die Zwischenablage kopiert.');
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
    console.log(dieColor);
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
    //TODO list all html objects visible in the lobby state
    const preGameElements = document.querySelectorAll('.pre-game')
    preGameElements.forEach((element) => element.style.display = 'none')
    const lobbyElements = document.querySelectorAll('.lobby')
    lobbyElements.forEach((element) => element.style.display = 'block')
    document.getElementById('body').style.backgroundColor = 'azure'
    document.getElementById('body').style.marginTop = '60px'
    document.getElementById('main-area').style.marginLeft = '240px'
    //document.getElementById('body').style.width = '80%'

}

function setGameRunning() {
    currentGame.gameState = "GAME_RUNNING"
    const lobbyElements = document.querySelectorAll('.lobby')
    const gameRunningElements = document.querySelectorAll('.game-running')
    lobbyElements.forEach((element) => element.style.display = 'none')
    gameRunningElements.forEach((element) => element.style.display = 'block')
}

function endGame() {
    currentGame.gameState = "GAME_OVER"
    const gameRunningElements = document.querySelectorAll('.game-running')
    const gameOverElements = document.querySelectorAll('.game-over')
    gameRunningElements.forEach((element) => element.style.display = 'none')
    gameOverElements.forEach((element) => element.style.display = 'block')
}

function handleCreateGameResponse(response) {
    document.getElementById("inGameMessage").innerHTML = "Nice. You've created a game."
    currentGame.gameId = response.gameId;
    currentGame.playerId = response.playerId;

    const gameId = document.getElementById("gameId");
    gameId.innerHTML = "Send the game id to your friends to join your game: " + currentGame.gameId;
    console.log(currentGame);
    //document.getElementById("createGameButton").style.display = 'none';
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

function handleJoinGameResponse(response) {
    if (response.playerId) {
        document.getElementById('joinGamePopup').style.display = 'none'
        document.getElementById('succesfullJoinPopup').style.display = 'block'


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


        currentGame.playerId = response.playerId;
        let serverResponseText = document.getElementById("inGameMessage");
        serverResponseText.innerHTML = "You've joined the game. " +
            "Please choose a name and a color";
        setGameState('LOBBY');
        document.getElementById('startGameButton').style.display = 'none';
        document.getElementById('leaveGameButton').style.display = 'block';
        const gameId = document.getElementById("gameId");
        gameId.innerHTML = "Send the game id to your friends to join your game: " + currentGame.gameId;
        initRenderer(response)


    } else {
        let serverResponseText = document.getElementById("joinGamePopupServerResponse");
        serverResponseText.innerHTML = response.message;
        console.log(response.message);
    }
}

function initRenderer(response) {
    document.addEventListener("DOMContentLoaded", function () {
        const renderer = new Renderer("myCanvas");
    });

    renderer.canvas.addEventListener('click', function (e) {
        onCanvasClick(e)
    })
    renderer.fields = response.fields;
    renderer.drawFields();
    renderer.drawTokens();
    console.log(renderer.fields)
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

function handlePickedColor(response) {
    currentGame.playerName = response.playerName
    currentGame.playerColor = response.playerColor
    document.getElementById('succesfullJoinPopup').style.display = 'none'
}

/**
 * Checks the eligibility of the player clicking on the die symbol and if the player is eligible for the action
 * ROLL_DIE, a message is sent to the server communicating the action. Otherwise, an error message is printed in
 * the HTML element with id "inGameMessage"
 */
function rollDice() {
    //check if action allowed
    if (isPlayerEligibleForGameAction('ROLL_DIE')) {
        sendMessage({type: 'rollDice', gameId: currentGame.gameId});
    } else {
        //send message to the sideboard
        document.getElementById("inGameMessage").innerHTML = "It's not your turn to roll the die."
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
    console.log(currentGame.playerId + " is not eligible for game action " + action)
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
        console.log("This move is not possible!")
        return false
    } else {
        console.log("It's not your turn to play!")
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
        console.log("Execute game action " + validatedAction.action)
    } else {
        document.getElementById("inGameMessage").innerHTML = "It's not your turn to move.";
    }
}

/**
 * Gets the game update from the server and
 * @param message
 */
function handleGameUpdate(message) {
    if (message.status !== currentGame.gameState) {
        setGameState(message.status)
    }
    //update available game actions
    let tokens = JSON.parse(message.tokens)
    let gameActions = JSON.parse(message.gameActions)
    updateGameActions(gameActions)
    // if the server calculated that you have no gameActions
    console.log("AvailableGameActions: ", availableGameActions)
    if (message.dieValue) {
        dieAnimation(message.dieValue)
    }
    if (isGameActionNone()) {
        console.log("You have no available game action. It's the next players Turn.")

        // this will not be shown because it will be instantly overwritten because of the next players turn
        // TODO if chat like function implemented add to chat otherwise delete these comments
        // document.getElementById("inGameMessage").innerHTML =
        //     "You have no available game action. It's the next players Turn."
    } else {
        document.getElementById("inGameMessage").innerHTML = message.message
        tokenToRenderer(tokens);
    }

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
    document.getElementById("inGameMessage").innerHTML =
        "A new player joined your game. There are now " + message.numberOfPlayers + " players in your game."
}

function handleAPlayerLeftGame(message) {
    const serverResponseText = message.nameOfLeavingPlayer + ' (' + message.colorOfLeavingPlayer +
        ' player) left the game.\n There are now ' + message.numberOfPlayers + ' player' +
        (message.numberOfPlayers <= 1 ? "" : "s") + ' in your game.';
    document.getElementById("inGameMessage").innerHTML = serverResponseText;
    console.log(serverResponseText)
    console.log("There are now " + message.numberOfPlayers + " players in your game.")
}

function handleLeftGame(message) {
    const serverResponseText = 'You left the game.\n Game id: ' + message.gameId;
    document.getElementById("inGameMessage").innerHTML = serverResponseText;
    document.getElementById("gameId").innerHTML = "";
    console.log(serverResponseText);
}

function handleGameStarted(message) {
    //     todo show in response text or something like that
    console.log("Handle game started: ", message)
    document.getElementById("inGameMessage").innerHTML = message.message;
    handleGameUpdate(message)
    setGameState("GAME_RUNNING")
    console.log("The current state is: " + currentGame.gameState);


}

function handleServerMessage(response) {
    // TODO show message in game in grey block on the left or maybe implement chat and show it there
    const serverResponseText = response.message;
    document.getElementById("inGameMessage").innerHTML = serverResponseText;
    console.log(serverResponseText);
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
        const tokenSize = 35 * renderer.scale;
        const tokenX = token.x;
        const tokenY = token.y;

        // Überprüfen, ob der Klick innerhalb des Bereichs des Tokens liegt
        if (
            clickPoint.x >= tokenX - tokenSize / 2 &&
            clickPoint.x <= tokenX + tokenSize / 2 &&
            clickPoint.y >= tokenY - tokenSize / 2 &&
            clickPoint.y <= tokenY + tokenSize / 2
        ) {
            console.log(`Game piece clicked:`, token);
            currentGame.currentTokenId = token.tn
            moveToken(token.tn)
            //renderer.moveToken(token)
        }
    });
}
},{"../View/Renderer":2}],2:[function(require,module,exports){

class Renderer {
    constructor(canvasID) {

        this.scale = 1;
        this.tokens = [];
        this.fields = [];
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext("2d");

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


    drawTokens() {

        let ctx = this.ctx;


        let size = 35 * this.scale;

        this.tokens.forEach((token) => {
            ctx.beginPath();
            ctx.scale(1, 1)
            ctx.fillStyle = token.color;
            ctx.fillRect(token.x * this.scale - size / 2, token.y * this.scale - size / 2, size, size);
            ctx.strokeStyle = "black";
            ctx.strokeRect(token.x * this.scale - size / 2, token.y * this.scale - size / 2, size, size);
            ctx.stroke();
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    window.renderer = new Renderer("myCanvas");
})

module.exports = Renderer;
},{}],3:[function(require,module,exports){
const client = require('./Communication/client');
const board =  require('./View/Renderer');

},{"./Communication/client":1,"./View/Renderer":2}]},{},[3]);
