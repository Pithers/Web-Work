#myapp/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('page/<int:year>/<int:day>/', views.page),
    path('suggestions/', views.rest_suggestion),
]
