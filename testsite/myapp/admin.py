#myapp/admin.py

from django.contrib import admin

from . import models

# Register your models here
admin.site.register(models.SuggestionModel)
admin.site.register(models.CommentModel)
