// usual way to get a function called after document loading
window.addEventListener('DOMContentLoaded', setup, false)

/**
 * Sets up event, global variables, ...
 */
function setup() {
    const button = document.getElementById('scomponi')
    button.addEventListener('click', scomponi, false)
}

function scomponi() {
    const number = getInput('numero', 0)    // 0 is invalid!
    if (number != 0) {
        // const factors = doIt(number)
        const factors = doItWithSieve(number)
        // check
        let prodotto = 1
        for (let index = 0; index < factors.length; index++) {
            prodotto *= factors[index][0] ** factors[index][1]
        }
        if (prodotto != number) {
            alert(`OOPS! ${number} <> ${prodotto}`)
        } else {
            document.getElementById('table').innerHTML = getTable(factors)
            document.getElementById('report').innerHTML = number + ' = ' + getProdotto(factors)
            document.getElementById('nicer').innerHTML = number + ' = ' + getNicerProdotto(factors)
            document.getElementById('divisors').innerHTML = 'Divisori di ' + number + ': ' + getDivisors(factors)
        }
    }
}

/**
 * Restituisce un array con i possibili divisori,
 * data la scomposizione in fattori factors,
 * senza considerare i fattori con indice < which
 * @param {*} factors array di fattori ed esponenti, ad es. 20 -> [[2, 2], [5, 1]]
 * @param {*} which il fattore da cui partire (valore di default 0!!!)
 * @returns un array con i divisori, ad es. 20 -> [1, 2, 4, 5, 10, 20]
 */
function getDivisors(factors, which = 0) {
    const result = []   // no factors so far
    if (which == factors.length) {
        result.push(1)  // obvious 1 if no more factors
    } else {
        // get divisors for next factors
        const others = getDivisors(factors, which + 1)
        // now multiply each divisor for each allowed power of this factor
        for (let index = 0; index < others.length; index++) {
            let potenza = 1 // factor ** 0
            for (let esponente = 0; esponente <= factors[which][1]; esponente++) {
                // another divisor
                result.push(others[index] * potenza)
                potenza *= factors[which][0]
            }
        }
    }
    return result
}

/**
 * Crea il codice HTML della tabella della scomposizione
 * @param {*} factors 
 * @returns 
 */
function getTable(factors) {
    let first = '<tr><th>Fattori primi</th>'
    let second = '<tr><th>Esponenti</th>'
    for (let index = 0; index < factors.length; index++) {
        first += '<td>' + factors[index][0] + '</td>'
        second += '<td>' + factors[index][1] + '</td>'
    }
    first += '</tr>'
    second += '</tr>'
    return '<tbody>' + first + second + '</tbody>'
}

/**
 * Crea l'espressione del prodotto
 * @param {*} factors 
 * @returns 
 */
function getProdotto(factors) {
    let result = ''
    for (let index = 0; index < factors.length; index++) {
        if (index > 0) {
            result += ' x '
        }
        result += factors[index][0]
        if (factors[index][1] > 1) {
            result += '^' + factors[index][1]
        }
    }
    return result
}

/**
 * Crea l'espressione del prodotto
 * @param {*} factors 
 * @returns 
 */
function getNicerProdotto(factors) {
    let result = ''
    for (let index = 0; index < factors.length; index++) {
        if (index > 0) {
            result += ' x '
        }
        result += factors[index][0]
        if (factors[index][1] > 1) {
            result += '<span class="esponente">' + factors[index][1] + '</span>'
        }
    }
    return result
}

/**
 * Effettiva scomposizione in fattori
 * @param {*} numero il numero da scomporre
 * @returns un array contenente le coppie [fattore, esponente]
 */
function doIt(numero) {
    const result = []   // no factors so far
    if (numero > 1) {   // no decomposition for 0, 1
        // start with factor 2, then odd factors up to square root of numero
        for (let fattore = 2; fattore * fattore <= numero; fattore += (fattore == 2 ? 1 : 2)) {
            let esponente = 0
            while ((numero % fattore) == 0) {
                // found a factor: get rid of it and increment the exponent
                numero /= fattore
                ++esponente
            }
            if (esponente > 0) {
                // only real factors
                result.push([fattore, esponente])
            }
        }
        if (numero > 1) {
            // last factor, numero is now a prime
            result.push([numero, 1])
        }
    }
    return result
}

/**
 * Effettiva scomposizione in fattori, con crivello di Eratostene
 * @param {*} numero il numero da scomporre
 * @returns un array contenente le coppie [fattore, esponente]
 */
function doItWithSieve(numero) {
    const result = []   // no factors so far
    if (numero > 1) {   // no decomposition for 0, 1
        const primes = []   // the primes
        const maxPrime = Math.floor(Math.sqrt(numero))
        primes.length = maxPrime + 1
        // inizializza primes[i] = undefined per i = 0..maxPrime
        // check powers of 2
        let esponente = 0
        while ((numero % 2) == 0) {
            numero /= 2
            ++esponente
        }
        if (esponente > 0) {
            result.push([2, esponente])
        }
        // start with factor 3, then prime factors up to square root of numero
        for (let fattore = 3; fattore * fattore <= numero; fattore += 2) {
            if (primes[fattore] == undefined) {
                // fattore is a prime
                let esponente = 0
                while ((numero % fattore) == 0) {
                    // found a factor: get rid of it and increment the exponent
                    numero /= fattore
                    ++esponente
                }
                if (esponente > 0) {
                    // only real factors
                    result.push([fattore, esponente])
                }
                // mark multiples starting from fattore squared
                let multiplo = fattore * fattore, doppio = fattore + fattore
                while (multiplo <= maxPrime) {
                    primes[multiplo] = false
                    multiplo += doppio
                }
            }
        }
        if (numero > 1) {
            // last factor, numero is now a prime
            result.push([numero, 1])
        }
    }
    return result
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
