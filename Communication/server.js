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
                    let aPlayer = game.player[game.getCurrentPlayerIndex()];
                    game.currentDieValue = dieValue
                    game.calculateAvailableGameActions(board)
                    //let info = aPlayer.name + " rolled a " + dieValue
                    sendMessageToAllPlayers(game, {
                        type: 'updateGame',
                        //message: info,
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
                playerColor: message.playerColor,
                playerName: message.playerName,
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
                    let players = []
                    for (const player of game.player) {
                        if (player.color !== "") {
                            takenColors.push(player.color)
                            let playerHelp = {
                                name: player.name,
                                color: player.color,
                                playerId: player.playerId
                            }
                            players.push(playerHelp)
                        }
                    }

                    let player = new Player(playerId, "", "");
                    game.addPlayer(player);
                    return {
                        type: 'joinGame',
                        playerId: playerId,
                        takenColors: takenColors,
                        players: players,
                        fields: board.gameArray.concat(board.homeArray.flat(Infinity), board.goalArray.flat(Infinity))
                    };
                }
            }
            return {
                type: 'joinGame',
                message: `There is no game with game id: ${(message.gameId === "" ? "empty game id" : message.gameId)}`,

            };


        case 'tryPickColor':
            for (const game of games) {
                if (game.gameId === message.gameId) {
                    let takenColors = []
                    let takenNames = []
                    for (const player of game.player) {
                        if (player.color !== "") {
                            takenColors.push(player.color)
                            takenNames.push(player.name)
                        }
                }

                console.log("takenColors:" + takenColors)
                for (const player of game.player) {
                    if (player.playerId === message.playerId && !takenColors.includes(message.playerColor)) {
                        player.color = message.playerColor
                        addTokensOnPlayerJoin(message, playerId, game);
                        player.name = message.playerName
                        takenColors.push(message.playerColor)
                        sendMessageToAllPlayers(game, {
                            type: "newPlayer",
                            name: message.playerName,
                            color: message.playerColor,
                            playerId: message.playerId
                        })
                        return {
                            type: 'pickedColor',
                            message: `Successfully picked color!`,
                            playerColor: message.playerColor,
                            playerName: message.playerName
                        }
                    } else if (takenColors.includes(message.playerColor)) {
                        return {
                            type: 'colorTaken',
                            message: `The color ${message.playerColor} is already taken.`,
                            color: message.playerColor
                        }
                    } else if (takenNames.includes(message.playerName)) {
                        return {
                            type: 'nameTaken',
                            message: `The name ${message.playerName} is already taken.`,
                            name: message.playerName
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
            if (games[i].player.length === 0 && games[i].winner.length === 0) {
                games.splice(i, 1);
            } else {
                games[i].tokens = games[i].tokens.filter(token => token.color !== leavingPlayer.color);
                if (games[i].status === "GAME_RUNNING") {
                    games[i].calculateAvailableGameActions(board)
                    let info = leavingPlayer.name + " (" + leavingPlayer.color + " player) left the game."
                    sendUpdateToAllPlayers(games[i], info)
                }

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
        }
    }
    return {type: 'message', message: `There is no game with game id: ${message.gameId}.`};
case"action_MOVE":
    console.log(message);
    for (const game of games) {
        if (game.gameId === message.gameId) {
            game.moveToken(board, message.tokenId, message.fieldId, game.currentDieValue);
            game.calculateAvailableGameActions(board)
            let aPlayer = game.getPlayerById(message.playerId);
            let info = aPlayer.name + " moved a game piece."
            sendUpdateToAllPlayers(game, info);
        }
    }
    break;
case"action_LEAVE_HOUSE":
    for (const game of games) {
        if (game.gameId === message.gameId) {
            game.leaveHouse(board, message.playerId, message.tokenId)
            game.calculateAvailableGameActions(board)
            let aPlayer = game.getPlayerById(message.playerId);
            let info = aPlayer.name + " moved out of the house"
            sendUpdateToAllPlayers(game, info);
        }
    }
    break
case"action_BEAT":
    for (const game of games) {
        if (game.gameId === message.gameId) {
            game.beatToken(board, message.tokenId, message.fieldId, game.currentDieValue)
            game.calculateAvailableGameActions(board)
            let aPlayer = game.getPlayerById(message.playerId);
            let info = aPlayer.name + " beat another token!"
            sendUpdateToAllPlayers(game, info);
        }
    }
    break
case"action_ENTER_GOAL":
    for (const game of games) {
        if (game.gameId === message.gameId) {
            game.enterGoal(message.tokenId, message.fieldId)
            let aPlayer = game.getPlayerById(message.playerId);
            let info = aPlayer.name + " moved into the goal!"
            // if game is won fully
            if (game.areAllPlayersWinners()) {
                let winners = JSON.stringify(game.getWinners())
                let finalInfo = aPlayer.name + " moved into the goal. The game is now over!"
                sendMessageToAllPlayers(game, {
                    type: "updateGame",
                    message: finalInfo,
                    status: game.status,
                    gameId: game.gameId,
                    tokens: JSON.stringify(game.tokens),
                    winners: winners
                })
                return
                // If game is won partially
            } else if (game.isPlayerWinner(game.getPlayerById(message.playerId))) {
                info = aPlayer.name + " finished the game!"
            }
            game.calculateAvailableGameActions(board)
            sendUpdateToAllPlayers(game, info);
        }
    }

    break
case"action_MOVE_GOAL":
    for (const game of games) {
        if (game.gameId === message.gameId) {
            game.moveInGoal(message.tokenId, message.fieldId)
            game.calculateAvailableGameActions(board)
            let aPlayer = game.getPlayerById(message.playerId);
            let info = aPlayer.name + " moved in the goal!"
            sendUpdateToAllPlayers(game, info);
        }
    }
    break

case"chatMessage":
    for (const game of games) {
        if (game.gameId === message.gameId) {
            let colorOfSendingPlayer = ""
            for (const aPlayer of game.player) {
                if (aPlayer.playerId === playerId) {
                    colorOfSendingPlayer = aPlayer.color
                    break
                }
            }
            sendMessageToAllPlayers(game, {
                type: 'chatMessage',
                playerColor: colorOfSendingPlayer,
                chatMessage: message.chatMessage
            })
            break
        }
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
    for (const winner of game.winner) {
        let client = clients.get(winner.playerId)
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
        // Check if empty just in case there is no message to return
        if (sendBackToClient) {
            ws.send(JSON.stringify(sendBackToClient));
        }
    });

    ws.on('close', () => {
        clients.delete(playerId);
        // check if the client is still in a game
        leaveGameOnCloseWindow(playerId);
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

