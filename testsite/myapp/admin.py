#myapp/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import RegistrationForm, CustomUserChangeForm
from .models import CustomUser, PostModel, CommentModel

class CustomUserAdmin(UserAdmin):
    add_form = RegistrationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ['email', 'username',]

# Register your models here
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(PostModel)
admin.site.register(CommentModel)
