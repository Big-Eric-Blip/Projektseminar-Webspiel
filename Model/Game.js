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
    }
    //GETTERS, SETTERS and ADMIN functions
    addPlayer(newPlayer) {
        this.player.push(newPlayer);
    }

    removePlayer(playerId) {
        //TODO implement this method
        //remove player from game: save their points or not?
    }

    updatePlayersTurn() {
        //TODO implement this method
    }
    updateCurrentDieValue(value) {
        this.currentDieValue = value
    }
    getCurrentPlayer(){
        return this.player.findIndex(player => player.playersTurn === true)
    }
    getCurrentDieValue(){
        return this.currentDieValue
    }

    addToken(tokenId, playerId, fieldId, color) {
        this.tokens.push(new Token(tokenId, playerId, fieldId, color));
    }

    //Calculate available game actions
    calculateAvailableGameActions(board) {
        //TODO implement this method
        //empty out all old values
        while(this.gameActions.length > 0) {
            this.gameActions.pop()
        }
        //calculate new values
        let currentPlayer = this.getCurrentPlayer()
        // available actions: MOVE, ROLLDIE, NONE, BEAT
        //die value available?
        if(this.currentDieValue > 0) {
            //MOVE, NONE, BEAT
            //get all array positions for the tokens

            //case by case
            if (this.currentDieValue === 6) {
                //leave home + maybe move from starting position
                for (let i = 0; i<this.tokens.length; i++) {
                    if(this.tokens[i].playerId === currentPlayer.playerId) {
                      if(board.getFieldType(this.tokens[i].fieldId) === 'HOME') {
                          let startingPosition = board.getStartingPosition(currentPlayer.getColor())
                          this.gameActions.push(new GameAction(currentPlayer.playerId,
                              'LEAVE_HOUSE',this.tokens[i].tokenId,startingPosition,this.currentDieValue))
                      }
                    }
                }
                //make sure they can move again!
            } else if (this.currentDieValue <6 && this.currentDieValue >0) {
                //regular cases
                // depends on Lukas' branch
               // let nextPosition = board.getNextPosition()
                // mit Input arbeiten
            }
        } else {
            // it's the player's turn to roll the die
            this.gameActions.push(new GameAction(currentPlayer.playerId,'ROLLDIE'))
        }

    }
    //actually complete game actions
    leaveHouse(playerId, tokenId) {
        //DO NOT UPDATE PLAYERS TURN!
        //TODO implement this function
    }

    moveToken(playerId, tokenId) {

    }
    enterGoalArray(playerId, tokenId) {

    }

    beatToken() {

    }




}

module.exports = Game;