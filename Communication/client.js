let currentGame = {
    gameId: "",
    playerId: "",
    gameState: "PRE_GAME" //also available: LOBBY, GAME_RUNNING, GAME_OVER
}
let availableGameActions = new Set;


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
        joinGameButton: joinGame,
        startGameButton: startGame,
        leaveGameButton: leaveGame,
        landingPageButton: returnToLandingPage,
        createGameButton: createGame,

        //Join Game
        joinGamePopupButton: openJoinGamePopup,
        closeJoinGamePopupButton: closeJoinGamePopup,

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

function createGame() {
    setGameState("LOBBY")
    const selectedColor = document.querySelector('input[name="playerColor"]:checked');
    // TODO set parameter to not static values
    sendMessage({
        type: 'createGame',
        boardType: "default",
        playerName: "Alice",
        playerColor: "red"
    });
    //the game state influences the CSS of the game

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

function rollDice() {
    sendMessage({ type: 'rollDice' });
}

/**
 * Sends a message to the server to initiate the execution of the chosen game action
 * @param gameAction
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
    let gameActions = message.gameActions
    let tokens = message.tokens
    let gameId = message.gameId
    availableGameActions.add(gameActions)
    //message: "You´ve started the game.",
    //TODO: update board with current token positions

    //availableGameActions = message.

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