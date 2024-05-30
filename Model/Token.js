class Token {

    constructor(tokenId, playerId, fieldId, color) {
        this.tokenId = tokenId
        this.playerId = playerId;
        this.fieldId = fieldId;
        this.color = color;
        this.traversedDistance = 0;
        this.inHouse = true;
        this.inGame = false;
        this.inGoal = false;
    }

    getCurrentFieldId() {
        return this.fieldId
    }

    setNewFieldId(fieldId) {
        this.fieldId = fieldId
    }
    updateTraversedDistance(increment) {
        this.traversedDistance = this.traversedDistance + increment;
    }
}


module.exports = Token;