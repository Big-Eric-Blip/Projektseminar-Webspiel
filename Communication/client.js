let currentGame = {
    gameId: "",
    playerId: ""
}

function sendMessage(message, onResponse) {
    const url = "ws://127.0.0.1:3000";
    const socket = new WebSocket(url);

    // Connect to server
    socket.addEventListener('open', function (event) {
        console.log('Connection established.');
        // Send the message once the connection is open
        socket.send(JSON.stringify(message));
    });

    // Handle incoming messages
    socket.addEventListener('message', function (event) {
        console.log('Message from server:', event.data);
        onResponse(event.data);
    });

    // Error handling on connection
    socket.addEventListener('error', function (error) {
        console.error('Connection Error:', error);
    });

    // Close connection
    socket.addEventListener('close', function (event) {
        console.log('Connection closed.');
    });
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
    }, handleCreateGameResponse);
}

function handleCreateGameResponse(response) {
    document.getElementById("serverResponse").innerHTML = "Nice. You've created a game."
    const gameObj = JSON.parse(response);
    currentGame.gameId = gameObj.gameId;
    currentGame.playerId = gameObj.playerId;
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
    }, handleJoinGameResponse);
}

function handleJoinGameResponse(response) {
    let serverResponseText = document.getElementById("serverResponse");
    const joinGameResponse = JSON.parse(response);
    if (joinGameResponse.playerId) {
        currentGame.playerId = joinGameResponse.playerId;
        serverResponseText.innerHTML = "You've joined the game. " +
            "Please choose a name and a color";
    } else {
        console.log(joinGameResponse.message);
        serverResponseText.innerHTML = joinGameResponse.message;
    }
}

function rollDice() {
    sendMessage({type: 'rollDice'}, handleRollDiceResponse);
}


function handleRollDiceResponse(response) {
    const dieObj = JSON.parse(response);
    console.log(dieObj);
    console.log(dieObj.dieValue);

}

