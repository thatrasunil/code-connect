from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from utils.mongodb import db_manager
from bson.objectid import ObjectId
import json
from datetime import datetime

@require_http_methods(["GET"])
def get_questions(request):
    """Get all coding questions from MongoDB"""
    try:
        db = db_manager.db
        questions = list(db['questions'].find({}, {
            '_id': 1, 'title': 1, 'difficulty': 1, 'category': 1
        }).limit(50))
        
        for q in questions:
            q['_id'] = str(q['_id'])
        
        return JsonResponse({
            'status': 'success',
            'count': len(questions),
            'data': questions
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@require_http_methods(["POST"])
def save_quiz_result(request):
    """Save quiz result to MongoDB"""
    try:
        db = db_manager.db
        data = json.loads(request.body)
        
        result_doc = {
            'userId': data.get('userId'),
            'score': data.get('score'),
            'category': data.get('category'),
            'answers': data.get('answers', []),
            'completedAt': datetime.utcnow()
        }
        
        result = db['quiz_results'].insert_one(result_doc)
        
        return JsonResponse({
            'status': 'success',
            'resultId': str(result.inserted_id)
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)
