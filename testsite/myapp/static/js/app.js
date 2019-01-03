$(document).foundation()

//Grab session data and act accordingly
function loadSession() {
    var color_mode = sessionStorage.getItem('color-mode');
    if(color_mode !== null) {
        document.querySelector('body').className = color_mode;

        if(color_mode == 'dark-mode'){
          document.getElementById('light-switch').checked = true;
        } else if (color_mode == 'light-mode') {
          document.getElementById('light-switch').checked = false;
        }
    }
}

//Site theme darkmode toggle
function themeUpdate(element) {
    if(element.checked) {
        document.querySelector('body').className = 'dark-mode';
        sessionStorage.setItem('color-mode', 'dark-mode')
    } else {
        document.querySelector('body').className = 'light-mode';
        sessionStorage.setItem('color-mode', 'light-mode')
    }
}
