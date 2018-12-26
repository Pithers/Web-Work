#myapp/forms.py

from django import forms
from django.core.validators import validate_slug #validate_email?
from django.contrib.auth.forms import UserCreationForm #AuthenticationForm
from django.contrib.auth.models import User

class SuggestionForm(forms.Form):
    suggestion = forms.CharField(
        validators=[validate_slug], #Add slug validator
        label='Suggestion',
        max_length=240
        )

#NIS requirements for passwords, look into this later
#Need to make sure authenticator on this is the same used in the login form
#Inherit from UserCreationForm here
class RegistrationForm(UserCreationForm):
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
