class GameAction {
    constructor(playerId, action, tokenId, fieldId, amount) {
        this.playerId = playerId
        this.action = action
        this.tokenId = tokenId
        this.fieldId = fieldId
        this.amount = amount
    }

}
module.exports = GameAction;
