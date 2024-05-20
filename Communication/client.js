let currentGame = {
    gameId: "",
    playerId: ""
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
    const buttonFunctions = {
        createGameButton: createGame,
        rollDiceButton: rollDice,
        joinGameButton: joinGame
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

function createGame() {
    // TODO set parameter to not static values
    sendMessage({
        type: 'createGame',
        boardType: "default",
        playerName: "Alice",
        playerColor: "red"
    });
}

function handleCreateGameResponse(response) {
    document.getElementById("serverResponse").innerHTML = "Nice. You've created a game."
    currentGame.gameId = response.gameId;
    currentGame.playerId = response.playerId;
    const gameId = document.getElementById("gameId");
    gameId.innerHTML = "Send the game id to your friends to join your game: " + currentGame.gameId;
    console.log(currentGame);
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
