class Board {
 /**
  * 
  * @param {*} numberOfTokens 
  * @param {*} maxPlayers 
  * @param {*} boardFields 
  */
    constructor(numberOfTokens, maxPlayers) {
        this.numberOfTokens = numberOfTokens
        this.maxPlayers = maxPlayers
        this.gameArray = new Array(new Field('wp1', 50, 450, "blue", 'REGULAR'),
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
            new Field('wp24', 850, 650, "white", 'REGULAR'),
            new Field('wp25', 750, 650, "white", 'REGULAR'),
            new Field('wp26', 650, 650, "white", 'REGULAR'),
            new Field('wp27', 650, 750, "white", 'REGULAR'),
            new Field('wp28', 650, 850, "white", 'REGULAR'),
            new Field('wp29', 650, 950, "white", 'REGULAR'),
            new Field('wp30', 650, 1050, "white", 'REGULAR'),
            new Field('wp31', 550, 1050, "white", 'REGULAR'),
            new Field('wp32', 450, 1050, "yellow", 'REGULAR'),
            new Field('wp33', 450, 950, "white", 'REGULAR'),
            new Field('wp34', 450, 850, "white", 'REGULAR'),
            new Field('wp35', 450, 750, "white", 'REGULAR'),
            new Field('wp36', 450, 650, "white", 'REGULAR'),
            new Field('wp37', 350, 650, "white", 'REGULAR'),
            new Field('wp38', 250, 650, "white", 'REGULAR'),
            new Field('wp39', 150, 650, "white", 'REGULAR'),
            new Field('wp40', 50, 650, "white", 'REGULAR'),
            new Field('wp41', 50, 550, "white", 'REGULAR'))

        this.goalArray = new Array(new Array(
            // blue safe (Starting position 0)
            new Field('bi1', 150, 550, "blue", 'GOAL'),
            new Field('bi2', 250, 550, "blue", 'GOAL'),
            new Field('bi3', 350, 550, "blue", 'GOAL'),
            new Field('bi4', 450, 550, "blue", 'GOAL')),
        // red safe (Starting position 1)
        new Array(
            new Field('ri1', 550, 150, "red", 'GOAL'),
            new Field('ri2', 550, 250, "red", 'GOAL'),
            new Field('ri3', 550, 350, "red", 'GOAL'),
            new Field('ri4', 550, 450, "red", 'GOAL')),
        //green safe (Starting position 2)
        new Array(
            new Field('gi1', 650, 550, "green", 'GOAL'),
            new Field('gi2', 750, 550, "green", 'GOAL'),
            new Field('gi3', 850, 550, "green", 'GOAL'),
            new Field('gi4', 950, 550, "green", 'GOAL')),
        // yellow safe (Starting position 3)
        new Array(
            new Field('yi1', 550, 650, "yellow", 'GOAL'),
            new Field('yi2', 550, 750, "yellow", 'GOAL'),
            new Field('yi3', 550, 850, "yellow", 'GOAL'),
            new Field('yi4', 550, 950, "yellow", 'GOAL')),
        )

        function getStartingPosition(color){
            switch(color) {
                case "blue": return "wp1"
                case "red": return "wp11"
                case "green": return "wp21"
                case "yellow": return "wp32"
                default: return "This is an invalid color"
            }
        }

    }


    }