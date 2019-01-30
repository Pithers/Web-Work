//myapp/static/js/preferences.js

//Function runs from preferences view and sets/loads a default color scheme
//If light or dark mode is set, set the checkbox accordingly and let the
//light/dark themeupdater handle it
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
      light_switch.checked = false;
    }
    else {
      light_switch.checked = true;
    }
    themeUpdate(light_switch);
  }
}

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

  console.log("deleting... " + scheme_name);
}

function colorPreferences(list, default_scheme) {
  //Fields for each color preference
  var fields = ["color_bg","color_base","color_accent","color_tertiary","color_text",
                "color_text_invert","color_text_highlight","color_border",
                "color_border_accent","color_drop_shadow"];

  //Create HTML main list group
  var html_list = document.createElement("ul");
  html_list.setAttribute("class", "list-group");

  //Generate color scheme preference list and the two defaults: dark and light
  for(i = 0; i < list.length + 2; i++) {
    var html_button = document.createElement("ul");
    var html_palette = document.createElement("div");
    var delete_button = document.createElement("div");

    html_button.setAttribute("name", "scheme_name");
    html_button.setAttribute("id", "scheme-" + i);

    //Style class for palette
    html_palette.setAttribute("class", "user-list-palette");

    //Style class for trash-icon
    delete_button.setAttribute("class", "delete-button fas fa-trash");

    //Generate list-group for selecting color schemes
    if(i < list.length) {
      if(list[i].color_scheme_name == default_scheme) {
        html_button.setAttribute("class", "list-group-item active");
      } else {
        html_button.setAttribute("class", "list-group-item");
      }

      //Have button launch the setDefaultScheme on the respective color scheme
      html_button.setAttribute("onclick", "setDefaultScheme(" + i +
                               ", '" + list[i].color_scheme_name  + "')");

      //Color patches
      html_button.innerText = list[i].color_scheme_name;

      for(j = 0; j < 10; j++) {
        //This searches the list for any of the fields and writes it to the DOM
        var html_color = document.createElement("div");
        html_color.setAttribute("class", "user-list-patches");
        html_color.setAttribute("style", "background: #" + list[i][fields[j]]);
        html_palette.appendChild(html_color);
      }

      //Add in delete button, deletes colorscheme upon click
      delete_button.setAttribute("onclick", "deleteScheme('" +
                                 list[i].color_scheme_name + "'); event.stopPropagation();");
      html_button.appendChild(delete_button);
    }
    else if(i == list.length) {
      html_button.setAttribute("class", "list-group-item");
      html_button.setAttribute("onclick", "setDefaultScheme(" + i + ", 'default-light-mode')");
      html_button.innerText = "default-light-mode";
    }
    else {
      html_button.setAttribute("class", "list-group-item");
      html_button.setAttribute("onclick", "setDefaultScheme(" + i + ", 'default-dark-mode')");
      html_button.innerText = "default-dark-mode";
    }
    html_list.appendChild(html_button);
    html_button.appendChild(html_palette);
  }

  document.getElementById("user-color-schemes").appendChild(html_list);
}
