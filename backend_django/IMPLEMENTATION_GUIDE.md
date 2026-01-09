# CodeConnect - Complete Django Backend Implementation Guide

## 📁 Project Structure
```
codeconnect/
├── manage.py
├── requirements.txt
├── codeconnect/
│   ├── settings.py
│   ├── asgi.py
│   ├── wsgi.py
│   └── urls.py
├── rooms/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── consumers.py
│   └── tests.py
└── static/
```

***

## 1️⃣ DJANGO MODELS (`rooms/models.py`)

```python
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid

class Room(models.Model):
    """Room for collaborative coding"""
    
    LANGUAGE_CHOICES = [
        ('javascript', 'JavaScript'),
        ('python', 'Python'),
        ('cpp', 'C++'),
        ('java', 'Java'),
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('json', 'JSON'),
        ('sql', 'SQL'),
    ]
    
    id = models.BigIntegerField(primary_key=True, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rooms')
    language = models.CharField(
        max_length=20, 
        choices=LANGUAGE_CHOICES, 
        default='javascript'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['language']),
        ]
    
    def __str__(self):
        return f"Room {self.id} - {self.get_language_display()}"
    
    @property
    def get_code_content(self):
        """Get current code content"""
        try:
            return self.code.content
        except RoomCode.DoesNotExist:
            return ""
    
    @property
    def active_collaborators_count(self):
        """Get count of active collaborators"""
        return self.collaborators.filter(is_active=True).count()


class RoomCode(models.Model):
    """Stores the code content for each room with version history"""
    
    room = models.OneToOneField(Room, on_delete=models.CASCADE, related_name='code')
    content = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_saved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='saved_codes'
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['room', 'updated_at']),
        ]
    
    def __str__(self):
        return f"Code for Room {self.room.id}"
    
    def get_content_preview(self, max_length=100):
        """Get preview of code content"""
        return self.content[:max_length] + ("..." if len(self.content) > max_length else "")


class RoomCodeVersion(models.Model):
    """Track code changes history for version control"""
    
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='code_versions')
    content = models.TextField()
    version_number = models.IntegerField()
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    change_summary = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-version_number']
        unique_together = [['room', 'version_number']]
        indexes = [
            models.Index(fields=['room', '-version_number']),
        ]
    
    def __str__(self):
        return f"Room {self.room.id} v{self.version_number}"


class RoomMetadata(models.Model):
    """Store room metadata and configuration"""
    
    room = models.OneToOneField(Room, on_delete=models.CASCADE, related_name='metadata')
    last_accessed = models.DateTimeField(auto_now=True)
    access_count = models.IntegerField(default=0)
    is_public = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    
    def __str__(self):
        return f"Metadata for Room {self.room.id}"


class Collaborator(models.Model):
    """Track active collaborators in a room"""
    
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='collaborators')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    cursor_position = models.JSONField(
        default=dict,
        help_text="Store cursor position {line, column}"
    )
    
    class Meta:
        unique_together = [['room', 'user']]
        indexes = [
            models.Index(fields=['room', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.username} in Room {self.room.id}"


class ChatMessage(models.Model):
    """Store chat messages for collaboration"""
    
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
        ]
    
    def __str__(self):
        return f"Message from {self.user.username} in Room {self.room.id}"


class SyncLog(models.Model):
    """Log synchronization events for debugging"""
    
    SYNC_TYPES = [
        ('code_save', 'Code Save'),
        ('language_change', 'Language Change'),
        ('user_join', 'User Join'),
        ('user_leave', 'User Leave'),
        ('cursor_update', 'Cursor Update'),
    ]
    
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='sync_logs')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    sync_type = models.CharField(max_length=20, choices=SYNC_TYPES)
    data = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['room', 'sync_type', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.sync_type} in Room {self.room.id}"
```

***

## 2️⃣ DJANGO SERIALIZERS (`rooms/serializers.py`)

```python
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Room, RoomCode, RoomMetadata, Collaborator, ChatMessage, SyncLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class RoomCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomCode
        fields = ['content', 'updated_at', 'last_saved_by']
        read_only_fields = ['updated_at']


class RoomMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomMetadata
        fields = ['last_accessed', 'access_count', 'is_public', 'description', 'tags']


class CollaboratorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Collaborator
        fields = ['user', 'joined_at', 'last_active', 'is_active', 'cursor_position']


class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class RoomDetailSerializer(serializers.ModelSerializer):
    code = RoomCodeSerializer(read_only=True)
    metadata = RoomMetadataSerializer(read_only=True)
    collaborators = CollaboratorSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Room
        fields = [
            'id', 'user', 'language', 'is_active', 'created_at', 'updated_at',
            'code', 'metadata', 'collaborators'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class RoomListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    code_preview = serializers.SerializerMethodField()
    collaborators_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = [
            'id', 'user', 'language', 'created_at', 'updated_at',
            'code_preview', 'collaborators_count', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_code_preview(self, obj):
        return obj.code.get_content_preview() if hasattr(obj, 'code') else ""
    
    def get_collaborators_count(self, obj):
        return obj.active_collaborators_count


class RoomCodeUpdateSerializer(serializers.Serializer):
    """Serializer for code updates"""
    content = serializers.CharField(allow_blank=True)
    language = serializers.ChoiceField(choices=Room.LANGUAGE_CHOICES, required=False)
    change_summary = serializers.CharField(required=False, allow_blank=True)


class RoomLanguageUpdateSerializer(serializers.Serializer):
    """Serializer for language updates"""
    language = serializers.ChoiceField(choices=Room.LANGUAGE_CHOICES)


class RoomMetadataFetchSerializer(serializers.ModelSerializer):
    """Lightweight serializer for room metadata"""
    class Meta:
        model = Room
        fields = ['id', 'language', 'created_at', 'updated_at']
```

***

## 3️⃣ DJANGO VIEWS & API ENDPOINTS (`rooms/views.py`)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, NotFound
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
import json
import logging

from .models import Room, RoomCode, RoomMetadata, Collaborator, ChatMessage, SyncLog
from .serializers import (
    RoomDetailSerializer, RoomListSerializer, RoomCodeUpdateSerializer,
    RoomLanguageUpdateSerializer, RoomMetadataFetchSerializer,
    RoomCodeSerializer, CollaboratorSerializer, ChatMessageSerializer
)

logger = logging.getLogger(__name__)


class RoomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Room management with synchronization support
    Handles:
    - Room CRUD operations
    - Code retrieval and updates
    - Language management
    - Collaborator tracking
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter rooms by current user"""
        return Room.objects.filter(user=self.request.user).prefetch_related(
            'code', 'metadata', 'collaborators__user'
        )
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return RoomListSerializer
        elif self.action == 'retrieve':
            return RoomDetailSerializer
        return RoomDetailSerializer
    
    def perform_create(self, serializer):
        """Set user on room creation"""
        serializer.save(user=self.request.user)
    
    @action(
        detail=True, 
        methods=['GET'],
        url_path='metadata',
        permission_classes=[IsAuthenticated]
    )
    def get_metadata(self, request, pk=None):
        """
        GET /api/rooms/{room_id}/metadata/
        Retrieve room metadata including language, creation time, etc.
        """
        try:
            room = self.get_object()
            
            # Update access count and last accessed time
            room.metadata.access_count += 1
            room.metadata.last_accessed = timezone.now()
            room.metadata.save()
            
            # Log the access
            SyncLog.objects.create(
                room=room,
                user=request.user,
                sync_type='code_save',
                data={'action': 'metadata_fetch'}
            )
            
            serializer = RoomMetadataFetchSerializer(room)
            response_data = serializer.data
            
            # Ensure language is included
            response_data['language'] = room.get_language_display()
            response_data['language_code'] = room.language
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        except Room.DoesNotExist:
            logger.warning(f"Room {pk} not found for user {request.user.id}")
            return Response(
                {'error': f'Room {pk} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching metadata: {str(e)}")
            return Response(
                {'error': 'Failed to fetch room metadata'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(
        detail=True,
        methods=['GET'],
        url_path='code',
        permission_classes=[IsAuthenticated]
    )
    def get_code(self, request, pk=None):
        """
        GET /api/rooms/{room_id}/code/
        Retrieve the current code content for a room
        """
        try:
            room = self.get_object()
            
            # Get or create RoomCode if it doesn't exist
            room_code, created = RoomCode.objects.get_or_create(room=room)
            
            serializer = RoomCodeSerializer(room_code)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Room.DoesNotExist:
            logger.warning(f"Room {pk} not found")
            return Response(
                {'error': f'Room {pk} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching code: {str(e)}")
            return Response(
                {'error': 'Failed to fetch code'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(
        detail=True,
        methods=['PUT'],
        url_path='code',
        permission_classes=[IsAuthenticated]
    )
    def update_code(self, request, pk=None):
        """
        PUT /api/rooms/{room_id}/code/
        Update code content for a room with auto-save
        """
        try:
            room = self.get_object()
            serializer = RoomCodeUpdateSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            content = serializer.validated_data['content']
            language = serializer.validated_data.get('language')
            change_summary = serializer.validated_data.get('change_summary', '')
            
            # Get or create RoomCode
            room_code, created = RoomCode.objects.get_or_create(room=room)
            
            # Save previous version if content changed
            if room_code.content != content:
                # Create version entry
                latest_version = room.code_versions.all().first()
                next_version = (latest_version.version_number + 1) if latest_version else 1
                
                RoomCodeVersion.objects.create(
                    room=room,
                    content=content,
                    version_number=next_version,
                    changed_by=request.user,
                    change_summary=change_summary or f"Updated by {request.user.username}"
                )
            
            # Update current code
            room_code.content = content
            room_code.last_saved_by = request.user
            room_code.save()
            
            # Update language if provided
            if language:
                room.language = language
                room.save()
            
            # Log sync event
            SyncLog.objects.create(
                room=room,
                user=request.user,
                sync_type='code_save',
                data={
                    'content_length': len(content),
                    'language': language,
                    'summary': change_summary
                }
            )
            
            return Response(
                {
                    'success': True,
                    'message': 'Code saved successfully',
                    'version': room.code_versions.count(),
                    'timestamp': timezone.now().isoformat()
                },
                status=status.HTTP_200_OK
            )
        
        except Room.DoesNotExist:
            return Response(
                {'error': f'Room {pk} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating code: {str(e)}")
            return Response(
                {'error': 'Failed to save code'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(
        detail=True,
        methods=['PUT'],
        url_path='language',
        permission_classes=[IsAuthenticated]
    )
    def update_language(self, request, pk=None):
        """
        PUT /api/rooms/{room_id}/language/
        Update the programming language for a room
        """
        try:
            room = self.get_object()
            serializer = RoomLanguageUpdateSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            language = serializer.validated_data['language']
            old_language = room.language
            
            # Update room language
            room.language = language
            room.save()
            
            # Log sync event
            SyncLog.objects.create(
                room=room,
                user=request.user,
                sync_type='language_change',
                data={
                    'old_language': old_language,
                    'new_language': language
                }
            )
            
            return Response(
                {
                    'success': True,
                    'message': f'Language updated to {room.get_language_display()}',
                    'language': language,
                    'timestamp': timezone.now().isoformat()
                },
                status=status.HTTP_200_OK
            )
        
        except Room.DoesNotExist:
            return Response(
                {'error': f'Room {pk} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating language: {str(e)}")
            return Response(
                {'error': 'Failed to update language'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(
        detail=True,
        methods=['GET'],
        url_path='collaborators',
        permission_classes=[IsAuthenticated]
    )
    def list_collaborators(self, request, pk=None):
        """
        GET /api/rooms/{room_id}/collaborators/
        List all active collaborators in a room
        """
        try:
            room = self.get_object()
            collaborators = room.collaborators.filter(is_active=True)
            serializer = CollaboratorSerializer(collaborators, many=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Room.DoesNotExist:
            return Response(
                {'error': f'Room {pk} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error listing collaborators: {str(e)}")
            return Response(
                {'error': 'Failed to list collaborators'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(
        detail=True,
        methods=['POST'],
        url_path='join',
        permission_classes=[IsAuthenticated]
    )
    def join_room(self, request, pk=None):
        """
        POST /api/rooms/{room_id}/join/
        Join a room as a collaborator
        """
        try:
            room = self.get_object()
            
            collaborator, created = Collaborator.objects.get_or_create(
                room=room,
                user=request.user,
                defaults={'is_active': True}
            )
            
            if not created:
                collaborator.is_active = True
                collaborator.last_active = timezone.now()
                collaborator.save()
            
            # Log sync event
            SyncLog.objects.create(
                room=room,
                user=request.user,
                sync_type='user_join',
                data={'username': request.user.username}
            )
            
            serializer = CollaboratorSerializer(collaborator)
            return Response(
                {
                    'success': True,
                    'message': 'Joined room successfully',
                    'collaborator': serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        except Room.DoesNotExist:
            return Response(
                {'error': f'Room {pk} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error joining room: {str(e)}")
            return Response(
                {'error': 'Failed to join room'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(
        detail=True,
        methods=['POST'],
        url_path='leave',
        permission_classes=[IsAuthenticated]
    )
    def leave_room(self, request, pk=None):
        """
        POST /api/rooms/{room_id}/leave/
        Leave a room (deactivate as collaborator)
        """
        try:
            room = self.get_object()
            
            collaborator = Collaborator.objects.filter(
                room=room,
                user=request.user
            ).first()
            
            if collaborator:
                collaborator.is_active = False
                collaborator.save()
            
            # Log sync event
            SyncLog.objects.create(
                room=room,
                user=request.user,
                sync_type='user_leave',
                data={'username': request.user.username}
            )
            
            return Response(
                {
                    'success': True,
                    'message': 'Left room successfully'
                },
                status=status.HTTP_200_OK
            )
        
        except Room.DoesNotExist:
            return Response(
                {'error': f'Room {pk} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error leaving room: {str(e)}")
            return Response(
                {'error': 'Failed to leave room'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(
        detail=True,
        methods=['GET'],
        url_path='versions',
        permission_classes=[IsAuthenticated]
    )
    def list_versions(self, request, pk=None):
        """
        GET /api/rooms/{room_id}/versions/
        List version history for a room's code
        """
        try:
            room = self.get_object()
            versions = room.code_versions.all()[:20]  # Get last 20 versions
            
            version_data = [
                {
                    'version': v.version_number,
                    'changed_by': v.changed_by.username if v.changed_by else 'Unknown',
                    'change_summary': v.change_summary,
                    'created_at': v.created_at.isoformat(),
                    'content_length': len(v.content)
                }
                for v in versions
            ]
            
            return Response(version_data, status=status.HTTP_200_OK)
        
        except Room.DoesNotExist:
            return Response(
                {'error': f'Room {pk} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error listing versions: {str(e)}")
            return Response(
                {'error': 'Failed to list versions'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
```

***

## 4️⃣ DJANGO URLS (`rooms/urls.py`)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet

router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')

urlpatterns = [
    path('api/', include(router.urls)),
]
```

***

## 5️⃣ DJANGO CHANNELS SETUP (`rooms/consumers.py`)

```python
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Room, RoomCode, Collaborator, SyncLog

logger = logging.getLogger(__name__)


class RoomConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time room collaboration
    Handles real-time code, language, and collaborator updates
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        try:
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.user = self.scope['user']
            self.room_group_name = f'room_{self.room_id}'
            
            # Verify user has access to room
            has_access = await self.check_room_access()
            if not has_access:
                await self.close()
                return
            
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            # Register user as active collaborator
            await self.add_collaborator()
            
            # Accept connection
            await self.accept()
            
            # Notify others that user joined
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_joined',
                    'username': self.user.username,
                    'user_id': self.user.id,
                    'timestamp': timezone.now().isoformat()
                }
            )
            
            logger.info(f"User {self.user.username} connected to room {self.room_id}")
        
        except Exception as e:
            logger.error(f"Connection error: {str(e)}")
            await self.close()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            # Remove user from collaborators
            await self.remove_collaborator()
            
            # Notify others that user left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'username': self.user.username,
                    'user_id': self.user.id,
                    'timestamp': timezone.now().isoformat()
                }
            )
            
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            
            logger.info(f"User {self.user.username} disconnected from room {self.room_id}")
        
        except Exception as e:
            logger.error(f"Disconnection error: {str(e)}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'code_update':
                await self.handle_code_update(data)
            elif message_type == 'language_change':
                await self.handle_language_change(data)
            elif message_type == 'cursor_position':
                await self.handle_cursor_position(data)
            elif message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            else:
                logger.warning(f"Unknown message type: {message_type}")
        
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
            await self.send_error("Invalid message format")
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            await self.send_error(str(e))
    
    # Message handlers
    
    async def handle_code_update(self, data):
        """
        Handle code content updates from clients
        """
        try:
            content = data.get('content', '')
            change_summary = data.get('summary', '')
            
            # Save to database
            await self.save_code_to_db(content, change_summary)
            
            # Broadcast to all room members
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'code_updated',
                    'content': content,
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'timestamp': timezone.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Code update error: {str(e)}")
            await self.send_error(f"Failed to update code: {str(e)}")
    
    async def handle_language_change(self, data):
        """
        Handle language changes
        """
        try:
            language = data.get('language')
            
            if not language:
                await self.send_error("Language not specified")
                return
            
            # Update in database
            await self.update_room_language(language)
            
            # Broadcast to all room members
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'language_changed',
                    'language': language,
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'timestamp': timezone.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Language change error: {str(e)}")
            await self.send_error(f"Failed to change language: {str(e)}")
    
    async def handle_cursor_position(self, data):
        """
        Handle cursor position updates for collaborative editing
        """
        try:
            cursor_position = data.get('position', {})
            
            # Update collaborator's cursor position
            await self.update_cursor_position(cursor_position)
            
            # Broadcast cursor position to other users (not back to sender)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'cursor_position_updated',
                    'cursor_position': cursor_position,
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'timestamp': timezone.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Cursor position error: {str(e)}")
    
    async def handle_chat_message(self, data):
        """Handle chat messages"""
        try:
            content = data.get('content', '').strip()
            
            if not content:
                await self.send_error("Message cannot be empty")
                return
            
            # Save message to database
            message_id = await self.save_chat_message(content)
            
            # Broadcast to all room members
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message_sent',
                    'message_id': message_id,
                    'content': content,
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'timestamp': timezone.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Chat message error: {str(e)}")
            await self.send_error(f"Failed to send message: {str(e)}")
    
    # Group message handlers (receive from group_send)
    
    async def code_updated(self, event):
        """Broadcast code update to WebSocket"""
        if event['user_id'] != self.user.id:  # Don't send back to sender
            await self.send(text_data=json.dumps({
                'type': 'code_updated',
                'content': event['content'],
                'user': event['username'],
                'timestamp': event['timestamp']
            }))
    
    async def language_changed(self, event):
        """Broadcast language change to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'language_changed',
            'language': event['language'],
            'user': event['username'],
            'timestamp': event['timestamp']
        }))
    
    async def cursor_position_updated(self, event):
        """Broadcast cursor position update to WebSocket"""
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'cursor_position_updated',
                'cursor_position': event['cursor_position'],
                'user': event['username'],
                'user_id': event['user_id'],
                'timestamp': event['timestamp']
            }))
    
    async def chat_message_sent(self, event):
        """Broadcast chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message_id': event['message_id'],
            'content': event['content'],
            'user': event['username'],
            'timestamp': event['timestamp']
        }))
    
    async def user_joined(self, event):
        """Notify of user joining"""
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_joined',
                'username': event['username'],
                'timestamp': event['timestamp']
            }))
    
    async def user_left(self, event):
        """Notify of user leaving"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'username': event['username'],
            'timestamp': event['timestamp']
        }))
    
    # Database operations
    
    @database_sync_to_async
    def check_room_access(self):
        """Verify user has access to room"""
        try:
            room = Room.objects.get(id=self.room_id, user=self.user)
            return True
        except Room.DoesNotExist:
            return False
    
    @database_sync_to_async
    def add_collaborator(self):
        """Register user as active collaborator"""
        try:
            room = Room.objects.get(id=self.room_id)
            collaborator, created = Collaborator.objects.get_or_create(
                room=room,
                user=self.user
            )
            collaborator.is_active = True
            collaborator.last_active = timezone.now()
            collaborator.save()
            return collaborator
        except Exception as e:
            logger.error(f"Error adding collaborator: {str(e)}")
    
    @database_sync_to_async
    def remove_collaborator(self):
        """Deactivate user as collaborator"""
        try:
            collaborator = Collaborator.objects.filter(
                room_id=self.room_id,
                user=self.user
            ).first()
            if collaborator:
                collaborator.is_active = False
                collaborator.save()
        except Exception as e:
            logger.error(f"Error removing collaborator: {str(e)}")
    
    @database_sync_to_async
    def save_code_to_db(self, content, change_summary=''):
        """Save code content to database"""
        try:
            room = Room.objects.get(id=self.room_id)
            room_code, created = RoomCode.objects.get_or_create(room=room)
            
            # Create version if content changed
            if room_code.content != content:
                latest_version = room.code_versions.first()
                next_version = (latest_version.version_number + 1) if latest_version else 1
                
                from .models import RoomCodeVersion
                RoomCodeVersion.objects.create(
                    room=room,
                    content=content,
                    version_number=next_version,
                    changed_by=self.user,
                    change_summary=change_summary or f"Updated by {self.user.username}"
                )
            
            # Update current code
            room_code.content = content
            room_code.last_saved_by = self.user
            room_code.save()
            
            # Log sync event
            SyncLog.objects.create(
                room=room,
                user=self.user,
                sync_type='code_save',
                data={'content_length': len(content)}
            )
            
        except Exception as e:
            logger.error(f"Error saving code to database: {str(e)}")
            raise
    
    @database_sync_to_async
    def update_room_language(self, language):
        """Update room language"""
        try:
            room = Room.objects.get(id=self.room_id)
            old_language = room.language
            room.language = language
            room.save()
            
            # Log sync event
            SyncLog.objects.create(
                room=room,
                user=self.user,
                sync_type='language_change',
                data={'old': old_language, 'new': language}
            )
            
        except Exception as e:
            logger.error(f"Error updating language: {str(e)}")
            raise
    
    @database_sync_to_async
    def update_cursor_position(self, cursor_position):
        """Update collaborator's cursor position"""
        try:
            collaborator = Collaborator.objects.get(
                room_id=self.room_id,
                user=self.user
            )
            collaborator.cursor_position = cursor_position
            collaborator.last_active = timezone.now()
            collaborator.save()
        except Collaborator.DoesNotExist:
            pass
        except Exception as e:
            logger.error(f"Error updating cursor position: {str(e)}")
    
    @database_sync_to_async
    def save_chat_message(self, content):
        """Save chat message to database"""
        try:
            from .models import ChatMessage
            room = Room.objects.get(id=self.room_id)
            message = ChatMessage.objects.create(
                room=room,
                user=self.user,
                content=content
            )
            return message.id
        except Exception as e:
            logger.error(f"Error saving chat message: {str(e)}")
            raise
    
    async def send_error(self, error_message):
        """Send error message to client"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message,
            'timestamp': timezone.now().isoformat()
        }))
```
