// core javascript


window.addEventListener('DOMContentLoaded', setup, false)

function setup() {
    let button = document.getElementById('prenota')
    button.addEventListener('click', saveCookies, false)
    // document.getElementById('surname').value = getCookie('cognome', '')
    // document.getElementById('name').value = getCookie('nome', '')
    let utente = JSON.parse(getCookie('utente', 'null'))
    if (utente != null) {
        document.getElementById('surname').value = utente.surname
        document.getElementById('name').value = utente.username
    }

}

function saveCookies(evento) {
    let cognome = document.getElementById('surname').value
    // document.cookie = 'cognome' + '=' + cognome
    let nome = document.getElementById('name').value
    // document.cookie = 'nome' + '=' + nome
    // { nomeProprietà: valoreProprietà, nomeProprietà: valoreProprietà, ....}
    // valoreProprietà può essere una variabile, una costante, un'array o altro ancora
    let utente = { "username": nome, 'surname': cognome, saved: true }
    document.cookie = 'utente' + '=' + JSON.stringify(utente)
    // JSON JavaScript Object Notation
    // {"username":"emanuele","surname":"rizzolo","saved":true}
    // {} delimitano "oggetti" ovvero "struct"
    // [] delimitano array
    // { "v": [1,2,null,[]], "a": { "m": 10 }, "c": true }

    // alert(utente)   // object ...
    // alert(utente.surname)
}

function getCookie(name, defaultValue) {
    let allCookies = document.cookie.split('; ')
    for (let c = 0; c < allCookies.length; c++) {
        // nome=valore
        if (allCookies[c].startsWith(name + '=')) {
            return allCookies[c].substring(name.length + 1)
        }
    }
    return defaultValue
}