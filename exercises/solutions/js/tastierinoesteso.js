// usual way to get a function called after document loading
window.addEventListener('DOMContentLoaded', setup, false)

function debug(what) {
    console.log(what)
}

const DIGITS = '0123456789ABCDEF'
let radix = 10  // remember previous radix

/**
 * Sets up event, global variables, ...
 */
function setup() {
    const keys = document.querySelector('#tastierino tbody')
    keys.addEventListener('click', press, false)

    const controls = document.querySelectorAll('#tastierino tfoot td')
    for (let index = 0; index < controls.length; index++) {
        controls[index].addEventListener('click', press, false)
    }

    const baseSelector = document.getElementById('base')
    baseSelector.addEventListener('change', baseChange, false)

    window.addEventListener('keydown', digita, false)

    baseChange(null)
    clearHistory()
    show(0)
    addHistory('nothing', display())
}

function baseChange(evento) {
    let number = parse(display(), radix)
    radix = Number(document.getElementById('base').value)
    const keys = document.querySelectorAll('#tastierino tbody td')
    for (let index = 0; index < keys.length; index++) {
        if (DIGITS.indexOf(keys[index].innerText) < radix) {
            keys[index].classList.remove('disabled')
        } else {
            keys[index].classList.add('disabled')
        }
    }
    show(number.toString(radix))
}

function display() {
    return document.getElementById('result').innerText
}

function show(what) {
    document.getElementById('result').innerText = what
}

function press(evento) {
    if (!evento.target.classList.contains('disabled')) {
        const what = evento.target.innerHTML
        if (what.length <= 2) { // avoids click on tbody, tr ...
            process(what)
        }
    }
}

function digita(evento) {
    const KEYS = ['Backspace', 'Delete', '.']
    const ACTIONS = ['C', 'AC', '.']
    let key = evento.key
    let editing = KEYS.indexOf(key)
    if (editing >= 0) {
        key = ACTIONS[editing]
    } else {
        let valid = DIGITS.indexOf(key.toUpperCase())
        if (valid < 0 || valid >= radix) {
            key = null
        }
    }
    if (key != null) {
        process(key)
    }
}

function process(action) {
    let shown = display()
    switch (action) {
        case 'C':
            if (shown.length > 1) {
                shown = shown.substring(0, shown.length - 1)
            } else {
                shown = '0'
            }
            break
        case 'AC':
            shown = '0'
            break
        case '.':
            if (shown.indexOf('.') < 0) {
                shown += '.'
            }
            break
        default:
            if (DIGITS.indexOf(action.toUpperCase()) < radix) {
                shown = shown == '0' ? action : (shown + action)
            }
    }
    document.getElementById('result').innerText = shown
    addHistory(action, display())
}


function addHistory(what, value) {
    const pressed = document.querySelector('#history tr:first-child')
    const p = document.createElement('td')
    p.innerHTML = what
    pressed.appendChild(p)
    const showed = document.querySelector('#history tr:nth-child(2)')
    const s = document.createElement('td')
    s.innerHTML = value
    showed.appendChild(s)
}

function clearHistory() {
    document.getElementById('history').innerHTML =
        `<tbody><tr><th>Premuto</th></tr><tr><th>Visualizzato</th></tr></tbody>`
}

function parse(what, base) {
    let result = 0
    const point = what.indexOf('.')
    if (point < 0 || what[what.length - 1] == '.') {
        result = parseInt(what, base)
    } else {
        result = parseInt(what.substring(0, point), base)
        const fractional = parseInt(what.substring(point + 1), base)
        result += fractional / (base ** (what.length - point - 1))
    }
    return result
}