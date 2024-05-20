class Board {
    /**
     *
     * @param {number} numberOfTokens
     * @param {number} maxPlayers
     */
    constructor(numberOfTokens, maxPlayers) {
        this.numberOfTokens = numberOfTokens
        this.maxPlayers = maxPlayers
        this.startingPositions = []
        this.gamrArray = []
        this.goalArray = []
    }

}

module.exports = Board;