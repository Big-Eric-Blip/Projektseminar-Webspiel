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
    const createGameButton = document.getElementById('createGameButton');
    const rollButton = document.getElementById('rollDiceButton');

    if (createGameButton) {
        createGameButton.addEventListener('click', createGame);
    } else {
        console.error('Button with id "createGameButton" not found.');
    }

    if (rollButton) {
        rollButton.addEventListener('click', rollDice);
    } else {
        console.error('Button with id "rollDiceButton" not found.');
    }
});


function createGame() {
    fetch('http://localhost:3000/createGame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // TODO set parameter not static values
        body: JSON.stringify({
            board: 1,
            colorOfFigure: "red",
            colorOfDie: "blue"
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            console.log('Response:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function rollDice() {
    sendMessage({type: 'rollDice'}, handleRollDiceResponse);
}


function handleRollDiceResponse(response) {
    const dieObj = JSON.parse(response);
    console.log(dieObj);
    console.log(dieObj.dieValue);

}

