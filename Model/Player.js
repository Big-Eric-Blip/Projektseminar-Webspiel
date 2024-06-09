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
    }

    //TODO: implement getters and setters
    

}

module.exports = Player;