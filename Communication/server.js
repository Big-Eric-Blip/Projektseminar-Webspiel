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
            for (const game of games) {
                if (game.gameId === message.gameId) {
                    let dieValue = (Math.floor(Math.random() * 6) + 1)
                    //keep the following line for testing purposes
                    //let dieValue = 6
                    game.currentDieValue = dieValue
                    if (0<message.turnCounter <4 && message.turnCounter) {
                        game.calculateAvailableGameActions(board, message.turnCounter)
                    } else {
                        game.calculateAvailableGameActions(board, -1)
                        game.updatePlayersTurn()
                    }

                    sendMessageToAllPlayers(game, {
                        type: 'updateGame',
                        message: "Updated actions after rolling the dice",
                        status: game.status,
                        gameId: game.gameId,
                        gameActions: JSON.stringify(game.gameActions),
                        tokens: JSON.stringify(game.tokens),
                        dieValue: dieValue
                    })
                    return {
                        type: 'message',
                        message: 'Rolled the die: ' + dieValue
                    };
                }
            }
            return {
                type: 'message',
                message: "No game available with this id"
            }
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
                playerId: playerId,
                fields: board.gameArray.concat(board.homeArray.flat(Infinity), board.goalArray.flat(Infinity))
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
                        numberOfPlayers: game.player.length + 1,
                        fields: board.gameArray.concat(board.homeArray.flat(Infinity), board.goalArray.flat(Infinity))
                    });
                    let takenColors = []
                    for (const player of game.player) {
                        if (player.color !== "") {
                            takenColors.push(player.color)
                        }
                    }
                    let player = new Player(playerId, "", "");
                    game.addPlayer(player);
                    return {
                        type: 'joinGame',
                        playerId: playerId,
                        takenColors: takenColors,
                        fields: board.gameArray.concat(board.homeArray.flat(Infinity), board.goalArray.flat(Infinity))
                    };
                }
            }
            return {
                type: 'joinGame',
                message: `There is no game with game id: ${(message.gameId === "" ? "empty game id" : message.gameId)}`,

            };

        case 'pickColor':
            for (const game of games) {
                if (game.gameId === message.gameId) {
                    for (const player of game.player) {
                        if (player.color !== "") {
                            takenColors.push(player.color)
                        }
                    }
                    // TODO Clemens schau dir das nochmal an!!
                    console.log(takenColors)
                    for (const player of game.player) {
                        if (player.playerId === message.playerId) {
                            player.color = message.playerColor
                            player.name = message.playerName
                            addTokensOnPlayerJoin(message, playerId, game);
                            return {type: 'pickedColor', message: `Successfully picked color!`}
                        }
                    }
                    return {type: 'message', message: `There is no player with playerId: ${playerId} in this game.`}
                }
            }
            return {type: 'message', message: `There is no game with game id: ${message.gameId}.`};


        case 'tryPickColor':
            for (const game of games) {
                if (game.gameId === message.gameId) {
                    let takenColors = []

                    for (const player of game.player) {
                        if (player.color !== "") {
                            takenColors.push(player.color)
                        }
                    }
                    console.log(takenColors)
                    for (const player of game.player) {
                        if (player.playerId === message.playerId && !takenColors.includes(message.playerColor)) {
                            player.color = message.playerColor
                            player.name = message.playerName
                            addTokensOnPlayerJoin(message, playerId, game);
                            return {type: 'pickedColor', message: `Successfully picked color!`}
                        } else if (takenColors.includes(message.playerColor)) {
                            return {
                                type: 'colorTaken',
                                message: `The color ${message.playerColor} is already taken.`,
                                color: message.playerColor
                            }
                        }
                    }
                    return {type: 'message', message: `There is no player with playerId: ${playerId} in this game.`}
                }
            }
            return {type: 'message', message: `There is no game with game id: ${message.gameId}.`};


        case 'leaveGame':
            for (let i = 0; i < games.length; i++) {
                if (games[i].gameId === message.gameId) {
                    const leavingPlayer = games[i].removePlayer(playerId);
                    // if the game is empty delete the game
                    if (games[i].player.length === 0) {
                        games.splice(i, 1);
                        // TODO else if (games[i].player.length === 1) trigger winning screen
                    } else {
                        games[i].calculateAvailableGameActions(board)
                        sendMessageToAllPlayers(games[i], {
                            type: 'aPlayerLeftGame',
                            colorOfLeavingPlayer: leavingPlayer.color,
                            nameOfLeavingPlayer: leavingPlayer.name,
                            numberOfPlayers: games[i].player.length
                        });
                        let info = leavingPlayer.name + " (" + leavingPlayer.color + " player) left the game."
                        sendUpdateToAllPlayers(games[i], info)
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
                    game.initializePlayersTurn()
                    game.calculateAvailableGameActions(board)
                    sendMessageToAllPlayers(game, {
                        type: 'gameStarted',
                        status: game.status,
                        gameId: game.gameId,
                        message: 'The game started!',
                        gameActions: JSON.stringify(game.gameActions),
                        tokens: JSON.stringify(game.tokens)
                    });
                    return {
                        type: 'message',
                        message: "You've started the game."
                    }
                    //     todo check in joinGame case if game is in status LOBBY
                }
            }
            return {type: 'message', message: `There is no game with game id: ${message.gameId}.`};
        case "action_MOVE":
            console.log(message);
            for (const game of games) {
                if (game.gameId === message.gameId) {
                    game.moveToken(board, message.tokenId, message.fieldId, game.currentDieValue);
                    game.calculateAvailableGameActions(board)
                    let aPlayer = game.getPlayerById(message.playerId);
                    let info = aPlayer.name + " (" + aPlayer.color + " player) moved a game piece."
                    sendUpdateToAllPlayers(game, info);
                }
            }
            break;
        case "action_LEAVE_HOUSE":
            for (const game of games) {
                if (game.gameId === message.gameId) {
                    //console.log("Arrived at the server side of action_LEAVE_HOUSE")
                    game.leaveHouse(board, message.playerId, message.tokenId)
                    game.calculateAvailableGameActions(board)
                    let aPlayer = game.getPlayerById(message.playerId);
                    let info = aPlayer.name + " (" + aPlayer.color + " player) moved out of the house"
                    sendUpdateToAllPlayers(game, info);
                }
            }
            break
        case "action_BEAT":
            for (const game of games) {
                if (game.gameId === message.gameId) {
                    game.beatToken(board,message.tokenId,message.fieldId, game.currentDieValue)
                    game.calculateAvailableGameActions(board)
                    let aPlayer = game.getPlayerById(message.playerId);
                    let info = aPlayer.name + " (" + aPlayer.color + " player) beat another token!"
                    sendUpdateToAllPlayers(game, info);
                }
            }
            break
        case "action_ENTER_GOAL":
            for (const game of games) {
                if (game.gameId === message.gameId) {
                    game.enterGoal(message.tokenId, message.fieldId)
                }
                game.calculateAvailableGameActions(board)
                let aPlayer = game.getPlayerById(message.playerId);
                let info = aPlayer.name + " (" + aPlayer.color + " player) moved into the goal!"
                sendUpdateToAllPlayers(game, info);
            }
            break

        case "action_MOVE_GOAL":
            for (const game of games) {
                if (game.gameId === message.gameId) {
                    game.moveInGoal(message.tokenId, message.fieldId)
                }
                game.calculateAvailableGameActions(board)
                let aPlayer = game.getPlayerById(message.playerId);
                let info = aPlayer.name + " (" + aPlayer.color + " player) moved in the goal!"
                sendUpdateToAllPlayers(game, info);
            }
            break

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

function sendUpdateToAllPlayers(game, info) {
    let jsonMessage = {
        type: "updateGame",
        message: info,
        status: game.status,
        gameId: game.gameId,
        gameActions: JSON.stringify(game.gameActions),
        tokens: JSON.stringify(game.tokens)
    }
    sendMessageToAllPlayers(game, jsonMessage);
}


function addTokensOnPlayerJoin(message, playerId, game) {
    for (const fields of board.homeArray) {
        if (fields[0].color === message.playerColor) {
            for (let i = 0; i < fields.length; i++) {
                let tokenId = message.playerColor + (i + 1)
                game.addToken(tokenId, playerId, fields[i].fieldId, message.playerColor);
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
        // Check if empty just in case there is no message to return
        if (sendBackToClient) {
            ws.send(JSON.stringify(sendBackToClient));
        }
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

