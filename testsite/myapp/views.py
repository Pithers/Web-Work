#myapp/views.py

from django.shortcuts import render

from . import models
from . import forms

#Default view
def index(request):
    if request.method == 'POST':
        form_instance = forms.SuggestionForm(request.POST)

        #Check to see if submitted form is valid
        if form_instance.is_valid():
            #Give the valid form to the database 
            temp_model = models.SuggestionModel(
                suggestion=form_instance.cleaned_data['suggestion']
            )
            temp_model.save()

            #Refresh the form so a new form can be added
            form_instance = forms.SuggestionForm()
    else:
        form_instance = forms.SuggestionForm()

    suggestions = models.SuggestionModel.objects.all()
    context = {
        'title':'Title',
        'suggestions':suggestions,
        'form_instance':form_instance
    }
    return render(request, 'index.html', context=context)

#View provided page, day, and year. ex: site/page/2003/2
def page(request, day, year):
    context = {
        'title':'Title',
        'day':day,
        'year':year
    }
    return render(request, 'index.html', context=context)
