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
    }

    addPlayer(newPlayer) {
        this.player.push(newPlayer);
    }

//     TODO add removePlayer method
}

module.exports = Game;