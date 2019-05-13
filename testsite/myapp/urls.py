# Filename: myapp/urls.py
# Author: Brandon Smith

# File Description:
# Site Url definitions.

# Imports
from django.urls import path
from django.contrib.auth import views as adminviews
from . import views

urlpatterns = [
    path('', views.index_view),
    path('posts/', views.post_view),
    path('preferences/', views.preferences_view),
    path('register/', views.register),
    path('comment/<int:post_id>/', views.comment_view),
    path('login/', adminviews.LoginView.as_view()),
    path('logout/', views.logout_view),
    path('webgl/<slug:name>/', views.webgl_view),
    path('about/', views.about_view),
    path('music/', views.music_view),
    path('playlist/', views.playlist_view),
    path('rest_posts/', views.rest_post),
    path('rest_color_scheme/', views.rest_color_scheme),
]
