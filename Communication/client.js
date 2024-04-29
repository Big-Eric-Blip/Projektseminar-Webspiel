const url = "ws://127.0.0.1:3000";
const socket = new WebSocket(url);

// Connect to server
socket.addEventListener('open', function (event) {
    console.log('Connection established.');

    socket.send('Hello Server, I\'m the client!');
});

// Handle incoming messages
socket.addEventListener('message', function (event) {
    console.log('Message from server:', event.data);
});

// Error handling on connection
socket.addEventListener('error', function (error) {
    console.error('Connection Error:', error);
});

// Close connection
socket.addEventListener('close', function (event) {
    console.log('Connection closed.');
});

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('createGameButton');
    const rollButton = document.getElementById('rollDiceButton');

    if (button) {
        button.addEventListener('click', createGame);
    } else {
        console.error('Button with id "createGameButton" not found.');
    }

    if (rollButton) {
        rollButton.addEventListener('click', rollDice);
    } else {
        console.error('Button with id "rollDiceButton" not found.');
    }
});


/* document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('createGameButton');
    if (button) {
        button.addEventListener('click', createGame);
    } else {
        console.error('Button with id "createGameButton" not found.');
    }
});
 */


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
    fetch('http://localhost:3000/rollDice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data.result
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Dice Roll Result:', data.result); // Log the dice roll result
        })
        .catch(error => {
            console.error('Error:', error);
        });
}





