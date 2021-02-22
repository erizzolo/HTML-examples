// legata all'onload del body
// richiamata dopo che il body e tutto il documento
// è stato caricato
let min, max, ris
let numElementi, risVettore
let numDimensioni, dimensione, risMulti
let lanci, dadi, statistica

function setup() {
    min = document.getElementById('minimo')
    max = document.getElementById('massimo')
    ris = document.getElementById('risultato')
    numElementi = document.getElementById('elementi')
    risVettore = document.getElementById('vettore-risultato')
    numDimensioni = document.getElementById('dimensioni')
    dimensione = document.getElementById('dimensione')
    risMulti = document.getElementById('vettore-multi')
    lanci = document.getElementById('lanci')
    dadi = document.getElementById('dadi')
    statistica = document.getElementById('statistica')

    document.getElementById('genera').addEventListener('click', genera)
    document.getElementById('vettore').addEventListener('click', generaArray)
    document.getElementById('matrice').addEventListener('click', generaMatrice)
    document.getElementById('lancia').addEventListener('click', generaLanci)
    
}

function genera() {
    let minimo = min.valueAsNumber
    let massimo = max.valueAsNumber
    ris.innerHTML = casualeTra(minimo, massimo)
}

function casualeTra(minimo, massimo) {
    // Math.random() genera un valore "pseudo" casuale
    // in [0, 1[
    // [0, 10] = 11
    // [0, 66] = 67
    // [0, 3] = 4
    // [4, 66] = 67 - 4 = 66 - 4 + 1 = 63
    let numValori = massimo - minimo + 1
    // [0, numValori[
    return minimo + Math.floor(Math.random() * numValori)
    // [0, numValori[ = [0, numValori - 1]
}

function generaArray() {
    let length = numElementi.valueAsNumber
    let minimo = min.valueAsNumber
    let massimo = max.valueAsNumber
    risVettore.innerHTML = casualeArray(length, minimo, massimo)
}

function casualeArray(length, minimo, massimo) {
    let a = []
    a.length = length
    for (let i = 0; i < a.length; ++i) {
        a[i] = casualeTra(minimo, massimo)
    }
    return a
}

function generaMatrice() {
    let dimensions = numDimensioni.valueAsNumber
    let minimo = min.valueAsNumber
    let massimo = max.valueAsNumber
    let length = dimensione.valueAsNumber
    risMulti.innerHTML = JSON.stringify(casualeMulti(dimensions, length, minimo, massimo))
}

function casualeMulti(dimensions, length, minimo, massimo) {
    if (dimensions == 1) {
        return Array.from(Array(length), () => casualeTra(minimo, massimo))
    } else {
        return Array.from(Array(length), () => casualeMulti(dimensions - 1, length, minimo, massimo))
    }
}

function generaLanci() {
    let numLanci = lanci.valueAsNumber
    let numDadi = dadi.valueAsNumber
    let risultato = simulaLanci(numLanci, numDadi)
    statistica.innerHTML = risultato.slice(numDadi)
}

function simulaLanci(numLanci, numDadi) {
    let massimo = numDadi * 6
    let frequenze = Array(massimo + 1).fill(0)
    // alert(frequenze)
    for(let lancio = 0; lancio < numLanci; lancio++) {
        let totale = 0
        for(let dado = 0; dado < numDadi; dado++) {
            totale += 1 + Math.floor(Math.random() * 6)
        }
        frequenze[totale]++
    }
    return frequenze
}

