window.addEventListener('DOMContentLoaded', setup, false)

function setup() {
    const button = document.querySelector('button[type="submit"]')
    button.addEventListener('click', send, false)
    button.disabled = true
    const inputs = document.querySelectorAll('input')
    for (let index = 0; index < inputs.length; index++) {
        inputs[index].addEventListener('input', check, false)
    }
}

function abilita() {
    return document.getElementById('accept').checked
        && (document.querySelector('#username:valid'))  // not null
        && (document.querySelector('#password:valid'))  // not null
        && (document.querySelector('#conferma:valid'))  // not null
        && (document.querySelector('#email:valid'))  // not null
        && (document.getElementById('password').value == document.getElementById('conferma').value)
}

function check(evento) {
    let result = abilita()
    const button = document.querySelector('button[type="submit"]')
    button.disabled = !result
    return result
}

function send(evento) {
    if (!check(evento || true)) {
        return false
    }
}

