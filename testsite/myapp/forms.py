# Filename: myapp/forms.py
# Author: Brandon Smith

# File Description:
# All of the custom forms used for the website. 

# Contents:
# ColorSchemeActiveForm
# ColorSchemeForm
# PostForm
# CommentForm
# RegistrationForm
# CustomUserChangeForm

# Imports
from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser
from .models import ColorScheme

# ColorSchemeActiveForm
# Allows submission of a default user scheme for each user.
class ColorSchemeActiveForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ["active_color_scheme"]

# ColorSchemeForm
# Allows creation of a color scheme.
# color_scheme_name: a string name
# color_*: a color hexcode.
class ColorSchemeForm(forms.ModelForm):
    class Meta:
        model = ColorScheme
        fields = ["color_scheme_name", "color_bg", "color_text", "color_border", "color_base",
                  "color_text_invert", "color_border_accent", "color_accent",
                  "color_text_highlight", "color_drop_shadow", "color_tertiary",]

# PostForm
# Allows the creation of a Post. Posts are restricted to 240 chars.
class PostForm(forms.Form):
    error_css_class = "post-css-class-error"
    required_css_class = "post-css-class"
    post = forms.CharField(
        label="Post",
        max_length=240
        )

# CommentForm
# Allows the creation of a Comment. Comments are restricted to 240 chars.
class CommentForm(forms.Form):
    error_css_class = "comment-css-class_error"
    required_css_class = "comment-css-class"
    comment = forms.CharField(
        label="Comment",
        max_length=240
        )

# RegistrationForm
# Allows the registration of a new user.
# A username, email, password, and password confirmation are required.
class RegistrationForm(UserCreationForm):
    error_css_class = "registration-css-class-error"
    required_css_class = "registration-css-class"
    email = forms.EmailField(
        label="Email",
        required=True
        )

    class Meta:
        model = CustomUser
        fields = ("username", "email",
                  "password1", "password2")

    # Upon saving, run a validator on the email and then add the user to the database.
    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user

# CustomUserChangeForm
# Form used in the admin interface to change a user's information and permissions.
class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = CustomUser
        fields = ("username", "email")
