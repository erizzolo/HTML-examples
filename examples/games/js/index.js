// index specific javascript
/**
 * Fill nav element specific for games
 * @param  {} page the name of the page (e.g. 'index')
 */
function fillNavbarForPage(page) {
    let result = ''
    if (page == 'index') {
        result += `<a href="html/games.html">Giochi</a>`
        result += `<a href="html/photos.html">Foto</a>`
    } else {
        console.log("no site-nav element for page " + page)
    }
    return result
}
