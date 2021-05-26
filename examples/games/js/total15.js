/**
 * script handling the user interface: HTML elements, user input and so on
 * It MUST be possible to change this script without affecting the model.js
 * It MUST provide the following functions (called by the model script):
 *  report          : to show textual information to the user
 *  moveMade        : to show that a move has been made
 *  statusChanged   : to show that a game has changed status
 *  delay           : returns delay for AI moves
 * and the following data (used by the model script):
 *  OUTER_CELLS     : array of external cells ids = '123456789'
 *  OUTER_PLAYERS   : array of external players ids = 'OX '
 */

// usual way to get a function called after document loading
window.addEventListener('DOMContentLoaded', guiSetup, false)

// NOTA BENE:
// rappresentazione "esterna" (piuttosto ovvia e stabile per model script!!!)
//  per l'utente: evitare 0 per il primo elemento ....
// identificatore celle:
//  un carattere in '123456789' dall'alto in basso, da sinistra a destra
const OUTER_CELLS = Array.from('618753294')
// contenuto celle (giocatore che l'ha marcata):
//  un carattere in 'OX ' (player 1, 2, cella vuota)
const OUTER_PLAYERS = Array.from('OX ')

// constants ------------------------------------------------------------------
const EMPTY_BOARD = '         ' // the empty board
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
const DELTA = [-1, +1, -1, +1]  // movement amount for MOVE_KEYS
const ENTER_KEYS = [' ', 'Enter']   // keys to confirm selected cell move

// globals --------------------------------------------------------------------
// total games played, games won by player 0/1/none
const STATS = { played: 0, wonBy: [0, 0, 0] }
// replaying status
const REPLAY = { history: {}, replayMove: 0 }
// current cell selection status
const SELECTION = { current: 0, shown: false }

// required functions (called by the model script -----------------------------
/**
 * Reports the given text in element info
 * @param {*} what what to report
 */
function report(what) {
    document.getElementById('info').innerText = what
}

/**
 * Handler for move made notification
 * @param {*} cell the cell where the move has been made
 * @param {*} player the player who made the move
 */
function moveMade(cell, player) {
    markCell(cell, player)
}

/**
 * Enables/disables controls and take action according to new game status
 * @param {*} status the new game status
 */
function statusChanged(status) {
    enableControls(status)
    if (status == 'over') {
        updateAndShowStatistics()
        showWinner()
        if (isChecked('auto')) {
            setTimeout(genera, 0);
        } else {
            REPLAY.history = getHistory()
            REPLAY.replayMove = -1
            setTimeout(replayStep, 2000)    // start replay
        }
    }
}

/**
 * Returns the value of the animation delay
 * @returns the value of the animation delay
 */
function delay() {
    return document.getElementById('delay').valueAsNumber
}

// "internal" functions (used only by this script) ----------------------------
/**
 * Sets up event, global variables, ...
 */
function guiSetup() {
    document.getElementById('genera').addEventListener('click', genera, false)
    document.getElementById('save').addEventListener('click', save, false)
    document.getElementById('load').addEventListener('click', load, false)

    // moves by click on a cell
    document.querySelector('#tris').addEventListener('click', mouseMove, false)

    // moves by keyboard input
    window.addEventListener('keydown', keyMove, false)
    // document.getElementById('tris').focus()     // not sure if needed
    document.getElementById('genera').click()   // new game !!!
    setInterval(timer, 50)
}

/**
 * Returns the element representing a given cell
 * @param {*} cell the given (outer identifier of the) cell
 * @returns the element representing the given cell
 */
function cellElement(cell) {
    return document.getElementById(cell)
}

/**
 * Marks the given cell according to value
 * @param {*} cell the (outer index of the) cell to be marked
 * @param {*} value a single character in 'XOLWS '
 */
function markCell(cell, value) {
    const CLASSES = ['cross', 'circle', 'losing', 'winning']
    const element = cellElement(cell)
    switch (value) {
        case 'X':   // player X
        case 'O':   // player O
        case 'L':   // losing
        case 'W':   // winning
            const index = 'XOLW'.indexOf(value)
            element.classList.add(CLASSES[index])
            break
        case 'S':   // selected
            element.classList.toggle('current')
            break
        case ' ':   // empty cell: clear everything but 'current'
            element.classList.remove(...CLASSES)
        default:
    }
}

/**
 * Shows a board given it's representation
 * @param {*} board the string representation of a board
 */
function showBoard(board) {
    for (let c = 0; c < board.length; c++) {
        markCell(OUTER_CELLS[c], ' ')   // clear everything first
        markCell(OUTER_CELLS[c], board[c])
    }
}

/**
 * Shows the winner
 */
function showWinner(game) {
    const cells = getWinning()
    for (let c = 0; c < OUTER_CELLS.length; c++) {
        markCell(OUTER_CELLS[c], cells.indexOf(OUTER_CELLS[c]) < 0 ? 'L' : 'W')
    }
    report(`And the winner is: ${getWinner() == ' ' ? 'none' : getWinner()}`)
}

/**
 * Replay of last game
 */
function replayStep() {
    if (game.status == 'over') {
        if (REPLAY.replayMove < 0) { // restart
            showBoard(EMPTY_BOARD)
        } else if (REPLAY.replayMove < REPLAY.history.moves.length) {
            const cell = REPLAY.history.moves[REPLAY.replayMove]
            let player = REPLAY.history.firstPlayer
            if (REPLAY.replayMove % 2 != 0) {
                player = player == 'X' ? 'O' : 'X'
            }
            markCell(cell, player)
        } else {    // last move done
            showWinner()
        }
        ++REPLAY.replayMove
        report('Replaying move: ' + REPLAY.replayMove)
        if (REPLAY.replayMove > REPLAY.history.moves.length) {
            REPLAY.replayMove = -1
        }
        setTimeout(replayStep, 2000)
    }
}

/**
 * Enables/disables controls according to game status
 * @param {*} status the game status
 */
function enableControls(status) {
    document.getElementById('genera').disabled = status != 'over'
    document.getElementById('save').disabled = status == 'over'
    document.getElementById('load').disabled = status != 'over'
    const inputs = document.querySelectorAll('#controls input')
    for (let i = 0; i < inputs.length; ++i) {
        inputs[i].disabled = status != 'over'
    }
    document.getElementById('auto').disabled = false    // always enabled
    document.getElementById('tris').focus() // to get keyboard events ...
    if (SELECTION.shown != (status == 'playing')) {
        markCell(OUTER_CELLS[SELECTION.current], 'S')
        SELECTION.shown = !SELECTION.shown
    }
}

/**
 * Update statistics
 */
function updateAndShowStatistics() {
    ++STATS.played  // increment played games
    STATS.wonBy[OUTER_PLAYERS.indexOf(getWinner())]++
    const e = document.getElementById('stats')
    if (e != null) {
        let s = `Played ${STATS.played}`
        s += `, Won ${OUTER_PLAYERS[0]}: ${STATS.wonBy[0]}`
        s += `, Won ${OUTER_PLAYERS[1]}: ${STATS.wonBy[1]}`
        s += `, Draws ${STATS.wonBy[2]}`
        e.innerHTML = s
    }
}

/**
 * Updates and shows elapsed time in timer element
 */
function timer() {
    for (let p = 0; p < OUTER_PLAYERS.length; p++) {
        const timeElement = document.getElementById('timer' + OUTER_PLAYERS[p])
        if (timeElement != null) {
            const timing = getElapsed(OUTER_PLAYERS[p])
            const seconds = Math.floor(timing / 1000)
            const minutes = ('' + (seconds - seconds % 60) / 60).padStart(2, '0')
            timeElement.innerHTML = minutes + ':' + ('' + (seconds % 60)).padStart(2, '0')
            timeElement.className = OUTER_PLAYERS[p] == turnPlayer() ? 'turno' : ''
        }
    }
}

// event handlers -------------------------------------------------------------
/**
 * Handler for input events: "new game" button
 * @param {*} evento 
 */
function genera(evento) {
    const pcLevels = []
    pcLevels.length = parseInt(getRadioValue('players', 0))
    pcLevels.fill(getRadioValue('level', 'whatever'))
    newGame(pcLevels)
    showBoard(getBoard())
}

/**
 * Handler for input events: "save" button
 * @param {*} evento 
 */
function save(evento) {
    document.cookie = 'savedGame=' + getJSON()
    report(`Game saved, but you can still play!!!`)
}

/**
 * Handler for input events: "load" button
 * @param {*} evento 
 */
function load(evento) {
    let saved = getCookieValue('savedGame')
    if (saved != null) {
        if (fromJSON(saved)) {
            showBoard(getBoard())
            report(`Loaded game! Have fun !!!`)
        } else {
            report(`Unable to load !!!`)
        }
    } else {
        report(`Nothing to load !!!`)
    }
}

/**
 * Handler for input events: checks mouse user input
 * @param {*} evento 
 */
function mouseMove(evento) {
    if (OUTER_CELLS.indexOf(evento.target.id) >= 0) {
        makeMove(evento.target.id)
    }
}

/**
 * Handler for input events: checks keyboard user input
 * @param {*} evento 
 */
function keyMove(evento) {
    if (OUTER_CELLS.indexOf(evento.key) >= 0) {
        makeMove(evento.key)
    } else if (SELECTION.shown) {
        if (MOVE_KEYS.includes(evento.key)) {
            markCell(OUTER_CELLS[SELECTION.current], 'S')
            SELECTION.current += DELTA[MOVE_KEYS.indexOf(evento.key)]
            if (SELECTION.current < 0) {
                SELECTION.current += OUTER_CELLS.length
            } else if (SELECTION.current >= OUTER_CELLS.length) {
                SELECTION.current -= OUTER_CELLS.length
            }
            markCell(OUTER_CELLS[SELECTION.current], 'S')
        } else if (ENTER_KEYS.includes(evento.key)) {
            makeMove(OUTER_CELLS[SELECTION.current])
        }
    }
}

// Called by core.js
/**
 * Fill nav element specific for tris
 * @param  {} page the name of the page (e.g. 'index')
 */
function fillNavbarForPage(page) {
    let result = ''
    if (page == 'tris') {
        result += `<a href="games.html">Giochi</a>`
    } else {
        console.log("no site-nav element for page " + page)
    }
    return result
}
