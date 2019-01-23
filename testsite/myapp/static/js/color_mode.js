//myapp/static/js/color_mode.js

//Color elements
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
var palette_form_submit = document.getElementById("palette-form-submit");

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
