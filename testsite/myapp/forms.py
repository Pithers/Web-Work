#myapp/forms.py

from django import forms
from django.core.validators import validate_slug #validate email?
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class SuggestionForm(forms.Form):
    error_css_class = 'suggestion-css-class-error'
    required_css_class = 'suggestion-css-class'
    suggestion = forms.CharField(
        validators=[validate_slug], #Add slug validator
        label='Suggestion',
        max_length=240
        )

class CommentForm(forms.Form):
    error_css_class = 'comment-css-class_error'
    required_css_class = 'suggestion-css-class'
    comment = forms.CharField(
        label='Comment',
        max_length=240
        )

#NIS requirements for passwords, look into this later
#Need to make sure authenticator on this is the same used in the login form
#Inherit from UserCreationForm here
class RegistrationForm(UserCreationForm):
    error_css_class = 'registration-css-class-error'
    required_css_class = 'registration-css-class'
    email = forms.EmailField(
        label="Email",
        required=True
        )

    class Meta:
        model = User
        fields = ("username", "email",
                  "password1", "password2")

    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user
