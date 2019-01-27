//myapp/static/js/preferences.js

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

    html_button.setAttribute("type", "Submit");
    html_button.setAttribute("name", "scheme_name");

    html_palette.setAttribute("class", "user-list-palette");

    //Generate list-group for selecting color schemes
    if(i < list.length) {

      if(default_scheme == i) {
        html_button.setAttribute("class", "list-group-item active");
      } else {
        html_button.setAttribute("class", "list-group-item");
      }

      html_button.setAttribute("onclick", "setDefaultScheme(" + i + ")");
      html_button.setAttribute("value", list[i].color_scheme_name);

      //Color patches
      html_button.innerText = list[i].color_scheme_name;

      for(j = 0; j < 10; j++) {
        //This searches the list for any of the fields and writes it to the DOM
        var html_color = document.createElement("div");
        html_color.setAttribute("class", "user-list-patches");
        html_color.setAttribute("style", "background: #" + list[i][fields[j]]);
        html_palette.appendChild(html_color);
      }
    }
    else if(i == list.length) {
      html_button.setAttribute("class", "list-group-item");
      html_button.setAttribute("onclick", "setDefaultScheme(" + i + ")");
      html_button.setAttribute("value", "default-light-mode");
      html_button.innerText = "default-light-mode";
    }
    else {
      html_button.setAttribute("class", "list-group-item");
      html_button.setAttribute("onclick", "setDefaultScheme(" + i + ")");
      html_button.setAttribute("value", "default-dark-mode");
      html_button.innerText = "default-dark-mode";
    }
    html_button.appendChild(html_palette);
    html_list.appendChild(html_button);
  }

  document.getElementById("user-color-schemes").appendChild(html_list);
}
