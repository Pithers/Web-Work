#myapp/tests.py

from django.contrib.auth.models import User
from django.test import TestCase

from .models import SuggestionModel

#This will all be handled in a fake database
class PostTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='bob', email='bob@bob.com', password='top_secret')
        PostModel.objects.create(post="lion", author=self.user)
        PostModel.objects.create(post="cat", author=self.user)

    def test_posts_to_string(self):
        lion = PostModel.objects.get(post="lion")
        cat = PostModel.objects.get(post="cat")
        self.assertEqual(str(lion), 'lion')
        self.assertEqual(str(cat), 'cat')
        self.assertEqual(lion.author, self.user)
