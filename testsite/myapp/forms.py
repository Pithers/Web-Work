#myapp/forms.py

from django import forms
from django.core import validators

#NIS requirements for passwords, look into this later

class SuggestionForm(forms.Form):
    suggestion = forms.CharField(
        validators=[validators.validate_slug], #Add slug validator
        label='Suggestion',
        max_length=240
        )
