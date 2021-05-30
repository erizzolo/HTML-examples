window.addEventListener('DOMContentLoaded', setup, false)

const MAGIC_4 = [16, 3, 2, 13, 5, 10, 11, 8, 9, 6, 7, 12, 4, 15, 14, 1] // A. Duhrer

function setup() {
    document.getElementById('genera').addEventListener('click', genera, false)
    document.getElementById('risolvi').addEventListener('click', risolvi, false)
    document.getElementById('verifica').addEventListener('click', verifica, false)
    document.getElementById('save').addEventListener('click', save, false)
    document.getElementById('load').addEventListener('click', load, false)
}

/**
 * Genera la tabella per il quadrato magico:
 * td per i numeri, th per le somme
 * @param {*} evento 
 */
function genera(evento) {
    const dim = getNumber('dimension')
    if (dim == null) {
    } else {
        const table = document.getElementById('square')
        const thead = table.tHead       // first (and only) thead
        const tbody = table.tBodies[0]  // first (and only) tbody
        thead.innerHTML = tbody.innerHTML = ''  // empty
        const headRow = thead.insertRow()
        headRow.appendChild(document.createElement('th')).id = 'diag0'
        for (let row = 0; row < dim; ++row) {
            headRow.appendChild(document.createElement('th')).id = 'col' + row
            const bodyRow = tbody.insertRow()
            bodyRow.appendChild(document.createElement('th')).id = 'row' + row
            for (let col = 0; col < dim; ++col) {
                const td = bodyRow.insertCell()
                td.contentEditable = true   // OMG contenteditable doesn't work !!!
            }
            bodyRow.appendChild(document.createElement('th')).className = 'dead'
        }
        headRow.appendChild(document.createElement('th')).id = 'diag1'
        const ths = document.querySelectorAll('#square th')
        for (let i = 0; i < ths.length; ++i) {
            if (ths[i].id != '') {
                ths[i].title = 'Sum of ' + ths[i].id
            }
        }
    }
}

/**
 * Verifica se il quadrato attuale è un quadrato magico
 * @param {*} evento 
 */
function verifica(evento) {
    const sums = checkSumsArray(arrayFromTable())
    let sum = sums[0].total
    for (let s = 0; s < sums.length; ++s) {
        const th = document.getElementById(sums[s].group)
        if (th != null) {
            th.innerText = sums[s].total
            th.className = sums[s].total == sum ? 'good' : 'bad'
        }
    }
}

/**
 * Crea e mostra il quadrato magico
 * @param {*} evento 
 */
function risolvi(evento) {
    const dim = getNumber('dimension')
    if (dim != null) {
        showArray(square(dim))
    }
}

/**
 * Crea il quadrato magico
 * @param {*} dim la dimensione del quadrato
 * @returns un array di dim * dim numeri che compongono il quadrato magico
 */
function square(dim) {
    let power = 0, d = dim
    while (d % 2 == 0) {
        ++power
        d = d / 2
    }
    return power == 0 ? oddSquare(dim)
        : power == 1 ? doubleSquare(square(dim / 2), dim / 2)
            : fourSquare(dim)
}

/**
 * Mostra il quadrato magico dato
 * @param {*} array l'array contenente i numeri del quadrato
 */
function showArray(array) {
    const cells = document.querySelectorAll('#square tbody td')
    for (let c = 0; c < cells.length; ++c) {
        cells[c].innerText = array[c]
    }
}

/**
 * Costruisce un quadrato magico di ordine dim = 4 * k
 * Algoritmo ricavato da:
 * https://math.stackexchange.com/questions/76411/how-to-construct-magic-squares-of-even-order
 * @param {*} dim la dimensione del quadrato (multiplo di 4)
 * @returns un quadrato magico di ordine dim = 4 * k
 */
function fourSquare(dim) {
    console.assert(dim % 4 == 0, 'b should be multiple of four')
    const result = iota(dim * dim, 1, 1)
    const dimSqp1 = dim * dim + 1
    const SYMMETRIC = [3, 1, -1, -3]
    for (let row = 0, base = 0; row < dim; ++row, base += dim) {
        let start = row % 4, symm = SYMMETRIC[start]
        while (start < dim) {
            result[base + start] = dimSqp1 - result[base + start]
            result[base + start + symm] = dimSqp1 - result[base + start + symm]
            start += 4
        }
    }
    return result
}

/**
 * Costruisce un quadrato magico di ordine dim = 2 * base
 * dato un quadrato magico di ordine base (dispari)
 * Algoritmo ricavato da:
 * http://www.1728.org/magicsq3.htm
 * @param {*} base il quadrato magico di ordine base
 * @param {*} b la dimesnione di b (calcolata per default)
 * @returns un quadrato magico di ordine dim = 2 * base
 */
function doubleSquare(base, b = Math.sqrt(base.length)) {
    console.assert(b % 2 == 1, 'b should be odd')
    console.log(base)
    const dim = b * 2
    const result = constArray(dim * dim, 0)
    // fill result with shifted copies of base square
    //  A C  where   A = base, B = base + b ** 2
    //  D B          C = base + 2 * b ** 2, D = base + 3 * b ** 2
    // now swap cell between A and D
    //  first b/2 columns with exception for row b/2 (columns 1..b/2+1)
    // now swap cell between C and B
    //  last b/2 - 1 columns
    // We combine the three steps not dealing with the exception
    // starting shifts (A and D start swapped, B and C start not swapped)
    let aShift = 3 * b * b, bShift = b * b, cShift = 2 * b * b, dShift = 0
    // delta from A for indices
    const bdelta = b * dim + b  // b rows of dim columns è b columns
    const cdelta = b            // b columns
    const ddelta = b * dim      // b rows of dim columns
    let rIndex, bIndex  // indices in result and base
    for (let col = 0; col < b; ++col) {
        rIndex = bIndex = col
        if (col == (b - 1) / 2) {    // stop swapping A and D
            [aShift, dShift] = [dShift, aShift]
        }
        if (col == (b + 3) / 2) {   // start swapping B and C
            [bShift, cShift] = [cShift, bShift]
        }
        for (let row = 0; row < b; ++row, rIndex += 2 * b, bIndex += b) {
            result[rIndex] = base[bIndex] + aShift
            result[rIndex + ddelta] = base[bIndex] + dShift
            result[rIndex + bdelta] = base[bIndex] + bShift
            result[rIndex + cdelta] = base[bIndex] + cShift
        }
    }
    // now for the exception
    let aIndex = b * (b - 1), dIndex = aIndex + ddelta; // shouldn't have been swapped  // ; needed
    [result[aIndex], result[dIndex]] = [result[dIndex], result[aIndex]] // so swap them again
    aIndex += (b - 1) / 2   // should have been swapped
    dIndex += (b - 1) / 2;  // so swap them // ; needed
    [result[aIndex], result[dIndex]] = [result[dIndex], result[aIndex]]
    return result
}

/**
 * Costruisce un quadrato magico di ordine m * n
 * dati due quadrati di ordine m e n (m, n > 2)
 * Attualmente non usato, ma carino ...
 * Algoritmo ricavato da:
 * https://en.wikipedia.org/wiki/Magic_square#For_squares_of_order_m_%C3%97_n_where_m,_n_%3E_2
 * @param {*} mSquare quadrato di ordine m
 * @param {*} nSquare quadrato di ordine n
 * @param {*} m 
 * @param {*} n 
 * @returns un quadrato magico di ordine m * n
 */
function composite(mSquare, nSquare, m = Math.sqrt(mSquare.length), n = Math.sqrt(nSquare.length)) {
    const result = constArray(mSquare.length * nSquare.length, 0)
    const dim = m * n
    const nCopy = nSquare.slice()
    for (let i = 0; i < nCopy.length; ++i) {
        nCopy[i] = (nCopy[i] - 1) * mSquare.length
    }
    for (let r = 0; r < result.length; ++r) {
        const col = r % dim
        const row = (r - col) / dim
        const nCol = Math.floor(col / n)
        const nRow = Math.floor(row / n)
        const mCol = Math.floor(col % m)
        const mRow = Math.floor(row % m)
        result[r] = mSquare[mRow * m + mCol] + nCopy[nRow * n + nCol]
    }
    return result
}

/**
 * Costruisce un quadrato magico di ordine dim (dispari)
 * Algoritmo ricavato da:
 * https://en.wikipedia.org/wiki/Magic_square#A_method_for_constructing_a_magic_square_of_odd_order
 * @param {*} dim l'ordine del quadrato
 * @returns un quadrato magico di ordine dim (dispari)
 */
function oddSquare(dim) {
    const result = constArray(dim * dim, 0)
    let value = 0, cell = dim >> 1
    while (value++ < dim * dim) {
        result[cell] = value
        let next = cell - dim + 1   // up right
        if (next % dim == 0) {  // exited from right
            next -= dim
        }
        if (next < 0) { // exited from top
            next += dim * dim
        }
        if (result[next] != 0) {
            next = cell + dim   // down
            if (next >= dim * dim) {    // exited from bottom
                next -= dim * dim
            }
        }
        cell = next
    }
    return result
}

/**
 * Ricava l'array dal documento HTML
 * @returns l'array dei numeri inseriti nelle celle del quadrato
 */
function arrayFromTable() {
    const result = []
    const cells = document.querySelectorAll('#square td')
    for (let c = 0; c < cells.length; ++c) {
        result[c] = parseInt(cells[c].innerText)
    }
    return result
}

/**
 * Restiruisce l'array delle somme di righe, colonne e diagonali del quadrato dato
 * @param {*} array il quadrato, come array monodimensionale
 * @param {*} dim la dimensione del quadrato
 * @returns l'array delle somme di righe, colonne e diagonali del quadrato dato
 */
function checkSumsArray(array, dim = Math.sqrt(array.length)) {
    let result = []
    let sum = null
    for (let rc = 0; rc < dim; ++rc) {
        result.push({ group: 'row' + rc, total: getSumArray(array, rc * dim, 1, (rc + 1) * dim) })
        result.push({ group: 'col' + rc, total: getSumArray(array, rc, dim) })
    }
    result.push({ group: 'diag0', total: getSumArray(array, 0, dim + 1) })
    result.push({ group: 'diag1', total: getSumArray(array, dim - 1, dim - 1, dim * dim - 1) })
    return result
}

/**
 * Calcolo effettivo delle somme:
 * restituisce la somma di array[i] per i = start + k * delta in [start, limit[ con k = 0, 1, 2, ...
 * @param {*} array l'array da sommare
 * @param {*} start l'indice iniziale
 * @param {*} delta l'incremento dell'indice (positivo, please!!!)
 * @param {*} limit il minimo indice da escludere
 * @returns la somma di array[i] per i = start + k * delta in [start, limit[ con k = 0, 1, 2, ...
 */
function getSumArray(array, start, delta, limit = array.length) {
    let result = 0
    for (let index = start; index < limit; index += delta) {
        result += array[index]
    }
    return result
}

