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
    password = models.CharField(max_length=100, blank=True, null=True) # For private rooms
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

class Question(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=200)
    content = models.TextField() # Description / Problem Statement
    difficulty = models.CharField(max_length=20, choices=[('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard')])
    topic = models.CharField(max_length=50, default='Algorithms')
    input_format = models.TextField(blank=True, default="")
    output_format = models.TextField(blank=True, default="")
    constraints = models.TextField(blank=True, default="")
    example_cases = models.TextField(blank=True, default="") # JSON or string representation
    
    class Meta:
        db_table = 'questions'

class InterviewSession(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    room = models.ForeignKey(Room, related_name='session', on_delete=models.CASCADE)
    interviewer = models.ForeignKey(User, related_name='conducted_interviews', on_delete=models.SET_NULL, null=True)
    candidate_name = models.CharField(max_length=100, default='Candidate')
    notes = models.TextField(blank=True, default="")
    score = models.IntegerField(default=0) # 0-10 or 0-100
    status = models.CharField(max_length=20, choices=[('Active', 'Active'), ('Completed', 'Completed')], default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'interview_sessions'

class TestCase(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    question = models.ForeignKey(Question, related_name='test_cases', on_delete=models.CASCADE)
    input_data = models.TextField() # JSON string or plain text
    expected_output = models.TextField()
    is_hidden = models.BooleanField(default=False) # Hidden test cases for final submission
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'test_cases'

class Submission(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, related_name='submissions', on_delete=models.CASCADE, null=True)
    question = models.ForeignKey(Question, related_name='submissions', on_delete=models.CASCADE)
    room = models.ForeignKey(Room, related_name='submissions', on_delete=models.CASCADE, null=True)
    code = models.TextField()
    language = models.CharField(max_length=50, default='javascript')
    status = models.CharField(max_length=20, choices=[
        ('Accepted', 'Accepted'),
        ('Wrong Answer', 'Wrong Answer'),
        ('Runtime Error', 'Runtime Error'),
        ('Time Limit Exceeded', 'Time Limit Exceeded')
    ], default='Accepted')
    runtime = models.IntegerField(null=True, blank=True) # in milliseconds
    memory = models.IntegerField(null=True, blank=True) # in KB
    passed_tests = models.IntegerField(default=0)
    total_tests = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'submissions'

class RoomParticipant(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    room = models.ForeignKey(Room, related_name='participants_roles', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='room_roles', on_delete=models.CASCADE, null=True)
    user_id_str = models.CharField(max_length=255, blank=True) # For guest users
    role = models.CharField(max_length=20, choices=[
        ('INTERVIEWER', 'Interviewer'),
        ('CANDIDATE', 'Candidate'),
        ('VIEWER', 'Viewer')
    ], default='CANDIDATE')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'room_participants'
        unique_together = ['room', 'user']

class Quiz(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100) # e.g., "Python", "React", "Algorithms"
    image_url = models.CharField(max_length=500, blank=True, null=True) # Cover image
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quizzes'

class QuizQuestion(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    options = models.JSONField() # List of strings: ["Option A", "Option B", ...]
    correct_answer = models.IntegerField() # Index of the correct option (0-3)
    explanation = models.TextField(blank=True)

    class Meta:
        db_table = 'quiz_questions'

class QuizResult(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, related_name='quiz_results', on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, related_name='results', on_delete=models.CASCADE)
    score = models.IntegerField() # Number of correct answers
    total_questions = models.IntegerField()
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quiz_results'
