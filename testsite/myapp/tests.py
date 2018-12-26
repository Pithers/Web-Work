#myapp/tests.py

from django.contrib.auth.models import User
from django.test import TestCase

from .models import SuggestionModel

#This will all be handled in a fake database
class SuggestionTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='bob',email='bob@bob.com',password='randyrandy')
        SuggestionModel.objects.create(suggestion="lion",author=self.user)
        SuggestionModel.objects.create(suggestion="cat",author=self.user))

    def test_suggestions_to_string(self):
        lion = SuggestionModel.objects.get(suggestion="lion")
        cat = SuggestionModel.objects.get(suggestion="cat")
        self.assertEqual(str(lion), 'lion')
        self.assertEqual(str(cat), 'cat')
        self.assertEqual(lion.author, self.user)
