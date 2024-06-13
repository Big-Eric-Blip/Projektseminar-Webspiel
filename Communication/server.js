const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const {v4: uuidv4} = require('uuid');
const Game = require('../Model/Game');
const Player = require('../Model/Player');
const Board = require('../Model/Board');
const Die = require('../Model/Die')

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
            let game = new Game(gameId, [], message.boardType, "LOBBY");
            let player = new Player(playerId, message.playerColor, message.playerName);
            addTokensOnPlayerJoin(message, playerId, game);
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
                    if (game.status !== "LOBBY") {
                        return {
                            type: 'joinGame',
                            message: `The game has already started.`
                        };
                    }
                    if (game.player.length >= board.maxPlayers) {
                        return {
                            type: 'joinGame',
                            message: `The game you've tried to join is full. There is no space for another player.`
                        };
                    }
                    sendMessageToAllPlayers(game, {
                        type: "playerJoined",
                        numberOfPlayers: game.player.length + 1
                    });
                    let player = new Player(playerId, "", "");
                    game.addPlayer(player);
                    return {
                        type: 'joinGame',
                        playerId: playerId
                    };
                }
            }
            return {
                type: 'joinGame',
                message: `There is no game with game id: ${(message.gameId === "" ? "empty game id" : message.gameId)}`
            };
        case 'leaveGame':
            for (let i = 0; i < games.length; i++) {
                if (games[i].gameId === message.gameId) {
                    const leavingPlayer = games[i].removePlayer(playerId);
                    // if the game is empty delete the game
                    if (games[i].player.length === 0) {
                        games.splice(i, 1);
                        // TODO else if (games[i].player.length === 1) trigger winning screen
                    } else {
                        sendMessageToAllPlayers(games[i], {
                            type: 'aPlayerLeftGame',
                            colorOfLeavingPlayer: leavingPlayer.color,
                            nameOfLeavingPlayer: leavingPlayer.name,
                            numberOfPlayers: games[i].player.length
                        });
                    }
                    return {
                        type: 'leftGame',
                        gameId: message.gameId
                    }
                }
            }
            return {
                type: 'message', message: 'There is no game with game id: ' + message.gameId +
                    '. Meaning you are not in the game with this id.'
            };
        case 'startGame':
            //     transfer game status
            for (const game of games) {
                if (game.gameId === message.gameId) {
                    game.status = "GAME_RUNNING";
                    sendMessageToAllPlayers(game, {
                        type: 'gameStarted',
                        gameId: game.gameId,
                        message: 'The game started!'
                    });
                    game.initializePlayersTurn()
                    game.calculateAvailableGameActions(board)
                    return {
                       //type: "message",
                        type: "updateGame",
                        message: "You´ve started the game.",
                        status: game.status,
                        gameId: game.gameId,
                        gameActions: JSON.stringify(game.gameActions),
                        tokens: JSON.stringify(game.tokens)

                    }
                    //     todo check in joinGame case if game is in status LOBBY

                }
            }
            break;
        case "action_moveToken":
            console.log(message);
            // TODO following code doesn't work. Has to be reworked.
            // game.moveToken(message.tokenId,message.diceResult);
            //
            //
            // return {
            //     type: "moveToken",
            //     tokenId: tokenId,
            //     diceResult: diceResult
            //
            // }
            break;
        case "action_leaveHouse":

            break;

        default:
            console.log(`Server: Sorry, we are out of ${message.type}.`);
            return {type: 'message', message: `Server: Sorry, we are out of ${message.type}.`};
    }
}

function sendMessageToAllPlayers(game, jsonMessage) {
    for (const player of game.player) {
        let client = clients.get(player.playerId)
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(jsonMessage));
        }
    }
}

function addTokensOnPlayerJoin(message, playerId, game) {
    for (const fields of board.homeArray) {
        if (fields[0].color === message.playerColor) {
            for (let i = 0; i < fields.length; i++) {
                //TODO: match Tokenid with front end!
                let tokenId = message.playerColor + (i + 1)
                game.addToken(tokenId, playerId, fields[i].fieldId, message.playerColor);
                //old constructor
                //game.addToken(playerId, fields[i].fieldId, fields[i].xCoord, fields[i].yCoord, message.playerColor);
            }
            break;
        }
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
        console.log('Current games:', games)

        ws.send(JSON.stringify(sendBackToClient));
    });

    ws.on('close', () => {
        clients.delete(playerId);
        // check if the client is still in a game
        leaveGameOnCloseWindow(playerId);

        console.log(`Client disconnected: ${playerId}`);
        console.log(`Currently connected clients:`, [...clients.keys()]);
    });


});

function leaveGameOnCloseWindow(playerId) {
    for (const game of games) {
        for (const player of game.player) {
            if (player.playerId === playerId) {
                checkClientMessage({type: 'leaveGame', gameId: game.gameId}, playerId);
                return;
            }
        }
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

