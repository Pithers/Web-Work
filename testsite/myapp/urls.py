#myapp/urls.py

from django.urls import path
from django.contrib.auth import views as adminviews
from . import views

urlpatterns = [
    path('', views.index),
    path('page/<int:year>/<int:day>/', views.page),
    path('suggestions/', views.rest_suggestion),
    path('register/', views.register),
    path('comment/', views.comment_view),
    path('login/', adminviews.LoginView.as_view()),
    path('logout/', views.logout_view),
]
