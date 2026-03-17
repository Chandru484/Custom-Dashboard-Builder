import sys
import os
sys.path.append(os.getcwd())

from app import app
from models import db, Order, Product

def seed():
    with app.app_context():
        # Seed products if empty
        if Product.query.count() == 0:
            print("[INFO] Seeding products...")
            default_products = [
                Product(name="VoIP Corporate Package", price=450.0),
                Product(name="Business Internet 500 Mbps", price=800.0),
                Product(name="Fiber Internet 1 Gbps", price=1200.0),
                Product(name="5G Unlimited Mobile Plan", price=300.0),
                Product(name="Fiber Internet 300 Mbps", price=500.0)
            ]
            db.session.add_all(default_products)
            db.session.commit()
            print(f"[SUCCESS] Seeded {len(default_products)} products.")

        # Seed orders if empty
        if Order.query.count() == 0:
            print("[INFO] Seeding orders...")
            default_orders = [
                Order(
                    first_name="John", last_name="Doe", email="john.doe@example.com",
                    phone="1234567890", street_address="123 Tech Lane", city="San Francisco",
                    state="CA", postal_code="94105", country="USA",
                    product="Fiber Internet 1 Gbps", quantity=1, unit_price=1200.0,
                    total_amount=1200.0, status="Completed", user_id="guest_user"
                ),
                Order(
                    first_name="Jane", last_name="Smith", email="jane.smith@example.com",
                    phone="0987654321", street_address="456 Innovation Dr", city="New York",
                    state="NY", postal_code="10001", country="USA",
                    product="5G Unlimited Mobile Plan", quantity=2, unit_price=300.0,
                    total_amount=600.0, status="Pending", user_id="guest_user"
                ),
                Order(
                    first_name="Robert", last_name="Brown", email="robert.b@example.com",
                    phone="5551234567", street_address="789 Connectivity Way", city="Austin",
                    state="TX", postal_code="78701", country="USA",
                    product="Business Internet 500 Mbps", quantity=1, unit_price=800.0,
                    total_amount=800.0, status="Shipped", user_id="guest_user"
                ),
                Order(
                    first_name="Emily", last_name="Davis", email="emily.d@example.com",
                    phone="4449876543", street_address="321 Broadband St", city="Seattle",
                    state="WA", postal_code="98101", country="USA",
                    product="Fiber Internet 300 Mbps", quantity=3, unit_price=500.0,
                    total_amount=1500.0, status="Pending", user_id="guest_user"
                ),
                Order(
                    first_name="Michael", last_name="Wilson", email="m.wilson@example.com",
                    phone="3335557777", street_address="555 Digital Rd", city="Chicago",
                    state="IL", postal_code="60601", country="USA",
                    product="VoIP Corporate Package", quantity=1, unit_price=450.0,
                    total_amount=450.0, status="Completed", user_id="guest_user"
                )
            ]
            db.session.add_all(default_orders)
            db.session.commit()
            print(f"[SUCCESS] Seeded {len(default_orders)} orders.")
        else:
            print(f"[INFO] Orders table already has {Order.query.count()} records.")

if __name__ == "__main__":
    seed()
