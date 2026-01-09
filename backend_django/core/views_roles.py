from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Room, RoomParticipant, User
from django.shortcuts import get_object_or_404

class AssignRoleView(APIView):
    permission_classes = [permissions.AllowAny]  # In production: IsAuthenticated + IsRoomOwner

    def post(self, request, room_id):
        room = get_object_or_404(Room, room_id=room_id)
        user_id = request.data.get('userId')
        role = request.data.get('role', 'CANDIDATE')
        
        if role not in ['INTERVIEWER', 'CANDIDATE', 'VIEWER']:
            return Response({'error': 'Invalid role'}, status=400)
        
        # Get or create participant
        try:
            user = User.objects.get(username=user_id)
            participant, created = RoomParticipant.objects.get_or_create(
                room=room,
                user=user,
                defaults={'role': role}
            )
            if not created:
                participant.role = role
                participant.save()
        except User.DoesNotExist:
            # Guest user
            participant, created = RoomParticipant.objects.get_or_create(
                room=room,
                user_id_str=user_id,
                defaults={'role': role}
            )
            if not created:
                participant.role = role
                participant.save()
        
        return Response({
            'success': True,
            'userId': user_id,
            'role': role
        })

class RoomPermissionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        room = get_object_or_404(Room, room_id=room_id)
        
        # Get current user's role
        user_id = request.user.username if request.user.is_authenticated else request.query_params.get('userId', 'Guest')
        
        try:
            if request.user.is_authenticated:
                participant = RoomParticipant.objects.get(room=room, user=request.user)
            else:
                participant = RoomParticipant.objects.get(room=room, user_id_str=user_id)
            
            role = participant.role
        except RoomParticipant.DoesNotExist:
            # Default role for new participants
            role = 'CANDIDATE'
        
        # Determine permissions
        can_edit = role in ['CANDIDATE']
        can_view = True
        can_evaluate = role in ['INTERVIEWER']
        
        return Response({
            'role': role,
            'canEdit': can_edit,
            'canView': can_view,
            'canEvaluate': can_evaluate,
            'isOwner': room.owner == request.user if request.user.is_authenticated else False
        })

class RoomParticipantsRolesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, room_id):
        room = get_object_or_404(Room, room_id=room_id)
        participants = RoomParticipant.objects.filter(room=room)
        
        data = []
        for p in participants:
            data.append({
                'userId': p.user.username if p.user else p.user_id_str,
                'role': p.role,
                'joinedAt': p.joined_at
            })
        
        return Response(data)
