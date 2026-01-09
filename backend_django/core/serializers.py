from rest_framework import serializers
from .models import User, Room, Message, RoomHistory

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar', 'role', 'date_joined')
        read_only_fields = ('id', 'date_joined')

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class MessageSerializer(serializers.ModelSerializer):
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'room', 'user_id', 'content', 'type', 'attachment', 'attachment_url', 'is_voice', 'parent', 'timestamp']

    def get_attachment_url(self, obj):
        if obj.attachment:
            return obj.attachment.url
        return None

class RoomSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Room
        fields = '__all__'

class RoomHistorySerializer(serializers.ModelSerializer):
    room_details = RoomSerializer(source='room', read_only=True)

    class Meta:
        model = RoomHistory
        fields = '__all__'
