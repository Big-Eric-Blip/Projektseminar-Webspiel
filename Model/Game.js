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
        this.winner = []
        this.boardType = boardType;
        this.tokens = [];
        this.status = status;
        this.gameActions = [];
        this.currentDieValue = 0
        this.playersTokens = []
        this.allInHouse = false
        this.numOfTokensAtHome = 0
        this.optionsExhausted = false
    }

    //GETTERS, SETTERS and ADMIN functions
    addPlayer(newPlayer) {
        this.player.push(newPlayer);
    }

    /**
     * Moves a player from the player array to the winner array of the game
     * @param {Player} winningPlayer a player who just moved all tokens into the goal area
     */
    addWinningPlayer(winningPlayer) {
        //remove player from player array
        let playerIndex = this.player.findIndex(player => player.playerId === winningPlayer.playerId)
        this.player.splice(playerIndex, 1)
        //add player to winner array
        this.winner.push(winningPlayer)
    }

    /**
     * Moves the attribute playersTurn = true to the next player in the array
     * Exception: if there is only one player in the game, nothing happens
     */
    updatePlayersTurn() {
        if (this.player.length !== 1) {
            let currentIndex = this.getCurrentPlayerIndex()
            this.player[currentIndex].setPlayersTurn(false)
            this.player[currentIndex].turnCounter = 0
            if (this.player.length === currentIndex + 1) {
                this.player[0].setPlayersTurn(true)
            } else {
                this.player[currentIndex + 1].setPlayersTurn(true)
            }
        }
    }
    getWinners() {
        let winners = []
        for(let i = 0; i < this.winner.length; i++) {
            winners.push(new Object({
                playersName: this.winner[i].playersName,
                moveCounter: this.winner[i].moveCounter
            }));
        }

        return winners
    }

    /**
     * Randomly chooses one player to start the game by setting the player's playersTurn attribute to {true}
     */
    initializePlayersTurn() {
        let numberOfPlayers = this.player.length
        let turn = Math.floor(Math.random() * (numberOfPlayers)) + 1;
        this.player[turn - 1].setPlayersTurn(true)
        console.log("Player " + this.player[turn - 1].getPlayerId() + " has player's turn set to TRUE")
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
     * function to determine if a field is empty
     * @param  {String} fieldId
     * @return {*|boolean} true if field is empty, else the token object that currently occupies it
     */
    isFieldEmpty(fieldId) {
        for (let i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].fieldId === fieldId) {
                return this.tokens[i]
            }
        }
        return true;
    }

    /**
     * Returns the goal array index for a given player
     * @param {Player}player
     * @return {number}
     */
    getGoalArrayIndex(player) {
        switch (player.color.charAt(0)) {
            case 'b':
                return 0
            case 'r':
                return 1
            case 'g':
                return 2
            case 'y':
                return 3
        }
        return -1;
    }

    getHomeArrayIndex(tokenColor) {
        switch (tokenColor.charAt(0)) {
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
            if (this.isFieldEmpty(board.goalArray[this.getGoalArrayIndex(this.player[this.getCurrentPlayerIndex()])][gLoop].fieldId) === true) {
                gCount++
            } else {
                break;
            }
            gLoop++
        }
        return neededFields === gCount;
    }

    /**
     * Checks if all tokens of the current player are in the goal
     * @return {boolean}
     */
    areAllTokensInGoal() {
        let goalCount = 0
        for(let i = 0; i < this.playersTokens.length; i++) {
            if(this.playersTokens[i].inGoal === true) {
                goalCount++
            }
        }
        return goalCount === this.playersTokens.length;
    }
    isPlayerWinner(playerId) {
        let player = this.getPlayerById(playerId)
        let goalCount = 0
        for(let i = 0; i < this.tokens.length; i++) {
            if(this.tokens[i].inGoal === true && this.tokens[i].playerId === playerId) {
                goalCount++
            }
        }
        return goalCount === 4
    }

    areAllPlayersWinners() {
        if(this.player.length === 0 && this.winner.length > 0) {
            this.status = "GAME_OVER"
            return true
        } else {
            return false
        }
    }

    /**
     * This function calculates the currently available game actions.
     * It does NOT execute any actions by itself. The actions are then triggered
     * in the next step by the client
     * Available actions: LEAVE_HOUSE, ENTER_GOAL, BEAT, MOVE, MOVE_GOAL, ENTER_GOAL
     * @param {Board} board on which the game actions are performed
     *
     */
    calculateAvailableGameActions(board) {
        //empty out all old values
        this.gameActions = []
        //calculate new values
        let currentPlayer = this.player[this.getCurrentPlayerIndex()]
        //update playersTokens
        //fill the array with the current players tokens + count the number of tokens in the house
        this.playersTokens = []
        let numberOfTokensInHouse = 0
        let numberOfTokensInGoal = 0
        for (let i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].playerId === currentPlayer.playerId) {
                this.playersTokens.push(this.tokens[i])
                if (this.tokens[i].inHouse === true) {
                    numberOfTokensInHouse++
                } else if (this.tokens[i].inGoal === true) {
                    numberOfTokensInGoal++
                }
            }
        }
        //if all tokens are either in the home or the goal array,
        // the player is allowed to roll the die three times
        this.allInHouse = numberOfTokensInHouse + numberOfTokensInGoal === this.playersTokens.length;
        //die value available?
        if (this.currentDieValue === 0) {
            // it's the player's turn to roll the die
            if (this.allInHouse === true) {
                if (currentPlayer.turnCounter < 3) {
                    currentPlayer.turnCounter++
                    this.gameActions.push(new GameAction(currentPlayer.playerId, 'ROLL_DIE'))
                    return
                }
            } else {
                this.gameActions.push(new GameAction(currentPlayer.playerId, 'ROLL_DIE'))
            }
        } else {
            //check if player is on own starting position -> force the move away
            let startingPosition = board.getStartingPosition(currentPlayer.getColor())
            let nextPosition = board.getNextPosition(startingPosition, this.currentDieValue, 1)
            let startingFieldToken = this.isFieldEmpty(startingPosition)
            if (startingFieldToken.playerId === currentPlayer.playerId) {
                //case nextField is empty
                if (this.isFieldEmpty(nextPosition) === true) {
                    this.gameActions.push(new GameAction(currentPlayer.playerId, 'MOVE',
                        startingFieldToken.tokenId, nextPosition, this.currentDieValue))
                    return
                    //case nextField harbors enemy token
                } else if (this.isFieldEmpty(nextPosition).getTokensPlayerId() !== currentPlayer.playerId) {
                    // check that the next field is populated by an enemy token
                    this.gameActions.push(new GameAction(currentPlayer.playerId, 'BEAT',
                        startingFieldToken.tokenId, nextPosition, this.currentDieValue))
                    return
                    //case next field harbors own token
                } else {
                    //check if token on next field can move
                    let nextToken = this.getTokenById(this.isFieldEmpty(nextPosition).getTokenId())
                    let nextTokensNextPosition = board.getNextPosition(nextToken.fieldId, this.currentDieValue, nextToken.traversedDistance)
                    if (this.isFieldEmpty(nextTokensNextPosition) === true) {
                        this.gameActions.push(new GameAction(currentPlayer.playerId, 'MOVE',
                            nextToken.tokenId, nextTokensNextPosition, this.currentDieValue))
                        return
                    } else if (this.isFieldEmpty((nextTokensNextPosition)).getTokensPlayerId() !== currentPlayer.playerId) {
                        this.gameActions.push(new GameAction(currentPlayer.playerId, 'BEAT',
                            nextToken.tokenId, nextTokensNextPosition, this.currentDieValue))
                        return
                    }
                }
            }
        }
        //case by case
        if (this.currentDieValue === 6 || this.currentDieValue === '6') {
            //leave home + maybe move from starting position
            //check if field starting position is empty or contains other token
            let startingPosition = board.getStartingPosition(currentPlayer.getColor())
            let fieldCheck = this.isFieldEmpty(startingPosition)
            //if own token on starting position: needs to move!
            // except if beats own token
            this.numOfTokensAtHome = 0
            this.optionsExhausted = false
            for (let i = 0; i < this.playersTokens.length; i++) {
                //If there are tokens in the player's home
                if (this.playersTokens[i].inHouse === true) {
                    this.numOfTokensAtHome++
                    //case starting field empty
                    if (fieldCheck === true) {
                        this.gameActions.push(new GameAction(currentPlayer.playerId,
                            'LEAVE_HOUSE', this.playersTokens[i].getTokenId(), startingPosition))
                        //case starting field populated by enemy token
                    } else if (fieldCheck.getTokensPlayerId() !== currentPlayer.getPlayerId()) {
                        this.gameActions.push(new GameAction(currentPlayer.playerId,
                            'BEAT', this.playersTokens[i].tokenId, startingPosition,
                            this.currentDieValue))
                        //case starting field populated by own token
                    } else {
                        // move that token!
                        this.optionsExhausted = true
                    }

                }
            }
            if (this.numOfTokensAtHome > 0 && !this.optionsExhausted) {
                return
            }
        }
        if ((this.currentDieValue < 6 && this.currentDieValue > 0) || (this.optionsExhausted)
            || (this.currentDieValue === 6 && this.numOfTokensAtHome === 0)) {
            //if all tokens are on home fields
            if (this.allInHouse === true) {
                if (currentPlayer.turnCounter < 3) {
                    currentPlayer.turnCounter++
                    this.gameActions.push(new GameAction(currentPlayer.playerId, 'ROLL_DIE'))
                    return
                }
            }
            //regular cases
            //next position = string of the fieldId
            for (let i = 0; i < this.playersTokens.length; i++) {
                let tokenFieldId = this.playersTokens[i].fieldId
                if (this.playersTokens[i].inGame === true) {
                    if (this.playersTokens[i].traversedDistance + this.currentDieValue > 40) {
                        //calculate needed free steps
                        let neededFields = this.currentDieValue - (40 - this.playersTokens[i].traversedDistance)
                        let nextFieldId = board.goalArray[this.getGoalArrayIndex(currentPlayer)][neededFields - 1].fieldId
                        //if the path is clear (enough goal fields are empty), add a game action
                        if (this.isGoalPathClear(board, neededFields, 0)) {
                            this.gameActions.push(new GameAction(currentPlayer.playerId, 'ENTER_GOAL',
                                this.playersTokens[i].tokenId,
                                nextFieldId,
                                this.currentDieValue))
                        }

                    } else if (this.isFieldEmpty(board.getNextPosition(tokenFieldId, this.currentDieValue,
                        this.playersTokens[i].traversedDistance)) === true) {
                        let nextPosition = board.getNextPosition(tokenFieldId,
                            this.currentDieValue, this.playersTokens[i].traversedDistance)
                        this.gameActions.push(new GameAction(currentPlayer.playerId, 'MOVE',
                            this.playersTokens[i].tokenId, nextPosition, this.currentDieValue))

                    } else if (this.isFieldEmpty(board.getNextPosition(tokenFieldId, this.currentDieValue,
                        this.playersTokens[i].traversedDistance)).playerId !== currentPlayer.playerId) {
                        let nextPosition = board.getNextPosition(tokenFieldId,
                            this.currentDieValue, this.playersTokens[i].traversedDistance)
                        this.gameActions.push(new GameAction(currentPlayer.playerId, 'BEAT',
                            this.playersTokens[i].tokenId, nextPosition, this.currentDieValue))

                    }

                } else if (this.playersTokens[i].inGoal === true) {
                    //check needed path
                    let goalArrayIndex = this.getGoalArrayIndex(currentPlayer)
                    let index =
                        board.goalArray[goalArrayIndex].findIndex(field => field.fieldId === tokenFieldId)
                    if (index + this.currentDieValue < 4) {
                        if (this.isGoalPathClear(board, this.currentDieValue, index)) {
                            let newFieldId = board.getNextGoalPosition(tokenFieldId.fieldId,
                                this.currentDieValue, goalArrayIndex)
                            this.gameActions.push(new GameAction(currentPlayer.playerId, 'MOVE_GOAL',
                                this.playersTokens[i].tokenId, newFieldId, this.currentDieValue))
                        }
                    }
                }
            }

        }
        //if no actions are available, check if there is more than one player
        if (this.gameActions.length === 0) {
            if (this.player.length === 1) {
                //if there is only one player, let them roll the dice again
                this.gameActions.push(new GameAction(currentPlayer.playerId, 'ROLL_DIE'))
            } else {
                //if no actions are available, push "NONE" to signal this to the client
                this.gameActions.push(new GameAction(currentPlayer.playerId, 'NONE'))
                //if there is more than one player, update the players turn
                this.updatePlayersTurn()
                this.currentDieValue = 0
                this.calculateAvailableGameActions(board)
            }
        }
    }

    getPlayerById(playerId) {
        for (let i = 0; i < this.player.length; i++) {
            if (this.player[i].playerId === playerId) {
                return this.player[i]
            }
        }
        return false;
    }

    getTokenById(tokenId) {
        for (let i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].tokenId === tokenId) {
                return this.tokens[i]
            }
        }
        return false;
    }


    //The following functions actually complete game actions.

    leaveHouse(board, playerId, tokenId) {
        let token = this.getTokenById(tokenId);
        let player = this.getPlayerById(playerId)
        player.incrementMoveCounter()
        token.fieldId = board.getStartingPosition(player.color)
        token.inHouse = false
        token.inGame = true
        token.traversedDistance = 1
        this.currentDieValue = 0
    }

    moveToken(board, tokenId, fieldId, dieValue) {
        let token = this.getTokenById(tokenId);
        let currentPlayer = this.getPlayerById(token.playerId)
        currentPlayer.incrementMoveCounter()
        token.fieldId = fieldId
        token.updateTraversedDistance(dieValue)
        if (dieValue < 6) {
            this.updatePlayersTurn()
        }
        this.currentDieValue = 0
    }

    enterGoal(tokenId, fieldId) {
        let token = this.getTokenById(tokenId);
        let currentPlayer = this.getPlayerById(token.playerId)
        currentPlayer.incrementMoveCounter()
        token.inGame = false
        token.inGoal = true
        token.fieldId = fieldId
        if (this.currentDieValue < 6) {
            this.updatePlayersTurn()
        }
        this.currentDieValue = 0
        if(this.isPlayerWinner(currentPlayer)) {
            this.addWinningPlayer(currentPlayer)
        }
    }

    moveInGoal(tokenId, fieldId) {
        let token = this.getTokenById(tokenId);
        let currentPlayer = this.getPlayerById(token.playerId)
        currentPlayer.incrementMoveCounter()
        token.fieldId = fieldId
        if (this.currentDieValue < 6) {
            this.updatePlayersTurn()
        }
        this.currentDieValue = 0
        if(this.isPlayerWinner(currentPlayer)) {
            this.addWinningPlayer(currentPlayer)
        }
    }

    removePlayer(playerId) {
        for (let i = 0; i < this.player.length; i++) {
            if (this.player[i].playerId === playerId) {
                let aPlayer = this.player[i];
                //update playersTurn
                if (aPlayer.playersTurn === true) {
                    this.updatePlayersTurn()
                }
                this.player.splice(i, 1);
                return aPlayer;
            }
        }
    }

    beatToken(board, tokenId, contestedField, dieValue) {
        //Do not switch the order of the following assignment, otherwise the wrong token may land on the contested field
        // get token that beats
        let token = this.getTokenById(tokenId);
        let enemyToken = this.getTokenByFieldId(contestedField)
        let currentPlayer = this.getPlayerById(token.playerId)
        currentPlayer.incrementMoveCounter()
        enemyToken.traversedDistance = 0
        //send enemy token back to house
        this.sendTokenBackToHouse(enemyToken, board)
        token.fieldId = contestedField
        token.updateTraversedDistance(dieValue)
        if (dieValue < 6) {
            this.updatePlayersTurn()
        }
        this.currentDieValue = 0

    }

    getTokenByFieldId(fieldId) {
        for (let i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].fieldId === fieldId) {
                return this.tokens[i]
            }
        }
        return false
    }

    sendTokenBackToHouse(token, board) {
        token.inGame = false
        token.inHouse = true
        let index = this.getHomeArrayIndex(token.color)
        let fieldIds = []
        let fieldIndex
        //find empty home field
        for (let i = 0; i < board.homeArray[index].length; i++) {
            fieldIds.push(board.homeArray[index][i].fieldId)
        }
        for (let i = 0; i < this.tokens.length; i++) {
            for (let j = 0; j < fieldIds.length; j++) {
                if (this.tokens[i].fieldId === fieldIds[j]) {
                    fieldIds.splice(j, 1)
                }
            }
        }
        //pick the first available home field id
        token.fieldId = fieldIds[0]
    }


}

module.exports = Game;

