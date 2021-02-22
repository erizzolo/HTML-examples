// legata all'onload del body
// richiamata dopo che il body e tutto il documento
// è stato caricato
function setup() {
    // restituisce il primo elemento tra quelli selezionati da 'tbody'
    // cioé l'unico tbody del documento
    let tb = document.querySelector('tbody')
    // console.log(tb)
    // aggiungo al tb un gestore dell'evento 'click'
    tb.addEventListener('click', cellClicked)
}

// gestore dell'evento 'click'
// il browser passa come parametro l'evento da gestire
function cellClicked(evento) {
    // console.log(evento)
    // alert("cellClicked")
    // target è l'elemento cliccato
    incrementa(evento.target)
}

// funzione che incrementa il contenuto
function incrementa(elemento) {
    if (elemento.tagName == 'TD') {
        // se è un TD
        let valore = parseInt(elemento.innerHTML)
        // alert("Cliccato su td: " + valore)
        valore = valore + 1
        elemento.innerHTML = valore
    }
}

function mostra(elemento) {
    alert("cliccato su " + elemento.innerHTML)
}