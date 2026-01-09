import asyncio
from database import get_db, engine, Base
from models import Room
from sqlalchemy import select
import random

async def test_create_room():
    print("Testing DB Connection...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created/verified.")

    async with engine.connect() as conn:
        print("Connected.")

    # Test insertion
    print("Testing insertion...")
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.asyncio import AsyncSession
    
    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with AsyncSessionLocal() as db:
        room_id = str(random.randint(10000000, 99999999))
        print(f"Generated Room ID: {room_id}")
        new_room = Room(id=room_id, room_id=room_id)
        db.add(new_room)
        try:
            await db.commit()
            print("Room created successfully!")
            await db.refresh(new_room)
            print(f"Room: {new_room.room_id}")
        except Exception as e:
            print(f"Error creating room: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(test_create_room())
