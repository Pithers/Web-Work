# Filename: myapp/models.py
# Author: Brandon Smith

# File Description:
# All of the custom database models/objects used for the website.

# Contents:
# validate_color
# CustomUser
# ColorScheme
# PostModel
# CommentModel

# Imports
import re
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# validate_color
# This is a validator that ensures the hex string is in the correct format for our database
# Ex: 999 or 909090
def validate_color(value):
    if not re.search(r"^(?:[0-9a-fA-F]{3}){1,2}$", value):
        raise ValidationError(
            _("%(value)s is not valid hex color code"),
            params={'value':value},
        )

# CustomUser
# An override for the User class.
# This adds in an active color scheme for each user (the one the user wants to see by default)
class CustomUser(AbstractUser):
    # Search the database for the colorscheme desired and associate it with the user
    active_color_scheme = models.ForeignKey("ColorScheme", on_delete=models.SET_NULL,
                                            blank=True, null=True)
    def __str__(self):
        return self.email

# ColorScheme
# A color scheme objects.
# The object is defined as follows:
# creator: the user that created it
# color_scheme_name: a string defining the name
# color_*: hexcode colors associated with different sections of the website
class ColorScheme(models.Model):
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE,
                                blank=True, null=True)
    color_scheme_name = models.CharField(max_length=20)
    color_bg = models.CharField(max_length=7, default="666666",
                                validators=[validate_color],
                                help_text="Valid hexcode, ex: 666666")
    color_text = models.CharField(max_length=7, default="666666",
                                  validators=[validate_color],
                                  help_text="Valid hexcode, ex: 666666")
    color_text_invert = models.CharField(max_length=7, default="666666",
                                         validators=[validate_color],
                                         help_text="Valid hexcode, ex: 666666")
    color_text_highlight = models.CharField(max_length=7, default="666666",
                                            validators=[validate_color],
                                            help_text="Valid hexcode, ex: 666666")
    color_base = models.CharField(max_length=7, default="666666",
                                  validators=[validate_color],
                                  help_text="Valid hexcode, ex: 666666")
    color_accent = models.CharField(max_length=7, default="666666",
                                    validators=[validate_color],
                                    help_text="Valid hexcode, ex: 666666")
    color_tertiary = models.CharField(max_length=7, default="666666",
                                      validators=[validate_color],
                                      help_text="Valid hexcode, ex: 666666")
    color_border = models.CharField(max_length=7, default="666666",
                                    validators=[validate_color],
                                    help_text="Valid hexcode, ex: 666666")
    color_border_accent = models.CharField(max_length=7, default="666666",
                                           validators=[validate_color],
                                           help_text="ease submit valid hexcode, ex: 666666")
    color_drop_shadow = models.CharField(max_length=7, default="666666",
                                         validators=[validate_color],
                                         help_text="Please submit valid hexcode, ex: 666666")

    def __str__(self):
        return self.color_scheme_name

# PostModel
# An object that contains a user post in the post system.
# The object is defined as follows:
# post: a string of text (max 240 characters)
# author: the user that created it
# creation_date: when the object was created
class PostModel(models.Model):
    post = models.CharField(max_length=240)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.post

# CommentModel
# An object that contains a user comment in the post system.
# The object is defined as follows:
# comment: a string of text (max 240 characters)
# author: the user that created it
# post: the post that the comment is attached to
# creation_date: when the object was created
class CommentModel(models.Model):
    comment = models.CharField(max_length=240)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    post = models.ForeignKey(PostModel, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "%s authored by %s" % (self.comment, self.author)
