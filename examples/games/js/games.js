// games specific javascript
/**
 * Fill nav element specific for games
 * @param  {} page the name of the page (e.g. 'index')
 */
function fillNavbarForPage(page) {
    let result = ''
    if (page == 'games') {
        result += `<a href="logica.html">Logica</a>`
        result += `<a href="animazione.html">Animazione</a>`
        result += `<a href="scacchi.html">Scacchi</a>`
    } else {
        console.log("no site-nav element for page " + page)
    }
    return result
}
