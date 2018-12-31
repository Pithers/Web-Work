$(document).foundation()

//Site theme darkmode toggle
const root = document.documentElement

function themeUpdate(element) {
    if(element.checked) {
        root.style.setProperty('--bg', 'black')
        root.style.setProperty('--bg-text', 'white');
    } else {
        root.style.setProperty('--bg', 'white')
        root.style.setProperty('--bg-text', 'black')
    }
}
