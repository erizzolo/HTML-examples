// usual way to get a function called after document loading
window.addEventListener('DOMContentLoaded', setup, false)

/**
 * Sets up event, global variables, ...
 */
function setup() {
    const button = document.querySelector('#genera')
    button.addEventListener('click', genera, false)
    genera()
}

function genera() {
    const rows = document.querySelector('#righe:valid')
    if (rows != null) {
        const righe = rows.valueAsNumber
        let values = []
        let table = ''
        for (let riga = 0; riga < righe; ++riga) {
            values = next(values)
            table += rigaHTML(values, righe)
        }
        document.querySelector('#tartaglia tbody').innerHTML = table
    }
}

function next(values) {
    const result = values.slice()
    for (let index = result.length; index-- > 1;) {
        result[index] += result[index - 1]
    }
    result.push(1)
    return result
}

function rigaHTML(values, righe) {
    let result = '<tr>'
    // let empty = righe > values.length ? `<td class="empty" colspan="${righe - values.length}">` : ''
    let empty = `<td class="empty" colspan="${righe - values.length + 1}">`
    result += empty
    for (let index = 0; index < values.length; index++) {
        result += `<td colspan="2">${values[index]}</td>`
    }
    result += empty
    result += '</tr>'
    return result
}
