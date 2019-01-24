#myapp/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse

from .forms import RegistrationForm, CustomUserChangeForm
from .models import CustomUser, PostModel, CommentModel, ColorScheme

class CustomUserAdmin(UserAdmin):
    add_form = RegistrationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ['email', 'username', 'default_color_scheme',]

    #Display active color scheme to user
    def default_color_scheme(self, obj):
        if obj.active_color_scheme != None:
            link=reverse("admin:myapp_colorscheme_change", args=[obj.active_color_scheme.id])
            return format_html('<a href="{}">{}</a>', link, obj.active_color_scheme.color_scheme_name)
        return

# Register your models here
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(ColorScheme)
admin.site.register(PostModel)
admin.site.register(CommentModel)
