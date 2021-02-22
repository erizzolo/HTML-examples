let semi, valori
let mazzo

function setup() {
    semi = document.getElementById('semi')
    valori = document.getElementById('valori')
    document.getElementById('genera').addEventListener('click', genera)
    document.getElementById('mescola').addEventListener('click', mescola)

}

function genera(evento) {
    let numSemi = semi.valueAsNumber
    let numValori = valori.valueAsNumber
    let h = `mazzo di ${numSemi} semi e ${numValori} valori:<br>${getMazzo(numSemi, numValori)}`
    document.getElementById('mazzo').innerHTML = h
}

function getMazzo(numSemi, numValori) {
    let mazzo = []
    for (let seme = 0; seme < numSemi; seme++) {
        for (let valore = 0; valore < numValori; valore++) {
            // 00 01 02 ... 09 0A 0B 0C 10 11 12 .... 1C 20
            let carta = seme * numValori + valore
            // mazzo.push(carta)    
            mazzo.push(getSimbolo(carta, numValori))
        }
    }
    return mazzo
}

function getSimbolo(carta, numValori) {
    let seme = Math.floor(carta / numValori)    // quoziente (intero) carta / numValori
    let valore = carta - seme * numValori       // resto (intero) carta % numValori
    return "A234567JQK".charAt(valore) + "CQFP".charAt(seme)
}

function mescola() {
    let numSemi = semi.valueAsNumber
    let numValori = valori.valueAsNumber
    let mazzo = getMazzo(numSemi, numValori)
    disordina(mazzo)
    let h = `mazzo di ${numSemi} semi e ${numValori} valori:<br>${mazzo}`
    document.getElementById('mescolato').innerHTML = h

}

function disordina(mazzo) {
    for (let restanti = mazzo.length; restanti > 1; restanti--) {
        let estratta = Math.floor(Math.random() * restanti)
        let temp = mazzo[estratta]
        mazzo[estratta] = mazzo[restanti - 1]
        mazzo[restanti - 1] = temp
    }
}

