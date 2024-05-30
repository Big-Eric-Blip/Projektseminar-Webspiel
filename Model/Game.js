const Board = require("./Board");
const Token = require("./Token");
const GameAction = require('../Model/GameAction');
class Game {
    /**
     *
     * @param {string} gameId
     * @param {Player[]} player
     * @param {string} boardType
     */
    constructor(gameId, player, boardType) {
        this.gameId = gameId;
        this.player = player;
        this.boardType = boardType;
        this.tokens = [];
    }

    addPlayer(newPlayer) {
        this.player.push(newPlayer);
    }

    removePlayer(playerId) {
        //TODO implement this method
        //remove player from game: save their points or not?
    }

    addToken(tokenId, playerId, fieldId, color) {
        this.tokens.push(new Token(tokenId, playerId, fieldId, color));
    }

    getAvailableGameActions() {
        //TODO implement this method

    }




}

module.exports = Game;