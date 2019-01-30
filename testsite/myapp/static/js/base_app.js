//myapp/static/js/app.js
$(document).foundation();
var root_style = document.documentElement.style

//Functions to define light and dark modes
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
  root_style.setProperty("--color-drop-shadow", "#000000");
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
  root_style.setProperty("--color-drop-shadow", "#aaaaaa");
}

//Upon logout erases preference loaded variable in session storage
function loggedOut() {
  sessionStorage.setItem("preferences", "unloaded");
}

//Vue app for fetching colorscheme from database
var fetch_color_scheme = new Vue({
  el: '#fetch_color_scheme',
  delimiters: ['[[',']]'],
  data () {
    return {
      color_scheme: [],
      default_scheme: [],
    }
  },

  mounted: function() {
    this.getColorScheme();
  },

  //Messing with this created very strange bug with it looks like JScolor loading on page refresh
  updated: function() {
    //This checks to see if user is logged in
    if(this.default_scheme != null && sessionStorage.getItem("preferences") != "loaded") {
      sessionStorage.setItem("preferences", "loaded");
      this.loadColorScheme(this.default_scheme);
    }

    if(window.location.pathname == "/") {
      colorSchemeNameUpdate();
    }
    else if(window.location.pathname == "/preferences/") {
      colorPreferences(this.color_scheme, this.default_scheme);
    }
  },

  methods: {
    //Method retrieves color scheme models from database
    getColorScheme: function() {
      axios
      //Access our own API to get a json object
        .get('/rest_color_scheme/')
      //Make sure to grab the response data, not the response itself
        .then(response => (this.color_scheme = response.data.color_scheme, this.default_scheme = response.data.default_scheme))
    },

    //Method loads colorscheme into website when clicked. Index locates specific color scheme
    loadColorScheme: function(default_scheme) {
      //We need to access the object here and set all of the parts
      //Objects save without hashtag so add it back in before loading
      //Get index of default scheme in color scheme list
      var index = this.color_scheme.findIndex(x => x.color_scheme_name==default_scheme);

      root_style.setProperty("--color-bg", "#" + this.color_scheme[index].color_bg);
      root_style.setProperty("--color-base", "#" + this.color_scheme[index].color_base);
      root_style.setProperty("--color-accent", "#" + this.color_scheme[index].color_accent);
      root_style.setProperty("--color-tertiary", "#" + this.color_scheme[index].color_tertiary);
      root_style.setProperty("--color-text", "#" + this.color_scheme[index].color_text);
      root_style.setProperty("--color-text-invert", "#" + this.color_scheme[index].color_text_invert);
      root_style.setProperty("--color-text-highlight", "#" + this.color_scheme[index].color_text_highlight);
      root_style.setProperty("--color-border", "#" + this.color_scheme[index].color_border);
      root_style.setProperty("--color-border-accent", "#" + this.color_scheme[index].color_border_accent);
      root_style.setProperty("--color-drop-shadow", "#" + this.color_scheme[index].color_drop_shadow);

      //Then save name of color scheme into session Storage
      sessionStorage.setItem("color-mode", this.color_scheme[index].color_scheme_name);

      //Then save into session storage and update Jscolor boxes
      updateStorage("all", "save");

      //We need to only update js color when we are on the index page
      if(window.location.pathname == "/") {
        updateJscolor();
        document.getElementById("id_color_scheme_name").value = this.color_scheme[index].color_scheme_name;
        colorSchemeNameUpdate();
      }
    }
  }
})


//Function that gets color scheme from vue object
function colorListUpdate() {
  fetch_color_scheme.getColorScheme();
}

//Upon changing colors, save them to browser session storage so colorscheme can be held across pages
//If name == "all" then every element will be saved/loaded
//If method == "save" then the css color property will be saved into session storage
//If method == "load" then the css color property will be loaded from session storage
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
      else
        root_style.setProperty("--color-bg", "#e5e4d3");
      if(all == false)
        break;
    case "Color text":
      if(method == "save")
        sessionStorage.setItem("color_text", root_style.getPropertyValue("--color-text"));
      else if(method == "load" && sessionStorage.getItem("color_text") !== null)
        root_style.setProperty("--color-text", sessionStorage.getItem("color_text"));
      else
        root_style.setProperty("--color-text", "#241a22");
      if(all == false)
        break;
    case "Color border":
      if(method == "save")
        sessionStorage.setItem("color_border", root_style.getPropertyValue("--color-border"));
      else if(method == "load" && sessionStorage.getItem("color_border") !== null)
        root_style.setProperty("--color-border", sessionStorage.getItem("color_border"));
      else
        root_style.setProperty("--color-border", "#838378");
      if(all == false)
        break;
    case "Color base":
      if(method == "save")
        sessionStorage.setItem("color_base", root_style.getPropertyValue("--color-base"));
      else if(method == "load" && sessionStorage.getItem("color_base") !== null)
        root_style.setProperty("--color-base", sessionStorage.getItem("color_base"));
      else
        root_style.setProperty("--color-base", "#817b7b");
      if(all == false)
        break;
    case "Color text invert":
      if(method == "save")
        sessionStorage.setItem("color_text_invert", root_style.getPropertyValue("--color-text-invert"));
      else if(method == "load" && sessionStorage.getItem("color_text_invert") !== null)
        root_style.setProperty("--color-text-invert", sessionStorage.getItem("color_text_invert"));
      else
        root_style.setProperty("--color-text-invert", "#e5e4d3");
      if(all == false)
        break;
    case "Color border accent":
      if(method == "save")
        sessionStorage.setItem("color_border_accent", root_style.getPropertyValue("--color-border-accent"));
      else if(method == "load" && sessionStorage.getItem("color_border_accent") !== null)
        root_style.setProperty("--color-border-accent", sessionStorage.getItem("color_border_accent"));
      else
        root_style.setProperty("--color-border-accent", "#727267");
      if(all == false)
        break;
    case "Color accent":
      if(method == "save")
        sessionStorage.setItem("color_accent", root_style.getPropertyValue("--color-accent"));
      else if(method == "load" && sessionStorage.getItem("color_accent") !== null)
        root_style.setProperty("--color-accent", sessionStorage.getItem("color_accent"));
      else
        root_style.setProperty("--color-accent", "#667075");
      if(all == false)
        break;
    case "Color text highlight":
      if(method == "save")
        sessionStorage.setItem("color_text_highlight", root_style.getPropertyValue("--color-text-highlight"));
      else if(method == "load" && sessionStorage.getItem("color_text_highlight") !== null)
        root_style.setProperty("--color-text-highlight", sessionStorage.getItem("color_text_highlight"));
      else
        root_style.setProperty("--color-text-highlight", "#20436f");
      if(all == false)
        break;
    case "Color drop shadow":
      if(method == "save")
        sessionStorage.setItem("color_drop_shadow", root_style.getPropertyValue("--color-drop-shadow"));
      else if(method == "load" && sessionStorage.getItem("color_drop_shadow") !== null)
        root_style.setProperty("--color-drop-shadow", sessionStorage.getItem("color_drop_shadow"));
      else
        root_style.setProperty("--color-drop-shadow", "#000000");
      if(all == false)
        break;
    case "Color tertiary":
      if(method == "save")
        sessionStorage.setItem("color_tertiary", root_style.getPropertyValue("--color-tertiary"));
      else if(method == "load" && sessionStorage.getItem("color_tertiary") !== null)
        root_style.setProperty("--color-tertiary", sessionStorage.getItem("color_tertiary"));
      else
        root_style.setProperty("--color-tertiary", "#666666");
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
  //If there are hashtags, be sure to strip them off
  document.getElementById("color-bg").value = (root_style.getPropertyValue("--color-bg")).replace('#','');
  document.getElementById("color-base").value = (root_style.getPropertyValue("--color-base")).replace('#','');
  document.getElementById("color-accent").value = (root_style.getPropertyValue("--color-accent")).replace('#','');
  document.getElementById("color-tertiary").value = (root_style.getPropertyValue("--color-tertiary")).replace('#','');
  document.getElementById("color-text").value = (root_style.getPropertyValue("--color-text")).replace('#','');
  document.getElementById("color-text-invert").value = (root_style.getPropertyValue("--color-text-invert")).replace('#','');
  document.getElementById("color-text-highlight").value = (root_style.getPropertyValue("--color-text-highlight")).replace('#','');
  document.getElementById("color-border").value = (root_style.getPropertyValue("--color-border")).replace('#','');
  document.getElementById("color-border-accent").value = (root_style.getPropertyValue("--color-border-accent")).replace('#','');
  document.getElementById("color-drop-shadow").value = (root_style.getPropertyValue("--color-drop-shadow")).replace('#','');
}

//Set onload functions for each page
$(window).ready(function() {
  loadSession();
  if(window.location.pathname == "/") {
    updateJscolor();
    colorSchemeNameUpdate();
  }
  else if(window.location.href.indexOf("/webgl/") !== -1) {
    main();
  }
});

//Grab session data and set color-mode and checkbox accordingly
//Can consider adding another field to sessionStorage which are additonal color modes
//If preferences haven't been loaded once, it will load them
function loadSession() {
  var color_mode = sessionStorage.getItem("color-mode");

  //If first time visiting website, set color mode to default
  if(color_mode === null){
    sessionStorage.setItem("color-mode", "default-light-mode");
    color_mode = "default-light-mode";
  }
  updateStorage("all", "load"); //Load from session storage

  if(color_mode == "default-dark-mode")
    document.getElementById("light-switch").checked = true;
  else if (color_mode == "default-light-mode")
    document.getElementById("light-switch").checked = false;

  if(window.location.pathname == "/") {
    document.getElementById("id_color_scheme_name").value = color_mode;
    colorSchemeNameUpdate();
  }
}

//Site theme darkmode toggle, set root css variables accordingly
function themeUpdate(element) {
  if(element.checked) {
    dark_mode();
    sessionStorage.setItem("color-mode", "default-dark-mode");
    if(window.location.pathname == "/")
      document.getElementById("id_color_scheme_name").value = "default-dark-mode";
  } else {
    light_mode();
    sessionStorage.setItem("color-mode", "default-light-mode");
    if(window.location.pathname == "/")
      document.getElementById("id_color_scheme_name").value = "default-light-mode";
  }
  updateStorage("all", "save");
  if(window.location.pathname == "/") {
    updateJscolor();
    colorSchemeNameUpdate();
  }
}
