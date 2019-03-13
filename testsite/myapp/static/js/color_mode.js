//Filename: color_mode.js
//Author: Brandon Smith

//File Description:
//This js file runs on index.html and is responsible for dealing with
//all of the different buttons and elements there in relation to color

//References:
//http://jscolor.com/

//Contents:
//## Color elements definitions
//## Html buttons
//## colorFormSubmit()
//## colorSchemeNameUpdate()
//## Color buttons
//## updateJscolor()

//Color element definitions
var color_scheme_name = document.getElementById("id_color_scheme_name");
var color_bg = document.getElementById("color-bg");
var color_text = document.getElementById("color-text");
var color_text_invert = document.getElementById("color-text-invert");
var color_text_highlight = document.getElementById("color-text-highlight");
var color_base = document.getElementById("color-base");
var color_accent = document.getElementById("color-accent");
var color_tertiary = document.getElementById("color-tertiary");
var color_border = document.getElementById("color-border");
var color_border_accent = document.getElementById("color-border-accent");
var color_drop_shadow = document.getElementById("color-drop-shadow");

//Form specific elements
var palette_form = document.getElementById("palette-form");
var palette_form_submit = document.getElementById("palette-form-submit");
var palette_form_button = document.getElementsByClassName("palette-form-button");
var palette_form_randomize = document.getElementById("palette-button-randomize");

//Html buttons
//When user submits the palette form
palette_form.onsubmit = function() {
    return colorFormSubmit();
};
//Set onchange for every palette_form_button
[].forEach.call(palette_form_button, function(element) {
  element.onchange = function() {
    updateStorage(element.id,'save');
  };
});
//Set click for randomize color pallete button
palette_form_randomize.onclick = function() {
    colorRandomizer();
};

//colorFormSubmit()
//Give user a prompt to save the color scheme to their profile
//The form submits the color scheme to the Django database
function colorFormSubmit() {
  //Check to see if form is saving or overwriting
  if(palette_form_submit.value == "Overwrite Color Scheme") {
    msg = "Overwrite color scheme: " + color_scheme_name.value + "?"
  } else {
    msg = "Save: " + color_scheme_name.value + " to user color schemes?"
  }

  if (!confirm(msg)) {
    return false;
  } else {
    //Get color scheme from vue object
    fetch_color_scheme.getColorScheme();
    return true;
  }
}

//colorSchemeNameUpdate()
//The vue object fetch_color_scheme has a list of color schemes that
//the user has access to. We need to alter the save button of the
//color scheme form submission to read as 'edit color scheme' when
//the user enters a name that is in the fetch_color_scheme list
function colorSchemeNameUpdate() {
  if (palette_form_submit != null) {
    var array = fetch_color_scheme.color_scheme.filter(obj => obj.color_scheme_name === color_scheme_name.value)
    if (array === undefined || array.length == 0) {
      palette_form_submit.value = "Save Color Scheme";
    }
    else {
      palette_form_submit.value = "Overwrite Color Scheme";
    }
  }
}
color_scheme_name.oninput = colorSchemeNameUpdate;

//Color buttons
//Set root css variables properly on changing any of the color elements
color_bg.onchange = function() {
  document.documentElement.style.setProperty("--color-bg", "#" + color_bg.value);
};
color_text.onchange = function() {
  document.documentElement.style.setProperty("--color-text", "#" + color_text.value);
};
color_text_invert.onchange = function() {
  document.documentElement.style.setProperty("--color-text-invert", "#" + color_text_invert.value);
};
color_text_highlight.onchange = function() {
  document.documentElement.style.setProperty("--color-text-highlight", "#" + color_text_highlight.value);
};
color_base.onchange = function() {
  document.documentElement.style.setProperty("--color-base", "#" + color_base.value);
};
color_accent.onchange = function() {
  document.documentElement.style.setProperty("--color-accent", "#" + color_accent.value);
};
color_tertiary.onchange = function() {
  document.documentElement.style.setProperty("--color-tertiary", "#" + color_tertiary.value);
};
color_border.onchange = function() {
  document.documentElement.style.setProperty("--color-border", "#" + color_border.value);
};
color_border_accent.onchange = function() {
  document.documentElement.style.setProperty("--color-border-accent", "#" + color_border_accent.value);
};
color_drop_shadow.onchange = function() {
  document.documentElement.style.setProperty("--color-drop-shadow", "#" + color_drop_shadow.value);
};

//updateJscolor()
//Each line in this function locates the specific jscolor element and updates the field
function updateJscolor() {
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
