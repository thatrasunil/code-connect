from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(191), primary_key=True, index=True)
    room_id = Column(String(50), unique=True, index=True)
    code = Column(Text, default="")
    language = Column(String(50), default="javascript")
    created_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    messages = relationship("Message", back_populates="room", cascade="all, delete-orphan")
    participants = relationship("RoomParticipant", back_populates="room", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String(191), ForeignKey("rooms.id"))
    user_id = Column(String(100))
    content = Column(Text)
    type = Column(String(20), default="text")
    timestamp = Column(DateTime, default=datetime.utcnow)

    room = relationship("Room", back_populates="messages")

class RoomParticipant(Base):
    __tablename__ = "room_participants"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String(191), ForeignKey("rooms.id"))
    user_id = Column(String(100))
    # Count how many connections/tabs a user has open
    connection_count = Column(Integer, default=1)
    joined_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("Room", back_populates="participants")

class User(Base):
    __tablename__ = "users"
    # Ported from User.js, though we might not fully implement auth yet if it wasn't used in server.js logic heavily
    # server.js logic seemed to focus on rooms.
    # However, existing User.js had username/email.
    # We will implement it for future proofing.
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    avatar = Column(String(255), default='https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')
    role = Column(String(20), default='user')
    created_at = Column(DateTime, default=datetime.utcnow)
