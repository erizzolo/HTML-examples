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

// useful functions -----------------------------------------------------------
/**
 * Return the value of the cookie with the given name or default value
 * @param {*} name name of the cookie
 * @param {*} defaultValue value to return if cookie not found (defaults to null)
 * @returns the value of the cookie with the given name or default value
 */
function getCookieValue(name, defaultValue = null) {
    let cookies = document.cookie.split('; ')
    for (let c = 0; c < cookies.length; ++c) {
        if (cookies[c].startsWith(name + '=')) {
            return cookies[c].substring(name.length + 1)
        }
    }
    return defaultValue
}

/**
 * Returns an array of the given length filled with values starting at start
 * and incremented by delta
 * @param {*} length the length of the returned array
 * @param {*} start the value at index 0, defaults to 0
 * @param {*} delta the incremenet between successive values, defaults to 1
 * @returns an array of the given length filled with successive values starting at start
 */
function iota(length, start = 0, delta = 1) {
    const result = []
    for (let index = 0; index < length; ++index, start += delta) {
        result[index] = start
    }
    return result
}


/**
 * Return the selected value of the input(s) with the given name or default value
 * @param {*} name name of the input(s)
 * @param {*} value default value if none selected (defaults to null)
 * @returns the selected value of the input(s) with the given name or default value
 */
function getRadioValue(name, value = null) {
    const e = document.querySelector('input[name="' + name + '"]:checked')
    return e == null ? value : e.value
}

/**
 * Return whether the input with the given id is checked or not
 * @param {*} id id of the input(s)
 * @returns true if the input with the given id is checked, false otherwise
 */
function isChecked(id) {
    const e = document.getElementById(id)
    return e == null ? false : e.checked
}

/**
 * Just a console.log that can be disabled everywhere
 * @param {*} what 
 */
function debug(what) {
    console.log(what)
}
