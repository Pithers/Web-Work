//Filename: base_app.js
//Author: Brandon Smith

//File Description:
//This js file runs on every page of the website. It is responsible for everything
//that stays the same, page to page, such as the header, footer, and menus
//It also includes functionality that any pages would share

//Contents:
//## Launch foundation, define root style
//## Light and Dark modes
//## Vue app for colorschemes
//## updateStorage()
//## loadSession()
//## themeUpdate(element)
//## trianglifyBars()
//## Onload functions

//Launch foundation and define root style
$(document).foundation();
const root_style = document.documentElement.style

//Light and Dark modes
//These load default styles into the site's css color variables
function light_mode() {
  root_style.setProperty("--color-bg", "#e5e4d3");
  root_style.setProperty("--color-base", "#817b7b");
  root_style.setProperty("--color-accent", "#667075");
  root_style.setProperty("--color-tertiary", "#666666");
  root_style.setProperty("--color-text", "#241a22");
  root_style.setProperty("--color-text-invert", "#e5e4d3");
  root_style.setProperty("--color-text-highlight", "#206fd0");
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
  root_style.setProperty("--color-drop-shadow", "#000000");
}

//Vue app for fetching colorschemes from database
const fetch_color_scheme = new Vue({
  el: '#fetch_color_scheme',
  delimiters: ['[[',']]'],
  data () {
    return {
      color_scheme: [],
      default_scheme: [],
    }
  },

  //Grabs colorscheme when first loaded
  mounted: function() {
    this.getColorScheme();
  },

  //Upon data change, causes virtual DOM to be re-rendered
  updated: function() {
    //This checks to see if user is logged in
    if (this.default_scheme != null && sessionStorage.getItem("preferences") != "loaded") {
      sessionStorage.setItem("preferences", "loaded");
      this.loadColorScheme(this.default_scheme);
    }

    if (window.location.pathname == "/") {
      colorSchemeNameUpdate();
    } else if (window.location.pathname == "/preferences/") {
      colorPreferences(this.color_scheme, this.default_scheme);
    }
  },

  methods: {
    //Method retrieves color scheme models from database via axios
    getColorScheme: function() {
      axios
        //Access our own API to get a json object
        .get('/rest_color_scheme/')
        //Make sure to grab the response data, not the response itself
        .then(response => (
          this.color_scheme = response.data.color_scheme,
          this.default_scheme = response.data.default_scheme
        ))
    },

    //Method loads colorscheme into website when clicked. Index locates specific color scheme
    loadColorScheme: function(default_scheme) {
      //Get index of default scheme in color scheme list
      const index = this.color_scheme.findIndex(
        x => x.color_scheme_name == default_scheme
      );
      const scheme = this.color_scheme[index];

      //Objects save without hashtag so add it back in before loading
      root_style.setProperty("--color-bg", "#" + scheme.color_bg);
      root_style.setProperty("--color-base", "#" + scheme.color_base);
      root_style.setProperty("--color-accent", "#" + scheme.color_accent);
      root_style.setProperty("--color-tertiary", "#" + scheme.color_tertiary);
      root_style.setProperty("--color-text", "#" + scheme.color_text);
      root_style.setProperty("--color-text-invert", "#" + scheme.color_text_invert);
      root_style.setProperty("--color-text-highlight", "#" + scheme.color_text_highlight);
      root_style.setProperty("--color-border", "#" + scheme.color_border);
      root_style.setProperty("--color-border-accent", "#" + scheme.color_border_accent);
      root_style.setProperty("--color-drop-shadow", "#" + scheme.color_drop_shadow);

      //Save name of color scheme into session Storage
      sessionStorage.setItem("color-mode", this.color_scheme[index].color_scheme_name);

      //Then save into session storage and update Jscolor boxes
      updateStorage("all", "save");

      //We need to only update js color when we are on the index page
      if (window.location.pathname == "/") {
        updateJscolor();
        document.getElementById("id_color_scheme_name").value =
          this.color_scheme[index].color_scheme_name;
        colorSchemeNameUpdate();
      }
    }
  }
})

//updateStorage()
//Upon changing colors, save them to browser session storage
//This allows color schemes to persist across pages
//If name == "all" then every element will be saved/loaded
//If method == "save" then the css color property will be saved into session storage
//If method == "load" then the css color property will be loaded from session storage
function updateStorage(name, method) {
  let all = false;

  if(name == "all") {
    name = "Color bg"; //Trigger all of the switch statements starting from the top
    all = true;
  }

  switch(name) {
    case "Color bg":
      if(method == "save") {
        sessionStorage.setItem("color_bg", root_style.getPropertyValue("--color-bg"));
      } else if (method == "load" && sessionStorage.getItem("color_bg") !== null) {
        root_style.setProperty("--color-bg", sessionStorage.getItem("color_bg"));
      } else {
        root_style.setProperty("--color-bg", "#24252f");
      }
      if(all == false)
        break;
    case "Color text":
      if(method == "save") {
        sessionStorage.setItem("color_text", root_style.getPropertyValue("--color-text"));
      } else if (method == "load" && sessionStorage.getItem("color_text") !== null) {
        root_style.setProperty("--color-text", sessionStorage.getItem("color_text"));
      } else {
        root_style.setProperty("--color-text", "#eaeced");
      }
      if(all == false)
        break;
    case "Color border":
      if(method == "save") {
        sessionStorage.setItem("color_border", root_style.getPropertyValue("--color-border"));
      } else if (method == "load" && sessionStorage.getItem("color_border") !== null) {
        root_style.setProperty("--color-border", sessionStorage.getItem("color_border"));
      } else {
        root_style.setProperty("--color-border", "#826c73");
      }
      if(all == false)
        break;
    case "Color base":
      if(method == "save") {
        sessionStorage.setItem("color_base", root_style.getPropertyValue("--color-base"));
      } else if (method == "load" && sessionStorage.getItem("color_base") !== null) {
        root_style.setProperty("--color-base", sessionStorage.getItem("color_base"));
      } else {
        root_style.setProperty("--color-base", "#7f838e");
      }
      if(all == false)
        break;
    case "Color text invert":
      if(method == "save") {
        sessionStorage.setItem("color_text_invert", root_style.getPropertyValue("--color-text-invert"));
      } else if (method == "load" && sessionStorage.getItem("color_text_invert") !== null) {
        root_style.setProperty("--color-text-invert", sessionStorage.getItem("color_text_invert"));
      } else {
        root_style.setProperty("--color-text-invert", "#24252f");
      }
      if(all == false)
        break;
    case "Color border accent":
      if(method == "save") {
        sessionStorage.setItem("color_border_accent", root_style.getPropertyValue("--color-border-accent"));
      } else if (method == "load" && sessionStorage.getItem("color_border_accent") !== null) {
        root_style.setProperty("--color-border-accent", sessionStorage.getItem("color_border_accent"));
      } else {
        root_style.setProperty("--color-border-accent", "#715d62");
      }
      if(all == false)
        break;
    case "Color accent":
      if(method == "save") {
        sessionStorage.setItem("color_accent", root_style.getPropertyValue("--color-accent"));
      } else if(method == "load" && sessionStorage.getItem("color_accent") !== null){
        root_style.setProperty("--color-accent", sessionStorage.getItem("color_accent"));
      } else {
        root_style.setProperty("--color-accent", "#7dacc4");
      }
      if(all == false)
        break;
    case "Color text highlight":
      if(method == "save") {
        sessionStorage.setItem("color_text_highlight", root_style.getPropertyValue("--color-text-highlight"));
      } else if (method == "load" && sessionStorage.getItem("color_text_highlight") !== null) {
        root_style.setProperty("--color-text-highlight", sessionStorage.getItem("color_text_highlight"));
      } else {
        root_style.setProperty("--color-text-highlight", "#1f6f90");
      }
      if(all == false)
        break;
    case "Color drop shadow":
      if(method == "save") {
        sessionStorage.setItem("color_drop_shadow", root_style.getPropertyValue("--color-drop-shadow"));
      } else if (method == "load" && sessionStorage.getItem("color_drop_shadow") !== null) {
        root_style.setProperty("--color-drop-shadow", sessionStorage.getItem("color_drop_shadow"));
      } else {
        root_style.setProperty("--color-drop-shadow", "#000000");
      }
      if(all == false)
        break;
    case "Color tertiary":
      if(method == "save") {
        sessionStorage.setItem("color_tertiary", root_style.getPropertyValue("--color-tertiary"));
      } else if(method == "load" && sessionStorage.getItem("color_tertiary") !== null) {
        root_style.setProperty("--color-tertiary", sessionStorage.getItem("color_tertiary"));
      } else {
        root_style.setProperty("--color-tertiary", "#666666");
      }
      break;
  }

  //If we're saving into sessionStorage, send a storage update event
  if (method == "save") {
    window.dispatchEvent(new Event('storage'));
  }

  //Trianglify header and footer when color base or color bg changes
  if (name == "all" || name == "Color base" || name == "Color bg") {
    trianglifyBars();
  }
}

//loadSession()
//Grab session data from browser and set color-mode and checkbox accordingly
//If preferences haven't been loaded once, it will load them
function loadSession() {
  let color_mode = sessionStorage.getItem("color-mode");

  //If first time visiting website, set color mode to default
  if (color_mode === null){
    sessionStorage.setItem("color-mode", "default-dark-mode");
    color_mode = "default-dark-mode";
  }
  updateStorage("all", "load"); //Load from session storage

  if (color_mode == "default-dark-mode") {
    document.getElementById("light-switch").checked = false;
  } else if (color_mode == "default-light-mode") {
    document.getElementById("light-switch").checked = true;
  }

  if (window.location.pathname == "/") {
    document.getElementById("id_color_scheme_name").value = color_mode;
    colorSchemeNameUpdate();
  }
}

//themeUpdate(element)
//Day/Night toggle button
document.getElementById("light-switch").onclick = function() {
  themeUpdate(document.getElementById("light-switch"));
};
//Site theme toggle, set root css variables accordingly and save into sessionStorage
function themeUpdate(element) {
  if (element.checked) {
    light_mode();
    sessionStorage.setItem("color-mode", "default-light-mode");
    if (window.location.pathname == "/") {
      document.getElementById("id_color_scheme_name").value = "default-light-mode";
    }
  } else {
    dark_mode();
    sessionStorage.setItem("color-mode", "default-dark-mode");
    if (window.location.pathname == "/") {
      document.getElementById("id_color_scheme_name").value = "default-dark-mode";
    }
  }

  updateStorage("all", "save");

  if (window.location.pathname == "/") {
    updateJscolor();
    colorSchemeNameUpdate();
  }
}

//trianglifyBars()
//This function when called updates the header and footer with Trianglify
function trianglifyBars() {
  //Get locations of header and footer
  const navbar = document.getElementById("nav-bar");
  const footer = document.getElementById("footer");

  //Create Trianglify svg
  const pattern = Trianglify({
    height: 200,
    width: 1940,
    variance: 0.75,
    x_colors: ['' + root_style.getPropertyValue("--color-base"),
               '' + root_style.getPropertyValue("--color-bg")],
    cell_size: 120,
    stroke_width: 1.51
  });

  // Serialize the SVG object to a String, get the base64 encoding and set property
  const pattern_string = new XMLSerializer().serializeToString(pattern.svg());
  const pattern_64 = window.btoa(pattern_string);

  if(navbar != null) {
    navbar.style.backgroundImage = 'url("data:image/svg+xml;base64,' + pattern_64 + '")';
  }

  if(footer != null) {
    footer.style.backgroundImage = 'url("data:image/svg+xml;base64,' + pattern_64 + '")';
  }
}

//Onload functions for each page
$(window).ready(function() {

  //Upon logout, erases preference loaded variable in session storage
  if (document.getElementById("logout-msg")) {
    sessionStorage.setItem("preferences", "unloaded");
  }

  //Set colorschemes correctly
  loadSession();
  if (window.location.pathname == "/") {
    updateJscolor();
    colorSchemeNameUpdate();
  } else if (window.location.href.indexOf("/webgl/") !== -1) {
    //If we're on a webgl page, launch main of the corresponding javascript
    main();
  }
});
