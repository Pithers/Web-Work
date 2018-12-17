#myapp/views.py

from django.shortcuts import render
from django.http import HttpResponse

from . import models

#Default view
def index(request):
    suggestions = models.SuggestionModel.objects.all()
    context = {
        'title':'Title',
        "suggestions":suggestions
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
