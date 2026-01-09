from rest_framework.views import APIView
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.shortcuts import get_object_or_404
from .models import Room, Message, RoomHistory, User
from .serializers import UserSerializer, SignUpSerializer, RoomSerializer, MessageSerializer, RoomHistorySerializer
from .ai_service import GeminiService
import random
import string

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignUpSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Total sessions could be tracked by RoomHistory
        total_sessions = RoomHistory.objects.filter(user_id=user.username).count()
        rooms_created = Room.objects.filter(owner=user).count()
        
        # Simple stats for demo
        stats = {
            'totalSessions': total_sessions,
            'roomsCreated': rooms_created,
            'languagesUsed': ['JavaScript', 'Python'], # Placeholder
            'lastActive': user.last_login
        }
        return Response(stats)

        return Response(stats)

class MyRoomsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RoomSerializer

    def get_queryset(self):
        return Room.objects.filter(owner=self.request.user).order_by('-created_at')

class CreateRoomView(APIView):
    # Allow anyone to create room, but associate if logged in
    permission_classes = [permissions.AllowAny] 
    
    def post(self, request):
        room_id = str(random.randint(10000000, 99999999))
        
        owner = None
        if request.user.is_authenticated:
            owner = request.user
            
        room = Room.objects.create(room_id=room_id, owner=owner)
        return Response({'roomId': room_id}, status=status.HTTP_201_CREATED)

# --- Lean Fixes for Synchronization & Persistence ---

from core.sockets import sio
from asgiref.sync import async_to_sync

class RoomMetadataView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        # Allow finding by internal ID or room_id string
        room = get_object_or_404(Room, room_id=room_id)
        # In a real app check permissions (owner or participant)
        
        return Response({
            'room_id': room.room_id,
            'language': room.language,
            'language_display': room.language, # Simplified for now
            'created_at': room.created_at.isoformat(),
            'updated_at': room.updated_at.isoformat(),
        })

class RoomLanguageView(APIView):
    permission_classes = [permissions.AllowAny]

    def put(self, request, room_id):
        room = get_object_or_404(Room, room_id=room_id)
        
        language = request.data.get('language')
        if not language:
            return Response({'error': 'Language not provided'}, status=400)
        
        room.language = language
        room.save()
        
        # Broadcast via Socket.IO
        # Note: emit is async, use async_to_sync if needed, 
        # but sio.emit returns a coroutine. 
        # However, inside Sync view, we should use async_to_sync.
        async_to_sync(sio.emit)('language_updated', {
            'room_id': room.room_id,
            'language': language,
            'user': request.user.username if request.user.is_authenticated else "Guest"
        }, room=room.room_id)
        
        return Response({
            'success': True,
            'language': language,
            'message': f'Room language updated to {language}'
        })

class RoomCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        room = get_object_or_404(Room, room_id=room_id)
        return Response({
            'room_id': room.room_id,
            'content': room.code
        })

    def post(self, request, room_id):
        # Handle both POST and PUT
        return self.put(request, room_id)

    def put(self, request, room_id):
        room = get_object_or_404(Room, room_id=room_id)
        content = request.data.get('content', '')
        
        room.code = content
        room.save()
        
        return Response({
            'success': True,
            'message': 'Code saved successfully',
            'timestamp': room.updated_at.isoformat()
        })


class RoomMessageView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        room = get_object_or_404(Room, room_id=room_id)
        # Fetch messages since a specific timestamp if provided (optimization)
        # For now, return recent 50 messages
        messages = room.messages.all().order_by('timestamp')
        # Serialize manually or use serializer. doing manually to match existing structure in RoomDetail
        message_list = [{
            'id': m.id,
            'userId': m.user_id,
            'content': m.content,
            'type': m.type,
            'isVoice': m.is_voice,
            'attachmentUrl': m.attachment_url if m.attachment_url else (m.attachment.url if m.attachment else None),
            'timestamp': m.timestamp.isoformat()
        } for m in messages]
        return Response(message_list)

    def post(self, request, room_id):
        room = get_object_or_404(Room, room_id=room_id)
        
        user_id = request.data.get('userId', 'Guest')
        content = request.data.get('content', '')
        msg_type = request.data.get('type', 'TEXT')
        file_url = request.data.get('fileUrl')
        
        if not content and not file_url:
             return Response({'error': 'Content required'}, status=400)

        message = Message.objects.create(
            room=room,
            user_id=user_id,
            content=content,
            type=msg_type,
            attachment_url=file_url
        )
        
        # Serialize and return
        return Response({
            'id': message.id,
            'userId': message.user_id,
            'content': message.content,
            'type': message.type,
            'attachmentUrl': message.attachment_url,
            'timestamp': message.timestamp.isoformat()
        }, status=201)


class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save implicitly via a temporary Message or just save file?
        # Better: Just save to storage and return URL, let client attach URL to socket message.
        # But we want to use Django's storage system.
        # We can create a Message with no room initially? Or just a standalone Media model?
        # For simplicity in this hackathon, let's just use FileSystemStorage manually or a dummy model.
        # Actually, let's use the Message model but we need a room.
        # Alternative: Just return the URL if we save it manually using default storage.
        
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        
        path = default_storage.save(f"uploads/{file_obj.name}", ContentFile(file_obj.read()))
        url = default_storage.url(path)
        
        return Response({'url': url, 'filename': file_obj.name})

class RootView(APIView):
    def get(self, request):
        return Response({'message': 'CodeConnect Backend API is running'})

class RoomDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        try:
            room = Room.objects.get(room_id=room_id)
            
            # Privacy Check
            if not room.is_public:
                if not request.user.is_authenticated or room.owner != request.user:
                    return Response({'error': 'This room is private'}, status=status.HTTP_403_FORBIDDEN)

            messages = room.messages.all().order_by('timestamp')
            message_list = [{
                'id': m.id,
                'userId': m.user_id,
                'content': m.content,
                'type': m.type,
                'isVoice': m.is_voice,
                'attachmentUrl': m.attachment_url if m.attachment_url else (m.attachment.url if m.attachment else None),
                'timestamp': m.timestamp
            } for m in messages]
            
            return Response({
                'roomId': room.room_id,
                'code': room.code,
                'language': room.language,
                'messages': message_list,
                'owner': room.owner.username if room.owner else None,
                'isPublic': room.is_public
            })
        except Room.DoesNotExist:
            return Response({'code': '', 'language': 'javascript', 'messages': []})

# AI Endpoints
class AIChatView(APIView):
    permission_classes = [permissions.AllowAny] # Or IsAuthenticated

    def post(self, request):
        prompt = request.data.get('prompt')
        context = request.data.get('context', '')
        if not prompt:
            return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

        service = GeminiService()
        response = service.chat_with_ai(prompt, context)
        return Response({'response': response})

class AIExplainView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        language = request.data.get('language', 'javascript')
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

        service = GeminiService()
        response = service.explain_code(code, language)
        return Response({'response': response})

class AIInterviewView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        difficulty = request.data.get('difficulty', 'medium')
        topic = request.data.get('topic', 'algorithms')

        service = GeminiService()
        response = service.generate_interview_question(difficulty, topic)
        return Response({'response': response})

from django.core.cache import cache

class TypingStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, room_id):
        user_id = request.data.get('userId')
        is_typing = request.data.get('isTyping', False)
        
        if not user_id:
            return Response({'error': 'userId required'}, status=400)
            
        key = f'room_typing_users_{room_id}'
        typing_users = cache.get(key, {})
        
        import time
        if is_typing:
            typing_users[user_id] = time.time()
        else:
            if user_id in typing_users:
                del typing_users[user_id]
        
        # Simple cleanup of old entries
        current_time = time.time()
        typing_users = {uid: ts for uid, ts in typing_users.items() if current_time - ts < 5}
                
        cache.set(key, typing_users, timeout=10)
            
        return Response({'success': True})

class RoomTypingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        key = f'room_typing_users_{room_id}'
        typing_users = cache.get(key, {})
        
        import time
        current_time = time.time()
        active_users = []
        
        for uid, timestamp in typing_users.items():
            if current_time - timestamp < 4:
                active_users.append(uid)
        
        return Response(active_users)

class LeaderboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        users = User.objects.all()
        leaderboard = []
        
        for user in users:
            # Aggregate stats
            rooms_count = Room.objects.filter(owner=user).count()
            # Note: Message user_id is a string, so we filter by username. 
            # Ideally we should use ForeignKey in Message too, but adhering to existing schema.
            messages_count = Message.objects.filter(user_id=user.username).count()
            
            # Simple point system: 10 pts per room, 1 pt per message
            points = (rooms_count * 10) + messages_count
            
            leaderboard.append({
                'username': user.username,
                'avatar': user.avatar,
                'rooms': rooms_count,
                'messages': messages_count,
                'points': points
            })
            
        # Sort by points descending
        leaderboard.sort(key=lambda x: x['points'], reverse=True)
        
        # Return top 10
        return Response(leaderboard[:10])
