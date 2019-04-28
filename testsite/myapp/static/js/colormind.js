//Filename: colormind.js
//Author: Brandon Smith

//File Description:
//This file uses the colormind api which is currently only available via http :/.
//It also specifies some code to completely randomize the colorscheme

//References:
//http://colormind.io/api-access/
//https://foundation.zurb.com/building-blocks/blocks/ecommerce-loading-button.html

//Contents:
//## Colormind info
//## colorRandomizer()
//## rgbToHex()
//## get() (specifically used to get data from colormind)
//## getColormindPalette()
//## Colormind loading button

//Colormind info
const colormind_url = "http://colormind.io/api/";
const colormind_data = {
  model : "ui",
  input : ["N","N","N","N","N"]
}

//randomHexColor()
//random HexColor generates a random color hex value string
//Ex: #343424
//Provide the function with a seed large enough to chop the last 6 characters off of
//Eight digit numbers seem to be statistically high enough.
function randomHexColor(seed) {
  const random_num = Math.floor(Math.random() * seed);
  return '#' + ('000000' + random_num.toString(16)).slice(-6);
}

//colorRandomizer()
//This takes every css color variable and changes them to a random hex color
//It then updates session storage, and updates the site colors
function colorRandomizer() {
  root_style.setProperty("--color-bg", randomHexColor(16777215));
  root_style.setProperty("--color-base", randomHexColor(30243194));
  root_style.setProperty("--color-accent", randomHexColor(32047111));
  root_style.setProperty("--color-tertiary", randomHexColor(39924913));
  root_style.setProperty("--color-text", randomHexColor(34194342));
  root_style.setProperty("--color-text-invert", randomHexColor(19932439));
  root_style.setProperty("--color-text-highlight", randomHexColor(73894012));
  root_style.setProperty("--color-border", randomHexColor(43104931));
  root_style.setProperty("--color-border-accent", randomHexColor(39402934));
  root_style.setProperty("--color-drop-shadow", randomHexColor(15839428));

  //Change site storage to new color scheme
  updateStorage("all", "save");

  //Update js color boxes
  updateJscolor();

  document.getElementById("id_color_scheme_name").value = "";
  colorSchemeNameUpdate();
  sessionStorage.setItem("color-mode", "");
}

//rgbToHex()
//Function takes rgb values and converts them to a hex string
//r = red
//g = green
//b = blue
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

//get()
//Generic api get function
//We specifically leverage this to get data from colormind
function get(url, data, callback) {
  const http = new XMLHttpRequest();
  http.open("POST", url, true);

  http.onreadystatechange = function() {
    if (http.readyState == 4 && http.status == 200) {
      callback.apply(http);
    }
  };
  http.send(JSON.stringify(data));
}

//getColormindPalette()
//Request information from colormind and load into page
function getColormindPalette() {
  //Send get request
  get(colormind_url, colormind_data,
    function() {
      colormind_palette = JSON.parse(this.responseText).result;

      //Take results and set css color properties
      root_style.setProperty("--color-bg",
        rgbToHex(colormind_palette[0][0], colormind_palette[0][1], colormind_palette[0][2]));
      root_style.setProperty("--color-base",
        rgbToHex(colormind_palette[1][0], colormind_palette[1][1], colormind_palette[1][2]));
      root_style.setProperty("--color-accent",
        rgbToHex(colormind_palette[2][0], colormind_palette[2][1], colormind_palette[2][2]));
      root_style.setProperty("--color-tertiary",
        rgbToHex(colormind_palette[4][0], colormind_palette[4][1], colormind_palette[4][2]));
      root_style.setProperty("--color-text", "#241a22");
      root_style.setProperty("--color-text-invert", "#e5e4d3");
      root_style.setProperty("--color-text-highlight", randomHexColor(14039429));
      root_style.setProperty("--color-border",
        rgbToHex(colormind_palette[3][0], colormind_palette[3][1], colormind_palette[3][2]));
      root_style.setProperty("--color-border-accent", randomHexColor(23432433));
      root_style.setProperty("--color-drop-shadow", "#1f1f1f");

      //Update site with needed colors
      updateStorage("all", "save");
      updateJscolor();
      document.getElementById("id_color_scheme_name").value = "";
      colorSchemeNameUpdate();
      sessionStorage.setItem("color-mode", "");

      //End colormind loading button when done
      $('[data-colormind-start]').removeClass('hide');
      $('[data-colormind-end]').addClass('hide');
    });
}

//Colormind loading button
//This will show that it's loading from colorminds's API while user waits
$('[data-colormind-start]').click(function() {
  $('[data-colormind-start]').addClass('hide');
  $('[data-colormind-end]').removeClass('hide');
  getColormindPalette();
});
