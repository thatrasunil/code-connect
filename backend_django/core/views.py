from rest_framework.views import APIView
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.shortcuts import get_object_or_404
from .models import User, Room, Message, RoomHistory, Question, TestCase, Submission, Quiz, QuizQuestion, QuizResult
from .serializers import (
    UserSerializer, SignUpSerializer, RoomSerializer, MessageSerializer, 
    RoomHistorySerializer, QuestionSerializer, SubmissionSerializer,
    QuizSerializer, QuizDetailSerializer, QuizResultSerializer
)
from .ai_service import GeminiService
from .utils.firebase_client import get_firestore_client
import random
import string
import time
import datetime
from firebase_admin import firestore

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignUpSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        
        is_public = request.data.get('isPublic', True)
        password = request.data.get('password', '')
        
        owner_username = None
        if request.user.is_authenticated:
            owner_username = request.user.username
            
        # Create in Firestore (Preferred) or Django ORM (Fallback)
        db = get_firestore_client()
        created_in_firestore = False
        
        if db:
            try:
                room_data = {
                    'roomId': room_id,
                    'code': '',
                    'language': 'javascript',
                    'messages': [],
                    'users': [],
                    'owner': owner_username,
                    'createdAt': datetime.datetime.now().isoformat(),
                    'isPublic': is_public,
                    'password': password
                }
                db.collection('rooms').document(room_id).set(room_data)
                created_in_firestore = True
            except Exception as e:
                print(f"Firestore Create Warning: {e}")
        
        # Always create/sync to SQLite if possible
        try:
             Room.objects.create(
                room_id=room_id, 
                owner=request.user if request.user.is_authenticated else None,
                is_public=is_public,
                password=password
            )
        except Exception as e:
            print(f"Django Create Error: {e}")
            if not created_in_firestore:
                 return Response({'error': 'Failed to create room'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'roomId': room_id}, status=status.HTTP_201_CREATED)

# --- Lean Fixes for Synchronization & Persistence ---

from core.sockets import sio
from asgiref.sync import async_to_sync

class RoomMetadataView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        db = get_firestore_client()
        if not db: return Response({})
        
        try:
            doc = db.collection('rooms').document(room_id).get()
            if not doc.exists:
                return Response({'error': 'Room not found'}, status=404)
            
            room_data = doc.to_dict()
            return Response({
                'room_id': room_data.get('roomId'),
                'language': room_data.get('language', 'javascript'),
                'language_display': room_data.get('language', 'javascript'),
                'created_at': room_data.get('createdAt'),
                'updated_at': datetime.datetime.now().isoformat(), # approximate
            })
        except Exception:
            return Response({'error': 'Fetch error'}, status=500)

class RoomLanguageView(APIView):
    permission_classes = [permissions.AllowAny]

    def put(self, request, room_id):
        language = request.data.get('language')
        if not language:
            return Response({'error': 'Language not provided'}, status=400)
            
        db = get_firestore_client()
        if db:
            try:
                db.collection('rooms').document(room_id).update({'language': language})
                return Response({
                    'success': True,
                    'language': language,
                    'message': f'Room language updated to {language}'
                })
            except Exception as e:
                print(f"Language Update Error: {e}")
                return Response({'error': 'Update failed'}, status=500)
        return Response({'error': 'Database Error'}, status=500)

class RoomCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        db = get_firestore_client()
        found_code = None
        
        if db:
            try:
                doc = db.collection('rooms').document(room_id).get()
                if doc.exists:
                    found_code = doc.to_dict().get('code', '')
            except Exception:
                pass
        
        if found_code is None:
            # Fallback to SQL
            room = Room.objects.filter(room_id=room_id).first()
            if room:
                found_code = room.code
        
        if found_code is not None:
            return Response({
                'room_id': room_id,
                'content': found_code
            })
            
        return Response({'content': ''})

    def post(self, request, room_id):
        return self.put(request, room_id)

    def put(self, request, room_id):
        content = request.data.get('content', '')
        
        db = get_firestore_client()
        updated_firestore = False
        
        if db:
            try:
                db.collection('rooms').document(room_id).update({'code': content})
                updated_firestore = True
            except Exception as e:
                print(f"Code Update Warning (Firestore): {e}")

        # Always try to update local DB as fallback or primary
        try:
             room = Room.objects.filter(room_id=room_id).first()
             if room:
                 room.code = content
                 room.save()
                 return Response({
                    'success': True,
                    'message': 'Code saved successfully',
                    'timestamp': datetime.datetime.now().isoformat()
                 })
        except Exception as e:
            print(f"Code Update Error (SQL): {e}")

        if updated_firestore:
             return Response({
                'success': True,
                'message': 'Code saved successfully (Firestore)',
                'timestamp': datetime.datetime.now().isoformat()
            })

        return Response({'error': 'Update failed'}, status=500)


class RoomMessageView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        # Already handled in RoomDetail, but if fetched separately:
        db = get_firestore_client()
        messages = None
        
        if db:
            try:
                doc = db.collection('rooms').document(room_id).get()
                if doc.exists:
                    messages = doc.to_dict().get('messages', [])
            except Exception:
                pass

        if messages is None:
             # Fallback to SQL
            room = Room.objects.filter(room_id=room_id).first()
            if room:
                # Retrieve from Message model
                msgs = Message.objects.filter(room=room).order_by('timestamp')
                messages = []
                for m in msgs:
                    messages.append({
                        'id': m.id,
                        'userId': m.user_id,
                        'content': m.content,
                        'type': m.type,
                        'attachmentUrl': m.attachment_url,
                        'timestamp': m.timestamp.isoformat()
                    })

        return Response(messages if messages is not None else [])

    def post(self, request, room_id):
        user_id = request.data.get('userId', 'Guest')
        content = request.data.get('content', '')
        msg_type = request.data.get('type', 'TEXT')
        file_url = request.data.get('fileUrl')
        
        if not content and not file_url:
             return Response({'error': 'Content required'}, status=400)
             
        new_message = {
            'id': int(time.time() * 1000),
            'userId': user_id,
            'content': content,
            'type': msg_type,
            'attachmentUrl': file_url,
            'timestamp': datetime.datetime.now().isoformat()
        }

        db = get_firestore_client()
        saved_firestore = False
        
        if db:
            try:
                # Atomically add to array in Firestore
                db.collection('rooms').document(room_id).update({
                    'messages': firestore.ArrayUnion([new_message])
                })
                saved_firestore = True
            except Exception as e:
                print(f"Message Save Warning (Firestore): {e}")
        
        # Always try saving to SQL
        try:
            room = Room.objects.filter(room_id=room_id).first()
            if room:
                # Save to Message model
                Message.objects.create(
                    room=room,
                    user_id=user_id,
                    content=content,
                    type=msg_type,
                    attachment_url=file_url,
                    timestamp=datetime.datetime.now()
                )
                return Response(new_message, status=201)
        except Exception as e:
             print(f"Message Save Error (SQL): {e}")

        if saved_firestore:
            return Response(new_message, status=201)
            
        return Response({'error': 'Failed to save message'}, status=500)


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
        # Get relative URL and convert to absolute URL
        relative_url = default_storage.url(path)
        # Build absolute URL with request host
        absolute_url = request.build_absolute_uri(relative_url)
        
        return Response({'url': absolute_url, 'filename': file_obj.name})

class RootView(APIView):
    def get(self, request):
        return Response({'message': 'CodeConnect Backend API is running'})

class RoomDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        db = get_firestore_client()
        room_data = None
        
        # 1. Fetch Room Logic (Firestore or Django)
        if db:
            try:
                doc_ref = db.collection('rooms').document(room_id)
                doc = doc_ref.get()
                if doc.exists:
                    room_data = doc.to_dict()
            except Exception as e:
                 print(f"Firestore Fetch Error: {e}")

        if not room_data:
            # Fallback to Django
            room = Room.objects.filter(room_id=room_id).first()
            if room:
                room_data = {
                    'roomId': room.room_id,
                    'code': room.code,
                    'language': room.language,
                    'messages': [], 
                    'owner': room.owner.username if room.owner else None,
                    'isPublic': room.is_public,
                    'password': room.password
                }

        if not room_data:
             return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

        # 2. Access Control Logic
        is_public = room_data.get('isPublic', True)
        if not is_public:
            # Check owner
            owner = room_data.get('owner')
            if request.user.is_authenticated and request.user.username == owner:
                pass # Owner has access
            else:
                # Check Password
                provided_password = request.headers.get('X-Room-Password') or request.query_params.get('password')
                correct_password = room_data.get('password', '')
                
                if provided_password != correct_password:
                     return Response({
                         'error': 'Password required',
                         'isPublic': False,
                         'roomId': room_id
                     }, status=status.HTTP_403_FORBIDDEN)

        # 3. Return Data (Sanitize Password)
        return Response({
            'roomId': room_data.get('roomId'),
            'code': room_data.get('code', ''),
            'language': room_data.get('language', 'javascript'),
            'messages': room_data.get('messages', []), # Usually empty in detail view unless synced
            'owner': room_data.get('owner'),
            'isPublic': is_public
        })

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

class HeartbeatView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, room_id):
        user_id = request.data.get('userId')
        username = request.data.get('username', 'Guest')
        avatar = request.data.get('avatar') # Optional
        
        if not user_id:
            return Response({'error': 'userId required'}, status=400)
            
        key = f'room_participants_{room_id}'
        participants = cache.get(key, {})
        
        # Update timestamp and info
        participants[user_id] = {
            'username': username,
            'avatar': avatar,
            'last_seen': time.time()
        }
        
        # Cleanup old participants (timeout > 10s)
        current_time = time.time()
        participants = {uid: data for uid, data in participants.items() if current_time - data['last_seen'] < 10}
        
        cache.set(key, participants, timeout=30)
        return Response({'success': True})

class RoomParticipantsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        key = f'room_participants_{room_id}'
        participants = cache.get(key, {})
        
        # Return list of participant info
        active_list = []
        current_time = time.time()
        
        for uid, data in participants.items():
            if current_time - data['last_seen'] < 10:
                active_list.append({
                    'userId': uid,
                    'name': data['username'],
                    'avatar': data.get('avatar')
                })
                
        return Response(active_list)

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

class QuizListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = QuizSerializer
    queryset = Quiz.objects.all()

class QuizDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = QuizDetailSerializer
    queryset = Quiz.objects.all()
    lookup_field = 'id'

class QuizSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            answers = request.data.get('answers', {}) # Dict: { question_id: option_index }
            
            score = 0
            total = quiz.questions.count()
            results = []

            for question in quiz.questions.all():
                user_answer = answers.get(str(question.id))
                is_correct = False
                if user_answer is not None and int(user_answer) == question.correct_answer:
                    score += 1
                    is_correct = True
                
                results.append({
                    'question_id': question.id,
                    'is_correct': is_correct,
                    'correct_answer': question.correct_answer,
                    'explanation': question.explanation
                })
            
            # Save result
            QuizResult.objects.create(
                user=request.user,
                quiz=quiz,
                score=score,
                total_questions=total
            )

            return Response({
                'score': score,
                'total': total,
                'results': results
            })

        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
