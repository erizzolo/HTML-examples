// usual way to get a function called after document loading
window.addEventListener('DOMContentLoaded', setup, false)

// structure of the script:
// constants
// global variables
// setup function
// in/out functions
// event handlers
// solver functions
// utility functions
// unused functions ???

// constants ------------------------------------------------------------------
const ALL_DIGITS = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$'

const BASE = 3  // MAX 6 !!!
const DIGITS = BASE * BASE  // number of digits
const MIN_DIGIT = 0 // minimum valid digit
const BLANK = MIN_DIGIT - 1 // blank cell value
const MAX_DIGIT = MIN_DIGIT + DIGITS - 1 // maximum valid digit
const ALLOWED_DIGITS = Array.from(ALL_DIGITS.substring(0, DIGITS))

const BLOCK_CELLS = BASE * BASE // cells in a block
const ROWS = BASE * BASE    // number of rows
const COLUMNS = BASE * BASE // number of columns
const BLOCKS = BASE * BASE  // number of blocks
const REGIONS = ROWS + COLUMNS + BLOCKS // number of regions (rows/columns/blocks)
const CELLS = ROWS * DIGITS // number of cells

// const ROW_OFFSET = 0 // index of first row region in REGION_CELLS
const COL_OFFSET = ROWS // index of first column region in REGION_CELLS
const BLOCK_OFFSET = ROWS + COLUMNS // index of first block region in REGION_CELLS
const REGION_CELLS = []  // a[REGIONS][ROWS]: cells belonging to a region
const CELL_REGIONS = []  // a[CELLS][3]: regions to which a cell belongs to

// const GAME = '.................................................................................'
// const GAME = '123456789467......589......2........3........6........7........8........9........'
// const GAME = '123456789476......589......2........3........6........7........8........9........'
// const GAME = '123456789456789123789123456214......365......897......531......642......978......'
const GAMES =
    ['..............3.85..1.2.......5.7.....4...1...9.......5......73..2.1........4...9',
        '6..8....25.26...94.813...7.......74...49.35...18.......9...826.12...94.78....1..9']

// globals --------------------------------------------------------------------
const game = { board: null, empty: null, level: null }  // the game
const solver = { method: null, step: null, solved: false, solutions: 0 }
let table   // the table element showing the board
let status  // status of the application

// setup function -------------------------------------------------------------
/**
 * Sets up event, global variables, ...
 */
function setup() {
    setupRegions()

    table = document.getElementById('sudoku')

    document.getElementById('genera').addEventListener('click', newBoard, false)
    document.getElementById('risolvi').addEventListener('click', risolvi, false)
    document.getElementById('mostra').addEventListener('click', mostra, false)
    document.getElementById('reimposta').addEventListener('click', reimposta, false)
    document.getElementById('esporta').addEventListener('click', esporta, false)
    document.querySelector('#sudoku tbody').addEventListener('input', check, false)

    document.getElementById('genera').click()   // new game !!!
}

/**
 * Every cell (CELLS in total) belongs to 3 regions: a row, a column and a block
 * Every region (REGIONS in total) contains BASE * BASE cells
 */
function setupRegions() {
    for (let region = 0; region < REGIONS; ++region) {
        REGION_CELLS[region] = []
    }
    for (let cell = 0; cell < CELLS; ++cell) {
        CELL_REGIONS[cell] = []
    }
    for (let row = 0, cell = 0; row < ROWS; ++row) {
        for (let col = 0; col < COLUMNS; ++col, ++cell) {
            REGION_CELLS[row].push(cell)
            CELL_REGIONS[cell].push(REGION_CELLS[row])
            REGION_CELLS[col + COL_OFFSET].push(cell)
            CELL_REGIONS[cell].push(REGION_CELLS[col + COL_OFFSET])
            const block = Math.floor(row / BASE) * BASE + Math.floor(col / BASE)
            REGION_CELLS[block + BLOCK_OFFSET].push(cell)
            CELL_REGIONS[cell].push(REGION_CELLS[block + BLOCK_OFFSET])
        }
    }
}

// in/out functions -----------------------------------------------------------
/**
 * Return the internal digit corresponding to a given input
 * @param {*} input the user input
 * @returns the internal digit corresponding to input
 */
function toDigit(input) {
    const d = ALLOWED_DIGITS.indexOf(input)
    return d < 0 ? BLANK : (MIN_DIGIT + d)
}

/**
 * Return the external representation of a given digit
 * @param {*} digit the digit
 * @param {*} blank the external representation of BLANK (defaults to '')
 * @returns the external representation corresponding to digit
 */
function toOutput(digit, blank = '') {
    return digit == BLANK ? blank : ALLOWED_DIGITS[digit - MIN_DIGIT]
}

/**
 * Returns a string representation of the board
 * @param {*} board the board
 * @param {*} rowSeparator the separator between rows (defaults to '\n')
 * @returns a string representation of the board
 */
function boardToString(board, rowSeparator = '\n') {
    let result = ''
    for (let cell = 0; cell < CELLS; ++cell) {
        result += toOutput(board[cell], '.')
        if (cell % COLUMNS == COLUMNS - 1) {
            result += rowSeparator
        }
    }
    return result
}

/**
 * Builds a board from a string representation
 * @param {*} boardString the string representation of the board
 * @param {*} rowSeparator the separator between rows (defaults to '\n')
 * @returns a board from the given string representation
 */
function boardFromString(boardString, rowSeparator = '\n') {
    return Array.from(boardString.replace(rowSeparator, '')).map(toDigit)
}

/**
 * Builds the HTML code (tbody.innerHTML) for the given board
 * @param {*} board 
 * @returns the HTML code (tbody.innerHTML) for the given board
 */
function tableHTML(board) {
    let result = ''
    if (board.length != CELLS) {
        alert('Wrong length ' + board.length)
    } else {
        for (let row = 0, cell = 0; row < ROWS; ++row) {
            result += '<tr class="' + rowClass(row) + '">'
            for (let col = 0; col < COLUMNS; ++col, ++cell) {
                result += '<td class="' + colClass(col)
                if (board[cell] == BLANK) {
                    result += '" contenteditable="true">'
                } else {
                    result += ' fixed">' + toOutput([board[cell]])
                }
                result += '</td>'
            }
            result += '</tr>'
        }
    }
    return result
}

/**
 * Returns whether the given row is a top, middle or bottom one of a block
 * @param {*} row the given row
 * @returns whether the given row is a top, middle or bottom one of a block
 */
function rowClass(row) {
    let rem = row % BASE
    return rem == 0 ? 'top' : rem == BASE - 1 ? 'bottom' : 'middle'
}

/**
 * Returns whether the given column is a left, middle or right one of a block
 * @param {*} col the given column
 * @returns whether the given column is a left, middle or right one of a block
 */
function colClass(col) {
    let rem = col % BASE
    return rem == 0 ? 'left' : rem == BASE - 1 ? 'right' : 'middle'
}

/**
 * Returns the element representing a given cell
 * @param {*} cell the given (index of the) cell
 * @returns the element representing the given cell
 */
function cellElement(cell) {
    return table.rows[Math.floor(cell / COLUMNS)].cells[cell % COLUMNS]
}

/**
 * Marks the given cell with the digit corresponding to value, actual class kind and removing classes in removed
 * @param {*} cell the (index of the) cell to be marked
 * @param {*} value the value in the cell
 * @param {*} kind the actual class of the element representing the cell
 * @param {*} removed the classes to be removed from the element representing the cell
 */
function markCell(cell, value, kind, removed = []) {
    const element = cellElement(cell)
    element.innerText = toOutput(value)
    for (const remove of removed) element.classList.remove(remove)
    element.classList.add(kind)
}

/**
 * Reports the given text in element info
 * @param {*} what what to report
 */
function report(what) {
    document.getElementById('info').innerText = what
}

/**
 * Returns the value of the animation delay element
 * @returns the value of the delay element
 */
function delay() {
    return document.getElementById('delay').valueAsNumber
}

// event handlers -------------------------------------------------------------
/**
 * Handler for button "nuovo gioco":
 * genera un nuovo game con board, relative empty cells e level
 * @param {*} evento 
 */
function newBoard(evento) {
    game.level = Number(getRadioValue('level'))
    if (game.level < GAMES.length) {
        game.board = boardFromString(GAMES[game.level])
        game.empty = getEmptyCells(game.board)
    } else {
        shuffle(ALLOWED_DIGITS)
        let timing = performance.now()
        game.board = randomBoard(game.level)
        timing = performance.now() - timing
        game.empty = getEmptyCells(game.board)
        debug(`target ${game.empty.length < game.level ? 'NOT ' : ''}reached: ${game.empty.length} empty cells in ${timing} ms`)
    }
    table.tBodies[0].innerHTML = tableHTML(game.board)
    report(`New game! Have fun !!!`)
    status = { mode: 'playing', start: performance.now(), interval: setInterval(timer, 100) }
    setStatus(status.mode)
}

/**
 * Handler for button "risolvi": mostra soluzione con animazione
 * @param {*} evento 
 */
function risolvi(evento) {
    clearInterval(status.interval)
    status = { mode: 'solving', start: performance.now() }
    setStatus(status.mode)
    for (let cell = 0; cell < game.empty.length; ++cell) {
        markCell(game.empty[cell], BLANK, 'empty', ['conflict'])
    }
    initSolver('all')
    initSolver('cells')
    solvingStep()
}

/**
 * Handler for button "mostra soluzione": mostra soluzione
 * @param {*} evento 
 */
function mostra(evento) {
    clearInterval(status.interval)
    status = { mode: 'solving', start: performance.now() }
    setStatus(status.mode)
    fillUnique(game.board)
    for (let cell = 0; cell < game.empty.length; ++cell) {
        const digit = game.board[game.empty[cell]]
        if (digit != BLANK) {
            markCell(game.empty[cell], digit, 'sure', ['empty', 'conflict'])
        }
    }
    game.empty = getEmptyCells(game.board)
    solve(game.board, game.empty, 0)
    for (let cell = 0; cell < game.empty.length; ++cell) {
        const digit = game.board[game.empty[cell]]
        markCell(game.empty[cell], digit, 'trial', ['empty', 'conflict'])
    }
    report(`found solution in ${performance.now() - status.start} ms.`)
    status = { mode: 'stopped', start: performance.now() }
    setStatus(status.mode)
}

/**
 * Handler for button "reimposta": reimposta tabella
 * @param {*} evento 
 */
function reimposta(evento) {
    table.tBodies[0].innerHTML = tableHTML(game.board)
}

/**
 * Handler for button "esporta": esporta tabella
 * @param {*} evento 
 */
function esporta(evento) {
    const result = game.board.slice()
    for (let c = 0; c < result.length; ++c) {
        result[c] = toOutput(result[c], '.')
    }
    alert(result.join(''))
}

/**
 * Handler for input events: checks user input
 * @param {*} evento 
 */
function check(evento) {
    let problems = 0
    for (let cell = 0; cell < CELLS; ++cell) {
        cellElement(cell).classList.remove('conflict', 'empty', 'trial')
        const conflicts = checkCell(cell)
        if (conflicts.length > 0) {
            ++problems
            if (conflicts.length > 1) {
                for (let c = 0; c < conflicts.length; ++c) {
                    cellElement(conflicts[c]).classList.add('conflict')
                }
            } else {
                cellElement(cell).classList.add('empty')
            }
        }
    }
    if (problems == 0) {
        clearInterval(status.interval)
        const timing = performance.now() - status.start
        report(`BRAVO!!! solved in ${timing} ms`)
        for (let cell = 0; cell < CELLS; ++cell) {
            cellElement(cell).contenteditable = false
        }
        status = { mode: 'stopped', start: performance.now() }
        setStatus(status.mode)
    }
}

/**
 * Checks whether the given cell has any conflict or is invalid:
 * @param {*} cell the cell to be checked
 * @returns an array of conflicting cells, including the given one
 */
function checkCell(cell) {
    let result = []
    let input = cellElement(cell).innerText.trim()
    if (input.length != 1 || toDigit(input) == BLANK) {
        result.push(cell)
    } else {
        for (let r = 0; r < CELL_REGIONS[cell].length; ++r) {
            const region = CELL_REGIONS[cell][r]
            for (let other = 0; other < region.length; ++other) {
                if (region[other] != cell) {
                    if (cellElement(region[other]).innerText.trim() == input) {
                        result.push(region[other])
                    }
                }
            }
        }
        if (result.length > 0) {
            result.push(cell)
        }
    }
    return result
}

/**
 * Shows elapsed time in timer element
 */
function timer() {
    const seconds = Math.floor((performance.now() - status.start) / 1000)
    const minutes = (seconds - seconds % 60) / 60
    let output = ('' + minutes).padStart(2, '0') + ':' + ('' + (seconds % 60)).padStart(2, '0')
    document.getElementById('timer').innerHTML = output
}

/**
 * Enables/disables controls according to mode
 * @param {*} mode the status.mode
 */
function setStatus(mode) {
    document.getElementById('genera').disabled = mode != 'stopped'
    document.getElementById('risolvi').disabled = mode != 'playing'
    document.getElementById('mostra').disabled = mode != 'playing'
    document.getElementById('reimposta').disabled = mode != 'playing'
}

// solver functions -----------------------------------------------------------

/**
 * Returns a new random board with target empty cells if possible
 * @param {*} target number of empty cells
 * @returns a new random board with target empty cells if possible
 */
function randomBoard(target) {
    const result = getValidBoard()
    let emptied = 0
    let toBeBlanked = shuffle(iota(CELLS))
    // let strategy = 9    // 1 cell in each block
    let strategy = 4    // 4 symmetrical cells
    do {
        const blanks = getBlanks(result, strategy, toBeBlanked)
        if (blanks.length > 0) {
            const goodBoard = result.slice()
            blank(goodBoard, blanks)
            if (hasUniqueSolution(goodBoard)) {
                blank(result, blanks)
                emptied += blanks.length
                // debug(`Succesfully blanked ${blanks.length} cells: ${blanks}`)
            } else {
                strategy >>= 1  // next strategy
                // debug(`Unsuccesfully blanked ${blanks.length} cells: ${blanks}`)
            }
        }
    } while (emptied < target && toBeBlanked.length > 0)
    return result
}

/**
 * Returns a new random board with target empty cells if possible
 * @param {*} target number of empty cells
 * @returns a new random board with target empty cells if possible
 */
function randomBoardTwo(target) {
    const result = iota(CELLS, BLANK, 0)    // empty board
    const empty = shuffle(iota(CELLS))  // empty cells
    let goodBoard   // a copy of the board
    let solved = solve(result, empty, 0)    // get first solution
    let solution = 0
    let lastChanged = iota(CELLS, solution, 0) // all have changed
    let blankable = 0
    debug(`start solving ${boardToString(result)}`)
    do {
        goodBoard = result.slice()  // copy before changes
        solved = solve(result, empty, CELLS - 1)    // get next solution
        if (solved.solved) {
            if (lastChanged[solved.firstChange] == solution) {
                blankable = CELLS - 1 - solved.firstChange
                debug(`found board with ${blankable} empty cells`)
            }
            lastChanged.fill(++solution, solved.firstChange)
        }
    } while (blankable < target && solved.solved)
    blank(goodBoard, empty.slice(-blankable))
    return goodBoard
}

/**
 * Blanks the given cells of the board
 * @param {*} board the board
 * @param {*} blanks the (indices of the) cells to be blanked
 */
function blank(board, blanks) {
    for (let b = 0; b < blanks.length; ++b) {
        board[blanks[b]] = BLANK
    }
}

/**
 * Returns an array of cells to be blanked in the board
 * @param {*} board the board
 * @param {*} strategy which strategy to use (see comments)
 * @param {*} toTry array of cells to try
 * @returns an array (possibly empty) of cells to be blanked
 */
function getBlanks(board, strategy, toTry) {
    const result = []
    let rndRow, rndCol, rndCell
    switch (strategy) {
        case 9:
            // 1 cell in each block
            do {
                rndCell = randomInt(BLOCK_CELLS)
            } while (board[REGION_CELLS[BLOCK_OFFSET][rndCell]] == BLANK)
            for (let block = 0; block < BLOCKS; ++block) {
                result.push(REGION_CELLS[block + BLOCK_OFFSET][rndCell])
            }
            break
        case 4:
            // 4 symmetrical cells
            do {
                rndRow = randomInt(ROWS >> 1)
                rndCol = randomInt(COLUMNS >> 1)
                rndCell = rndRow * COLUMNS + rndCol
            } while (board[rndCell] == BLANK)
            result.push(rndCell)
            result.push(CELLS - 1 - rndCell)
            rndCell = (ROWS - 1 - rndRow) * COLUMNS + rndCol
            result.push(rndCell)
            result.push(CELLS - 1 - rndCell)
            break
        case 2:
            // 2 symmetrical cells
            do {
                rndCell = randomInt(CELLS >> 1)
            } while (board[rndCell] == BLANK)
            result.push(rndCell)
            result.push(CELLS - 1 - rndCell)
            break
        default:
            // a single not yet blanked/tried cell
            do {
                rndCell = toTry.pop()
            } while (rndCell != undefined && board[rndCell] == BLANK)
            if (rndCell != undefined) {
                result.push(rndCell)
            }
            break
    }
    return result
}

/**
 * Returns a random partial board
 * @returns a random partial board
 */
function seedBoard() {
    let result = iota(CELLS, BLANK, 0)  // empty board
    const firstRow = REGION_CELLS[0] // first row with all digits in order
    fillRegion(result, firstRow, iota(DIGITS, MIN_DIGIT))
    const firstBlock = REGION_CELLS[BLOCK_OFFSET] // first block completed at random
    fillRegion(result, firstBlock, shuffle(missingInRegion(result, firstBlock)))
    const firstColumn = REGION_CELLS[COL_OFFSET] // first column completed at random
    fillRegion(result, firstColumn, shuffle(missingInRegion(result, firstColumn)))
    return result
}

/**
 * Returns a valid filled board
 * @returns a valid filled board
 */
function getValidBoard() {
    // get a complete valid board
    let result = seedBoard()
    debug('Seeded:\n' + boardToString(result))
    emptyCells = getEmptyCells(result)
    while (!solve(result, emptyCells, 0).solved) {
        result = seedBoard()
        debug('Seeded:\n' + boardToString(result))
    }
    debug('Valid:\n' + boardToString(result))
    return result
}

/**
 * Returns an array of shuffled CELLS indices of cells to be blanked
 * such that the board should still have a unique solution
 * @param {*} board the board
 * @returns an array of shuffled CELLS indices of cells to be blanked
 */
function randomModifiableCells(board) {
    let result = shuffle(iota(CELLS, 0))
    // make sure at least DIGITS - 1 digits are preserved in the first positions
    for (let digit = MIN_DIGIT, cell = 0; digit < MAX_DIGIT; ++digit, ++cell) {
        let chosen
        do {
            chosen = cell + Math.floor(Math.random() * CELLS - cell)
        } while (board[chosen] != digit)
        [result[cell], result[chosen]] = [result[chosen], result[cell]]   // swap
    }
    return result
}

/**
 * Fills unique cells in a board
 * @param {*} board the board
 */
function fillUnique(board) {
    let modified
    do {
        modified = false
        for (let digit = MIN_DIGIT; digit <= MAX_DIGIT; ++digit) {
            for (let r = 0, choices = 0, theCell = 0; r < REGIONS; ++r) {
                const region = REGION_CELLS[r]
                for (let cell = 0; cell < region.length && choices < 2; ++cell) {
                    if (board[region[cell]] == BLANK && allowed(board, region[cell], digit)) {
                        choices++
                        theCell = region[cell]
                    }
                }
                if (choices == 1) {
                    board[theCell] = digit
                    modified = true
                }
            }
        }
        for (let cell = 0, choices = 0, theDigit = 0; cell < CELLS; ++cell) {
            if (board[cell] == BLANK) {
                for (let digit = MIN_DIGIT; digit <= MAX_DIGIT && choices < 2; ++digit) {
                    if (allowed(board, cell, digit)) {
                        choices++
                        theDigit = digit
                    }
                }
                if (choices == 1) {
                    board[cell] = theDigit
                    modified = true
                }
            }
        }
    } while (modified)
}

/**
 * Returns whether the given board has a unique solution
 * @param {*} board a solvable board
 * @returns true if the board has a unique solution, false otherwise
 */
function hasUniqueSolution(board) {
    fillUnique(board)
    const empty = getEmptyCells(board)
    solve(board, empty, 0)
    return !solve(board, empty, empty.length - 1).solved
}

/**
 * Fills the empty cells of a region of the board with the given digits
 * @param {*} board the board
 * @param {*} region the region to be filled
 * @param {*} digits the digits to be used
 */
function fillRegion(board, region, digits) {
    for (let index = 0, used = 0; index < region.length && used < digits.length; ++index)
        if (board[region[index]] == BLANK)
            board[region[index]] = digits[used++]
}

/**
 * Returns an array filled with the digits missing in a region
 * @param {*} board the board
 * @param {*} region the given region
 * @returns an array filled with the digits missing in a region
 */
function missingInRegion(board, region) {
    const result = iota(DIGITS, MIN_DIGIT)
    for (let index = 0; index < region.length; ++index)
        result[board[region[index]]] = BLANK
    return result.filter((value) => value != BLANK)
}

/**
 * Solve the board changing empty cells
 * Starts from empty[current]
 * @param {*} board the board
 * @param {*} empty the (indices of) empty cells
 * @param {*} current the index to start from
 * @returns { solved: true/false, trials, backSteps, firstChange }
 */
function solve(board, empty, current) {
    let firstChange = current, trials = 0, backSteps = 0
    while (0 <= current && current < empty.length) {
        // debug(boardToString(board))
        const cell = empty[current]
        if (board[cell] == MAX_DIGIT) {
            board[cell] = BLANK
            --current
            ++backSteps
        } else {
            ++trials
            if (allowed(board, cell, board[cell] + 1)) {
                if (firstChange > current) {
                    firstChange = current
                }
                ++current
            }
            ++board[cell]
        }
    }
    return { solved: current >= 0, trials: trials, backSteps: backSteps, firstChange: firstChange }
}

/**
 * checks whether the given value can fit in given cell
 * returns true if allowed, false otherwise
 * @param {*} cell 
 * @param {*} value 
 * @returns 
 */
function allowed(board, cell, value) {
    for (let r = 0; r < CELL_REGIONS[cell].length; ++r) {
        const region = CELL_REGIONS[cell][r]
        for (let other = 0; other < region.length; ++other) {
            if (board[region[other]] == value) {
                return false
            }
        }
    }
    return true
}

/**
 * Initialize the global solver for a given step
 * @param {*} which the step
 */
function initSolver(which) {
    solver.method = which
    switch (which) {
        case 'cells':
            solver.step = { digit: MIN_DIGIT, region: 0 }
            solver.modified = false
            break
        case 'values':
            game.empty = getEmptyCells(game.board)
            solver.step = { currentCell: 0 }
            break
        case 'backtracking':
            game.empty = getEmptyCells(game.board)
            if (document.querySelector('#shuffle:checked') != null) {
                shuffle(game.empty)
            }
            solver.step = { currentCell: 0, trials: 0, backSteps: 0 }
            break
        case 'all':
            solver.solved = false
            solver.solutions = 0
            break
    }
}

/**
 * Returns an array with the (indices of) the blank cells in a board
 * @param {*} board the board
 * @returns an array with the (indices of) the blank cells in a board
 */
function getEmptyCells(board) {
    const result = []
    for (let cell = 0; cell < CELLS; ++cell) {
        if (board[cell] == BLANK) {
            result.push(cell)
        }
    }
    return result
}

/**
 * Executes one step of the backtracking solver
 * @param {*} board the board
 * @param {*} empty the empty cells
 */
function backtrack(board, empty) {
    let currentCell = solver.step.currentCell
    if (currentCell < 0) {
        alert(`There is no ${solver.solutions > 0 ? " other" : ""} solution.`)
    } else {
        if (currentCell < empty.length) {
            const cell = empty[currentCell]
            report(`backtracking cell ${cell}`)
            solver.step.trials++
            let kind = 'trial'
            if (board[cell] == MAX_DIGIT) {
                board[cell] = BLANK
                kind = 'empty'
                currentCell--
                solver.step.backSteps++
            } else {
                if (allowed(board, cell, board[cell] + 1)) {
                    kind = 'trial'
                    currentCell++
                } else {
                    kind = 'conflict'
                }
                board[cell]++
            }
            markCell(cell, board[cell], kind, ['empty', 'trial', 'conflict'])
            solver.step.currentCell = currentCell
        } else {
            solver.solved = true
        }
    }
}

/**
 * Executes one step of the solver
 */
function solvingStep() {
    if (solver.solved) {
        ++solver.solutions
        report(`found solution #${solver.solutions} in ${performance.now() - status.start} ms.`)
        const other = game.board.slice()
        if (solve(other, game.empty, game.empty.length - 1).solved) {
            alert(`Found another solution !!!`)
        }
        status = { mode: 'stopped', start: performance.now() }
        setStatus(status.mode)
    } else {
        switch (solver.method) {
            case 'cells':
                singleCells(game.board)
                break
            case 'values':
                singleValues(game.board, game.empty)
                break
            default:
                backtrack(game.board, game.empty)
        }
        setTimeout(solvingStep, delay())
    }
}

/**
 * Executes one step of the single cell solver
 * @param {*} board the board
 */
function singleCells(board) {
    const enabled = document.querySelector('#cells:checked') != null
    if (enabled) {
        const digit = solver.step.digit
        if (digit > MAX_DIGIT) {
            initSolver('values')
            report(`checking single cells completed: switching to ${solver.method}`)
        } else {
            const region = solver.step.region
            report(`checking single cell for digit ${toOutput(digit)} in region ${region}`)
            // single cell allowed for digit in region
            const cells = REGION_CELLS[region]
            let choices = 0, theCell = 0
            for (let cell = 0; cell < cells.length && choices < 2; ++cell) {
                if (board[cells[cell]] == BLANK && allowed(board, cells[cell], digit)) {
                    choices++
                    theCell = cells[cell]
                }
            }
            if (choices == 1) {
                board[theCell] = digit
                solver.modified = true
                markCell(theCell, digit, 'sure', ['empty'])
            }
            // next step
            if (++solver.step.region == REGIONS) {   // next region
                solver.step.region = 0
                ++solver.step.digit // next digit
            }
        }
    } else {
        initSolver('values')
        report(`checking single cells disabled: switching to ${solver.method}`)
    }
}

/**
 * Executes one step of the single value solver
 * @param {*} board the board
 * @param {*} empty the empty cells
 */
function singleValues(board, empty) {
    const enabled = document.querySelector('#values:checked') != null
    if (enabled) {
        let currentCell = solver.step.currentCell
        if (currentCell >= empty.length) {
            initSolver(solver.modified ? 'cells' : 'backtracking')
            report(`checking single values completed: switching to ${solver.method}`)
        } else {
            const cell = empty[currentCell]
            report(`checking cell ${cell} for single digit`)
            // single cell allowed for currentValue in currentRegion
            let choices = 0, theDigit = 0
            for (let value = MIN_DIGIT; value <= MAX_DIGIT && choices < 2; ++value) {
                if (allowed(board, cell, value)) {
                    choices++
                    theDigit = value
                }
            }
            if (choices == 1) {
                board[cell] = theDigit
                solver.modified = true
                markCell(cell, theDigit, 'sure', ['empty'])
            }
            // next step
            ++solver.step.currentCell
        }
    } else {
        initSolver(solver.modified ? 'cells' : 'backtracking')
        report(`checking single values disabled: switching to ${solver.method}`)
    }
}


// utility functions ----------------------------------------------------------

/**
 * Returns an array of the given length filled with values starting at start
 * and incremented by delta
 * @param {*} length the length of the returned array
 * @param {*} start the value at index 0, defaults to 0
 * @param {*} delta the incremenet between successive values, defaults to 1
 * @returns an array of the given length filled with successive values starting at start
 */
function iota(length, start = 0, delta = 1) {
    const result = []
    for (let index = 0; index < length; ++index, start += delta) {
        result[index] = start
    }
    return result
}

/**
 * Randomly shuffles shuffled array elements with index in [begin, end[
 * The shuffled elements will be at indices [begin, begin + shuffled[
 * @param {*} a the array to be shuffled
 * @param {*} begin initial index, defaults to 0
 * @param {*} end final index (excluded), defaults to a.length
 * @param {*} shuffled number of elements to be shuffled, defaults to end - begin
 * @returns the shuffled array
 */
function shuffle(a, begin = 0, end = a.length, shuffled = end - begin) {
    while (begin < end - 1 && shuffled-- > 0) {
        let rnd = randomInt(end - begin, begin);    // ; needed !!!
        [a[begin], a[rnd]] = [a[rnd], a[begin]]
        ++begin
    }
    return a
}

/**
 * Returns a random integer in [min, min + values[
 * @param {*} values number of allowed values
 * @param {*} min minimum value to be returned (defaults to 0)
 * @returns a random integer in [min, max = min + numValues -1]
 */
function randomInt(values, min = 0) {
    return min + Math.floor(Math.random() * values)
}

/**
 * Return the selected value of the input(s) with the given name or default value
 * @param {*} name name of the input(s)
 * @param {*} value default value if none selected (defaults to null)
 * @returns the selected value of the input(s) with the given name or default value
 */
function getRadioValue(name, value = null) {
    const e = document.querySelector('input[name="' + name + '"]:checked')
    return e == null ? value : e.value
}

function debug(what) {
    console.log(what)
}

// unused functions -----------------------------------------------------------

function getModifiableCells(board) {
    let result = iota(CELLS, 0)
    // make sure at least DIGITS - 1 digits are preserved in the first positions
    for (let digit = MIN_DIGIT; digit < MAX_DIGIT; ++digit) {
        let chosen = board.indexOf(digit, COLUMNS * digit); // find digit in row digit
        [result[digit], result[chosen]] = [result[chosen], result[digit]]   // swap
    }
    return shuffle(result, MAX_DIGIT) // shuffle the rest
}


function randomize(target) {
    let reached
    let goodBoard
    let next
    do {
        reached = 0
        getValidBoard()
        debug(boardToString(board))
        goodBoard = board.slice()
        // get another one changing random cells (not so random!)
        emptyCells = getModifiableCells(board)
        next = solve(board, emptyCells, emptyCells.length - 1) // another solution
        if (next.solved) {
            // remember changes
            let solution = 0
            let hasChanged = emptyCells.map(() => 0)
            ++solution
            // reached = CELLS - 1 - next.firstChange
            hasChanged.fill(solution, next.firstChange)
            do {
                goodBoard = board.slice()
                next = solve(board, emptyCells, emptyCells.length - 1)
                debug(next)
                if (next.solved) {
                    if (hasChanged[next.firstChange] == solution) {
                        reached = CELLS - next.firstChange - 1
                        debug(`found puzzle with ${reached} empty cells`)
                    }
                    ++solution
                    hasChanged.fill(solution, next.firstChange)
                    debug(boardToString(board))
                }
            } while (next.solved && reached < target)
        }
    } while (reached < target)
    debug(next)
    board = goodBoard.slice()
    for (let empty = next.firstChange + 1; empty < CELLS; ++empty) {
        board[emptyCells[empty]] = 0
    }
}

/**
 * Returns a new random board with target empty cells if possible
 * @param {*} target number of empty cells
 * @returns a new random board with target empty cells if possible
 */
function randomBoardOld(target) {
    const result = getValidBoard()
    const empty = []
    let toBeBlanked = randomModifiableCells(result)
    do {
        let blank = toBeBlanked.pop()
        empty.push(blank)
        const goodBoard = result.slice()
        goodBoard[blank] = BLANK
        if (hasUniqueSolution(goodBoard)) {
            result[blank] = BLANK
        } else {
            empty.pop()
        }
    } while (empty.length < target && toBeBlanked.length > 0)
    timing = performance.now() - timing
    if (empty.length < target) {
        debug('target NOT reached: ' + empty.length + ' empty cells in ' + timing + ' ms')
    } else {
        debug('target REACHED: ' + empty.length + ' empty cells in ' + timing + ' ms')
    }
    return result
}

