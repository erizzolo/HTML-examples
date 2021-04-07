// core javascript
/**
 * Fill site common elements
 * @param  {} page the name of the page (e.g. 'index')
 */
function fillCommon(page) {
    fillHeader(page)
    fillNavbar(page)
    fillNews(page)
    fillFooter(page)
    // disable context menu
    document.querySelector('body').addEventListener('contextmenu', noMenu)
}

function noMenu(event) {
    event.preventDefault()
}

/**
 * Fill header element
 * @param  {} page the name of the page (e.g. 'index')
 */
function fillHeader(page) {
    const e = document.getElementById("site-header")
    if (e != null) {
        let parent = page == 'index' ? '' : '../'
        let h = `<img src="${parent}images/Logo_Levi-Ponti.PNG"`
        h += ` alt="Logo dell'Istituto Levi-Ponti">`
        h += '<p>Welcome to our site: enjoy!</p>'
        e.innerHTML = h
    } else {
        console.log("no site-header element for page " + page)
    }
}

/**
 * Fill nav element
 * @param  {} page the name of the page (e.g. 'index')
 */
function fillNavbar(page) {
    const e = document.getElementById("site-nav")
    if (e != null) {
        let parent = page == 'index' ? '' : '../'
        let child = page == 'index' ? 'html/' : ''
        let h = `<a ${page == 'index' ? 'class="active"' : ''} href="${parent}index.html">Home</a>`
        // page specific sections
        if (typeof fillNavbarForPage === "function") {
            h += fillNavbarForPage(page)
        } else {
            console.log("not a function")
        }
        h += `<a class="info${page == 'about' ? ' active' : ''}" href="${child}about.html">About</a>`
        h += `<a class="info${page == 'credits' ? ' active' : ''}" href="${child}credits.html">Credits</a>`
        e.innerHTML = h
    } else {
        console.log("no site-nav element for page " + page)
    }
}


/**
 * Fill news element
 * @param  {} page the name of the page (e.g. 'index')
 */
function fillNews(page) {
    const e = document.getElementById("site-news")
    // Doesn't work on local files (CORS must be http)
    // fallback on using iframe
    if (e != null) {
        let base = `${page == 'index' ? 'html/' : ''}news`
        fetch(base + '.txt')
            .then(response => { if (response.ok) return response; throw Error('?') })
            .then(response => response.text())
            .then(text => e.innerHTML = text)
            .catch(error => e.innerHTML = `<iframe src="${base + '.html'}"></iframe>`)
    } else {
        console.log("no site-news element for page " + page)
    }
}

/**
 * Fill footer element
 * @param  {} page the name of the page (e.g. 'index')
 */
function fillFooter(page) {
    const e = document.getElementById("site-footer")
    if (e != null) {
        let parent = page == 'index' ? '' : '../'
        let child = page == 'index' ? 'html/' : ''
        let h = `Powered by 3AIN`
        h += `<a href="${child}credits.html">Credits</a>`
        h += `<a href="${parent}index.html">Home</a>`
        h += `<a href="${child}games.html">Giochi</a>`
        h += `<a class="privacy" href="${child}privacy.html">Privacy policy</a>`
        h += `<a class="mail" href="mailto:a@edu.iislevipont.it">Email us</a>`
        e.innerHTML = h
    } else {
        console.log("no site-footer element for page " + page)
    }
}

