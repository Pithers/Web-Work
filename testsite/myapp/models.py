# myapp/models.py
# Consider making a profile model that inherits from User so each user can have a profile

#from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser
from django.db import models

# Custom User Model
class CustomUser(AbstractUser):
    def __str__(self):
      return self.email

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
