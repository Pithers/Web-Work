//myapp/static/js/color_mode.js

//Color elements
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

