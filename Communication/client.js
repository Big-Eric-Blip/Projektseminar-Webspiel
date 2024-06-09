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
    sendMessage({
        type: 'pickColor',
        gameId: currentGame.gameId,
        playerColor: document.querySelector('input[name="playerColor"]:checked').value,
        playerName: document.getElementById('clientNameInput').value,
        playerId: currentGame.playerId
    });
}

function handlePickedColor(response) {
    console.log(response.message)
    currentGame.playerColor = response.playerColor
    currentGame.playerName = response.playerName
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