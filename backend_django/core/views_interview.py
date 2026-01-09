from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Question, InterviewSession, Room, User
from django.shortcuts import get_object_or_404
import uuid

class QuestionListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        difficulty = request.query_params.get('difficulty')
        topic = request.query_params.get('topic')
        
        questions = Question.objects.all()
        
        if difficulty:
            questions = questions.filter(difficulty=difficulty)
        if topic:
            questions = questions.filter(topic=topic)
            
        data = []
        for q in questions:
            data.append({
                'id': q.id,
                'title': q.title,
                'content': q.content,
                'difficulty': q.difficulty,
                'topic': q.topic
            })
            
        # If empty (first run), populate mock data
        if not data:
            self._populate_mock_questions()
            return self.get(request)
            
        return Response(data)

    def _populate_mock_questions(self):
        mock_qs = [
            {'title': 'Two Sum', 'difficulty': 'Easy', 'content': 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'topic': 'Array'},
            {'title': 'Reverse Linked List', 'difficulty': 'Easy', 'content': 'Given the head of a singly linked list, reverse the list, and return the reversed list.', 'topic': 'LinkedList'},
            {'title': 'LRU Cache', 'difficulty': 'Medium', 'content': 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.', 'topic': 'Design'},
            {'title': 'Merge Intervals', 'difficulty': 'Medium', 'content': 'Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals.', 'topic': 'Array'},
            {'title': 'Valid Parentheses', 'difficulty': 'Easy', 'content': 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.', 'topic': 'Stack'}
        ]
        for mq in mock_qs:
            Question.objects.create(**mq)

class InterviewSessionView(APIView):
    permission_classes = [permissions.AllowAny] # In prod, should be IsAuthenticated

    def get(self, request, room_id):
        # session = get_object_or_404(InterviewSession, room__room_id=room_id)
        # Using filter to avoid 404 if not created yet
        session = InterviewSession.objects.filter(room__room_id=room_id).first()
        
        if not session:
            return Response({'notes': '', 'score': 0})
            
        return Response({
            'notes': session.notes,
            'score': session.score,
            'status': session.status
        })

    def post(self, request, room_id):
        room = get_object_or_404(Room, room_id=room_id)
        
        # Get or Create Session
        session, created = InterviewSession.objects.get_or_create(room=room)
        
        # Update fields
        session.notes = request.data.get('notes', session.notes)
        session.score = request.data.get('score', session.score)
        
        # Ideally set interviewer if authenticated
        if request.user.is_authenticated:
            session.interviewer = request.user
            
        session.save()
        
        return Response({'success': True, 'id': session.id})

class InterviewHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Filter sessions where the current user is the interviewer
        sessions = InterviewSession.objects.filter(interviewer=request.user).order_by('-created_at')
        
        data = []
        for s in sessions:
            data.append({
                'id': s.id,
                'room_id': s.room.room_id,
                'candidate_name': s.candidate_name,
                'score': s.score,
                'status': s.status,
                'created_at': s.created_at
            })
            
        return Response(data)
