(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let currentGame = {
    gameId: "",
    playerId: "",
    playerColor: "",
    playerName: "",
    gameState: "PRE_GAME" //also available: LOBBY, GAME_RUNNING, GAME_OVER
}
let availableGameActions = [];

let dieColor;

let socket = null;
let isSocketOpen = false;
const url = "ws://127.0.0.1:3000";
const Renderer = require('../View/Renderer');

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
        case 'rollDice':
            handleRollDiceResponse(message);
            break;
        case 'createGame':
            handleCreateGameResponse(message);
            break;
        case 'joinGame':
            handleJoinGameResponse(message);
            break;
        case 'playerJoined':
            handlePlayerJoinedResponse(message);
            break;
        case 'moveToken':
            handleMoveTokenResponse(message);
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
        }, { once: true });
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
    document.getElementById('createGameErrorMessage').textContent='';
    document.getElementById('createGamePopup').style.display = 'none';
}

function cancel() {
    //ToDo checken
    leaveGame()
    document.getElementById('succesfullJoinPopup').style.display = 'none';
    setGameState("PRE_GAME")
    document.getElementById('myCanvas').style.display = 'none';
}

function createGame() {

    const selectedColor = document.querySelector('input[name="playerColor"]:checked').value;
    const playerName = document.getElementById('adminNameInput').value;
    dieColor = document.querySelector('input[name="dieOptionServer"]:checked').value;
    console.log(dieColor);
    changeRollDiceImage("./pictures/"+dieColor+".png")

    if (playerName != '') {

        setGameState("LOBBY")
        document.getElementById('createGamePopup').style.display = 'none';

        sendMessage({
            type: 'createGame',
            boardType: "default",
            playerName: playerName,
            playerColor: selectedColor
        });
    }else{
        document.getElementById('createGameErrorMessage').textContent='Do not forget to Enter a Name!'
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
    blinkCount=0
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
    document.getElementById("inGameServerResponse").innerHTML = "Nice. You've created a game."
    currentGame.gameId = response.gameId;
    currentGame.playerId = response.playerId;

    const gameId = document.getElementById("gameId");
    gameId.innerHTML = "Send the game id to your friends to join your game: " + currentGame.gameId;
    console.log(currentGame);
    document.getElementById("createGameButton").style.display = 'none';
    renderer.fields = response.fields;
    document.addEventListener("DOMContentLoaded", function () {
        const renderer = new Renderer("myCanvas");
    });
    renderer.drawFields();
    renderer.drawTokens();
    document.getElementById('leaveGameButton').style.display = 'block';
}

function joinGame() {
    const inputField = document.getElementById('joinGameInputId');
    currentGame.gameId = inputField.value;
    sendMessage({
        type: 'joinGame',
        gameId: currentGame.gameId
    });

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

        let serverResponseText = document.getElementById("inGameServerResponse");
        serverResponseText.innerHTML = "You've joined the game. " +
            "Please choose a name and a color";
        setGameState('LOBBY');
        document.getElementById('startGameButton').style.display = 'none';
        document.getElementById('leaveGameButton').style.display = 'block';

        document.addEventListener("DOMContentLoaded", function () {
            const renderer = new Renderer("myCanvas");

        });
        renderer.fields = response.fields;
            renderer.drawFields();
            renderer.drawTokens();
        console.log(renderer.fields)

    } else {
        let serverResponseText = document.getElementById("joinGamePopupServerResponse");
        serverResponseText.innerHTML = response.message;
        console.log(response.message);
    }
}

function startJoinedGame() {
    const selectedColor = document.querySelector('input[name="clientColor"]:checked').value
    const playerName = document.getElementById('clientNameInput').value
    dieColor = document.querySelector('input[name="dieOptionClient"]:checked').value;
    changeRollDiceImage("./pictures/"+dieColor+".png")
    console.log(dieColor);

    if (playerName!= '' && selectedColor!= ''){
        sendMessage({
            type: 'pickColor',
            gameId: currentGame.gameId,
            playerColor: selectedColor,
            playerName: playerName,
            playerId: currentGame.playerId
        });
    }else{
        document.getElementById('joinGameErrorMessage').textContent='Do not forget to Enter a Name and Pick a Color!'
        makeTextBlink('joinGameErrorMessage')
    }
}

function handlePickedColor(response) {
    currentGame.playerName = response.playerName
    currentGame.playerColor = response.playerColor
    document.getElementById('succesfullJoinPopup').style.display = 'none'
}


function rollDice() {
    //check if action allowed
    if(isPlayerEligibleForGameAction('ROLL_DIE')) {
        sendMessage({ type: 'rollDice' });
    } else {
        //send message to the sideboard
        console.log("It's not your turn.")
    }

}

/**
 * Checks if the player of this session is eligible to complete
 * a given action at this stage of the game
 * @param {string} action the action the player wants to perform
 * @return {boolean}
 */
function isPlayerEligibleForGameAction(action) {
    for(let i = 0; i < availableGameActions.length; i++) {
        if(currentGame.playerId === availableGameActions[i].playerId) {
            if(availableGameActions[i].action === action) {
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
    for(let i = 0; i < availableGameActions.length; i++) {
        if(currentGame.playerId === availableGameActions[i].playerId) {
                return true

        }
    }
    return false
}

/**
 * Checks whether the current player can move a given token
 * if the player is not eligible or the token can't be moved, this is logged to the console
 * @param {string} tokenId the token to be moved
 * @return {boolean} true if the token can be moved
 */
function validateMoveToken(tokenId) {
    if(isPlayerEligible()) {
        for(let i = 0; i<availableGameActions.length;i++) {
            if(availableGameActions[i].tokenId === tokenId) {
                return true
            }
        }
        console.log("This move is not possible!")
    } else {
        console.log("It's not your turn to play!")
        return false
    }
}

/**
 * Sends a message to the server to initiate the execution of the chosen game action
 * @param {string} gameAction
 */
function chooseGameAction(gameAction) {
    let action = 'text'
    sendMessage({
        type: 'action_' + action, //for example: action_ROLL_DIE


    })
}


function handleRollDiceResponse(response) {
    console.log(response);
    console.log(response.dieValue);
    dieAnimation(response.dieValue)
/*
    const diceResultDiv = document.getElementById('resultDice');
    if (diceResultDiv) {
        diceResultDiv.textContent = `${response.dieValue}`;
    } else {
        console.error('Element with id "diceResult" not found.');
    }*/
}

function dieAnimation(final) {
    const images = [
        'pictures/'+dieColor+'1.png',
        'pictures/'+dieColor+'2.png',
        'pictures/'+dieColor+'3.png',
        'pictures/'+dieColor+'4.png',
        'pictures/'+dieColor+'5.png',
        'pictures/'+dieColor+'6.png'
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
        changeRollDiceImage('pictures/'+dieColor+final+'.png');
    }, totalDuration);
}


function moveToken(tokenId, dieValue) {

    sendMessage({
        type: "moveToken",
        tokenId: tokenId,
        dieValue: dieValue
    })

}

/**
 * Gets the game update from the server and
 * @param message
 */
function handleGameUpdate(message) {
    console.log(message)
    if (message.status !== currentGame.gameState) {
        setGameState(message.status)
    }
    //update available game actions
    let tokens = message.tokens
    let gameId = message.gameId
    let gameActions = JSON.parse(message.gameActions)
    //clear out previously available game actions
    availableGameActions = []
    //add gameActions from the message
    gameActions.forEach(gameAction => {
        availableGameActions.push({playerId: gameAction.playerId, action: gameAction.action, tokenId:gameAction.tokenId,
            amount: gameAction.amount, fieldId: gameAction.fieldId})
        console.log(gameAction)
    })
    //example for how to access values from the array
    console.log(availableGameActions[0].action)
    //TODO: update board with current token positions

}

function handleMoveTokenResponse(response) {
    console.log(response)
    console.log(response.dieValue)
    console.log(response.tokenId)
}

function handlePlayerJoinedResponse(message) {
    document.getElementById("inGameServerResponse").innerHTML =
        "A new player joined your game. There are now " + message.numberOfPlayers + " players in your game."
}

function handleAPlayerLeftGame(message) {
    const serverResponseText = message.nameOfLeavingPlayer + ' (' + message.colorOfLeavingPlayer +
        ' player) left the game.\n There are now ' + message.numberOfPlayers + ' player' +
        (message.numberOfPlayers <= 1 ? "" : "s") + ' in your game.';
    document.getElementById("inGameServerResponse").innerHTML = serverResponseText;
    console.log(serverResponseText)
    console.log("There are now " + message.numberOfPlayers + " players in your game.")
}

function handleLeftGame(message) {
    const serverResponseText = 'You left the game.\n Game id: ' + message.gameId;
    document.getElementById("inGameServerResponse").innerHTML = serverResponseText;
    document.getElementById("gameId").innerHTML = "";
    console.log(serverResponseText);
}

function handleGameStarted(message) {
//     todo show in response text or something like that
    console.log(message)
    document.getElementById("inGameServerResponse").innerHTML = message.message;
    document.getElementById('rollDiceButton').style.display = 'block';

}

function handleServerMessage(response) {
    // TODO show message in game in grey block on the left or maybe implement chat and show it there
    const serverResponseText = response.message;
    document.getElementById("inGameServerResponse").innerHTML = serverResponseText;
    console.log(serverResponseText);
}
},{"../View/Renderer":2}],2:[function(require,module,exports){
class Renderer {
    constructor(canvasID) {

        this.scale = 1;



        this.tokens = [
            // blue token
            { tn: 'bt1', x: 50, y: 50, color: "blue" },
            { tn: 'bt2', x: 50, y: 150, color: "blue" },
            { tn: 'bt3', x: 150, y: 50, color: "blue" },
            { tn: 'bt4', x: 150, y: 150, color: "blue" },
            // green token
            { tn: 'gt1', x: 950, y: 950, color: "green" },
            { tn: 'gt2', x: 950, y: 1050, color: "green" },
            { tn: 'gt3', x: 1050, y: 950, color: "green" },
            { tn: 'gt4', x: 1050, y: 1050, color: "green" },
            // yellow token
            { tn: 'yt1', x: 50, y: 950, color: "yellow" },
            { tn: 'yt2', x: 50, y: 1050, color: "yellow" },
            { tn: 'yt3', x: 150, y: 950, color: "yellow" },
            { tn: 'yt4', x: 150, y: 1050, color: "yellow" },
            // red token
            { tn: 'rt1', x: 950, y: 50, color: "red" },
            { tn: 'rt2', x: 1050, y: 50, color: "red" },
            { tn: 'rt3', x: 950, y: 150, color: "red" },
            { tn: 'rt4', x: 1050, y: 150, color: "red" }
        ];
        this.fields = [];
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext("2d");

        this.drawFields();
        this.drawTokens();


        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
    }


    drawFields() {
        console.log(this.fields)
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

    onCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;

        const clickPoint = { x: clickX, y: clickY };

        this.tokens.forEach(token => {
            // Die Position des Tokens entsprechend der aktuellen Skalierung berücksichtigen
            const tokenSize = 35 * this.scale;
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
                this.moveToken(token);
            }
        });
    }


    moveToken(token) {
        console.log('Moving token:', token);

        console.log('Token is valid. Proceeding with movement.');
        const diceResultDiv = document.getElementById('resultDice');
        const resultDice = parseInt(diceResultDiv.innerText);
        console.log('Dice result:', resultDice);
        const currentIndex = this.fields.findIndex(field => field.x === token.x && field.y === token.y);
        console.log('Current index:', currentIndex);
        const newIndex = (currentIndex + resultDice) % this.fields.length;
        console.log('New index:', newIndex);
        const newField = this.fields[newIndex];
        console.log('New field:', newField);


        token.x = newField.xCoord;
        token.y = newField.yCoord;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawFields();
        this.drawTokens();

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
