//Filename: color_generate.js
//Author: Brandon Smith

//File Description:
//This file handles generation of colors
//It also specifies some code to completely randomize the colorscheme

//Note:
//Colormind functionality currently doesnt' work due to the site not using https

//References:
//http://colormind.io/api-access/
//https://foundation.zurb.com/building-blocks/blocks/ecommerce-loading-button.html

//Contents:
//## Colormind info
//## Color Functions
//##   randomHexColor()
//##   rand()
//##   rgbToHex()
//##   hslToHex()
//## colorRandomizer()
//## semiRandomizer()
//## get() (specifically used to get data from colormind)
//## getColormindPalette()
//## Colormind loading button

//Colormind info
const colormind_url = "http://colormind.io/api/";
const colormind_data = {
  model : "ui",
  input : ["N","N","N","N","N"]
}

//Color Functions
//randomHexColor()
//random HexColor generates a random color hex value string
//Ex: #343424
//Provide the function with a seed large enough to chop the last 6 characters off of
//Eight digit numbers seem to be statistically high enough.
function randomHexColor(seed) {
  const random_num = Math.floor(Math.random() * seed);
  return '#' + ('000000' + random_num.toString(16)).slice(-6);
}

//Gives a random number between min and max
function rand(min, max) {
  return parseInt(Math.random() * (max-min+1), 10) + min;
}

//rgbToHex()
//Function takes rgb values and converts them to a hex string
//r = red
//g = green
//b = blue
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

//hslToHex()
//converts hsl to hex value
function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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

//semiRandomizer()
//This takes every css color variable and changes them to a calculated hex color
//It then updates session storage, and updates the site colors
function semiRandomizer() {
  //Figure out color scheme based on some hue principles
  //Generate h,s,l for every color
  //Background
  const h0 = rand(1, 360);
  const s0 = rand(30, 50);
  const l0 = rand(30, 50);
  //Base
  const h1 = Math.abs(h0 + (30 * rand(1,2)) * (Math.round(Math.random()) * 2 - 1)) % 360;
  const s1 = rand(50, 80);
  const l1 = rand(30, 80);
  //Accent
  const h2 = h0;
  const s2 = rand(30, 80);
  const l2 = rand(60, 100);
  //Tertiary
  const h3 = h1;
  const s3 = Math.min(s0 + 60, 95);
  const l3 = rand(40, 60);
  //Text
  const h4 = Math.abs(h1 + -180);
  const s4 = rand(80, 100);
  const l4 = rand(50, 90);
  //Text-invert
  const h5 = h0;
  const s5 = rand(0, 20);
  const l5 = rand(0, 20);
  //Text-highlight
  const h6 = Math.abs(h0 + (90 * rand(1,3))) % 360;
  const s6 = rand(80, 100);
  const l6 = rand(50, 80);
  //Border
  const h7 = h3;
  const s7 = rand(30, 50);
  const l7 = rand(30, 50);
  //Border-accent
  const h8 = h1;
  const s8 = rand(30, 50);
  const l8 = rand(30, 50);
  //Drop Shadow
  const h9 = h0;
  const s9 = 15;
  const l9 = 15;

  //Set Colors
  root_style.setProperty("--color-bg", hslToHex(h0, s0, l0));
  root_style.setProperty("--color-base", hslToHex(h1, s1, l1));
  root_style.setProperty("--color-accent", hslToHex(h2, s2, l2));
  root_style.setProperty("--color-tertiary", hslToHex(h3, s3, l3));
  root_style.setProperty("--color-text", hslToHex(h4, s4, l4));
  root_style.setProperty("--color-text-invert", hslToHex(h5, s5, l5));
  root_style.setProperty("--color-text-highlight", hslToHex(h6, s6, l6));
  root_style.setProperty("--color-border", hslToHex(h7, s7, l7));
  root_style.setProperty("--color-border-accent", hslToHex(h8, s8, l8));
  root_style.setProperty("--color-drop-shadow", hslToHex(h9, s9, l9));

  //Change site storage to new color scheme
  updateStorage("all", "save");

  //Update js color boxes
  updateJscolor();

  document.getElementById("id_color_scheme_name").value = "";
  colorSchemeNameUpdate();
  sessionStorage.setItem("color-mode", "");
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

//Generate loading button
//Currently not using Colormind due to https problems keep this here for later
//This will show that it's loading from colorminds's API while user waits
$('[data-colormind-start]').click(function() {
  //$('[data-colormind-start]').addClass('hide');
  //$('[data-colormind-end]').removeClass('hide');
  //getColormindPalette();
  semiRandomizer();
});
