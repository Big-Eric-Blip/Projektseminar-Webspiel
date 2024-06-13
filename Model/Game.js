const Board = require("./Board");
const Token = require("./Token");
const GameAction = require('../Model/GameAction');

class Game {
    /**
     *
     * @param {string} gameId
     * @param {Player[]} player
     * @param {string} boardType
     * @param {string} status can be: "LOBBY", "GAME_RUNNING", "GAME_OVER"
     */
    constructor(gameId, player, boardType, status) {
        this.gameId = gameId;
        this.player = player;
        this.boardType = boardType;
        this.tokens = [];
        this.status = status;
        this.gameActions = [];
        this.currentDieValue = 0
        this.playersTokens = []
    }

    //GETTERS, SETTERS and ADMIN functions
    addPlayer(newPlayer) {
        this.player.push(newPlayer);
    }

    updatePlayersTurn() {
        //TODO implement this method
    }

    /**
     * Randomly chooses one player to start the game by setting the player's playersTurn attribute to {true}
     */
    initializePlayersTurn() {
        let numberOfPlayers = this.player.length
        let turn = Math.floor(Math.random() * (numberOfPlayers)) + 1;
        this.player[turn-1].setPlayersTurn(true)
        console.log("Player " + this.player[turn-1].getPlayerId() + " has player's turn set to TRUE")
    }

    updateCurrentDieValue(value) {
        this.currentDieValue = value
    }

    /**
     * Helper function for calculateGameAction
     * @return {number} the index of the player whose turn it currently is
     */
    getCurrentPlayerIndex() {
        return this.player.findIndex(player => player.playersTurn === true)
    }

    /**
     * Add a new token to the token array in Game
     * @param tokenId the id of the token
     * @param playerId the id of the player that owns the token
     * @param fieldId the fieldId the token is currently placed on
     * @param color the color of the token
     */
    addToken(tokenId, playerId, fieldId, color) {
        this.tokens.push(new Token(tokenId, playerId, fieldId, color));
    }

    /**
     * This function supports the function calculateAvailableGameActions()
     * @param currentPlayer is the player allowed to execute the next move(s) in the game
     * @return {*} an array with all tokens of the current player currentPlayer
     */
    getPlayersTokens(currentPlayer) {
        //empty the existing array
        while (this.playersTokens.length > 0) {
            this.playersTokens.pop()
        }
        //fill the existing array with the correct tokens
        for (let i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].playerId === currentPlayer.playerId) {
                this.playersTokens.push(this.tokens[i])
            }
        }
        return this.playersTokens;
    }

    /**
     * function to determine if a field is empty
     * @param  fieldId
     * @return {*|boolean} true if field is empty,
     * else the token object that currently occupies it
     */
    isFieldEmpty(fieldId) {
        for (let i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].fieldId === fieldId) {
                return this.tokens[i]
            }
        }
        return true;
    }

    getGoalArrayIndex(player) {
        switch (player.color.charAt(0)) {
            case 'b':
                return 0
            case 'g':
                return 1
            case 'y':
                return 2
            case 'r':
                return 3
        }
        return -1;
    }

    /**
     *
     * @param board the board the game is played on
     * @param neededFields the number of fields necessary for a successful move
     * @param index zero-indexed, the [][i]-position within the goal array
     * @return {boolean} whether or not the path is clear
     */
    isGoalPathClear(board, neededFields, index) {
        let gLoop = index
        let gCount = 0
        while (gLoop < neededFields) {
            //getGoalArrayIndex() returns
            if (this.isFieldEmpty(board.goalArray[this.getGoalArrayIndex(this.getCurrentPlayerIndex())][gLoop])) {
                gCount++
            } else {
                break;
            }
            gLoop++
        }
        return neededFields === gCount;
    }

    /**
     * This function calculates the currently available game actions.
     * It does NOT execute any actions by itself. The actions are then triggered
     * in the next step by the client
     * Available actions: LEAVE_HOUSE, ENTER_GOAL, BEAT, MOVE, MOVE_GOAL, ENTER_GOAL
     * @param board on which the game actions are performed
     */
    calculateAvailableGameActions(board) {
        //empty out all old values
        this.gameActions = []

        //calculate new values
        let currentPlayer = this.player[this.getCurrentPlayerIndex()]
        //die value available?
        if (this.currentDieValue === 0) {
            // it's the player's turn to roll the die
            this.gameActions.push(new GameAction(currentPlayer.playerId, 'ROLL_DIE'))

        } else {
            //available moves: MOVE, NONE, BEAT
            //case by case
            if (this.currentDieValue === 6) {
                //leave home + maybe move from starting position
                //check if field starting position is empty or contains other token
                let startingPosition = board.getStartingPosition(currentPlayer.getColor())
                let fieldCheck = this.isFieldEmpty(startingPosition)
                //if own token on starting position: needs to move!
                // except if beats own token
                for (let i = 0; i < this.playersTokens.length; i++) {
                    //If there are tokens in the player's home
                    if (board.getFieldType(this.playersTokens[i].fieldId) === 'HOME') {
                        //case starting field empty
                        if (fieldCheck === true) {
                            this.gameActions.push(new GameAction(currentPlayer.playerId,
                                'LEAVE_HOUSE', this.playersTokens[i].tokenId, startingPosition,
                                this.currentDieValue))
                            //case starting field populated by enemy token
                        } else if(fieldCheck.getTokensPlayerId() !== currentPlayer.getPlayerId()) {
                            this.gameActions.push(new GameAction(currentPlayer.playerId,
                                'BEAT', this.playersTokens[i].tokenId, startingPosition,
                                this.currentDieValue))
                            //case starting field populated by own token
                        } else {
                            // move that token!
                            let nextFieldCheck = board.getNextPosition(fieldCheck.fieldId, this.currentDieValue, 1)
                            let nextTokenCheck = this.isFieldEmpty(nextFieldCheck)
                            if(nextTokenCheck === true || nextTokenCheck.getTokensPlayerId() !== currentPlayer.getPlayerId()) {
                                // fieldCheck (see above) has returned player's own token on the starting field
                                //this check only goes one level deep! expand in the future
                                this.gameActions.push(new GameAction(currentPlayer.playerId,
                                    'MOVE', fieldCheck.tokenId, nextFieldCheck,
                                    this.currentDieValue))
                                break;
                            }
                        }
                    }
                }
                //make sure they can move again!
            } else if (this.currentDieValue < 6 && this.currentDieValue > 0) {
                //regular cases
                //next position = string of the fieldId
                for (let i = 0; i < this.playersTokens.length; i++) {
                    let tokenField = this.playersTokens[i].fieldId
                    if (board.getFieldType(tokenField) === 'REGULAR') {
                        let nextPosition = board.getNextPosition(tokenField,
                            this.currentDieValue, this.playersTokens[i].traversedDistance)
                        //move into goal array
                        if (nextPosition === "goalArray") {
                            //calculate needed free steps
                            let neededFields = this.currentDieValue - (40 - tokenField.traversedDistance)
                            //if the path is clear (enough goal fields are empty), add a game action
                            if (this.isGoalPathClear(board, neededFields,0)) {
                                this.gameActions.push(new GameAction(currentPlayer.playerId, 'ENTER_GOAL',
                                    this.playersTokens[i].tokenId,
                                    board.goalArray[this.getGoalArrayIndex(currentPlayer)][neededFields].fieldId,
                                    this.currentDieValue))
                            }
                            //check if there is a token on the next field
                            //TODO: refactor this else if clause because it doesnt work that way
                        } else if (this.isFieldEmpty(board.getNextPosition(tokenField, this.currentDieValue,
                            this.playersTokens[i].traversedDistance))) {
                            // check that the next field is populated by an enemy token
                            if(this.isFieldEmpty(board.getNextPosition(tokenField, this.currentDieValue,
                                this.playersTokens[i].traversedDistance)).getPlayerId() !== currentPlayer.playerId()) {
                                this.gameActions.push(new GameAction(currentPlayer.playerId, 'BEAT',
                                    this.playersTokens[i].tokenId, nextPosition, this.currentDieValue))
                            }

                        } else {
                            //TODO: treat other "wrong" input later (like strings that aren't actually fieldIds
                            this.gameActions.push(new GameAction(currentPlayer.playerId, 'MOVE',
                                this.playersTokens[i].tokenId, nextPosition, this.currentDieValue))
                        }


                    } else if (board.getFieldType(tokenField) === 'GOAL') {
                        //check needed path
                        let goalArrayIndex = this.getGoalArrayIndex(currentPlayer)
                        let index =
                            board.goalArray[goalArrayIndex].findIndex(field => field.fieldId === tokenField)
                        if (this.isGoalPathClear(board, this.currentDieValue, index)) {
                            let newFieldId = board.getNextGoalPosition(tokenField.fieldId,
                                this.currentDieValue, goalArrayIndex)
                            this.gameActions.push(new GameAction(currentPlayer.playerId, 'MOVE_GOAL',
                                this.playersTokens[i].tokenId, newFieldId, this.currentDieValue))
                        }
                    }
                }
            }
            //if no actions are available, push "NONE" to signal this to the client
            if(this.gameActions.length === 0) {
                this.gameActions.push(new GameAction(currentPlayer.playerId, 'NONE'))
            }

        }
    }

    //actually complete game actions
    leaveHouse(playerId, tokenId) {
        //DO NOT UPDATE PLAYERS TURN!
        //TODO implement this function
    }

    moveToken(playerId, tokenId) {
        //TODO implement this function

    }

    enterGoalArray(playerId, tokenId) {
        //TODO: implement this function

        return false;
    }

    removePlayer(playerId) {
        for (let i = 0; i < this.player.length; i++) {
            if (this.player[i].playerId === playerId) {
                let aPlayer = this.player[i];
                this.player.splice(i, 1);
                return aPlayer;
            }
        }
    }

    beatToken() {

    }


}

module.exports = Game;

