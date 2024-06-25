const Field = require('./Field');

class Board {

    /**
     * Constructs a board with coordinates that match the 1100 x 1100 HTML Canvas board in the Renderer
     * @param {number} numberOfTokens the number of tokens per player, usually four
     * @param {number} maxPlayers the maximum amount of players that can play on the board
     */
    constructor(numberOfTokens, maxPlayers) {
        this.numberOfTokens = numberOfTokens
        this.maxPlayers = maxPlayers
        this.gameArray = [
            new Field('wp1', 50, 450, "blue", 'REGULAR'),
            new Field('wp2', 150, 450, "white", 'REGULAR'),
            new Field('wp3', 250, 450, "white", 'REGULAR'),
            new Field('wp4', 350, 450, "white", 'REGULAR'),
            new Field('wp5', 450, 450, "white", 'REGULAR'),
            new Field('wp6', 450, 350, "white", 'REGULAR'),
            new Field('wp7', 450, 250, "white", 'REGULAR'),
            new Field('wp8', 450, 150, "white", 'REGULAR'),
            new Field('wp9', 450, 50, "white", 'REGULAR'),
            new Field('wp10', 550, 50, "white", 'REGULAR'),
            new Field('wp11', 650, 50, "red", 'REGULAR'),
            new Field('wp12', 650, 150, "white", 'REGULAR'),
            new Field('wp13', 650, 250, "white", 'REGULAR'),
            new Field('wp14', 650, 350, "white", 'REGULAR'),
            new Field('wp15', 650, 450, "white", 'REGULAR'),
            new Field('wp16', 750, 450, "white", 'REGULAR'),
            new Field('wp17', 850, 450, "white", 'REGULAR'),
            new Field('wp18', 950, 450, "white", 'REGULAR'),
            new Field('wp19', 1050, 450, "white", 'REGULAR'),
            new Field('wp20', 1050, 550, "white", 'REGULAR'),
            new Field('wp21', 1050, 650, "green", 'REGULAR'),
            new Field('wp22', 950, 650, "white", 'REGULAR'),
            new Field('wp23', 850, 650, "white", 'REGULAR'),
            new Field('wp24', 750, 650, "white", 'REGULAR'),
            new Field('wp25', 650, 650, "white", 'REGULAR'),
            new Field('wp26', 650, 750, "white", 'REGULAR'),
            new Field('wp27', 650, 850, "white", 'REGULAR'),
            new Field('wp28', 650, 950, "white", 'REGULAR'),
            new Field('wp29', 650, 1050, "white", 'REGULAR'),
            new Field('wp30', 550, 1050, "white", 'REGULAR'),
            new Field('wp31', 450, 1050, "yellow", 'REGULAR'),
            new Field('wp32', 450, 950, "white", 'REGULAR'),
            new Field('wp33', 450, 850, "white", 'REGULAR'),
            new Field('wp34', 450, 750, "white", 'REGULAR'),
            new Field('wp35', 450, 650, "white", 'REGULAR'),
            new Field('wp36', 350, 650, "white", 'REGULAR'),
            new Field('wp37', 250, 650, "white", 'REGULAR'),
            new Field('wp38', 150, 650, "white", 'REGULAR'),
            new Field('wp39', 50, 650, "white", 'REGULAR'),
            new Field('wp40', 50, 550, "white", 'REGULAR')]

        this.goalArray = [
            [
                // blue safe (Starting position 0)
                new Field('bi1', 150, 550, "blue", 'GOAL'),
                new Field('bi2', 250, 550, "blue", 'GOAL'),
                new Field('bi3', 350, 550, "blue", 'GOAL'),
                new Field('bi4', 450, 550, "blue", 'GOAL')],
            // red safe (Starting position 1)
            [
                new Field('ri1', 550, 150, "red", 'GOAL'),
                new Field('ri2', 550, 250, "red", 'GOAL'),
                new Field('ri3', 550, 350, "red", 'GOAL'),
                new Field('ri4', 550, 450, "red", 'GOAL')],
            //green safe (Starting position 2)
            [
                new Field('gi1', 950, 550, "green", 'GOAL'),
                new Field('gi2', 850, 550, "green", 'GOAL'),
                new Field('gi3', 750, 550, "green", 'GOAL'),
                new Field('gi4', 650, 550, "green", 'GOAL')],
            // yellow safe (Starting position 3)
            [
                new Field('yi1', 550, 950, "yellow", 'GOAL'),
                new Field('yi2', 550, 850, "yellow", 'GOAL'),
                new Field('yi3', 550, 750, "yellow", 'GOAL'),
                new Field('yi4', 550, 650, "yellow", 'GOAL')]
        ]

        this.homeArray = [
            // blue home (Starting position 0)
            [
                new Field('bt1', 50, 50, "blue", 'HOME'),
                new Field('bt2', 50, 150, "blue", 'HOME'),
                new Field('bt3', 150, 50, "blue", 'HOME'),
                new Field('bt4', 150, 150, "blue", 'HOME')],

            // red home (Starting position 1)
            [
                new Field('gt1', 950, 950, "green", 'HOME'),
                new Field('gt2', 950, 1050, "green", 'HOME'),
                new Field('gt3', 1050, 950, "green", 'HOME'),
                new Field('gt4', 1050, 1050, "green", 'HOME')],

            // green home (Starting position 2)
            [
                new Field('yt1', 50, 950, "yellow", 'HOME'),
                new Field('yt2', 50, 1050, "yellow", 'HOME'),
                new Field('yt3', 150, 950, "yellow", 'HOME'),
                new Field('yt4', 150, 1050, "yellow", 'HOME')],

            // yellow home (Starting position 3)
            [
                new Field('rt1', 950, 50, "red", 'HOME'),
                new Field('rt2', 950, 150, "red", 'HOME'),
                new Field('rt3', 1050, 50, "red", 'HOME'),
                new Field('rt4', 1050, 150, "red", 'HOME')]
        ]
    }

    /**
     * Determines the fieldId of the starting positions for a given color
     * @param color of the player
     * @return {string} the fieldId of the starting field for the given {color}
     */
    getStartingPosition(color) {
        switch (color) {
            case "blue":
                return "wp1"
            case "red":
                return "wp11"
            case "green":
                return "wp21"
            case "yellow":
                return "wp31"
            default:
                return "This is an invalid color";
        }
    }


    /**
     * Gets the next position of a token for a given die value
     * @param {string} currentFieldId the current token position
     * @param {number} dieValue the number of fields to be advanced
     * @param {number} traversedDistance the distance the token has already travelled, max 40
     * @return {*|string|string} the fieldId of the field where the token is positioned next
     */
    getNextPosition(currentFieldId, dieValue, traversedDistance) {
        let trueDieValue
        if(dieValue instanceof Number){
            trueDieValue = dieValue
        } else {
            trueDieValue = Number(dieValue)
        }
        let currentIndex = this.gameArray.findIndex(field => field.fieldId === currentFieldId);
        let fieldId = "test"
        let nextIndex = (currentIndex + trueDieValue)
        console.log("Index: " + nextIndex)
        if (traversedDistance + trueDieValue > 40) {
            return "goalArray"
        } else {
            if (currentIndex + trueDieValue > 39) {
                nextIndex = (currentIndex + trueDieValue) - 40
                console.log("Index: " + nextIndex)
            }
            let field = this.gameArray[nextIndex]
            fieldId = field.fieldId
        }
        return fieldId
    }

    getNextGoalPosition(currentFieldId, dieValue, goalArrayIndex) {
        let currentIndex = -50
        for(let i = 0; i < this.goalArray[goalArrayIndex].length; i++) {
            if(this.goalArray[goalArrayIndex][i].fieldId === currentFieldId) {
                currentIndex = i
            }
        }
        if (-1 < currentIndex + dieValue < 4) {
            return this.goalArray[goalArrayIndex][currentIndex + dieValue].fieldId
        } else {
            return false
        }
    }

}

module.exports = Board;
