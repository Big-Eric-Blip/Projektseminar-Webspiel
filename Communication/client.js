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
