from django.core.management.base import BaseCommand
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test MongoDB Atlas connection'
    
    def handle(self, *args, **options):
        # Force re-initialization to catch errors directly in command
        try:
            from utils.mongodb import MongoDBManager
            
            # We instantiate directly to catch the init exception
            manager = MongoDBManager()
            db = manager.db
            
            # Get database stats
            stats = db.command('dbstats')
            
            self.stdout.write(self.style.SUCCESS(
                '✅ MongoDB Atlas Connection Successful!\n'
            ))
            
            self.stdout.write(f"Database: {db.name}")
            self.stdout.write(f"Collections: {len(db.list_collection_names())}")
            # dataSize is easier to read
            size_mb = stats.get('dataSize', 0) / (1024*1024)
            self.stdout.write(f"Data Size: {size_mb:.2f} MB\n")
            
            # List collections
            collections = db.list_collection_names()
            if collections:
                self.stdout.write("📦 Collections Found:")
                for coll in collections:
                    count = db[coll].count_documents({})
                    self.stdout.write(f"  ✓ {coll}: {count} documents")
            else:
                self.stdout.write("📦 No collections yet (will be created on first write)")
            
            manager.close()
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {str(e)}'))
