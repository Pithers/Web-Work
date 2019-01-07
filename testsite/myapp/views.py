#myapp/views.py

#Look into google's nautral language api

from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.contrib.auth import logout
#from django.contrib.auth.decorators import login_required

from . import models
from . import forms

#Default view
#login required function decorator
#@login_required
def index(request):
    comm_form = forms.CommentForm()
    if request.method == 'POST':
        form_instance = forms.SuggestionForm(request.POST)

        #Check to see if submitted form is valid
        if form_instance.is_valid():
            #Give the valid form to t
            #possibly need to add additional logic to deal with guest users
            temp_model = models.SuggestionModel(
                suggestion=form_instance.cleaned_data['suggestion'],
                author=request.user
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
        'form_instance':form_instance,
        'comm_form':comm_form
    }
    return render(request, 'index.html', context=context)

#@login_required
def comment_view(request, suggestion_id):
    if request.method == 'POST':
        form_instance = forms.CommentForm(request.POST)

        #Check to see if submitted form is valid
        if form_instance.is_valid():
            #Give the valid form to t
            #possibly need to add additional logic to deal with guest users
            suggestion_instance = models.SuggestionModel.objects.get(pk=suggestion_id)
            temp_model = models.CommentModel(
                comment=form_instance.cleaned_data['comment'],
                author=request.user,
                suggestion=suggestion_instance
                )
            temp_model.save()
            return redirect("/")
    else:
        form_instance = forms.CommentForm()

    context = {
        'title':'Title',
        'form_instance':form_instance,
        'suggestion_id':suggestion_id
    }
    return render(request, 'comment.html', context=context)

#Consider redirecting to whatever page the user logged out from
def logout_view(request):
    logout(request)
    return redirect("/login/")

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
   #if not request.user.is_authenticated:
        #return redirect('%s?next=%s' % (settings.LOGIN_URL, request.path))
        #return JsonResponse({"suggestions":[]})
    if request.method == 'GET':
        #Get all suggestions
        suggestions = models.SuggestionModel.objects.all()

        suggestion_list = []
        for item in suggestions:
            add_to_list = {
                'suggestion':item.suggestion,
                'author':item.author.username,
                'id':item.id,
                'created_on':item.creation_date,
                'comments':[]
            }

            #Add list of comments to each suggestion item
            comment_query = models.CommentModel.objects.filter(suggestion=item)
            for comment_item in comment_query:
                add_to_list['comments'] += [{
                    'comment':comment_item.comment,
                    'id':comment_item.id,
                    'author':comment_item.author.username,
                    'created_on':comment_item.creation_date
                    }]

            suggestion_list += [add_to_list]

        return JsonResponse({"suggestions":suggestion_list})
    return HttpResponse('Invalid HTTP Method')

def webgl_view(request, name):
    context = {
        'name':name
    }
    return render(request, 'webgl.html', context=context)

def about_view(request):
    return render(request, 'about.html')
