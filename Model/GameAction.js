class GameAction {
    //TODO: potential problem: tokens have no IDs -> combined ID from playerId and fieldId?
    //available actions: MOVE, ROLLDIE
    constructor(playerId, fieldId, action, amount) {
        this.playerId = playerId
        this.fieldId = fieldId
        this.action = action
        this.amount = amount
    }

}
module.exports = GameAction;