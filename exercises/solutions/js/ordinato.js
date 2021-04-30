window.addEventListener('DOMContentLoaded', setup, false)

/**
 * semplice console.log(what) disabilitabile "globalmente"
 * @param {*} what 
 */
function debug(what) {
    console.log(what)
}

function setup() {
    document.getElementById('genera').addEventListener('click', genera)
    document.getElementById('ricerca').addEventListener('click', ricerca)
}

function genera() {
    let length = getNumber('length', 5)
    let minimo = getNumber('minimo', 20)
    let massimo = getNumber('massimo', 50)
    let metodo = Number(getOption('metodo', 1))
    let duplicati = isChecked('duplicati', false)
    console.log(duplicati)
    let a = getArray(length, minimo, massimo, duplicati, metodo)
    document.getElementById('risultato').innerHTML = a
    let complemento = Number(getOption('complemento', 1))
    document.getElementById('complementare').innerHTML = complementare(a, minimo, massimo, complemento)
    document.getElementById('cumsum').innerHTML = cumsum(a)
    document.getElementById('cumprod').innerHTML = cumprod(a)
    document.getElementById('frequencies').innerHTML = frequencies(a, minimo, massimo)
}

/**
 * Restituisce se valido il valore dell'input type="number" con la data id
 * oppure il valore di default fornito
 * @param {*} id l'id dell'elemento di input
 * @param {*} value valore da restituire se l'elemento non esiste o non è valido
 * @returns il valore dell'input oppure value
 */
function getNumber(id, value = null) {
    let e = document.querySelector('#' + id + ':valid')
    return e == null ? value : e.valueAsNumber
}

/**
 * Restituisce il valore dell'input type="radio" con il dato name
 * oppure il valore di default fornito
 * @param {*} name il valore di name dell'elemento di input
 * @param {*} value valore da restituire se l'elemento non esiste o non è valido
 * @returns il valore dell'input oppure value
 */
function getOption(name, value = null) {
    let e = document.querySelector('input[name="' + name + '"]:checked')
    return e == null ? value : e.value
}

/**
 * Restituisce se l'input type="checkbox" con la data id è selezionata
 * oppure il valore di default fornito
 * @param {*} id l'id dell'elemento di input
 * @param {*} value valore da restituire se l'elemento non esiste
 * @returns se l'input è selezionato o no, oppure value
 */
function isChecked(id, value = null) {
    let e = document.getElementById(id)
    return e == null ? value : e.checked
}

function getArray(length, minimo, massimo, duplicati, metodo) {
    let a = []
    if (duplicati) {
        switch (metodo) {
            case 1:
                // metodo 1: array ausiliario
                const count = []
                for (let e = 0; e < massimo - minimo + 1; ++e) {
                    count[e] = 0
                }
                debug(`created array of counters = ${count}`)
                for (let e = 0; e < length; ++e) {
                    count[casuale(0, massimo - minimo)]++
                }
                debug(`done increasing: counters = ${count}`)
                for (let e = 0; e < massimo - minimo + 1; ++e) {
                    for (let i = 0; i < count[e]; i++) {
                        a.push(minimo + e)
                    }
                }
                debug(`done scanning: a = ${a}`)
                break
            case 2:
                // metodo 2: controllo valore generato
                for (let e = 0; e < length; ++e) {
                    do {
                        a[e] = casuale(minimo, massimo)
                        debug(`a[${e}] = ${a[e]}: ${e > 0 && a[e] < a[e - 1] ? 'invalid' : 'valid'}`)
                    } while (e > 0 && a[e] < a[e - 1])
                }
                break
            case 3:
                // metodo 3: generazione incremento
                a[0] = casuale(minimo, massimo)
                for (let e = 1; e < length; ++e) {
                    debug(`a[${e}]: generating increment in[0, ${massimo - a[e - 1]}]`)
                    a[e] = a[e - 1] + casuale(0, massimo - a[e - 1])
                }
                break
            case 4:
                // metodo 4: variazione intervallo
                for (let e = 0; e < length; ++e) {
                    debug(`a[${e}]: generating value in[${minimo}, ${massimo}]`)
                    a[e] = casuale(minimo, massimo)
                    minimo = a[e]   // aggiorno minimo
                }
                break
            case 5:
                // metodo 5: ordinamento
                for (let e = 0; e < length; ++e) {
                    a[e] = casuale(minimo, massimo)
                }
                debug(`generated random array a = ${a}`)
                // a.sort((a, b) => a - b)
                a.sort(confronto)
                debug(`sorted random array a = ${a}`)
                break
            default:
        }
    } else {
        if (length > massimo - minimo + 1) {
            a = `Impossibile generare ${length} valori diversi tra ${minimo} e ${massimo} `
        } else {
            switch (metodo) {
                case 1:
                    // metodo 1: array ausiliario
                    const count = []
                    for (let e = 0; e < massimo - minimo + 1; ++e) {
                        count[e] = false
                    }
                    for (let e = 0; e < length; ++e) {
                        let random
                        do {
                            random = casuale(minimo, massimo) - minimo
                        } while (count[random])
                        count[random] = true
                    }
                    for (let e = 0; e < massimo - minimo + 1; ++e) {
                        if (count[e]) {
                            a.push(minimo + e)
                        }
                    }
                    break
                case 2:
                    // metodo 2: controllo valore generato
                    for (let e = 0; e < length; ++e) {
                        do {
                            a[e] = casuale(minimo, massimo + e + 1 - length)
                        } while (e > 0 && a[e] <= a[e - 1])
                    }
                    break
                case 3:
                    // metodo 3: generazione incremento
                    a[0] = casuale(minimo, massimo + 1 - length)
                    for (let e = 1; e < length; ++e) {
                        a[e] = a[e - 1] + casuale(1, massimo + e - 1 - length - a[e - 1])
                    }
                    break
                case 4:
                    // metodo 4: variazione intervallo
                    for (let e = 0; e < length; ++e) {
                        a[e] = casuale(minimo, massimo + e + 1 - length)
                        minimo = a[e] + 1  // aggiorno minimo
                    }
                    break
                case 5:
                    // metodo 5: ordinamento
                    for (let e = 0; e < length; ++e) {
                        do {
                            a[e] = casuale(minimo, massimo)
                        } while (a.indexOf(a[e]) != e)
                    }
                    a.sort(confronto)   // a.sort((a, b) => a - b)
                    break
                default:
            }
        }
    }
    return a
}

/**
 * Confronta a e b, restituendo un valore negativo, nullo o positivo
 * a seconda che a sia minore, uguale o maggiore di b
 * @param {*} a 
 * @param {*} b 
 * @returns < 0, 0, > 0 a seconda che a < b, a == b, a > b
 */
function confronto(a, b) {
    return a < b ? -1 : (a > b ? +1 : 0)
}

function casuale(minimo, massimo) {
    return minimo + Math.floor(Math.random() * (massimo - minimo + 1))
}

function ricerca() {
    let a = Array.from(document.getElementById('risultato').innerHTML.split(','))
    for (let index = 0; index < a.length; index++) {
        a[index] = Number(a[index])
    }
    if (isNaN(a[0]) || a.length < 2) {
        document.getElementById('coppia').innerHTML = 'Seems that there is no array to search'
        document.getElementById('terna').innerHTML = 'Seems that there is no array to search'
    } else {
        let target = getNumber('target', 55)
        let result
        let found = findCouple(a, target)
        if (found == null) {
            result = 'Sorry, no suitable couple found'
        } else {
            result = `a[${found.first}] + a[${found.second}] = ${a[found.first]} + ${a[found.second]} = ${a[found.first] + a[found.second]} `
        }
        document.getElementById('coppia').innerHTML = result
        if (a.length < 3) {
            document.getElementById('terna').innerHTML = 'Seems that there is no array to search'
        } else {
            found = findTriplet(a, target)
            if (found == null) {
                result = 'Sorry, no suitable triplet found'
            } else {
                result = `a[${found.first}] + a[${found.second}] + a[${found.third}] = ${a[found.first]} + ${a[found.second]} + ${a[found.third]} = ${a[found.first] + a[found.second] + a[found.third]} `
            }
            document.getElementById('terna').innerHTML = result
        }
    }
}

/**
 * Ricerca una coppia di elementi nel vettore ordinato a,
 * da a[begin] ad a[end] escluso, con somma target
 * @param {*} a il vettore di ricerca ordinato in modo crescente
 * @param {*} target la somma obiettivo
 * @param {*} begin indice iniziale (defaults to 0)
 * @param {*} end indice finale (default to a.length)
 * @returns la coppia di indici { first, second } se trovato, oppure null
 */
function findCouple(a, target, begin = 0, end = a.length) {
    let result = null   // risultato
    // let left = begin    // indice minimo
    let left = lowerBound(a, target - a[end - 1], begin, end) // indice minimo
    if (left < end - 1) {
        // let right = end - 1    // indice massimo
        let right = upperBound(a, target - a[left], left + 1, end) - 1  // indice massimo
        let comparison  // risultato confronto
        debug(`search couple with sum ${target} in [${left}, ${right}]`)
        while (comparison != 0 && left < right) {
            comparison = a[left] + a[right] - target
            debug(`a[${left}]+ a[${right}] = ${a[left]} + ${a[right]} = ${a[left] + a[right]} `)
            if (comparison < 0) {
                ++left
                debug(`${a[left - 1] + a[right]} < ${target}: increased left to ${left}`)
            } else if (comparison > 0) {
                --right
                debug(`${a[left] + a[right + 1]} > ${target}: decreased right to ${right} `)
            } else {
                debug(`${a[left] + a[right]} == ${target}: exiting loop`)
            }
        }
        if (comparison == 0) {
            result = { first: left, second: right }
        }
    }
    return result
}

/**
 * Ricerca una terna di elementi nel vettore ordinato a, con somma target
 * @param {*} a il vettore di ricerca ordinato in modo crescente
 * @param {*} target la somma obiettivo
 * @returns la terna di indici { first, second, third } se trovato, oppure null
 */
function findTriplet(a, target) {
    // trivial solution
    let result = null
    for (let first = 0; first < a.length - 2 && result == null; ++first) {
        let couple = findCouple(a, target - a[first], first + 1, a.length)
        if (couple != null) {
            result = { first: first, second: couple.first, third: couple.second }
        }
    }
    return result
}

/**
 * Restituisce l'indice del primo elemento nel range [first, last[
 * maggiore di o uguale a value, o last se l'elemento non esiste.
 * @param {*} a il vettore di ricerca ordinato in modo crescente
 * @param {*} value il valore obiettivo
 * @param {*} first il primo indice dell'intervallo
 * @param {*} last l'indice successivo all'ultimo dell'intervallo
 * @returns l'indice cercato, oppure last
 */
function lowerBound(a, value, first = 0, last = a.length) {
    let count = last - first
    // indici di ricerca da first a first + count - 1
    debug(`lower bound of ${value} in [${first}, ${first + count - 1}]`)
    while (count > 0) {
        let step = count >> 1   // divisione intera per 2
        debug(`checking a[${first + step}] = ${a[first + step]} `)
        if (a[first + step] < value) {
            first += step + 1
            count -= step + 1
        } else {
            count = step
        }
        debug(`interval modified in [${first}, ${first + count - 1}]`)
    }
    return first
}

/**
 * Restituisce l'indice del primo elemento nel range [first, last[
 * maggiore di value, o last se l'elemento non esiste.
 * @param {*} a il vettore di ricerca ordinato in modo crescente
 * @param {*} value il valore obiettivo
 * @param {*} first il primo indice dell'intervallo
 * @param {*} last l'indice successivo all'ultimo dell'intervallo
 * @returns l'indice cercato, oppure last
 */
function upperBound(a, value, first = 0, last = a.length) {
    let count = last - first
    // indici di ricerca da first a first + count - 1
    debug(`upper bound of ${value} in [${first}, ${first + count - 1}]`)
    while (count > 0) {
        let step = count >> 1   // divisione intera per 2
        debug(`checking a[${first + step}] = ${a[first + step]} `)
        if (a[first + step] <= value) {
            first += step + 1
            count -= step + 1
        } else {
            count = step
        }
        debug(`interval modified in [${first}, ${first + count - 1}]`)
    }
    return first
}

function complementare(a, minimo, massimo, metodo) {
    let c = []
    switch (metodo) {
        case 1:
            // metodo 1: array ausiliario
            const count = []
            for (let e = 0; e < massimo - minimo + 1; ++e) {
                count[e] = 0
            }
            debug(`created array of counters = ${count}`)
            for (let e = 0; e < a.length; ++e) {
                count[a[e] - minimo]++
            }
            debug(`done counting: counters = ${count}`)
            for (let e = 0; e < massimo - minimo + 1; ++e) {
                if (count[e] == 0) {
                    c.push(minimo + e)
                }
            }
            debug(`done scanning: c = ${c}`)
            break
        case 2:
            // metodo 2: ricerca sequenziale
            debug(`sequential search`)
            for (let e = minimo; e <= massimo; ++e) {
                if (a.indexOf(e) < 0) {
                    c.push(e)
                }
            }
            break
        case 3:
            // metodo 3: ricerca dicotomica
            debug(`binary search`)
            for (let e = minimo; e <= massimo; ++e) {
                if (!binarySearch(a, e)) {
                    c.push(e)
                }
            }
            break
        case 4:
            // metodo 4: rimozione
            debug(`removal`)
            for (let e = minimo; e <= massimo; ++e) {
                c.push(e)
            }
            for (let e = 0; e < a.length; ++e) {
                c = c.filter((value) => a[e] != value)
            }
            break
    }
    return c
}

/**
 * Restituisce vero se un elemento nel range [first, last[
 * è uguale a value, altrimenti false.
 * @param {*} a il vettore di ricerca ordinato in modo crescente
 * @param {*} value il valore obiettivo
 * @param {*} first il primo indice dell'intervallo
 * @param {*} last l'indice successivo all'ultimo dell'intervallo
 * @returns true se value corrisponde ad un elemento del range, altrimenti false
 */
function binarySearch(a, value, first = 0, last = a.length) {
    first = lowerBound(a, value, first, last)
    return !(first == last || value < a[first])
}

/**
 * Restituisce l'array delle somme cumulative di a.
 * s(a) è l'array tale che s[i] = a[0] + ... + a[i]
 * @param {*} a il vettore da sommare
 * @returns l'array delle somme cumulative di a.
 */
function cumsum(a) {
    let sum = 0
    let result = []
    for (let index = 0; index < a.length; index++) {
        result[index] = sum += a[index]
    }
    return result
}


/**
 * Restituisce l'array dei prodotti cumulativi di a.
 * s(a) è l'array tale che s[i] = a[0] x ... x a[i]
 * @param {*} a il vettore da sommare
 * @returns l'array dei prodotti cumulativi di a.
 */
function cumprod(a) {
    let product = 1
    let result = []
    for (let index = 0; index < a.length; index++) {
        result[index] = product *= a[index]
    }
    return result
}

/**
 * Restituisce l'array delle frequenze dei valori in [minimo, massimo] in a.
 * @param {*} a il vettore degli elementi
 * @param {*} minimo il minimo valore da contare
 * @param {*} massimo il massimo valore da contare
 * @returns l'array deelle frequenze dei valori in a.
 */
function frequencies(a, minimo, massimo) {
    let result = []
    result.length = massimo - minimo + 1
    result.fill(0)
    for (let e = 0; e < a.length; ++e) {
        if (minimo <= a[e] && a[e] <= massimo) {
            result[a[e] - minimo]++
        }
    }
    return result
}

