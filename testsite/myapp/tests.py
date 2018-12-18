#myapp/tests.py

from django.test import TestCase

from .models import SuggestionModel

#This will all be handled in a fake database
class SuggestionTestCase(TestCase):
    def setUp(self):
        SuggestionModel.objects.create(suggestion="lion")
        SuggestionModel.objects.create(suggestion="cat")

    def test_suggestions_to_string(self):
        lion = SuggestionModel.objects.get(suggestion="lion")
        cat = SuggestionModel.objects.get(suggestion="cat")
        self.assertEqual(str(lion), 'lion')
        self.assertEqual(str(cat), 'cat')
