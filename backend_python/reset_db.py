import asyncio
from database import engine, Base
# Import all models to ensure metadata is populated
from models import Room, Message, RoomParticipant, User

async def reset_database():
    print("Resetting database...")
    async with engine.begin() as conn:
        print("Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database reset complete.")

if __name__ == "__main__":
    asyncio.run(reset_database())
