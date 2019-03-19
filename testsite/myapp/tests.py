# Filename: myapp/tests.py
# Author: Brandon Smith

# File Description:
# Custom tests for site functionality

# Note: Database functionality is near-trivial at this point.
#       Robust testing is not needed until the database becomes more complex.

# Imports
from django.test import TestCase
from .models import CustomUser
from .models import PostModel

# Sanity test for our post system
class PostTestCase(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='bob', email='bob@bob.com', password='top_secret')
        PostModel.objects.create(post="lion", author=self.user)
        PostModel.objects.create(post="cat", author=self.user)

    def test_posts_to_string(self):
        lion = PostModel.objects.get(post="lion")
        cat = PostModel.objects.get(post="cat")
        self.assertEqual(str(lion), 'lion')
        self.assertEqual(str(cat), 'cat')
        self.assertEqual(lion.author, self.user)
