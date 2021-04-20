// usual way to get a function called after document loading
window.addEventListener('DOMContentLoaded', setup, false)

let value = 0

/**
 * Sets up event, global variables, ...
 */
function setup() {
    const buttons = document.querySelector('#tastierino')
    buttons.addEventListener('click', press, false)
    document.getElementById('result').innerHTML = value
    clear()
    show('nothing', value)
}

function press(evento) {
    const what = evento.target.innerHTML
    // console.log(what)
    if (what.length <= 2) {
        if (what == 'C') {
            value = Math.floor(value / 10)
        } else if (what == 'AC') {
            value = 0
        } else {
            value = value * 10 + parseInt(what)
        }
        document.getElementById('result').innerHTML = value
        show(what, value)
    }
}

function show(what, value) {
    const pressed = document.querySelector('#history tr:first-child')
    const p = document.createElement('td')
    p.innerHTML = what
    pressed.appendChild(p)
    const showed = document.querySelector('#history tr:nth-child(2)')
    const s = document.createElement('td')
    s.innerHTML = value
    showed.appendChild(s)
}

function clear() {
    document.getElementById('history').innerHTML =
        `<tbody><tr><th>Premuto</th></tr><tr><th>Visualizzato</th></tr></tbody>`
}
