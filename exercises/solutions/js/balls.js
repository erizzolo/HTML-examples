window.addEventListener('DOMContentLoaded', setup, false)

const balls = []
let running = true

function setup() {
    const area = document.getElementById('area')
    area.addEventListener('click', newBall)
    const button = document.getElementById('pause')
    button.addEventListener('click', pause, false)
    setInterval(moveBalls, 1000)
}

function pause(evento) {
    if (running) {
        evento.target.innerHTML = 'RESUME'
    } else {
        evento.target.innerHTML = 'PAUSE'
    }
    running = !running
}

function newBall(evento) {
    console.log(evento)
    const b = document.createElement('img')
    b.src = '../images/ball.png'
    b.alt = 'ball #' + balls.length
    b.id = 'ball-' + balls.length
    b.classList.add('ball')
    b.style.left = evento.layerX + 'px'
    b.style.top = evento.layerY + 'px'
    const area = evento.target
    area.appendChild(b)
    balls.push(b)
}

function moveBalls() {
    if (running) {
        for (let index = 0; index < balls.length; index++) {
            const ball = balls[index];
            let left = parseInt(ball.style.left)
            let top = parseInt(ball.style.top)
            ball.style.left = (left + rnd()) + 'px'
            ball.style.top = (top + rnd()) + 'px'
        }
    }
}

function rnd() {
    return -5 + Math.floor(Math.random() * 11)
}
