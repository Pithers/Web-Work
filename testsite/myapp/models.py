# myapp/models.py
# Consider making a profile model that inherits from User so each user can have a profile

#from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import re

def validate_color(value):
  if (re.search(r'^#(?:[0-9a-fA-F]{3}){1,2}$',value) == False):
    raise ValidationError(
        _('%(value)s is not valid hex color code'),
        params={'value':value},
    )

# Custom User Model
class CustomUser(AbstractUser):
    def __str__(self):
        return self.email

class ColorScheme(models.Model):
  creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
  color_scheme_name = models.CharField(max_length=20)
  color_bg = models.CharField(max_length=7, default="#666666", validators=[validate_color],
                              help_text="Please submit valid hexcode, ex: #666666")
  color_text = models.CharField(max_length=7, default="#666666", validators=[validate_color],
                                help_text="Please submit valid hexcode, ex: #666666")
  color_text_invert = models.CharField(max_length=7, default="#666666", validators=[validate_color],
                                         help_text="Please submit valid hexcode, ex: #666666")
  color_text_highlight = models.CharField(max_length=7, default="#666666", validators=[validate_color],
                                          help_text="Please submit valid hexcode, ex: #666666")
  color_base = models.CharField(max_length=7, default="#666666", validators=[validate_color],
                                help_text="Please submit valid hexcode, ex: #666666")
  color_accent = models.CharField(max_length=7, default="#666666", validators=[validate_color],
                                  help_text="Please submit valid hexcode, ex: #666666")
  color_tertiary = models.CharField(max_length=7, default="#666666", validators=[validate_color],
                                    help_text="Please submit valid hexcode, ex: #666666")
  color_border = models.CharField(max_length=7, default="#666666", validators=[validate_color],
                                  help_text="Please submit valid hexcode, ex: #666666")
  color_border_accent = models.CharField(max_length=7, default="#666666", validators=[validate_color],
                                         help_text="Please submit valid hexcode, ex: #666666")
  color_border_transp = models.CharField(max_length=7, default="#666666", validators=[validate_color],
                                         help_text="Please submit valid hexcode, ex: #666666")
  color_drop_shadow = models.CharField(max_length=7, default="#666666", validators=[validate_color],
                                       help_text="Please submit valid hexcode, ex: #666666")

  def __str__(self):
    return self.color_scheme_name + ":\n" + self.color_bg + "\n" + self.color_text + "\n" + self.color_text_invert + "\n" + \
           self.color_text_highlight + "\n" + self.color_base + "\n" + self.color_tertiary + "\n" + self.color_border + "\n" + \
           self.color_border_accent + "\n" + self.color_border_transp + "\n" + self.color_drop_shadow

# Model that contains something like a Post
class PostModel(models.Model):
    post = models.CharField(max_length=240)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.post

# Model that contains a comment that is linked to a speific post
class CommentModel(models.Model):
    comment = models.CharField(max_length=240)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    post = models.ForeignKey(PostModel, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "%s authored by %s" % (self.comment, self.author)
