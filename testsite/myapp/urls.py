#myapp/urls.py

from django.urls import path
from django.conf.urls import url
from django.contrib.auth import views as adminviews
from . import views

urlpatterns = [
    path('', views.index_view),
    path('posts/', views.post_view),
    path('rest_posts/', views.rest_post),
    path('register/', views.register),
    path('comment/<int:post_id>/', views.comment_view),
    path('login/', adminviews.LoginView.as_view()),
    path('logout/', views.logout_view),
    path('webgl/<slug:name>/', views.webgl_view),
    path('about/', views.about_view),
    path('music/', views.music_view),
]
