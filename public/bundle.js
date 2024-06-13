(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let currentGame = {
    gameId: "",
    playerId: "",
    playerColor: "",
    playerName: "",
    gameState: "PRE_GAME" //also available: LOBBY, GAME_RUNNING, GAME_OVER
}

let socket = null;
let isSocketOpen = false;
const url = "ws://127.0.0.1:3000";

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
        case 'pickedColor':
            handlePickedColor(message)
        case 'message':
            handleServerMessage(message);
            break;
        default:
            console.log(`Sorry, we are out of ${message.type}.`);
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
    if (playerName != '') {

        setGameState("LOBBY")
        document.getElementById('createGamePopup').style.display = 'none';

        sendMessage({
            type: 'createGame',
            boardType: "default",
            playerName: playerName,
            playerColor: selectedColor
        });
    }

    //the game state influences the CSS of the game

}

function returnToLandingPage() {
    setGameState('PRE_GAME')
}

//The following function may be not necessary?
function startGame() {
    setGameState('GAME_RUNNING')
    //sendMessage({
    //    type: 'startGame'
    //TODO implement full requiredJSON
    //});
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
    document.getElementById("serverResponse").innerHTML = "Nice. You've created a game."
    currentGame.gameId = response.gameId;
    currentGame.playerId = response.playerId;
    const gameId = document.getElementById("gameId");
    gameId.innerHTML = "Send the game id to your friends to join your game: " + currentGame.gameId;
    console.log(currentGame);
    document.getElementById("createGameButton").style.display = 'none';

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
    let serverResponseText = document.getElementById("serverResponse");
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
        serverResponseText.innerHTML = "You've joined the game. " +
            "Please choose a name and a color";
        setGameState('LOBBY');
    } else {
        console.log(response.message);
        serverResponseText.innerHTML = response.message;
    }
}

function startJoinedGame() {
    const selectedColor = document.querySelector('input[name="clientColor"]:checked').value
    const playerName = document.getElementById('clientNameInput').value
    //console.log(selectedColor)
    
    sendMessage({
        type: 'pickColor',
        gameId: currentGame.gameId,
        playerColor: selectedColor,
        playerName: playerName,
        playerId: currentGame.playerId
    });
}

function handlePickedColor(response) {
    currentGame.playerName = response.playerName
    currentGame.playerColor = response.playerColor
    document.getElementById('succesfullJoinPopup').style.display = 'none'
}


function rollDice() {
    sendMessage({ type: 'rollDice' });
}


function handleRollDiceResponse(response) {
    console.log(response);
    console.log(response.dieValue);

    const diceResultDiv = document.getElementById('resultDice');
    if (diceResultDiv) {
        diceResultDiv.textContent = `${response.dieValue}`;
    } else {
        console.error('Element with id "diceResult" not found.');
    }
}


function moveToken(tokenId, dieValue) {

    sendMessage({
        type: "moveToken",
        tokenId: tokenId,
        dieValue: dieValue
    })

}

function handleMoveTokenResponse(response) {
    console.log(response)
    console.log(response.dieValue)
    console.log(response.tokenId)
}

function handlePlayerJoinedResponse(message) {
    document.getElementById("serverResponse").innerHTML =
        "A new player joined your game. There are now " + message.numberOfPlayers + " players in your game."
}

function handleAPlayerLeftGame(message) {
    const serverResponseText = message.nameOfLeavingPlayer + ' (' + message.colorOfLeavingPlayer +
        ' player) left the game.\n There are now ' + message.numberOfPlayers + ' player' +
        (message.numberOfPlayers <= 1 ? "" : "s") + ' in your game.';
    document.getElementById("serverResponse").innerHTML = serverResponseText;
    console.log(serverResponseText)
    console.log("There are now " + message.numberOfPlayers + " players in your game.")
}

function handleLeftGame(message) {
    const serverResponseText = 'You left the game.\n Game id: ' + message.gameId;
    document.getElementById("serverResponse").innerHTML = serverResponseText;
    document.getElementById("gameId").innerHTML = "";
    console.log(serverResponseText);
}

function handleServerMessage(response) {
    // TODO show message in game in grey block on the left or maybe implement chat and show it there
    const serverResponseText = response.message;
    document.getElementById("serverResponse").innerHTML = serverResponseText;
    console.log(serverResponseText);
}
},{}],2:[function(require,module,exports){
class Renderer {
    constructor(canvasID) {
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext("2d");
        this.small = 35;
        this.big = 45;



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
        this.fields = [

            // blue home
            { fn: 'ba1', x: 50, y: 50, color: "blue" },
            { fn: 'ba2', x: 50, y: 150, color: "blue" },
            { fn: 'ba3', x: 150, y: 50, color: "blue" },
            { fn: 'ba4', x: 150, y: 150, color: "blue" },
            // blue safe
            { fn: 'bi1', x: 150, y: 550, color: "blue" },
            { fn: 'bi2', x: 250, y: 550, color: "blue" },
            { fn: 'bi3', x: 350, y: 550, color: "blue" },
            { fn: 'bi4', x: 450, y: 550, color: "blue" },
            // green home
            { fn: 'ga1', x: 950, y: 950, color: "green" },
            { fn: 'ga2', x: 950, y: 1050, color: "green" },
            { fn: 'ga3', x: 1050, y: 950, color: "green" },
            { fn: 'ga4', x: 1050, y: 1050, color: "green" },
            //green safe
            { fn: 'gi1', x: 650, y: 550, color: "green" },
            { fn: 'gi2', x: 750, y: 550, color: "green" },
            { fn: 'gi3', x: 850, y: 550, color: "green" },
            { fn: 'gi4', x: 950, y: 550, color: "green" },
            //yellow home
            { fn: 'ya1', x: 50, y: 950, color: "yellow" },
            { fn: 'ya2', x: 50, y: 1050, color: "yellow" },
            { fn: 'ya3', x: 150, y: 950, color: "yellow" },
            { fn: 'ya4', x: 150, y: 1050, color: "yellow" },
            // yellow safe
            { fn: 'yi1', x: 550, y: 650, color: "yellow" },
            { fn: 'yi2', x: 550, y: 750, color: "yellow" },
            { fn: 'yi3', x: 550, y: 850, color: "yellow" },
            { fn: 'yi4', x: 550, y: 950, color: "yellow" },
            // red home
            { fn: 'ra1', x: 950, y: 50, color: "red" },
            { fn: 'ra2', x: 1050, y: 50, color: "red" },
            { fn: 'ra3', x: 950, y: 150, color: "red" },
            { fn: 'ra4', x: 1050, y: 150, color: "red" },
            // red safe
            { fn: 'ri1', x: 550, y: 150, color: "red" },
            { fn: 'ri2', x: 550, y: 250, color: "red" },
            { fn: 'ri3', x: 550, y: 350, color: "red" },
            { fn: 'ri4', x: 550, y: 450, color: "red" },
            // white or first of color
            { fn: 'wp1', x: 50, y: 450, color: "blue" },
            { fn: 'wp2', x: 150, y: 450, color: "white" },
            { fn: 'wp3', x: 250, y: 450, color: "white" },
            { fn: 'wp4', x: 350, y: 450, color: "white" },
            { fn: 'wp5', x: 450, y: 450, color: "white" },
            { fn: 'wp6', x: 450, y: 350, color: "white" },
            { fn: 'wp7', x: 450, y: 250, color: "white" },
            { fn: 'wp8', x: 450, y: 150, color: "white" },
            { fn: 'wp9', x: 450, y: 50, color: "white" },
            { fn: 'wp10', x: 550, y: 50, color: "white" },
            { fn: 'wp11', x: 650, y: 50, color: "red" },
            { fn: 'wp12', x: 650, y: 150, color: "white" },
            { fn: 'wp13', x: 650, y: 250, color: "white" },
            { fn: 'wp14', x: 650, y: 350, color: "white" },
            { fn: 'wp15', x: 650, y: 450, color: "white" },
            { fn: 'wp16', x: 750, y: 450, color: "white" },
            { fn: 'wp17', x: 850, y: 450, color: "white" },
            { fn: 'wp18', x: 950, y: 450, color: "white" },
            { fn: 'wp19', x: 1050, y: 450, color: "white" },
            { fn: 'wp20', x: 1050, y: 550, color: "white" },
            { fn: 'wp21', x: 1050, y: 650, color: "green" },
            { fn: 'wp22', x: 950, y: 650, color: "white" },
            { fn: 'wp24', x: 850, y: 650, color: "white" },
            { fn: 'wp25', x: 750, y: 650, color: "white" },
            { fn: 'wp26', x: 650, y: 650, color: "white" },
            { fn: 'wp27', x: 650, y: 750, color: "white" },
            { fn: 'wp28', x: 650, y: 850, color: "white" },
            { fn: 'wp29', x: 650, y: 950, color: "white" },
            { fn: 'wp30', x: 650, y: 1050, color: "white" },
            { fn: 'wp31', x: 550, y: 1050, color: "white" },
            { fn: 'wp32', x: 450, y: 1050, color: "yellow" },
            { fn: 'wp33', x: 450, y: 950, color: "white" },
            { fn: 'wp34', x: 450, y: 850, color: "white" },
            { fn: 'wp35', x: 450, y: 750, color: "white" },
            { fn: 'wp36', x: 450, y: 650, color: "white" },
            { fn: 'wp37', x: 350, y: 650, color: "white" },
            { fn: 'wp38', x: 250, y: 650, color: "white" },
            { fn: 'wp39', x: 150, y: 650, color: "white" },
            { fn: 'wp40', x: 50, y: 650, color: "white" },
            { fn: 'wp41', x: 50, y: 550, color: "white" },
        ];

        this.drawFields();
        this.drawTokens();

        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));


    }


    drawFields() {
        let big = this.big;
        let ctx = this.ctx;

        this.fields.forEach(function (draw) {
            ctx.beginPath();
            ctx.fillStyle = draw.color;
            ctx.arc(draw.x, draw.y, big, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    drawTokens() {
        let small = this.small;
        let ctx = this.ctx;

        this.tokens.forEach(function (draw) {
            ctx.beginPath();
            ctx.fillStyle = draw.color;
            ctx.fillRect(draw.x - small / 2, draw.y - small / 2, small, small);

            ctx.strokeStyle = "black";
            ctx.strokeRect(draw.x - small / 2, draw.y - small / 2, small, small);
            ctx.stroke();
        });
    }

    onCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        this.tokens.forEach(token => {
            if (this.isPointInRect({ x: clickX, y: clickY }, token)) {
                console.log(`Game piece clicked:`, token);
                this.moveToken(token);
            }
        });
    }

    isPointInRect(point, token) {
        return (
            point.x >= token.x - this.small / 2 &&
            point.x <= token.x + this.small / 2 &&
            point.y >= token.y - this.small / 2 &&
            point.y <= token.y + this.small / 2
        );
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


        token.x = newField.x;
        token.y = newField.y;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawFields();
        this.drawTokens();

    }  


/* 
   moveToken(token) {
        console.log('Moving token:', token);
    
        console.log('Token is valid. Proceeding with movement.');
        const diceResultDiv = document.getElementById('resultDice');
        const resultDice = parseInt(diceResultDiv.innerText);
        console.log('Dice result:', resultDice);
    
        // Stellen Sie sicher, dass this.fields korrekt initialisiert ist
        if (!this.fields || !Array.isArray(this.fields)) {
            console.error('this.fields is not properly initialized:', this.fields);
            return;
        }
    
        // Überprüfen Sie, ob alle Felder korrekt initialisiert sind
        this.fields.forEach((field, index) => {
            if (!field || !field.fieldID) {
                console.error(`Field at index ${index} is not properly initialized:`, field);
            }
        });
    
        // Zugriff auf das Board-Objekt
        const board = this.board; // Stellen Sie sicher, dass das Board-Objekt korrekt initialisiert und zugewiesen ist
        if (!board) {
            console.error('Board object is not initialized.');
            return;
        }
    
        // Aktuelle Position des Tokens bestimmen
        const currentField = board.gameArray.find(field => field.x === token.x && field.y === token.y);
    
        if (!currentField) {
            // Token befindet sich noch im homeArray, setze auf Startposition
            const startingFieldID = board.getStartingPosition(token.color);
            const startingField = board.gameArray.find(field => field.fieldID === startingFieldID);
            console.log('Setting token to starting field:', startingField);
    
            if (startingField) {
                token.x = startingField.x;
                token.y = startingField.y;
            } else {
                console.error('Starting field not found for color:', token.color);
            }
        } else {
            // Token befindet sich bereits im gameArray, bewege um das Würfelergebnis weiter
            const newField = board.getNextPosition(currentField.fieldID, resultDice);
            console.log('New field:', newField);
    
            if (newField) {
                token.x = newField.x;
                token.y = newField.y;
            } else {
                console.error('New field not found.');
            }
        }
    
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawFields();
        this.drawTokens();
    } 
    

 */




}





document.addEventListener("DOMContentLoaded", function () {
    const renderer = new Renderer("myCanvas");
    
});

},{}],3:[function(require,module,exports){
const client = require('./Communication/client');
const board =  require('./View/Renderer');

},{"./Communication/client":1,"./View/Renderer":2}]},{},[3]);
