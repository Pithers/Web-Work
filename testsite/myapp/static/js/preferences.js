//Filename: preferences.js
//Author: Brandon Smith

//File Description:
//This file builds most of the preferences.html page
//The current functionality is that it displays the user's color palette preferences
//and allows the user to choose a default one, or delete one.
//Later on, more account preferences will be added

//Contents:
//## setDefaultScheme()
//## deleteScheme()
//## colorPreferences()

//setDefaultScheme()
//Function runs from preferences view and sets/loads a default color scheme
//If light or dark mode is set, set the checkbox accordingly and let the light/dark themeupdater handle it
//id = the id (based on the Vue colorscheme object)
//scheme_name = the color scheme name in the database
function setDefaultScheme(id, scheme_name) {
  //Submit the form with the appropriate scheme_name
  var form = document.getElementById("preferences_form");
  var form_input = document.getElementById("preference_form_input");
  form_input.name = "scheme_name";
  form_input.value = scheme_name;
  form.submit();

  //Set the color scheme for the button chosen
  var light_switch;
  var length = fetch_color_scheme.color_scheme.length;
  if(id < length) {
    fetch_color_scheme.loadColorScheme(scheme_name);
  }
  //Or check to see if dark/light mode has been selected
  else {
    light_switch = document.getElementById("light-switch");
    if (id == length) {
      light_switch.checked = true;
    }
    else {
      light_switch.checked = false;
    }
    themeUpdate(light_switch);
  }
}

//deleteScheme()
//deletes the scheme specified by 'scheme_name'
function deleteScheme(scheme_name) {
  //Check to make sure user really wants to delete the scheme
  //Return immediately if user cancels
  if (!confirm("Delete " + scheme_name + " from your color schemes?")) {
    return;
  }

  //Submit the form with the scheme_name to be deleted
  var form = document.getElementById("preferences_form");
  var form_input = document.getElementById("preference_form_input");
  form_input.name = "delete_name";
  form_input.value = scheme_name;
  form.submit();
}

//colorPreferences()
//This function builds the preferences html page (buttons, divs, etc)
//default_scheme = current default scheme name
//list = an array of color schemes (get this from the colorschemes Vue object)
function colorPreferences(list, default_scheme) {
  //Fields for each color preference
  var fields = ["color_bg","color_base","color_accent","color_tertiary","color_text",
                "color_text_invert","color_text_highlight","color_border",
                "color_border_accent","color_drop_shadow"];

  //Create HTML main list group
  var html_list = document.createElement("ul");
  html_list.classList.add("list-group");

  //Generate color scheme preference list
  for(i = 0; i < list.length; i++) {
    var html_button = document.createElement("ul");
    var html_palette = document.createElement("div");
    var delete_button = document.createElement("div");

    html_button.name = "scheme_name";
    html_button.id = "scheme-" + i;
    html_button.classList.add("list-group-item")

    //Style class for palette
    html_palette.classList.add("user-list-palette");

    //Style class for trash-icon
    delete_button.classList.add("delete-button");
    delete_button.classList.add("fas");
    delete_button.classList.add("fa-trash");

    //Generate list-group for selecting color schemes
    if(i < list.length) {
      if(list[i].color_scheme_name == default_scheme) {
        html_button.classList.add("active");
      }

      //Have button launch the setDefaultScheme on the respective color scheme
      html_button.onclick = new Function("setDefaultScheme(" + i + ",'" + list[i].color_scheme_name + "');");

      //Color patches
      html_button.innerText = list[i].color_scheme_name;

      //This searches the list for any of the fields and writes it to the DOM
      for(j = 0; j < 10; j++) {
        var html_color = document.createElement("div");
        html_color.classList.add("user-list-patches");
        html_color.style.background = "#" + list[i][fields[j]];
        html_palette.appendChild(html_color);
      }

      //Add in delete button, deletes colorscheme upon click
      delete_button.onclick = new Function("deleteScheme('" + list[i].color_scheme_name + "');");
      html_button.appendChild(delete_button);
    }

    html_list.appendChild(html_button);
    html_button.appendChild(html_palette);
  }

  document.getElementById("user-color-schemes").appendChild(html_list);
}
