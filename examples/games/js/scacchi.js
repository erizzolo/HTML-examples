// scacchi specific javascript

let dragged = null  // the element being dragged, if any

function debug(what) {
    console.log(what)
}

// alternative to body onload="setupDragging()"
window.addEventListener('DOMContentLoaded', setupDragging, false)

/**
 * Fill nav element specific for scacchi
 * @param  {} page the name of the page (e.g. 'index')
 */
function fillNavbarForPage(page) {
    let result = ''
    if (page == 'scacchi') {
        result += `<a href="games.html">Giochi</a>`
    } else {
        console.log("no site-nav element for page " + page)
    }
    return result
}

/**
 * Setup up dragging of pieces
 */
function setupDragging() {
    // allow dragging all images in the board
    let drag = document.querySelectorAll('.scacchiera img')
    for (let i = 0; i < drag.length; ++i) {
        drag[i].draggable = true    // not necessary because images are draggable by default
        drag[i].addEventListener('dragstart', dragStart, false)
    }
    // allow dropping in all cells in the board
    let drop = document.querySelectorAll('.scacchiera td')
    for (let i = 0; i < drop.length; ++i) {
        drop[i].addEventListener('dragover', dragOver, false)
        drop[i].addEventListener('drop', dragDrop, false)
    }
}

/**
 * Start dragging handler
 * @param  {} event the dragging event
 */
function dragStart(event) {
    debug(event)
    const e = event.target
    if (e !== null) {
        let img = new Image(e.width, e.height)
        img.src = e.src
        event.dataTransfer.setData('text/plain', e.src)
        event.dataTransfer.setDragImage(img, e.width / 2, e.height / 2)
        event.dataTransfer.dropEffect = "move"
        dragged = e
    } else {
        console.log("null target for " + event)
    }
}

/**
 * Over dragging handler
 * @param  {} event the dragging event
 */
function dragOver(event) {
    debug(event)
    const e = event.target
    if (e !== null) {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
    } else {
        console.log("null target for " + event)
    }
}

/**
 * Drop dragging handler
 * @param  {} event the dragging event
 */
function dragDrop(event) {
    debug(event)
    let e = event.target
    if (e !== null) {
        event.preventDefault()
        if (e.tagName !== 'TD') {
            e = e.parentElement
        }
        e.innerHTML = ''
        if (event.ctrlKey) {
            let clone = dragged.cloneNode(true)
            clone.addEventListener('dragstart', dragStart, false)
            e.appendChild(clone)
        } else {
            e.appendChild(dragged)
        }
        dragged = null
    } else {
        console.log("null target for " + event)
    }
}
