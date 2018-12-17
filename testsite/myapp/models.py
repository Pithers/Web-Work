#myapp/models.py

from django.db import models

class Suggestion_model(models.Model):
    suggestion = models.CharField(max_length = 240)

    def __str__(self):
        return self.suggestion
