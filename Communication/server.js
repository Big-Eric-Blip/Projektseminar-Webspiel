const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const clients = new Set();

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'main.html'));
});

app.use(express.json());

app.post('/createGame', (req, res) => {
    const data = req.body;
    console.log(data);

    res.send('POST request received');
});

wss.on('connection', function connection(ws) {
    clients.add(ws);
    ws.on('message', function incoming(fromClientMessage) {
        console.log('received: %s', fromClientMessage);
        const toClientMessage = "Message from server";
        for (let client of clients) {
            client.send(toClientMessage);
        }
    });

    ws.send('connected');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

