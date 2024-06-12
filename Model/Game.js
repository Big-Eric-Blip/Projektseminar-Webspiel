const Board = require("./Board");
const Token = require("./Token");

class Game {
    /**
     *
     * @param {string} gameId
     * @param {Player[]} player
     * @param {string} boardType
     * @param {string} status can be: "LOBBY", "GAME_RUNNING", "GAME_OVER"
     */
    constructor(gameId, player, boardType, status) {
        this.gameId = gameId;
        this.player = player;
        this.boardType = boardType;
        this.tokens = [];
        this.status = status;
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

    removePlayer(playerId) {
        for (let i = 0; i < this.player.length; i++) {
            if (this.player[i].playerId === playerId) {
                let aPlayer = this.player[i];
                this.player.splice(i, 1);
                return aPlayer;
            }
        }
    }
}

module.exports = Game;