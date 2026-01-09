import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codeconnect_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

try:
    User = get_user_model()
    username = 'testuser'
    password = 'password123'
    email = 'test@example.com'

    if not User.objects.filter(username=username).exists():
        User.objects.create_user(username=username, email=email, password=password)
        print(f"SUCCESS: User '{username}' created.")
    else:
        print(f"INFO: User '{username}' already exists.")
        
except Exception as e:
    print(f"ERROR: {e}")
