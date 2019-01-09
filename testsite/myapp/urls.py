#myapp/urls.py

from django.urls import path
from django.contrib.auth import views as adminviews
from . import views

urlpatterns = [
    path('', views.index),
    path('suggestions/', views.rest_suggestion),
    path('register/', views.register),
    path('comment/<int:suggestion_id>/', views.comment_view),
    path('login/', adminviews.LoginView.as_view()),
    path('logout/', views.logout_view),
    path('webgl/<slug:name>/', views.webgl_view),
    path('about/', views.about_view),
    path('music/', views.music_view),
]
