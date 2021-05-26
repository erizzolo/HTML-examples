/**
 * script handling the game model: current situation, moves and so on
 * It MUST be possible to change this script without affecting the gui.js
 * It MUST provide the following function (called by the gui script):
 *  newGame     : starts a new game
 *  turnPlayer  : returns the player who should move (in outer form)
 *  getElapsed  : returns the total elapsed timer for a player (in ms)
 *  makeMove    : lets turnPlayer make a move (in outer form)
 *  getWinner   : returns the winner if isOver (in outer form)
 *  getBoard    : returns the board (in outer form)
 *  getHistory  : returns the history of moves (in outer form)
 *  getWinning  : returns the winning cells (in outer form)
 *  getJSON     : returns a JSON representation of the game
 *  fromJSON    : restores a game from its JSON representation
 */

// usual way to get a function called after document loading
window.addEventListener('DOMContentLoaded', modelSetup, false)

// NOTA BENE:
// rappresentazione interna (molto meno ovvia e variabile a piacere)
// identificatore celle:
//  un numero da 0 a 8 dall'alto in basso, da sinistra a destra
// contenuto celle (giocatore che l'ha marcata):
//  un numero tra 0 e 2 (giocatore uno, due, nessuno)
const PLAYER_ONE = 0    // player one
const PLAYER_TWO = 1    // player two
const PLAYER_NONE = 2   // no player
// strutture dati utilizzate:
//  situazione attuale: board = array di 9 elementi con board[identificatore] = contenuto
//   è ridondante/superflua dato che viene mantenuta la storia del gioco ...
//  storia del gioco: moves = array di n (0..9) elementi con moves[i] = identificatore i-esima mossa
//                      + startPlayer = giocatore iniziale (per sapere chi deve effettuare la mossa)

// constants ------------------------------------------------------------------
const BASE = 3
const CELLS = BASE * BASE // number of cells

// globals --------------------------------------------------------------------
let game    // the game

// funzioni per il passaggio tra rappresentazione interna ed esterna ----------
/**
 * Return the inner cell corresponding to a given outer cell
 * @param {*} outer the outer cell
 * @returns the inner corresponding cell, INVALID_MOVE if invalid
 */
function innerCell(outer) {
    return OUTER_CELLS.indexOf(outer)
}

/**
 * Return the outer cell corresponding to a given inner cell
 * @param {*} inner the inner cell (assumed valid)
 * @returns the outer corresponding cell
 */
function outerCell(inner) {
    return OUTER_CELLS[inner]
}

/**
 * Return the inner player corresponding to a given outer player
 * @param {*} outer the outer player
 * @returns the inner corresponding player, -1 if invalid
 */
function innerPlayer(outer) {
    return OUTER_PLAYERS.indexOf(outer)
}

/**
 * Return the outer player corresponding to a given inner player
 * @param {*} inner the inner player (assumed valid)
 * @returns the outer corresponding player
 */
function outerPlayer(inner) {
    return OUTER_PLAYERS[inner]
}

// required functions (called by the gui script) ------------------------------
/**
 * Genera un nuovo game
 * @param {*} pcLevels PC levels
 */
function newGame(pcLevels = []) {
    game = {
        pcLevels: pcLevels, // AI levels if necessary
        board: iota(CELLS, PLAYER_NONE, 0), // the inner board
        moves: [],      // the history - part 1
        startPlayer: Math.random() < 0.5 ? PLAYER_ONE : PLAYER_TWO,   // the history - part 2
        winner: PLAYER_NONE,    // winner if isOver
        elapsed: [0, 0],        // elapsed time for players
        status: 'playing',          // current status
        start: performance.now()    // start of current status
    }
    report(`New game! Have fun !!!`)
    checkAIMove()
}

/**
 * Restituisce una rappresentazione JSON del gioco
 * @returns a JSON representation of the game
 */
function getJSON() {
    return JSON.stringify(game)
}

/**
 * Carica un gioco dalla rappresentazione JSON salvata
 * @param {*} JSONString the JSON representation of the game
 * @returns true
 */
function fromJSON(JSONString) {
    game = JSON.parse(JSONString)
    checkAIMove()
    return true
}

/**
 * Return the current turn player (in outer form)
 * @returns the current turn player (in outer form)
 */
function turnPlayer() {
    return outerPlayer(turn())
}

/**
 * Returns the total elapsed timer for a player (in ms)
 * @param {*} player the player (in outer form)
 * @returns the total elapsed timer for a player (in ms)
 */
function getElapsed(player) {
    let delta = 0
    if (!isOver() && player == turnPlayer()) {
        delta = performance.now() - game.start
    }
    return game.elapsed[innerPlayer(player)] + delta
}

/**
 * Make a move if it's allowed
 * @param {*} move the (outer identifier of a) move
 */
function makeMove(move) {
    if (game.status == 'playing') {
        move = innerCell(move)
        if (move >= 0) {
            if (game.board[move] == PLAYER_NONE) {
                doMove(move)
            }
        }
    }
}

/**
 * Returns the winner (in outer form)
 * @returns the winner (in outer form)
 */
function getWinner() {
    return outerPlayer(game.winner)
}

/**
 * Returns the outer representation of the board
 * @param {*} rowSeparator the separator between rows (defaults to '')
 * @returns a string representation of the board
 */
function getBoard(rowSeparator = '') {
    let result = ''
    for (let cell = 0; cell < CELLS; ++cell) {
        result += outerPlayer(game.board[cell])
        if (cell % BASE == BASE - 1) {
            result += rowSeparator
        }
    }
    return result
}

/**
 * Returns the history of the game (in outer form)
 * @returns the history of the game (in outer form)
 */
function getHistory() {
    let result = ''
    for (let m = 0; m < game.moves.length; ++m) {
        result += outerCell(game.moves[m])
    }
    return { firstPlayer: outerPlayer(game.startPlayer), moves: result }
}

/**
 * Returns the winning cells (in outer form) 
 * @returns the winning cells (in outer form)
 */
function getWinning() {
    let result = ''
    if (game.winner != PLAYER_NONE) {
        const lastMove = game.moves[game.moves.length - 1]
        const winning = winningMoves(game.board, lastMove)
        for (let m = 0; m < winning.length; ++m) {
            result += outerCell(winning[m])
        }
    }
    return result
}

// "internal" functions (used only by this script) ----------------------------
/**
 * Sets up global variables, ...
 */
function modelSetup() {
}

/**
 * Return whether the game is over or not
 * @returns true if the game is over, false otherwise
 */
function isOver() {
    return game.moves.length == game.board.length || game.winner != PLAYER_NONE
}

/**
 * Set a new status and notifies the GUI
 * @param {*} status the new game status
 */
function setStatus(status) {
    game.status = status
    game.start = performance.now()
    statusChanged(status)
}

/**
 * Make a surely possible move
 * @param {*} move the (inner identifier of a) move
 */
function doMove(move) {
    const player = turn()
    game.board[move] = player   // register move
    game.moves.push(move)       // add to history
    game.elapsed[player] += performance.now() - game.start// update elapsed
    moveMade(outerCell(move), outerPlayer(player)) // notify GUI
    if (isWinningMove(game.board, move)) {    // check if winning
        game.winner = player    // set winner
    }
    if (isOver(game)) {    // game over ?
        setStatus('over')    // new status
    } else {
        checkAIMove()   // check if AI should move
    }
}

/**
 * Return the current turn player (in inner form)
 * @returns the current turn player (in inner form)
 */
function turn() {
    return isOver(game) ? PLAYER_NONE : (game.startPlayer + game.moves.length) % 2
}

/**
 * Checks whether the given move wins 
 * @param {*} board the board
 * @param {*} move the (inner identifier of the) last move made
 * @returns true / false
 */
function isWinningMove(board, move) {
    const col = move % 3       // indice colonna
    const row = (move - col) / 3  // indice riga
    return checkCells(board, col, 3)     // column
        || checkCells(board, row * 3, 1)    // row
        || ((row == col) && checkCells(board, 0, 4)) // main diagonal
        || ((row + col == 2) && checkCells(board, 2, 2)) // second diagonal
}
/**
 * Checks whether board[base + (0..2) * delta] are the same value
 * @param {*} board the board
 * @param {*} base tha base cell
 * @param {*} delta increment from base
 * @returns true / false
 */
function checkCells(board, base, delta) {
    return board[base] == board[base + delta] && board[base] == board[base + 2 * delta]
}

/**
 * Checks whether the given move wins 
 * @param {*} board the board
 * @param {*} move the (inner identifier of the) last move made
 * @returns an array of the (inner identifiers of the) winning moves if any
 */
function winningMoves(board, move) {
    const col = move % 3    // indice colonna = same column, first row
    const row = move - col  // same row, first column
    return winningCells(board, col, 3)     // column
        .concat(winningCells(board, row, 1))    // row
        .concat((move % 4 == 0) ? winningCells(board, 0, 4) : []) // main diagonal
        .concat((move + 2 * col == 6) ? winningCells(board, 2, 2) : []) // second diagonal
}

/**
 * Checks whether board[base + (0..2) * delta] are the same value
 * @param {*} board the board
 * @param {*} base tha base cell
 * @param {*} delta increment from base
 * @returns an array [base, base + delta, base + 2 * delta] or an empty array
 */
function winningCells(board, base, delta) {
    return checkCells(board, base, delta) ? [base, base + delta, base + 2 * delta] : []
}

/**
 * Checks if AI should move, and in case make the move (delayed)
 */
function checkAIMove() {
    if (turn() < game.pcLevels.length) {
        setTimeout(makeAIMove, delay())
        setStatus('thinking')
    } else {
        setStatus('playing')
    }
}

/**
 * Make a move according to AI settings
 */
function makeAIMove() {
    let move
    switch (game.pcLevels[turn()]) {
        case 'random':
            move = randomMove(game.board)
            break;
        case 'perfect':
            move = bestMove(game.board, turn())
            break;
        default:
            move = oneAhead(game.board, turn())
            break;
    }
    doMove(move)
}

/**
 * Return a random move
 * @param {*} board the board
 * @returns a random move
 */
function randomMove(board) {
    let move
    do {
        move = Math.floor(Math.random() * CELLS)
    } while (board[move] != PLAYER_NONE)
    return move
}

/**
 * Returns best(?) move in current situation
 * @param {*} board the board
 * @param {*} turn the turn player
 * @returns best move (at random if more than one)
 */
function bestMove(board, turn) {
    let best = []
    let bestValue = -CELLS
    for (let move = 0; move < CELLS; ++move) {
        if (board[move] == PLAYER_NONE) {
            let value = valueOf(board, move, turn)
            if (bestValue < value) {
                bestValue = value
                best = [move]
            } else if (bestValue == value) {
                best.push(move)
            }
        }
    }
    return best[Math.floor(Math.random() * best.length)]    // return random best move
}

/**
 * Value of current configuration
 * @param {*} board the board
 * @param {*} move last move made
 * @param {*} turn player of last move
 * @returns a value < 0, = 0, > 0 if turn loses, draws or wins
 */
function valueOf(board, move, turn) {
    let result = CELLS
    board[move] = turn
    if (isWinningMove(board, move)) {   // wins
        result = countBlanks(board) + 1
    } else if (countBlanks(board) == 0) {   // draw
        result = 0
    } else {    // maybe ???
        for (let next = 0; next < CELLS; ++next) {
            if (board[next] == PLAYER_NONE) {
                let value = -valueOf(board, next, 1 - turn)  // other player
                if (result > value) {
                    result = value
                }
            }
        }
    }
    board[move] = PLAYER_NONE
    return result
}

/**
 * Returns count of blank cells in a board
 * @param {*} board the board
 * @returns count of blank cells in the board
 */
function countBlanks(board) {
    let count = 0
    for (let cell = 0; cell < board.length; ++cell) {
        if (board[cell] == PLAYER_NONE) {
            ++count
        }
    }
    return count
}

/**
 * Returns one ahead best(?) move in current situation
 * @param {*} board the board
 * @param {*} turn the turn player
 * @returns best move (at random if more than one)
 */
function oneAhead(board, turn) {
    let best = []
    for (let move = 0; move < CELLS; ++move) {
        if (board[move] == PLAYER_NONE) {
            board[move] = turn
            if (isWinningMove(board, move)) {
                best.push(move)
            }
            board[move] = PLAYER_NONE
        }
    }
    if (best.length == 0) { // can't win, try not to lose
        for (let move = 0; move < CELLS; ++move) {
            if (board[move] == PLAYER_NONE) {
                board[move] = 1 - turn
                if (isWinningMove(board, move)) {
                    best.push(move)
                }
                board[move] = PLAYER_NONE
            }
        }
    }
    if (best.length == 0) { // can't win, not losing soon: random
        best = [randomMove(board)]
    }
    return best[Math.floor(Math.random() * best.length)]    // return random best move
}