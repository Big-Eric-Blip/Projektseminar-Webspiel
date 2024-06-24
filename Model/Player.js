class Player {

    /**
     * 
     * @param {string} playerId
     * @param {string} color 
     * @param {string} name 
     */
    constructor(playerId, color, name){
        this.color = color
        this.playerId = playerId
        this.name = name
        this.playersTurn = false
        this.turnCounter = 0
        this.moveCounter = 0
    }

    //TODO: implement getters and setters

    setPlayersTurn(change) {
        if (change === true || change === false) {
            this.playersTurn = change
        } else {
            console.log("Error: the player's turn for " + this.playerId + " is neither TRUE NOR FALSE")
        }
    }

    getColor() {
        return this.color;
    }
    getPlayerId() {
        return this. playerId
    }

    incrementMoveCounter() {
        this.moveCounter++
    }



}

module.exports = Player;