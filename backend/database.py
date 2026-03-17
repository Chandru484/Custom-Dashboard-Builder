import os
import sys
from flask_sqlalchemy import SQLAlchemy
from models import db, Product, Order

# COLLECTIONS placeholders (to be updated in routes to use models)
orders_collection = None
dashboards_collection = None
users_collection = None
products_collection = None

def init_db(app):
    """
    Initialize MySQL connection using SQLAlchemy.
    Reads MYSQL_URI from the .env file.
    """
    MYSQL_URI = os.getenv("MYSQL_URI", "mysql+mysqlconnector://root:root@localhost/dashboard_builder")
    
    # Fix for Render: Handle driver prefix and Aiven SSL parameter hyphen
    if MYSQL_URI.startswith("mysql://"):
        MYSQL_URI = MYSQL_URI.replace("mysql://", "mysql+mysqlconnector://", 1)
        print("[INFO] Automatically adjusted MYSQL_URI driver.")
    
    if "ssl-mode=" in MYSQL_URI:
        MYSQL_URI = MYSQL_URI.replace("ssl-mode=", "ssl_mode=")
        print("[INFO] Automatically adjusted SSL parameter (hyphen to underscore).")
    
    app.config['SQLALCHEMY_DATABASE_URI'] = MYSQL_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        try:
            db.create_all()
            print("[SUCCESS] Connected to MySQL and tables created.")
            
            # Auto-seed products if empty
            if Product.query.count() == 0:
                print("[INFO] Products table is empty. Seeding default products...")
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

            # Auto-seed orders if empty
            if Order.query.count() == 0:
                print("[INFO] Orders table is empty. Seeding default orders...")
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
                        total_amount=800.0, status="In Progress", user_id="guest_user"
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
        except Exception as e:
            print(f"[ERROR] Failed to connect to MySQL: {e}")
            sys.exit(1)
