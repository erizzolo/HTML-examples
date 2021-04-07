window.addEventListener('DOMContentLoaded', setup, false)

const LUNGHEZZA = 4
const TENTATIVI = 3
const VALIDI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
let segreto
let sequenza = []
let effettuati = 0

function setup() {
    // alert('DOMContentLoaded')
    const tb = document.querySelectorAll('span.tasto')
    for (let index = 0; index < tb.length; index++) {
        tb[index].addEventListener('click', inserisci, false)
    }
    restart()
}

function genera() {
    const valori = VALIDI
    disordina(valori)
    return valori.slice(0, LUNGHEZZA)
}

function inserisci(evento) {
    let valore = Number(evento.target.innerHTML)
    document.getElementById('output').innerHTML = ''
    // console.log(valore)
    if (!sequenza.includes(valore)) {
        sequenza.push(valore)
        evento.target.classList.add('cliccato')
        if (sequenza.length == LUNGHEZZA) {
            check()
        }
    }
}

function check() {
    // alert('controllato...')
    let uguali = true
    for (let index = 0; index < sequenza.length; index++) {
        if (sequenza[index] != segreto[index]) {
            uguali = false
        }
    }
    if (uguali) {
        document.getElementById('output').innerHTML = 'Indovinato'
    } else {
        document.getElementById('output').innerHTML = 'sbagliato'
        effettuati++
        if (effettuati == TENTATIVI) {
            document.getElementById('output').innerHTML = 'GAME OVER!'
        }
    }
    if (uguali || (effettuati == TENTATIVI)) {
        // alert('restarting')
        restart()
    }
    sequenza = []
    let c = document.querySelectorAll('.cliccato')
    for (let index = 0; index < c.length; index++) {
        c[index].classList.remove('cliccato')
    }
}

function restart() {
    effettuati = 0
    segreto = genera()
    console.log(segreto)
}

function disordina(mazzo) {
    for (let restanti = mazzo.length; restanti > 1; restanti--) {
        let estratta = Math.floor(Math.random() * restanti)
        let temp = mazzo[estratta]
        mazzo[estratta] = mazzo[restanti - 1]
        mazzo[restanti - 1] = temp
    }
}

