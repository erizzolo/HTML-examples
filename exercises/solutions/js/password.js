window.addEventListener('DOMContentLoaded', setup, false)

function setup() {
    const button = document.getElementById('generate')
    button.addEventListener('click', genera, false)
}

function genera(evento) {

    const theUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const theLower = theUpper.toLowerCase()
    const theDigits = '0123456789'
    const theSymbols = '$_+-%'

    let password = '', chooseable = ''
    const upper = document.querySelector('input[name="upper"]:checked')
    if (upper.value != 'no') {
        chooseable += theUpper
        if (upper.value == 'sure') password += randomFrom(theUpper)
    }
    const lower = document.querySelector('input[name="lower"]:checked')
    if (lower.value != 'no') {
        chooseable += theLower
        if (lower.value == 'sure') password += randomFrom(theLower)
    }
    const digits = document.querySelector('input[name="digits"]:checked')
    if (digits.value != 'no') {
        chooseable += theDigits
        if (digits.value == 'sure') password += randomFrom(theDigits)
    }
    const symbols = document.querySelector('input[name="symbols"]:checked')
    if (symbols.value != 'no') {
        chooseable += theSymbols
        if (symbols.value == 'sure') password += randomFrom(theSymbols)
    }

    const length = document.getElementById('length').valueAsNumber
    const duplicates = document.querySelector('input[name="duplicates"]:checked') !== null
    if ((length > chooseable.length) && !duplicates)
        alert("Impossible to generate such a password!!!")
    else {
        while (password.length < length) {
            const next = randomFrom(chooseable)
            if (duplicates || password.indexOf(next) < 0)
                password += next
        }
        document.getElementById('password').innerText = password
    }
}

function randomFrom(what) {
    return what.charAt(Math.floor(Math.random() * what.length))
}