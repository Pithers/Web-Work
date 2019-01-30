#myapp/forms.py

from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser
from .models import ColorScheme

#Need to find a way around this when there's nothing to really pass
class ColorSchemeActiveForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ["active_color_scheme"]

class ColorSchemeForm(forms.ModelForm):
    class Meta:
        model = ColorScheme
        fields = ["color_scheme_name", "color_bg", "color_text", "color_border", "color_base",
                  "color_text_invert", "color_border_accent", "color_accent",
                  "color_text_highlight", "color_drop_shadow", "color_tertiary",]

class PostForm(forms.Form):
    error_css_class = "post-css-class-error"
    required_css_class = "post-css-class"
    post = forms.CharField(
        label="Post",
        max_length=240
        )

class CommentForm(forms.Form):
    error_css_class = "comment-css-class_error"
    required_css_class = "comment-css-class"
    comment = forms.CharField(
        label="Comment",
        max_length=240
        )

#Consider switching to two-factor authentication
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

    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user

# Form for changing users
class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = CustomUser
        fields = ("username", "email")
