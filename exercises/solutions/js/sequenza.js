const sequence = []

window.addEventListener('DOMContentLoaded', setup, false)

function setup() {
    const keys = document.querySelectorAll('#keyboard tbody tr td')
    for (const key of keys) {
        key.addEventListener('click', press, false)
    }
    document.getElementById('enter').addEventListener('click', enter)
    document.getElementById('restart').addEventListener('click', restart)
}

function press(evento) {
    if (sequence.length >= 4) {
        alert("You're clicking too much: the keyboard will break!!!")
    } else {
        evento.target.classList.add('clicked')
        sequence.push(evento.target.innerHTML)
        setTimeout((evento) => evento.target.classList.remove('clicked'), 300, evento)
    }
}

function enter(evento) {
    show(sequence, document.querySelectorAll('#sequence td'))
    show(sequence.reverse(), document.querySelectorAll('#reversed td'))
    sequence.length = 0
}

function show(what, where) {
    for (let index = 0; index < where.length; index++) {
        if (index < what.length) {
            where[index].innerHTML = what[index]
        } else {
            where[index].innerText = ''
        }
    }
}

function restart(evento) {
    sequence.length = 0
    enter(evento)
}
