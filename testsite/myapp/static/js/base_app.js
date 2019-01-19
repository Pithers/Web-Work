//myapp/static/js/app.js
$(document).foundation();
var root_style = document.documentElement.style

function light_mode() {
  root_style.setProperty("--color-bg", "#e5e4d3");
  root_style.setProperty("--color-base", "#817b7b");
  root_style.setProperty("--color-accent", "#667075");
  root_style.setProperty("--color-tertiary", "#666666");
  root_style.setProperty("--color-text", "#241a22");
  root_style.setProperty("--color-text-invert", "#e5e4d3");
  root_style.setProperty("--color-text-highlight", "#20436f");
  root_style.setProperty("--color-border", "#838378");
  root_style.setProperty("--color-border-accent", "#727267");
  root_style.setProperty("--color-drop-shadow", "#00000033");
}

function dark_mode() {
  root_style.setProperty("--color-bg", "#24252f");
  root_style.setProperty("--color-base", "#7f838e");
  root_style.setProperty("--color-accent", "#7dacc4");
  root_style.setProperty("--color-tertiary", "#666666");
  root_style.setProperty("--color-text", "#eaeced");
  root_style.setProperty("--color-text-invert", "#24252f");
  root_style.setProperty("--color-text-highlight", "#1f6f90");
  root_style.setProperty("--color-border", "#826c73");
  root_style.setProperty("--color-border-accent", "#715d62");
  root_style.setProperty("--color-drop-shadow", "#ffffff33");
}

//Vue app for fetching colorscheme from database
var fetch_color_scheme = new Vue({
  delimiters: ['[[',']]'],
  el: '#fetch_color_scheme',
  data () {
    return {
      color_scheme: [],
    }
  },

  mounted: function() {
    this.getColorScheme();
  },

  methods: {
    getColorScheme: function() {
      axios
        //Access our own API to get a json object
        .get('/rest_color_scheme/')
        //Make sure to grab the response data, not the response itself
        .then(response => (this.color_scheme = response.data.color_scheme))
    }
  }
})

function colorListUpdate() {
  fetch_color_scheme.getColorScheme();
}

//Upon changing colors, save them to browser session storage so colorscheme can be held across pages
//If method == "save" then the css color property will be saved into session storage
//If method == "load" then the css color property will be loaded from session storage
//If name == "all" then every element will be saved/loaded
function updateStorage(name, method) {
  var all = false;
  if(name == "all") {
    name = "Color bg"; //Trigger all of the switch statements starting from the top
    all = true;
  }

  switch(name) {
    case "Color bg":
      if(method == "save")
        sessionStorage.setItem("color_bg", root_style.getPropertyValue("--color-bg"));
      else if(method == "load" && sessionStorage.getItem("color_bg") !== null)
        root_style.setProperty("--color-bg", sessionStorage.getItem("color_bg"));
      if(all == false)
        break;
    case "Color text":
      if(method == "save")
        sessionStorage.setItem("color_text", root_style.getPropertyValue("--color-text"));
      else if(method == "load" && sessionStorage.getItem("color_text") !== null)
        root_style.setProperty("--color-text", sessionStorage.getItem("color_text"));
      if(all == false)
        break;
    case "Color border":
      if(method == "save")
        sessionStorage.setItem("color_border", root_style.getPropertyValue("--color-border"));
      else if(method == "load" && sessionStorage.getItem("color_border") !== null)
        root_style.setProperty("--color-border", sessionStorage.getItem("color_border"));
      if(all == false)
        break;
    case "Color base":
      if(method == "save")
        sessionStorage.setItem("color_base", root_style.getPropertyValue("--color-base"));
      else if(method == "load" && sessionStorage.getItem("color_base") !== null)
        root_style.setProperty("--color-base", sessionStorage.getItem("color_base"));
      if(all == false)
        break;
    case "Color text invert":
      if(method == "save")
        sessionStorage.setItem("color_text_invert", root_style.getPropertyValue("--color-text-invert"));
      else if(method == "load" && sessionStorage.getItem("color_text_invert") !== null)
        root_style.setProperty("--color-text-invert", sessionStorage.getItem("color_text_invert"));
      if(all == false)
        break;
    case "Color border accent":
      if(method == "save")
        sessionStorage.setItem("color_border_accent", root_style.getPropertyValue("--color-border-accent"));
      else if(method == "load" && sessionStorage.getItem("color_border_accent") !== null)
        root_style.setProperty("--color-border-accent", sessionStorage.getItem("color_border_accent"));
      if(all == false)
        break;
    case "Color accent":
      if(method == "save")
        sessionStorage.setItem("color_accent", root_style.getPropertyValue("--color-accent"));
      else if(method == "load" && sessionStorage.getItem("color_accent") !== null)
        root_style.setProperty("--color-accent", sessionStorage.getItem("color_accent"));
      if(all == false)
        break;
    case "Color text highlight":
      if(method == "save")
        sessionStorage.setItem("color_text_highlight", root_style.getPropertyValue("--color-text-highlight"));
      else if(method == "load" && sessionStorage.getItem("color_text_highlight") !== null)
        root_style.setProperty("--color-text-highlight", sessionStorage.getItem("color_text_highlight"));
      if(all == false)
        break;
    case "Color drop shadow":
      if(method == "save")
        sessionStorage.setItem("color_drop_shadow", root_style.getPropertyValue("--color-drop-shadow"));
      else if(method == "load" && sessionStorage.getItem("color_drop_shadow") !== null)
        root_style.setProperty("--color-drop-shadow", sessionStorage.getItem("color_drop_shadow"));
      if(all == false)
        break;
    case "Color tertiary":
      if(method == "save")
        sessionStorage.setItem("color_tertiary", root_style.getPropertyValue("--color-tertiary"));
      else if(method == "load" && sessionStorage.getItem("color_tertiary") !== null)
        root_style.setProperty("--color-tertiary", sessionStorage.getItem("color_tertiary"));
      break;
  }
}

//Each line in this function locates the specific jscolor element and updates the field
//Sadly the code lines in this function are really long. There isn't really a good way
//to split them up besides do something less efficient.
function updateJscolor() {
  //Update jscolor boxes
  document.getElementsByClassName("jscolor {valueElement: color_bg}")[0].style =
    "background-color:" + root_style.getPropertyValue("--color-bg") + ";";
  document.getElementsByClassName("jscolor {valueElement: color_base}")[0].style =
    "background-color:" + root_style.getPropertyValue("--color-base") + ";";
  document.getElementsByClassName("jscolor {valueElement: color_accent}")[0].style =
    "background-color:" + root_style.getPropertyValue("--color-accent") + ";";
  document.getElementsByClassName("jscolor {valueElement: color_tertiary}")[0].style =
    "background-color:" + root_style.getPropertyValue("--color-tertiary") + ";";
  document.getElementsByClassName("jscolor {valueElement: color_text}")[0].style =
    "background-color:" + root_style.getPropertyValue("--color-text") + ";";
  document.getElementsByClassName("jscolor {valueElement: color_text_invert}")[0].style =
    "background-color:" + root_style.getPropertyValue("--color-text-invert") + ";";
  document.getElementsByClassName("jscolor {valueElement: color_text_highlight}")[0].style =
    "background-color:" + root_style.getPropertyValue("--color-text-highlight") + ";";
  document.getElementsByClassName("jscolor {valueElement: color_border}")[0].style =
    "background-color:" + root_style.getPropertyValue("--color-border") + ";";
  document.getElementsByClassName("jscolor {valueElement: color_border_accent}")[0].style =
    "background-color:" + root_style.getPropertyValue("--color-border-accent") + ";";
  document.getElementsByClassName("jscolor {valueElement: color_drop_shadow}")[0].style =
    "background-color:" + root_style.getPropertyValue("--color-drop-shadow") + ";";

  //Update jscolor text fields
  document.getElementById("color-bg").value = root_style.getPropertyValue("--color-bg");
  document.getElementById("color-base").value = root_style.getPropertyValue("--color-base");
  document.getElementById("color-accent").value = root_style.getPropertyValue("--color-accent");
  document.getElementById("color-tertiary").value = root_style.getPropertyValue("--color-tertiary");
  document.getElementById("color-text").value = root_style.getPropertyValue("--color-text");
  document.getElementById("color-text-invert").value = root_style.getPropertyValue("--color-text-invert");
  document.getElementById("color-text-highlight").value = root_style.getPropertyValue("--color-text-highlight");
  document.getElementById("color-border").value = root_style.getPropertyValue("--color-border");
  document.getElementById("color-border-accent").value = root_style.getPropertyValue("--color-border-accent");
  document.getElementById("color-drop-shadow").value = root_style.getPropertyValue("--color-drop-shadow");
}

//Grab session data and set color-mode and checkbox accordingly
//Can consider adding another field to sessionStorage which are additonal color modes
function loadSession() {
  updateStorage("all", "load");

  var color_mode = sessionStorage.getItem("color-mode");
  if(color_mode == "dark-mode")
    document.getElementById("light-switch").checked = true;
  else if (color_mode == "light-mode")
    document.getElementById("light-switch").checked = false;
}

//Site theme darkmode toggle, set root css variables accordingly
function themeUpdate(element) {
  if(element.checked) {
    dark_mode();
    sessionStorage.setItem("color-mode", "dark-mode");
  } else {
    light_mode();
    sessionStorage.setItem("color-mode", "light-mode");
  }
  updateStorage("all", "save");
  updateJscolor();
}
