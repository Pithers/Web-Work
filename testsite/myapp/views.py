#myapp/views.py

from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.contrib.auth import logout
from django.conf import settings
from django.contrib.auth.decorators import login_required

from . import models
from . import forms

#Default view
#login required function decorator
@login_required
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

#Consider redirecting to whatever page the user logged out from
def logout_view(request):
    logout(request)
    return redirect("/login/")

#View provided page, day, and year. ex: site/page/2003/2
def page(request, day, year):
    context = {
        'title':'Title',
        'day':day,
        'year':year
    }
    return render(request, 'index.html', context=context)

#RESTful user registration ex: site/register/
def register(request):
    if request.method == 'POST':
        registration_form = forms.RegistrationForm(request.POST)
        if registration_form.is_valid():
            registration_form.save(commit=True)
            return redirect("/")
    else:
        registration_form = forms.RegistrationForm()

    context = {
        'form':registration_form
    }
    return render(request, 'registration/register.html', context=context)

#RESTful suggestion view ex: site/suggestion/
def rest_suggestion(request):
    if not request.user.is_authenticated:
        #return redirect('%s?next=%s' % (settings.LOGIN_URL, request.path))
        return JsonResponse({"suggestions":[]})
    if request.method == 'GET':
        #Get all suggestions
        suggestions = models.SuggestionModel.objects.all()

        suggestion_list = []
        for item in suggestions:
            suggestion_list += [{
                'suggestion':item.suggestion,
                'id':item.id
            }]
        return JsonResponse({"suggestions":suggestion_list})
    return HttpResponse('Invalid HTTP Method')

