#myapp/views.py

#Look into google's nautral language api

from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.contrib.auth import logout
from django.core.exceptions import ObjectDoesNotExist, EmptyResultSet
from django.core.exceptions import FieldDoesNotExist, MultipleObjectsReturned
#from django.contrib.auth.decorators import login_required

from . import models
from . import forms

#Post view
#login required function decorator
#@login_required
def post_view(request):
    comm_form = forms.CommentForm()
    if request.method == 'POST':
        form_instance = forms.PostForm(request.POST)

        #Check to see if submitted form is valid
        if form_instance.is_valid():
            #Give the valid form to t
            #possibly need to add additional logic to deal with guest users
            temp_model = models.PostModel(
                post=form_instance.cleaned_data['post'],
                author=request.user
                )
            temp_model.save()

            #Refresh the form so a new form can be added
            form_instance = forms.PostForm()
    else:
        form_instance = forms.PostForm()

    posts = models.PostModel.objects.all()
    context = {
        'title':'Title',
        'posts':posts,
        'form_instance':form_instance,
        'comm_form':comm_form
    }
    return render(request, 'posts.html', context=context)

#@login_required
def comment_view(request, post_id):
    if request.method == 'POST':
        form_instance = forms.CommentForm(request.POST)

        #Check to see if submitted form is valid
        if form_instance.is_valid():
            #Give the valid form to t
            #possibly need to add additional logic to deal with guest users
            post_instance = models.PostModel.objects.get(pk=post_id)
            temp_model = models.CommentModel(
                comment=form_instance.cleaned_data['comment'],
                author=request.user,
                post=post_instance
                )
            temp_model.save()
            return redirect("/")
    else:
        form_instance = forms.CommentForm()

    context = {
        'title':'Title',
        'form_instance':form_instance,
        'post_id':post_id
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

#RESTful post view ex: site/rest_post/
def rest_post(request):
    if request.method == 'GET':
        #Get all posts
        posts = models.PostModel.objects.all()

        post_list = []
        for item in posts:
            add_to_list = {
                'post':item.post,
                'author':item.author.username,
                'id':item.id,
                'created_on':item.creation_date,
                'comments':[]
            }

            #Add list of comments to each post item
            comment_query = models.CommentModel.objects.filter(post=item)
            for comment_item in comment_query:
                add_to_list['comments'] += [{
                    'comment':comment_item.comment,
                    'id':comment_item.id,
                    'author':comment_item.author.username,
                    'created_on':comment_item.creation_date
                    }]

            post_list += [add_to_list]

        return JsonResponse({"posts":post_list})
    return HttpResponse('Invalid HTTP Method')

#RESTful get color schemes
def rest_color_scheme(request):
    if request.method == 'GET' and request.user.is_authenticated:
        try:
            color_schemes = models.ColorScheme.objects.filter(creator__exact=request.user)
        except ObjectDoesNotExist:
            print("Object searched for does not exist.")
            return HttpResponse("Invalid Query: ObjectDoesNotExist")
        except EmptyResultSet:
            print("No results match name and user.")
            return HttpResponse("Invalid Query: No results.")
        except FieldDoesNotExist:
            print("Searched field does not exist.")
            return HttpResponse("Invalid Query: Field/s do not exist.")
        except MultipleObjectsReturned:
            print("Multiple schemes with same name from user.")
            return HttpResponse("Invalid Query: Multiple Objects fit search.")

        color_scheme_list = []
        for item in color_schemes:
            add_to_list = {
                'color_scheme_name':item.color_scheme_name,
                'color_bg':item.color_bg,
                'color_base':item.color_base,
                'color_accent':item.color_accent,
                'color_tertiary':item.color_tertiary,
                'color_text':item.color_text,
                'color_text_invert':item.color_text_invert,
                'color_text_highlight':item.color_text_highlight,
                'color_border':item.color_border,
                'color_border_accent':item.color_border_accent,
                'color_drop_shadow':item.color_drop_shadow
            }
            color_scheme_list += [add_to_list]

        return JsonResponse({"color_scheme":color_scheme_list})
    return redirect('/login/')

def webgl_view(request, name):
    context = {
        'name':name
    }
    return render(request, 'webgl.html', context=context)

def about_view(request):
    return render(request, 'about.html')

def music_view(request):
    return render(request, 'music.html')

def index_view(request):
    if request.method == "POST" and request.user.is_authenticated:
            #Search for model instance right here?
            color_scheme_form = forms.ColorSchemeForm(request.POST)
            if color_scheme_form.is_valid():
                temp_form = color_scheme_form.save(commit=False)
                temp_form.creator = request.user
                temp_form.save()
            return redirect('/')
    else:
        color_scheme_form = forms.ColorSchemeForm()
    return render(request, 'index.html', {'color_scheme_form': color_scheme_form})
