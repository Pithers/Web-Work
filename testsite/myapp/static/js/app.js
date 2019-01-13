$(document).foundation();

function light_mode() {
    document.documentElement.style.setProperty("--color-bg", "#e5e4d3");
    document.documentElement.style.setProperty("--color-text", "#241a22");
    document.documentElement.style.setProperty("--color-text-ui", "#241a22");
    document.documentElement.style.setProperty("--color-text-invert", "#e5e4d3");
    document.documentElement.style.setProperty("--color-text-highlight", "#e5e4d3");
    document.documentElement.style.setProperty("--color-base", "#817b7b");
    document.documentElement.style.setProperty("--color-accent", "#667075");
    document.documentElement.style.setProperty("--color-tertiary", "#666666");
    document.documentElement.style.setProperty("--color-border", "#838378");
    document.documentElement.style.setProperty("--color-border-accent", "#727267");
    document.documentElement.style.setProperty("--color-border-transp", "#e5e4d399");
    document.documentElement.style.setProperty("--color-drop-shadow", "#00000033");
}

function dark_mode() {
    document.documentElement.style.setProperty("--color-bg", "#24252f");
    document.documentElement.style.setProperty("--color-text", "#eaeced");
    document.documentElement.style.setProperty("--color-text-ui", "#eaeced");
    document.documentElement.style.setProperty("--color-text-invert", "#24252f");
    document.documentElement.style.setProperty("--color-text-highlight", "#24252f");
    document.documentElement.style.setProperty("--color-base", "#7f838e");
    document.documentElement.style.setProperty("--color-accent", "#7dacc4");
    document.documentElement.style.setProperty("--color-tertiary", "#666666");
    document.documentElement.style.setProperty("--color-border", "#826c73");
    document.documentElement.style.setProperty("--color-border-accent", "#715d62");
    document.documentElement.style.setProperty("--color-border-transp", "#24252f99");
    document.documentElement.style.setProperty("--color-drop-shadow", "#ffffff33");
}

//Grab session data and set color-mode and checkbox accordingly
function loadSession() {
    var color_mode = sessionStorage.getItem('color-mode');
    if(color_mode == 'dark-mode'){
        dark_mode();
        document.getElementById('light-switch').checked = true;
    } else if (color_mode == 'light-mode') {
        light_mode();
        document.getElementById('light-switch').checked = false;
    }
}

//Site theme darkmode toggle, set root css variables accordingly
function themeUpdate(element) {
    if(element.checked) {
        dark_mode();
        sessionStorage.setItem('color-mode', 'dark-mode');
    } else {
        light_mode();
        sessionStorage.setItem('color-mode', 'light-mode');
    }
}
