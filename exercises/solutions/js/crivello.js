// usual way to get a function called after document loading
window.addEventListener('DOMContentLoaded', setup, false)

// global animation status
let table
let interval = null
let primes // the array used by the sieve
let currentPrime // the current "prime"
let currentMultiple // the current multiple of currentPrime, none if equal to currentPrime
let colonne // how may columns in the number table

/**
 * Sets up event, global variables, ...
 */
function setup() {
    const button = document.getElementById('genera')
    button.addEventListener('click', genera, false)
    table = document.getElementById('table')
    console.log(table)
}

/**
 * Generates primes and starts animation
 */
function genera() {
    if (interval != null) {
        // animation already running
    } else {
        const massimo = getInput('massimo', null)
        if (massimo != null) {
            const sieve = crivello(massimo) // the real algorithm not actually used
            document.getElementById('output').innerHTML = 'The list of numbers will be shown here'
            animazione(massimo) // real stuff
        }
    }
}

/**
 * Generates an array primi of elements such that:
 * primi[i] = true iff i is prime
 * otherwise primi[i] = false
 * @param {*} massimo max index in the returned array, i.e. primi.length = massimo + 1
 * @returns the array primi 
 */
function crivello(massimo) {
    const primi = []
    primi.length = massimo + 1
    // primi[10] mi dice se 10 è primo oppure no
    // primi[massimo] esiste
    primi.fill(true)
    // alert(primi)
    primi[0] = primi[1] = false
    const radice = Math.sqrt(massimo)
    for (let primo = 2; primo <= radice; primo++) {
        if (primi[primo]) {
            // cancellazione multipli
            for (let multiplo = primo * primo; multiplo <= massimo; multiplo += primo) {
                primi[multiplo] = false
            }
        }
    }
    return primi
}

/**
 * Start the animation to generate primes up to massimo
 * @param {*} massimo the maximum prime to be generated
 */
function animazione(massimo) {
    colonne = getInput('colonne', 10)
    createTable(massimo, colonne, 'DOM')
    primes = [] // empty array
    primes.length = massimo + 1 // grow to contain primes[massimo]
    primes.fill(true)   // every number is supposed to be a prime
    primes[0] = primes[1] = false   // 0 & 1 aren't primes
    markAs(1, 'multiplo')   // no 0 in the table
    currentPrime = currentMultiple = 2  // start with 2
    const ritardo = getInput('ritardo', 10)
    interval = setInterval(setaccia, ritardo)   // one step every ritardo ms
}

/**
 * Creates the table to show numbers
 * @param {*} colonne number of columns of the table
 * @param {*} massimo maximum number to show
 * @param {*} method method to use, defaults to 'HTML'
 */
function createTable(massimo, colonne, method = 'HTML') {
    if (method == 'table') {
        // use table specific methods
        table.innerHTML = '<tbody></tbody>' // empty table
        let righe = Math.ceil(massimo / colonne)
        for (let riga = 0; riga < righe; riga++) {
            const row = table.insertRow()
            for (let cella = 1; cella <= colonne; cella++) {
                const cell = row.insertCell()
                let valore = cella + colonne * riga
                if (valore <= massimo) {
                    cell.classList.add('primo')
                    cell.innerHTML = valore
                } else {
                    cell.innerHTML = '&nbsp;'
                }
            }
        }
    } else if (method == 'DOM') {
        // use generic methods available to all elements
        const tbody = document.createElement('tbody')
        let righe = Math.ceil(massimo / colonne)
        for (let riga = 0; riga < righe; riga++) {
            const tr = document.createElement('tr')
            for (let cella = 1; cella <= colonne; cella++) {
                const td = document.createElement('td')
                let valore = cella + colonne * riga
                if (valore <= massimo) {
                    td.innerText = valore
                    td.classList.add('primo')
                } else {
                    td.innerText = ' '
                }
                tr.appendChild(td)
            }
            tbody.appendChild(tr)
        }
        table.replaceChildren() // empty table
        table.appendChild(tbody)
    } else /* if (method == 'HTML') */ {
        // use simple HTML code insertion
        let h = '<tbody>'
        let righe = Math.ceil(massimo / colonne)
        for (let riga = 0; riga < righe; riga++) {
            h += '<tr>'
            for (let cella = 1; cella <= colonne; cella++) {
                let valore = cella + colonne * riga
                if (valore <= massimo) {
                    h += '<td class="primo">' + valore + '</td>'
                } else {
                    h += '<td>&nbsp;</td>'
                }
            }
            h += '</tr>'
        }
        h += '</tbody>'
        table.innerHTML = h
    }
}

/**
 * Executes one step of the animation
 */
function setaccia() {
    if (currentMultiple == currentPrime) {
        // checking currentPrime
        if (currentPrime < primes.length) {
            if (primes[currentPrime]) {
                primes[currentPrime] = currentPrime
                markAs(currentPrime, 'primo')
                report('Found prime: ' + currentPrime)
                currentMultiple = currentPrime * currentPrime
            } else {
                report('Found a multiple: skipping ' + currentPrime)
                currentMultiple = ++currentPrime    // next prime
            }
        } else {
            // game over
            clearInterval(interval)
            interval = null
            showFinalResult()
        }
    } else {
        // cancelling multiples
        if (currentMultiple < primes.length) {
            primes[currentMultiple] = false
            markAs(currentMultiple, 'multiplo')
            report('Marked ' + currentMultiple + ' as multiple of ' + currentPrime)
            currentMultiple += currentPrime
        } else {
            report('Finished with multiples of ' + currentPrime)
            currentMultiple = ++currentPrime    // next prime
        }
    }
}

/**
 * Marks the given number in the table with the given class
 * @param {*} number 
 * @param {*} classe 
 */
function markAs(number, classe) {
    // console.log(number + 'is ' + classe)
    // actually 1 is at position 0
    const cella = (number - 1) % colonne
    const riga = (number - 1 - cella) / colonne
    const element = table.rows[riga].cells[cella]
    const oldClass = element.classList[0]
    element.classList.remove(oldClass)
    element.classList.add(classe)
}

/**
 * Just to show what's going on
 * @param {*} what 
 */
function report(what) {
    document.getElementById('report').innerHTML = what
}

/**
 * Final list of primes
 */
function showFinalResult() {
    primes = primes.filter(isPrime)
    document.getElementById('output').innerHTML = primes.toString().replaceAll(',', ', ')
    report('Finished: found ' + primes.length + ' primes')
}

/**
 * Filter function
 * @param {*} value 
 * @returns value (interpreted as a boolean value: true/false)
 */
function isPrime(value) {
    return value
}

/**
 * Gets a numeric input value from element with id which or a default value
 * @param {*} which the id of the input element
 * @param {*} defaultValue the value to return if element not valid
 * @returns the value from element with id which or a default value
 */
function getInput(which, defaultValue) {
    const element = document.querySelector('#' + which + ':valid')
    return element == null ? defaultValue : element.valueAsNumber
}
