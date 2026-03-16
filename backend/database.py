import os
import sys
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Global variables to hold db and collections
db = None
orders_collection = None
dashboards_collection = None
users_collection = None
products_collection = None

def init_db(app):
    """
    Initialize MongoDB Atlas connection.
    Reads MONGO_URI and DB_NAME from the .env file.
    Uses certifi CA bundle to fix SSL handshake issues on Windows.
    """
    global db, orders_collection, dashboards_collection, users_collection, products_collection

    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    DB_NAME   = os.getenv("DB_NAME", "halleyx")

    try:
        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=20000,
            tlsCAFile=certifi.where(),          # Use certifi's CA bundle
        )

        # Test connection
        client.admin.command('ping')
        print(f"[SUCCESS] Connected to MongoDB Atlas — database: '{DB_NAME}'")

        # Map to our globals
        db = client[DB_NAME]
        orders_collection     = db["orders"]
        dashboards_collection = db["dashboards"]
        users_collection      = db["users"]
        products_collection   = db["products"]

    except Exception as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")
        print("Please check your MONGO_URI in the .env file.")
        sys.exit(1)
