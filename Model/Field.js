class Field {
    /**
     * 
     * @param {*} fieldID 
     * @param {*} color 
     * @param {*} type : available types: START, REGULAR, GOAL
     * @param {*} xCoord 
     * @param {*} yCoord 
     */
    constructor(fieldID, xCoord, yCoord, color, type) {
        this.fieldID = fieldID
        this.color = color
        this.type = type
        this.xCoord = xCoord
        this.yCoord = yCoord
    }

    /*TODO: create getters and setters for type
    with the available types START, REGULAR, GOAL
    */
   getXCoord() {
    return this.xCoord
   }
   getYCoord() {
    return this.yCoord
   }
}

module.exports = Field;