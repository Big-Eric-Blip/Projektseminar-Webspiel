class Game {
    /**
     *
     * @param {string} gameID
     * @param {Player[]} player
     * @param {string} boardType
     */
    constructor(gameID, player, boardType) {
        this.gameID = gameID;
        this.player = player;
        this.boardType = boardType;
        // this.startingPositions = startingPositions
        // this.gameArray = gameArray
        // this.goalArray = goalArray
    }

    addPlayer(newPlayer) {
        this.player.push(newPlayer);
    }

//     TODO add removePlayer method
}

module.exports = Game;