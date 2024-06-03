const Board = require("./Board");
const Token = require("./Token");

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

    addToken(playerId, fieldId, xCoord, yCoord, color) {
        this.tokens.push(new Token(playerId, fieldId, xCoord, yCoord, color));
    }

    moveToken(tokenId,dieValue){
        this.tokens(tokenId)

    }

        
//     TODO add removePlayer method
}

module.exports = Game;