import socketio
from .models import Room, Message, RoomHistory, User
from asgiref.sync import sync_to_async
import datetime
import logging

# Setup logging
logging.basicConfig(filename='debug_chat.log', level=logging.INFO, format='%(asctime)s %(message)s')



sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Extended In-memory stores for better tracking
active_rooms = {} # roomId -> dict: user_id -> count
socket_id_to_user_id = {} # sid -> {user_id, room_id}
user_sockets = {} # user_id -> set of sids (handle multiple tabs)

@sio.event
async def connect(sid, environ):
    logging.info(f"DEBUG: User connected: {sid}")

@sio.event
async def disconnect(sid):
    logging.info(f"User disconnected: {sid}")
    user_info = socket_id_to_user_id.get(sid)
    if not user_info:
        return

    user_id = user_info['user_id']
    room_id = user_info['room_id']

    # Remove socket from user_sockets
    if user_id in user_sockets:
        user_sockets[user_id].discard(sid)
        if not user_sockets[user_id]:
            del user_sockets[user_id]

    # Handle room leaving
    if room_id in active_rooms:
        room_users = active_rooms[room_id]
        if user_id in room_users:
            room_users[user_id] -= 1
            if room_users[user_id] <= 0:
                del room_users[user_id]
                # Broadcast user-left
                await sio.emit('user-left', {'userId': user_id, 'timestamp': datetime.datetime.now().isoformat()}, room=room_id)
            
            # Broadcast updates
            active_participants = list(room_users.keys())
            await sio.emit('user-count', {'count': len(room_users), 'participants': active_participants}, room=room_id)
            await sio.emit('participants-update', active_participants, room=room_id)

            if not room_users:
                del active_rooms[room_id]

    if sid in socket_id_to_user_id:
        del socket_id_to_user_id[sid]

@sio.on('join-room')
async def handle_join_room(sid, room_id, user_data, password=None):
    # Handle both old format (string user_id) and new format (object with userId and name)
    if isinstance(user_data, dict):
        user_id = user_data.get('userId')
        user_name = user_data.get('name', user_id)
    else:
        user_id = user_data
        user_name = user_id
    
    logging.info(f"User {user_id} ({user_name}) joining room {room_id}")
    await sio.enter_room(sid, room_id)
    socket_id_to_user_id[sid] = {'user_id': user_id, 'room_id': room_id, 'name': user_name}

    # Track user sockets
    if user_id not in user_sockets:
        user_sockets[user_id] = set()
    user_sockets[user_id].add(sid)

    # Init room if needed
    if room_id not in active_rooms:
        active_rooms[room_id] = {}
    
    room_users = active_rooms[room_id]
    room_users[user_id] = room_users.get(user_id, 0) + 1

    # DB Operations (Async)
    room = await sync_to_async(Room.objects.filter(room_id=room_id).first)()
    if not room:
        room = await sync_to_async(Room.objects.create)(room_id=room_id) # Basic create
        # Add user? We can optimize DB access later
    
    # Using existing DB logic from previous step for messages...
    messages = await sync_to_async(lambda: list(room.messages.all().order_by('timestamp')))() if room else []
    message_list = [{
        'id': str(m.id),
        'userId': m.user_id,
        'content': m.content,
        'type': m.type,
        'timestamp': m.timestamp.isoformat() if m.timestamp else None
    } for m in messages]

    # Build participant list with names
    active_participants = [{
        'userId': uid,
        'name': socket_id_to_user_id.get(list(user_sockets.get(uid, set()))[0] if user_sockets.get(uid) else None, {}).get('name', uid),
        'color': '#3b82f6'
    } for uid in room_users.keys()]

    # Emit to self
    await sio.emit('room-joined', {
        'roomId': room_id,
        'code': room.code if room else '',
        'language': room.language if room else 'javascript',
        'messages': message_list,
        'participants': active_participants,
        'users': len(room_users)  # Total users in room
    }, to=sid)

    # Broadcasts
    await sio.emit('user-joined', {'userId': user_id, 'name': user_name, 'color': '#10b981', 'timestamp': datetime.datetime.now().isoformat()}, room=room_id, skip_sid=sid)
    await sio.emit('user-count', {'count': len(room_users), 'participants': active_participants}, room=room_id)
    await sio.emit('participants-update', active_participants, room=room_id)

# ... (rest of events: code-change, receive-message, etc using new structure)
@sio.on('send-message')
async def handle_send_message(sid, data):
    room_id = data.get('roomId')
    user_id = data.get('userId')
    content = data.get('content')
    m_type = data.get('type', 'TEXT').upper()
    file_url = data.get('fileUrl')
    is_voice = data.get('isVoice', False)
    parent_id = data.get('parentId') # Threading
    if m_type == 'AUDIO': is_voice = True

    # DB Save
    room = await sync_to_async(Room.objects.filter(room_id=room_id).first)()
    if room:
        # Resolve parent instance if provided
        parent_msg = None
        if parent_id:
            parent_msg = await sync_to_async(Message.objects.filter(id=parent_id).first)()

        msg = await sync_to_async(Message.objects.create)(
            room=room, 
            user_id=user_id, 
            content=content, 
            type=m_type,
            attachment_url=file_url,
            is_voice=is_voice,
            parent=parent_msg
        )
        new_message = {
            'id': str(msg.id),
            'userId': user_id,
            'content': content,
            'type': m_type,
            'attachmentUrl': file_url,
            'isVoice': is_voice,
            'parentId': parent_id,
            'timestamp': datetime.datetime.now().isoformat()
        }
        # Broadcast to ALL (including sender, per fix)
        await sio.emit('new-message', new_message, room=room_id)

@sio.on('code-change')
async def handle_code_change(sid, data):
    room_id = data.get('roomId')
    code = data.get('code')
    language = data.get('language')

    # Update DB
    await sync_to_async(Room.objects.filter(room_id=room_id).update)(code=code, language=language)
    
    # Broadcast to ALL EXCEPT sender to prevent cursor jumping/loops
    await sio.emit('code-update', {'code': code, 'language': language}, room=room_id, skip_sid=sid)

@sio.on('typing')
async def handle_typing(sid, data):
    # Broadcast to others
    await sio.emit('user-typing', data, room=data.get('roomId'), skip_sid=sid)

@sio.on('cursor-update')
async def handle_cursor_update(sid, data):
    # Broadcast to others
    await sio.emit('cursor-update', data, room=data.get('roomId'), skip_sid=sid)

@sio.on('cursor-leave')
async def handle_cursor_leave(sid, room_id, user_id): # User sends room_id in fix
    # Broadcast to room
    await sio.emit('cursor-leave', user_id, room=room_id)

@sio.on('end-room')
async def handle_end_room(sid, room_id, user_id):
    room = await sync_to_async(Room.objects.filter(room_id=room_id).first)()
    if room:
        await sync_to_async(Message.objects.filter(room=room).delete)()
        await sync_to_async(Room.objects.filter(room_id=room_id).update)(code="", language="javascript")
        
    await sio.emit('room-ended', {'roomId': room_id, 'message': f'Room ended by {user_id}'}, room=room_id)
    if room_id in active_rooms:
        del active_rooms[room_id]

