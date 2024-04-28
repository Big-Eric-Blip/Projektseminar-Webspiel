const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const clients = new Set();
let games = [];

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'main.html'));
});

app.use(express.json());

app.post('/createGame', (req, res) => {
    const data = req.body;
    console.log(data);
    const gameId = uuidv4();
    const playerId = uuidv4();

    // TODO create game with new class diagram

    res.send({gameId: gameId, playerId: playerId});
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

