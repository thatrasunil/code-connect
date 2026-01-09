import os
from django.core.asgi import get_asgi_application
import socketio

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codeconnect_backend.settings')

django_asgi_app = get_asgi_application()

from core.sockets import sio
application = socketio.ASGIApp(sio, django_asgi_app)
