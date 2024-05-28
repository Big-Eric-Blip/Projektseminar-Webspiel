let currentGame = {
    gameId: "",
    playerId: "",
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
        }, {once: true});
    } else {
        socket.send(JSON.stringify(message));
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // <id of the button being clicked>: name of the function below
    const buttonFunctions = {
        createGameButton: createGame,
        rollDiceButton: rollDice,
        openExamplePopupButton: openExamplePopup,
        closeExamplePopupButton: closeExamplePopup,
        createGamePopupButton: openCreateGamePopup,
        closeCreateGamePopupButton: closeCreateGamePopup,
        joinGameButton: joinGame,
        startGameButton: startGame
    };


    //also add "popup buttons into this?"
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



function openExamplePopup(){
    document.getElementById('examplePopup').style.display = 'block';
}
function closeExamplePopup(){
    document.getElementById('examplePopup').style.display = 'none';
}
function openCreateGamePopup(){
    document.getElementById('createGamePopup').style.display = 'block';
}
function closeCreateGamePopup(){
    document.getElementById('createGamePopup').style.display = 'none';
}

function createGame() {
    setGameState("LOBBY")
    lobbyElements.forEach((element) => element.style.display = 'block')
    // TODO set parameter to not static values
    sendMessage({
        type: 'createGame',
        boardType: "default",
        playerName: "Alice",
        playerColor: "red"
    });
    //the game state influences the CSS of the game

}
//The following function may be not necessary?
function startGame() {
    setGameState('GAME_RUNNING')
    //sendMessage({
    //    type: 'startGame'
        //TODO implement full requiredJSON
    //});
}
function setGameState(state) {
    switch (state) {
        case "PRE_GAME": setPreGame(); break
        case "LOBBY": setLobby(); break
        case "GAME_RUNNING": setGameRunning(); break
        case "GAME_OVER": endGame(); break
        default: console.log("The game state "+ state+ " is not available")
    }
}
function setPreGame() {
    currentGame.gameState = "PRE_GAME"
    //TODO list all html objects visible in the pre game state
    const gameBoard = document.getElementById("board")
    gameBoard.classList.add("pre-game")
    console.log("Status changed")
}

function setLobby() {
    currentGame.gameState = "LOBBY"
    //TODO list all html objects visible in the lobby state
    const preGameElements = document.querySelectorAll('.pre-game')
    preGameElements.forEach((element) => element.style.display = 'none')
    const lobbyElements = document.querySelectorAll('.lobby')
    lobbyElements.forEach((element) => element.style.display = 'block')
    document.getElementById('body').style.backgroundColor = 'azure'
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
        currentGame.playerId = response.playerId;
        serverResponseText.innerHTML = "You've joined the game. " +
            "Please choose a name and a color";
    } else {
        console.log(response.message);
        serverResponseText.innerHTML = response.message;
    }
}

function rollDice() {
    sendMessage({type: 'rollDice'});
}


function handleRollDiceResponse(response) {
    console.log(response);
    console.log(response.dieValue);

}

function handlePlayerJoinedResponse(message) {
    document.getElementById("serverResponse").innerHTML =
        "A new player joined your game. There are now " + message.numberOfPlayers + " players your game."
}
