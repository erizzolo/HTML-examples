// comment the following ...
window.addEventListener('DOMContentLoaded', setup, false)

// each cell of the board array contains a number:
// 0..8: number of mines adjacent to this cell
// 9: if the cell contains a mine
let board = []    // the board
const MINE = 9

// each cell of the covered arrays is true/false if the cell is/isn't covered
// uncovered cells cannot be flagged
let covered = []    // the covered status

// each cell of the flags arrays is true/false if the cell is/isn't flagged
// flagged cells must be unflagged before they are uncovered
let flags = []    // the flags

// total cells to be uncovered = total cells - mined cells
let toBeUncovered = 0

function setup() {
    const button = document.getElementById('genera')
    button.addEventListener('click', newGame, false)
    const boardDiv = document.querySelector('#minesweeper')
    boardDiv.addEventListener('click', clickCell, true)
    boardDiv.addEventListener('contextmenu', clickCell, true)
    setTimeout(deleteMe, 10)
}

function deleteMe() {
    const script = document.getElementById('S1')
    if (script != null) {
        // script.parentElement.removeChild(script)
        script.src = '../js/blank.js'
    }
}

function newGame(evento) {
    // level value is row-columns-mines
    const level = getRadioValue('level', '5-5-5')
    const dimensions = level.split('-')
    const rows = parseInt(dimensions[0])
    const columns = parseInt(dimensions[1])
    const mines = parseInt(dimensions[2])
    board = makeBoard(rows, columns, mines)
    flags = makeFlags(board)
    covered = makeCovered(board)
    // make #minesweeper of class l<rows>-<columns>-<mines>
    const boardDiv = document.getElementById('minesweeper')
    boardDiv.className = ''
    boardDiv.classList.add('l' + level)
    // add rule for cell dimensions
    let sheet = document.styleSheets[1] // I know it's the second stylesheet
    let pv = Math.floor(65 / Math.max(rows, columns))
    let rule = sheet.insertRule(`#minesweeper.l${level} div {}`)
    sheet.cssRules[rule].style = `width: ${pv}vmin; height: ${pv}vmin;`
    // add rule for cell display in a table way...
    rule = sheet.insertRule(`#minesweeper.l${level} div:nth-child(${columns}n+1) {}`)
    sheet.cssRules[rule].style = `clear: left;`
    // should remove old rules ...
    // create the board ...
    boardDiv.innerHTML = boardHTML(board)
    toBeUncovered = rows * columns - mines
}

function boardHTML(board) {
    let result = ''
    for (let row = 0; row < board.length; ++row) {
        for (let col = 0; col < board[row].length; ++col) {
            result += `<div id="${row}-${col}" class="covered"></div>`
        }
    }
    return result
}

function makeBoard(rows, columns, mines) {
    // build the matrix
    const result = []
    for (let row = 0; row < rows; ++row) {
        result[row] = iota(columns, 0, 0)
    }
    // place the mines
    const minedCells = shuffle(iota(rows * columns)).slice(0, mines)
    for (let m = 0; m < minedCells.length; ++m) {
        const mined = minedCells[m]
        result[Math.floor(mined / columns)][mined % columns] = MINE
    }
    // update adjacent count
    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < columns; ++col) {
            if (result[row][col] == MINE) {
                // it's a mine: increase adjacent cells count
                for (let nextRow = row - 1; nextRow <= row + 1; ++nextRow) {
                    for (let nextCol = col - 1; nextCol <= col + 1; ++nextCol) {
                        if (0 <= nextRow && nextRow < rows) {
                            if (0 <= nextCol && nextCol < columns) {
                                if (result[nextRow][nextCol] != MINE) {
                                    ++result[nextRow][nextCol]
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // done
    return result
}

function makeFlags(board) {
    // much simpler than makeBoard: no flags at all!
    const result = []
    for (let row = 0; row < board.length; ++row) {
        result[row] = iota(board[row].length)
        result[row].fill(false)
    }
    return result
}

function makeCovered(board) {
    // much simpler than makeBoard: all cells are covered!
    const result = []
    for (let row = 0; row < board.length; ++row) {
        result[row] = iota(board[row].length)
        result[row].fill(true)
    }
    return result
}

function clickCell(evento) {
    const cellID = evento.target.id
    if (cellID != 'minesweeper') {
        const position = cellID.split('-')
        const row = parseInt(position[0]), col = parseInt(position[1])
        if (covered[row][col]) {
            if (evento.buttons == 2) {
                flags[row][col] = !flags[row][col]
                evento.target.classList.toggle('flagged')
            } else if (!flags[row][col]) {
                uncoverCell(row, col)
            }
        }
    }
    evento.preventDefault()
}

function uncoverCell(row, col) {
    if (covered[row][col]) {
        covered[row][col] = false
        markCell(row, col, 'c' + board[row][col])
        if (board[row][col] == MINE) {
            showMines()
        } else {
            --toBeUncovered
            if (toBeUncovered == 0) {
                showVictory()
            } else if (board[row][col] == 0) {
                uncoverAdjacentCells(row, col)
            }
        }
    }
}

function markCell(row, col, newClass) {
    const cellElement = document.getElementById(row + '-' + col)
    cellElement.className = ''
    cellElement.classList.add(newClass)
}

function showMines() {
    alert('You have landed on a mine ... sorry!')
    markMines('c' + MINE)
}

function showVictory() {
    alert('You have discovered all the mines!!!')
    markMines('cM')
}

function markMines(newClass) {
    for (let row = 0; row < board.length; ++row) {
        for (let col = 0; col < board[row].length; ++col) {
            if (board[row][col] == MINE) {
                markCell(row, col, newClass)
            }
        }
    }
}

function uncoverAdjacentCells(row, col) {
    for (let nextRow = row - 1; nextRow <= row + 1; ++nextRow) {
        for (let nextCol = col - 1; nextCol <= col + 1; ++nextCol) {
            if (0 <= nextRow && nextRow < board.length) {
                if (0 <= nextCol && nextCol < board[nextRow].length) {
                    uncoverCell(nextRow, nextCol)
                }
            }
        }
    }
}

// utility functions ----------------------------------------------------------

/**
 * Returns an array of the given length filled with values starting at start
 * and incremented by delta
 * @param {*} length the length of the returned array
 * @param {*} start the value at index 0, defaults to 0
 * @param {*} delta eccelse the incremenet between successive values, defaults to 1
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
