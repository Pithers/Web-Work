# Filename: myapp/views.py
# Author: Brandon Smith

# File Description:
# This file defines views for use by the website.

# Contents:
# preferences_view
# post_view
# comment_view
# logout_view
# register
# rest_post
# rest_color_scheme
# webgl_view
# about_view
# music_view
# index_view
# error_views

# Imports
from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist, EmptyResultSet
from django.core.exceptions import FieldDoesNotExist, MultipleObjectsReturned
from . import models
from . import forms

# preferences_view
# Defines the functionality for the preferences page.
# For any user that is logged in, they can access their preferences page.
# As of now, users can set as default or delete their user's color schemes.
@login_required
def preferences_view(request):
    if request.method == 'POST':
        # Check to see if we're setting the default scheme, or deleting one
        if request.POST.get('scheme_name') is not None:
            scheme_name = request.POST.get('scheme_name')
            save = True
        elif request.POST.get('delete_name') is not None:
            scheme_name = request.POST.get('delete_name')
            save = False
        else:
            return HttpResponse("Invalid POST: No scheme_name provided")

        # Verify that the colorscheme exists in the database
        try:
            color_scheme_model = models.ColorScheme.objects.get(color_scheme_name=scheme_name,
                                                                creator=request.user)
        except MultipleObjectsReturned:
            return HttpResponse("Invalid Query: Multiple Objects fit search.")
        except ObjectDoesNotExist:
            color_scheme_model = None

        # Save default scheme to user
        if save:
            active_scheme_form = forms.ColorSchemeActiveForm(instance=request.user)
            temp_form = active_scheme_form.save(commit=False)
            temp_form.active_color_scheme = color_scheme_model
            temp_form.save()
        # Delete color scheme from database
        else:
            color_scheme_model.delete()

        return redirect('/preferences/')

    active_scheme_form = forms.ColorSchemeActiveForm()
    return render(request, 'preferences.html', {'active_scheme_form': active_scheme_form})

# post_view
# This view allows submission of posts by the user.
def post_view(request):
    comm_form = forms.CommentForm()
    if request.method == 'POST':
        form_instance = forms.PostForm(request.POST)

        # Check to see if submitted form is valid
        if form_instance.is_valid():
            temp_model = models.PostModel(
                post=form_instance.cleaned_data['post'],
                author=request.user
                )
            temp_model.save()

            # Refresh the form so a new form can be added
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

# comment_view
# This view allows submission of comments by the user.
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
            return redirect("/posts/")
    else:
        form_instance = forms.CommentForm()

    context = {
        'title':'Title',
        'form_instance':form_instance,
        'post_id':post_id
    }
    return render(request, 'comment.html', context=context)

# logout_view
# This view logus the user out and sets a logout message status.
def logout_view(request):
    logout(request)
    messages.success(request, 'Logged out.', extra_tags='LOGOUT')
    return redirect("/login/")

# register
# This view is a RESTful user registration
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

# rest_post
# This view is a RESTful post getter.
# It queries the database for all of the posts and comments.
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

        # Package up the posts/comments into a Json Response
        return JsonResponse({"posts":post_list})
    return HttpResponse('Invalid HTTP Method')

# rest_color_scheme
# This view is a RESTful color scheme getter.
# It queries the database for all of the color schemes available to the user.
def rest_color_scheme(request):
    # This can only be accessed by site users.
    if request.method == 'GET' and request.user.is_authenticated:
        # Attempt to find the color schemes in the database attributed to the user.
        try:
            color_schemes = models.ColorScheme.objects.filter(creator__exact=request.user)
        except (ObjectDoesNotExist, EmptyResultSet, FieldDoesNotExist,
                MultipleObjectsReturned) as error_value:
            return HttpResponse(error_value)

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

        # Package up the color schemes into a Json Response
        if request.user.active_color_scheme is not None:
            # Find that color scheme and pass it the name of the color_scheme that it matches
            default_scheme = request.user.active_color_scheme.color_scheme_name
            response = JsonResponse({"color_scheme":color_scheme_list,
                                     "default_scheme":default_scheme})
        else:
            response = JsonResponse({"color_scheme":color_scheme_list})

        return response
    return redirect('/login/')

# webgl_view
# This view contains all of the views that use Webgl.
# /name defines which webgl html runs.
def webgl_view(request, name):
    context = {
        'name':name
    }
    return render(request, 'webgl.html', context=context)

# about_view
def about_view(request):
    return render(request, 'about.html')

# music_view
def music_view(request):
    return render(request, 'music.html')

# index_view
# Defines the functionality for the index page.
# For any user that is logged in, they can save and edit color schemes.
def index_view(request):
    if request.method == "POST" and request.user.is_authenticated:
        # Search for current color_scheme_name in database
        scheme_name = request.POST.get('color_scheme_name')
        try:
            current = models.ColorScheme.objects.get(color_scheme_name=scheme_name,
                                                     creator=request.user)
        except MultipleObjectsReturned:
            return HttpResponse("Invalid Query: Multiple Objects fit search.")
        except ObjectDoesNotExist:
            current = None

        # If the color scheme already exists, overwrite it, if not create a new one
        color_scheme_form = forms.ColorSchemeForm(request.POST, instance=current)
        if color_scheme_form.is_valid():
            temp_form = color_scheme_form.save(commit=False)
            temp_form.creator = request.user
            temp_form.save()
        return redirect('/')
    color_scheme_form = forms.ColorSchemeForm()
    return render(request, 'index.html', {'color_scheme_form': color_scheme_form})

# error_views
def handler404(request):
    return render(request, '404.html', status=404)

def handler500(request):
    return render(request, '500.html', status=500)

def handler403(request):
    return render(request, '403.html', status=403)

def handler400(request):
    return render(request, '400.html', status=400)
