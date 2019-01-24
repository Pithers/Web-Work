//myapp/static/js/preferences.js

//Clone the color
function colorPreferences(list) {
  var html_list = document.createElement("ul");
  var html_button;

  //Generate color scheme preference list and the two defaults: dark and light
  for(i = 0; i < list.length + 2; i++) {
    html_button = document.createElement("input");

    html_button.setAttribute("type", "Submit");
    html_button.setAttribute("class", "button");
    html_button.setAttribute("value", "Set As Default");
    html_button.setAttribute("name", "scheme_name");

    //Need onclick to also launch what sets the default in the database
    if(i < list.length) {
      html_button.setAttribute("onclick", "setDefaultScheme(" + i + ")");
      html_button.setAttribute("value", list[i].color_scheme_name);
    }
    else if(i == list.length) {
      html_button.setAttribute("onclick", "setDefaultScheme(" + i + ")");
      html_button.setAttribute("value", "default-light-mode");
    }
    else {
      html_button.setAttribute("onclick", "setDefaultScheme(" + i + ")");
      html_button.setAttribute("value", "default-dark-mode");
    }
    html_list.appendChild(html_button);

    //Consider adding color palette swatches right here
  }

  document.getElementById("user-color-schemes").appendChild(html_list);
}
