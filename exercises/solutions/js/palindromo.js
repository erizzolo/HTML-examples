let word, phrase, wordCheck, phraseCheck

function setup() {
    word = document.getElementById('parola')
    word.addEventListener('input', checkWord)
    phrase = document.getElementById('frase')
    phrase.addEventListener('input', checkPhrase)
    wordCheck = document.getElementById('checkParola')
    phraseCheck = document.getElementById('checkFrase')
}

function checkWord() {
    doCheck(word, wordCheck, 'Parola')
}
function checkPhrase() {
    doCheck(phrase, phraseCheck, 'Frase')
}

function doCheck(input, out, what) {
    let parola = input.value
    if (isPalindroma(parola)) {
        out.innerHTML = what + ' palindroma'
    } else {
        out.innerHTML = what + ' NON palindroma'
    }
}

function isPalindroma(parola) {
    let ignored = ` .,;:!?'"`
    for (let c = 0; c < ignored.length; c++) {
        let char = ignored.charAt(c)
        while (parola.includes(char))
            parola = parola.replace(char, '')
    }
    parola = parola.toLowerCase()
    for (let s = 0, r = parola.length - 1; s < r; ++s, --r)
        if (parola.charAt(s) != parola.charAt(r))
            return false
    return true
}

