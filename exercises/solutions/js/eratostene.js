window.addEventListener('DOMContentLoaded', setup, false)

function setup() {
    document.getElementById('genera').addEventListener('click', genera)
}

function genera() {
    // checkValidity()
    const max = document.querySelector('#massimo:valid')
    if (max != null) {
        const started = performance.now()
        const sieve = crivello(max.valueAsNumber)
        const sieveTime = performance.now() - started
        setTimeout(() => {
            // inserisco gli indici degli elementi con valore undefined, cioè i numeri primi
            const primes = [2]
            for (let prime = 3; prime < sieve.length; prime += 2) {
                if (sieve[prime] == undefined) {
                    primes.push(prime)
                }
            }
            const totalTime = performance.now() - started
            createImage(sieve)
            createTable(sieve)
            document.getElementById('output').innerHTML = primes.toString().replaceAll(',', ', ')
            const outputTime = performance.now() - started - totalTime
            document.getElementById('report').innerText =
                `${primes.length} primes generated in ${totalTime} ms` +
                ` (sieve took ${sieveTime} ms & output took ${outputTime} ms).`
        }, 0);
    }
}

function createImage(sieve) {
    const canvas = document.getElementById('image')
    if (canvas) {
        if (canvas.getContext) {
            const radice = Math.floor(Math.sqrt(sieve.length))
            canvas.style.width = canvas.style.height = radice + 'px'
            const ctx = canvas.getContext("2d")
            ctx.save()  // ???
            // ctx.strokeStyle = document.getElementById('colour').value
            ctx.fillStyle = document.getElementById('colour').value
            for (let number = 3, x = 3, y = 0; number < sieve.length; number += 2, x += 2) {
                if (x >= radice) {
                    ++y
                    x -= radice
                }
                if (sieve[number] == undefined) {
                    // setTimeout(() => {
                    ctx.fillRect(x, y, 1, 1)
                    // }, 5);
                }
            }
        } else {
            alert("Need canvas support!!!")
        }

    }
}

function createTable(sieve) {
    const table = document.getElementById('table')
    if (table) {
        const rows = Math.ceil((sieve.length - 1) / 10)
        let h = '<tbody><tr><td>1</td><td class="prime">2</td>'
        for (let index = 3; index <= rows * 10; index += 2) {
            if (index % 10 == 1) {
                h += '</tr><tr>'
            }
            if (index < sieve.length) {
                h += '<td' + (sieve[index] == undefined ? ' class="prime">' : '>') + index + '</td>'
            } else {
                h += '<td>' + index + '</td>'
            }
            h += '<td>' + (index + 1) + '</td>'
        }
        h += '</tr></tbody>'
        table.innerHTML = h
    }
}

function indicesFor(x, y, width) {
    const red = (x + y * width) * 4;
    return [red, red + 1, red + 2, red + 3];
}

/**
 * Restituisce un array di lunghezza max + 1
 * in cui l'elemento in posizione i vale:
 * i se il numero i è primo
 * undefined o true altrimenti
 * Trivial version
 * @param {*} max >= 2
 */
function crivello(max) {
    // array che indica quali numeri sono primi
    const primes = []
    primes.length = max + 1
    // inizializza primes[i] = undefined per i = 0..max
    // primes[i] == undefined    true
    // primes[i] != undefined    false
    // primes[i] === undefined   true
    // primes[i] !== undefined   false
    // 0 e 1 non sono primi
    primes[0] = primes[1] = false
    // per tutti i possibili primi successivi 3, 5, 7, ...
    // fino alla radice di max
    const radice = Math.floor(Math.sqrt(max))
    for (let primo = 3; primo <= radice; primo += 2) {
        // se non composto
        if (primes[primo] == undefined) {
            // trovato un nuovo numero primo
            const number = primo
            setTimeout(() => {
                // console.log(number)
                // marcatura dei multipli (dispari, a partire dal quadrato di primo)
                // let multiplo = primo * primo, doppio = primo + primo
                let multiplo = number * number, doppio = number + number
                while (multiplo <= max) {
                    primes[multiplo] = false
                    multiplo += doppio
                }
            }, 0);
        }
    }
    return primes
}
