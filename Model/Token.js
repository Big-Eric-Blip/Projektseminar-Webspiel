class Token {
/**
 * 
 * @param {*} playerID 
 * @param {*} fieldID 
 */
    constructor(playerID, fieldID) {
        this.playerID = playerID
        this.fieldID = fieldID // may be unnecessary?
        this.traversedDistance = 0
        this.inHouse = true
        this.inGame = false
        this.inGoal = false
    }
}