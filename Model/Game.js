const Board = require("./Board");
const Token = require("./Token");
const GameAction = require('../Model/GameAction');

class Game {
    /**
     *
     * @param {string} gameId
     * @param {Player[]} player
     * @param {string} boardType
     */
    constructor(gameId, player, boardType) {
        this.gameId = gameId;
        this.player = player;
        this.boardType = boardType;
        this.tokens = [];
        this.gameActions = [];
        this.currentDieValue = 0
        this.playersTokens = []
    }

    //GETTERS, SETTERS and ADMIN functions
    addPlayer(newPlayer) {
        this.player.push(newPlayer);
    }

    //addToken(playerId, fieldId, xCoord, yCoord, color) {
    //    this.tokens.push(new Token(playerId, fieldId, xCoord, yCoord, color));
    //}

    updatePlayersTurn() {
        //TODO implement this method
    }

    updateCurrentDieValue(value) {
        this.currentDieValue = value
    }

    getCurrentPlayer() {
        return this.player.findIndex(player => player.playersTurn === true)
    }

    getCurrentDieValue() {
        return this.currentDieValue
    }

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
     * else the id of the token that currently occupies it
     */
    isFieldEmpty(fieldId) {
        for (let i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].fieldId === fieldId) {
                return this.tokens[i].tokenId
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

    isGoalPathClear(board, neededFields) {
        let gLoop = 0
        let gCount = 0
        while (gLoop <= neededFields) {
            if (this.isFieldEmpty(board.goalArray[this.getGoalArrayIndex(this.getCurrentPlayer())][gLoop])) {
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
     * @param board on which the game actions are performed
     */
    calculateAvailableGameActions(board) {
        //empty out all old values
        while (this.gameActions.length > 0) {
            this.gameActions.pop()
        }

        //calculate new values
        let currentPlayer = this.getCurrentPlayer()
        let playersTokens = this.getPlayersTokens(currentPlayer)
        // available actions: MOVE, ROLL_DIE, NONE, BEAT, LEAVE_HOUSE, ENTER_GOAL, MOVE_GOAL
        //die value available?
        if (this.currentDieValue > 0) {
            //available moves: MOVE, NONE, BEAT

            //case by case
            if (this.currentDieValue === 6) {
                //leave home + maybe move from starting position
                for (let i = 0; i < this.playersTokens.length; i++) {
                    if (board.getFieldType(this.playersTokens[i].fieldId) === 'HOME') {
                        let startingPosition = board.getStartingPosition(currentPlayer.getColor())
                        this.gameActions.push(new GameAction(currentPlayer.playerId,
                            'LEAVE_HOUSE', this.playersTokens[i].tokenId, startingPosition,
                            this.currentDieValue))
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
                            if (this.isGoalPathClear(board, neededFields)) {
                                this.gameActions.push(new GameAction(currentPlayer.playerId, 'ENTER_GOAL',
                                    this.playersTokens[i].tokenId,
                                    board.goalArray[this.getGoalArrayIndex(currentPlayer)][neededFields].fieldId,
                                    this.currentDieValue))
                            }
                        } else if (this.isFieldEmpty(board.getNextPosition(tokenField) !== true)) {
                            this.gameActions.push(new GameAction(currentPlayer.playerId, 'BEAT',
                                this.playersTokens[i].tokenId, nextPosition, this.currentDieValue))
                        } else {
                            //TODO: treat other "wrong" input later (like strings that aren't actually fieldIds
                            this.gameActions.push(new GameAction(currentPlayer.playerId, 'MOVE',
                                this.playersTokens[i].tokenId, nextPosition, this.currentDieValue))
                        }


                    } else if (board.getFieldType(tokenField) === 'GOAL') {
                        //check needed path
                        if (this.isGoalPathClear(board, this.currentDieValue)) {
                            let newFieldId = board.getNextGoalPosition(tokenField.fieldId,
                                this.currentDieValue, this.getGoalArrayIndex(currentPlayer))
                            this.gameActions.push(new GameAction(currentPlayer.playerId, 'MOVE_GOAL',
                                this.playersTokens[i].tokenId, newFieldId, this.currentDieValue))
                        }
                    }
                }
            }
        } else {
            // it's the player's turn to roll the die
            this.gameActions.push(new GameAction(currentPlayer.playerId, 'ROLL_DIE'))
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

    beatToken() {

    }


}

module.exports = Game;