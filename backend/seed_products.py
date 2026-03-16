from pymongo import MongoClient
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "dashboard_builder")

def seed_products():
    client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client[DB_NAME]
    products_col = db["products"]

    default_products = [
        {"name": "VoIP Corporate Package", "price": 450},
        {"name": "Business Internet 500 Mbps", "price": 800},
        {"name": "Fiber Internet 1 Gbps", "price": 1200},
        {"name": "5G Unlimited Mobile Plan", "price": 300},
        {"name": "Fiber Internet 300 Mbps", "price": 500}
    ]

    for prod in default_products:
        existing = products_col.find_one({"name": prod["name"]})
        if not existing:
            products_col.insert_one(prod)
            print(f"Added: {prod['name']} at ₹{prod['price']}")
        else:
            products_col.update_one({"name": prod["name"]}, {"$set": {"price": prod["price"]}})
            print(f"Updated price for: {prod['name']}")

    print("Seeding complete.")

if __name__ == "__main__":
    seed_products()
