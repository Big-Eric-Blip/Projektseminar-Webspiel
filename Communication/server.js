const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const {v4: uuidv4} = require('uuid');
const Game = require('../Model/Game');
const Player = require('../Model/Player');
const Board = require('../Model/Board');


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const clients = new Map();
let games = [];
let board = new Board(4, 4);

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'main.html'));
});

app.use(express.json());


function checkClientMessage(message, playerId) {
    switch (message.type) {
        case 'rollDice':
            return {
                type: 'rollDice',
                dieValue: (Math.floor(Math.random() * 6) + 1).toString()
            };
        case 'createGame':
            const gameId = uuidv4();
            let game = new Game(gameId, [], message.boardType);
            let player = new Player(playerId, message.playerColor, message.playerName);
            game.addPlayer(player);
            games.push(game);
            return {
                type: 'createGame',
                gameId: gameId,
                playerId: playerId
            };
        case 'joinGame':
            for (const game of games) {
                if (game.gameId === message.gameId) {
                    if (game.player.length >= board.maxPlayers) {
                        return {message: `The game you've tried to join is full. There is no space for another player.`};
                    }
                    for (const player of game.player) {
                        let client = clients.get(player.playerID)
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({type: "playerJoined", numberOfPlayers: game.player.length + 1}));
                        }
                    }
                    let player = new Player(playerId, "", "");
                    game.addPlayer(player);
                    return {
                        type: 'joinGame',
                        playerId: playerId
                    };
                }
            }
            return {message: `There is no game with game id: ${message.gameId}`};
        default:
            console.log(`Sorry, we are out of ${message.type}.`);
            return {message: `Sorry, we are out of ${message.type}.`};
    }
}

wss.on('connection', function connection(ws) {
    const playerId = uuidv4();
    ws.playerId = playerId;
    clients.set(playerId, ws);
    console.log(`New client connected: ${playerId}`);

    ws.on('message', function incoming(fromClientMessage) {
        console.log(`Received message from ${playerId}: ${fromClientMessage}`);
        let sendBackToClient = checkClientMessage(JSON.parse(fromClientMessage), playerId);

        console.log(`Current clients:`, [...clients.keys()]);

        ws.send(JSON.stringify(sendBackToClient));
    });

    ws.on('close', () => {
        clients.delete(playerId);
        console.log(`Client disconnected: ${playerId}`);
        console.log(`Currently connected clients:`, [...clients.keys()]);
    });


});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

