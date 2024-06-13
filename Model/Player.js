class Player {

    /**
     *
     * @param {*} playerId
     * @param {*} color
     * @param {*} name

     * */
    constructor(playerId, color, name) {
        this.color = color
        this.playerId = playerId
        this.name = name
        this.playersTurn = false
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



}

module.exports = Player;