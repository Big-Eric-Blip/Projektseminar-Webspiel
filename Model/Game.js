class Game {
    /**
     * 
     * @param {*} gameID 
     * @param {*} player 
     * @param {*} boardType 
     * @param {*} startingPositions 
     * @param {*} gameArray 
     * @param {*} goalArray 
     */
    constructor(gameID, player, boardType, startingPositions, gameArray, goalArray) {
        this.gameID = gameID
        this.player = player
        this.boardType = boardType
        this.startingPositions = startingPositions
        this.gameArray = gameArray
        this.goalArray = goalArray
    }
}