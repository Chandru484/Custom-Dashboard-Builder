import os
import sys
import random
from datetime import datetime, timedelta
from mongoengine import connect
from models import Product, Order

def init_db(app):
    """
    Initialize MongoDB connection using MongoEngine connect().
    Reads MONGO_URI from the .env file.
    """
    MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb+srv://Chandru:Chandru@cluster0.gfxrmm3.mongodb.net/?appName=Cluster0"
    
    try:
        # Connect directly without Flask wrapper to avoid JSONEncoder issues
        connect(host=MONGO_URI)
        print("[SUCCESS] Connected to MongoDB Atlas via MongoEngine.")
        
        # Test connection by performing a count
        Product.objects.count()
        
        # Auto-seed products if empty
        if Product.objects.count() == 0:
            print("[INFO] Products collection is empty. Seeding default products...")
            default_products = [
                Product(name="VoIP Corporate Package", price=450.0),
                Product(name="Business Internet 500 Mbps", price=800.0),
                Product(name="Fiber Internet 1 Gbps", price=1200.0),
                Product(name="5G Unlimited Mobile Plan", price=300.0),
                Product(name="Fiber Internet 300 Mbps", price=500.0)
            ]
            Product.objects.insert(default_products)
            print(f"[SUCCESS] Seeded {len(default_products)} products.")

        # Auto-seed orders if empty (Extensive Seed - 25 records total)
        if Order.objects.count() == 0:
            print("[INFO] Orders collection is empty. Seeding extensive sample data (25 records)...")
            
            base_customers = [
                ("John", "Doe", "john.doe@example.com", "San Francisco", "CA"),
                ("Jane", "Smith", "jane.smith@example.com", "New York", "NY"),
                ("Robert", "Brown", "robert.b@example.com", "Austin", "TX"),
                ("Emily", "Davis", "emily.d@example.com", "Seattle", "WA"),
                ("Michael", "Wilson", "m.wilson@example.com", "Chicago", "IL"),
                ("Alice", "Johnson", "alice.j@example.com", "Denver", "CO"),
                ("Mark", "Thompson", "m.thompson@pro.com", "Miami", "FL"),
                ("Sophia", "Garcia", "sophia.g@creative.net", "Silicon Valley", "CA"),
                ("David", "Miller", "dmiller@tech.org", "Dallas", "TX"),
                ("Olivia", "Martinez", "olivia.m@global.com", "Atlanta", "GA")
            ]
            
            products = Product.objects.all()
            statuses = ["Completed", "Pending", "Shipped", "Cancelled"]
            new_orders = []
            
            # Generate 25 diverse orders backdated over 6 months
            for i in range(25):
                first, last, email, city, state = random.choice(base_customers)
                prod = random.choice(products)
                qty = random.randint(1, 3)
                backdate_days = random.randint(0, 180)
                
                new_orders.append(Order(
                    first_name=first, last_name=last, email=email,
                    phone=f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                    street_address=f"{random.randint(100, 999)} Tech Dr", city=city,
                    state=state, postal_code=str(random.randint(10000, 99999)), country="USA",
                    product=prod.name, quantity=qty, unit_price=prod.price,
                    total_amount=qty * prod.price, status=random.choice(statuses),
                    user_id="guest_user",
                    created_at=datetime.utcnow() - timedelta(days=backdate_days)
                ))
            
            Order.objects.insert(new_orders)
            print(f"[SUCCESS] Seeded {len(new_orders)} extensive sample orders across 6 months.")

    except Exception as e:
        print(f"[ERROR] MongoDB connection failed: {e}")
