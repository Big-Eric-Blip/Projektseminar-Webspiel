const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const {v4: uuidv4} = require('uuid');
const Game = require('../Model/Game');
const Player = require('../Model/Player');

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

    const gameId = uuidv4();
    const playerId = uuidv4();

    let game = new Game(gameId, [], data.boardType);
    let player = new Player(playerId, data.playerColor, data.playerName);

    game.addPlayer(player);
    games.push(game);

    res.send({gameId: gameId, playerId: playerId});
});


app.get('/rollDice', (req, res) => {
    const diceResult = Math.floor(Math.random() * 6) + 1;

    res.send({result: diceResult});
});


function checkClientMessage(message) {
    switch (message.type) {
        case 'rollDice':
            return {dieValue: (Math.floor(Math.random() * 6) + 1).toString()};
        default:
            console.log(`Sorry, we are out of ${message.type}.`);
            return {message: `Sorry, we are out of ${message.type}.`};
    }
}

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(fromClientMessage) {
        console.log('received: %s', fromClientMessage);
        let sendBackToClient = checkClientMessage(JSON.parse(fromClientMessage));

        ws.send(JSON.stringify(sendBackToClient));
    });


});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

