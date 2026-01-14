from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .utils.firebase_client import get_firestore_client
from django.conf import settings

class AssignRoleView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, room_id):
        # Firestore Logic Only
        user_id = request.data.get('userId')
        role = request.data.get('role', 'CANDIDATE')
        
        if role not in ['INTERVIEWER', 'CANDIDATE', 'VIEWER']:
            return Response({'error': 'Invalid role'}, status=400)
            
        db = get_firestore_client()
        if not db:
             return Response({'error': 'Database unavailable'}, status=503)
             
        doc_ref = db.collection('rooms').document(room_id)
        
        try:
            doc = doc_ref.get()
            if not doc.exists:
                return Response({'error': 'Room not found'}, status=404)
            
            room_data = doc.to_dict()
            users = room_data.get('users', [])
            
            # Remove existing role for this user if exists
            # Assuming users is list of dicts: [{'userId': 'abc', 'role': 'INTERVIEWER'}, ...]
            # Or if it's just list of strings, we need to upgrade it. 
            # Given previous context, it was just [] initialized. We will use dicts.
            
            new_users = [u for u in users if u.get('userId') != user_id]
            new_users.append({'userId': user_id, 'role': role})
            
            doc_ref.update({'users': new_users})
            
            return Response({
                'success': True,
                'userId': user_id,
                'role': role
            })
            
        except Exception as e:
            print(f"Assign Role Error: {e}")
            return Response({'error': 'Failed to assign role'}, status=500)


class RoomPermissionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        user_id = request.user.username if request.user.is_authenticated else request.query_params.get('userId', 'Guest')
        
        db = get_firestore_client()
        if not db:
            return Response({'error': 'Database unavailable'}, status=503)
            
        try:
            doc = db.collection('rooms').document(room_id).get()
            if not doc.exists:
                 return Response({'error': 'Room not found'}, status=404)
                 
            room_data = doc.to_dict()
            
            # Check Password / Public Access logic can be here too if strict, 
            # but usually handled in DetailView. Here we focus on Role.
            
            users = room_data.get('users', [])
            role = 'CANDIDATE' # Default
            
            # Find user role
            # Users array structure: [{'userId': '...', 'role': '...'}]
            for u in users:
                if u.get('userId') == user_id:
                    role = u.get('role', 'CANDIDATE')
                    break
            
            # If owner (stored as string owner username)
            if room_data.get('owner') == user_id:
                role = 'INTERVIEWER' # Owner is always admin/interviewer

            can_edit = role in ['CANDIDATE', 'INTERVIEWER'] # Interviewer can also edit usually
            can_view = True
            can_evaluate = role in ['INTERVIEWER']
            
            return Response({
                'role': role,
                'canEdit': can_edit,
                'canView': can_view,
                'canEvaluate': can_evaluate,
                'isOwner': room_data.get('owner') == user_id
            })

        except Exception as e:
            print(f"Permissions Error: {e}")
            return Response({'error': str(e)}, status=500)


class RoomParticipantsRolesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        db = get_firestore_client()
        if not db: return Response([])
        
        try:
            doc = db.collection('rooms').document(room_id).get()
            if not doc.exists: return Response([])
            
            users = doc.to_dict().get('users', [])
            return Response(users)
        except Exception:
            return Response([])
