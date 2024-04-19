const WebSocket = require('ws');

const url = "127.0.0.1:3000";
const socket = new WebSocket('ws://' + url);

// Connect to server
socket.on('open', function () {
    console.log('Connection established.');

    socket.send('Hello Server, i\'m the client!');
});

// Handle incoming messages
socket.on('message', function (data) {
    console.log('Message from server:', data.toString());
});

// Error handling on connection
socket.on('error', function (error) {
    console.error('Connection Error:', error);
});

// Close connection
socket.on('close', function () {
    console.log('Connection closed.');
});
