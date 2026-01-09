from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    avatar = models.TextField(default="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix")
    role = models.CharField(max_length=10, choices=[('USER', 'User'), ('ADMIN', 'Admin')], default='USER')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

class Room(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    room_id = models.CharField(max_length=20, unique=True)
    code = models.TextField(default="", blank=True)
    language = models.CharField(max_length=50, default="javascript")
    owner = models.ForeignKey(User, related_name='rooms', on_delete=models.SET_NULL, null=True, blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rooms'

class Message(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    room = models.ForeignKey(Room, related_name='messages', on_delete=models.CASCADE)
    user_id = models.CharField(max_length=255) # Storing user ID as string to match Node.js implementation
    content = models.TextField(blank=True, default="")
    type = models.CharField(max_length=20, default='TEXT') # TEXT, VIDEO, AUDIO, IMAGE
    attachment = models.FileField(upload_to='chat_uploads/', null=True, blank=True)
    attachment_url = models.CharField(max_length=500, null=True, blank=True)
    is_voice = models.BooleanField(default=False)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='replies')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'

class RoomHistory(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    room = models.ForeignKey(Room, related_name='users', on_delete=models.CASCADE)
    user_id = models.CharField(max_length=255)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'room_history'
