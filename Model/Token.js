class Token {
    /**
     *
     * @param {string} playerId
     * @param {string} fieldId
     * @param {number} xCoord
     * @param {number} yCoord
     * @param {string} color
     */
    constructor(playerId, fieldId, xCoord, yCoord, color) {
        this.playerId = playerId;
        this.fieldId = fieldId;
        this.xCoord = xCoord;
        this.yCoord = yCoord;
        this.color = color;
        this.traversedDistance = 0;
        this.inHouse = true;
        this.inGame = false;
        this.inGoal = false;
    }
}

module.exports = Token;