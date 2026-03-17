import os
import sys
from flask_sqlalchemy import SQLAlchemy
from models import db, Product

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
    
    # Fix for Render: If the user provided a URI starting with mysql:// (missing the driver),
    # we automatically prepend the explicit driver to avoid "ModuleNotFoundError: No module named 'MySQLdb'"
    if MYSQL_URI.startswith("mysql://"):
        MYSQL_URI = MYSQL_URI.replace("mysql://", "mysql+mysqlconnector://", 1)
        print("[INFO] Automatically adjusted MYSQL_URI to use mysql+mysqlconnector driver.")
    
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
        except Exception as e:
            print(f"[ERROR] Failed to connect to MySQL: {e}")
            sys.exit(1)
