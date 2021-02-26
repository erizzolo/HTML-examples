window.addEventListener('DOMContentLoaded', setup, false)

let testo     // text input
let auto      // checkbox auto
let conta     // button conta
let letters   // select per caratteri
let counts    // td per occorrenze

function setup() {
    testo = document.getElementById('testo')
    testo.addEventListener('input', autoCheck)
    auto = document.getElementById('auto')
    auto.addEventListener('change', setAuto)
    auto.checked = false
    conta = document.getElementById('conta')
    conta.addEventListener('click', doCheck)
    conta.classList.remove('hidden')
    letters = document.querySelectorAll('select')
    counts = document.querySelectorAll('td')
    if (letters.length != counts.length) {
        console.log('Length mismatch')
    }
    // fill select elements
    let options = ''
    for (let char = 'A'; char <= 'Z'; char = nextLetter(char)) {
        options += `<option value="${char}">${char}</option>`
    }
    options += `<option value=" ">spazi</option>`
    for (let index = 0; index < letters.length; index++) {
        letters[index].innerHTML = options
        letters[index].selectedIndex = index
        letters[index].addEventListener('change', autoCheck, false)
    }
    // console.log(counts)
}

function nextLetter(letter) {
    return String.fromCharCode(letter.charCodeAt(0) + 1)
}

function setAuto() {
    conta.classList.toggle('hidden')
}

function autoCheck() {
    if (auto.checked) {
        doCheck()
    }
}

function doCheck() {
    const parola = testo.value.toUpperCase()
    for (let index = 0; index < letters.length; index++) {
        let count = -1  // offset
        let start = 0
        do {
            start = parola.indexOf(letters[index].value, start) + 1
            count++
        } while (start > 0)
        counts[index].innerHTML = count
    }
}

