class Field {
    /**
     * Constructs a field that is part of a board
     * @param {string} fieldId the id of the field, used throughout the game
     * @param {string} color the color of the field
     * @param {*} type available types: START, REGULAR, GOAL
     * @param {*} xCoordinate
     * @param {*} yCoordinate
     */
    constructor(fieldId, xCoordinate, yCoordinate, color, type) {
        this.fieldId = fieldId
        this.color = color
        this.type = type
        this.xCoord = xCoordinate
        this.yCoord = yCoordinate
    }
}

module.exports = Field;