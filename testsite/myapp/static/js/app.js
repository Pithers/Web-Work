$(document).foundation()

//Site theme darkmode toggle
function themeUpdate(element) {
    if(element.checked) {
        document.querySelector('body').className = "night-mode";
    } else {
        document.querySelector('body').className = "day-mode";
    }
}
