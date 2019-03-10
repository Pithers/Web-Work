cd testsite
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser2 --username USERNAME --password default_pass1 --noinput --email 'USER@email.com'
