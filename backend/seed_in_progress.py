import random
from flask import Flask
from database import db, init_db
from models import Order, Product
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

def seed_in_progress_orders():
    app = Flask(__name__)
    init_db(app)
    
    with app.app_context():
        print("[INFO] Seeding 10 'In Progress' / 'Pending' orders...")
        
        customers = [
            ("Jim", "Halpert", "j.halpert@dundermifflin.com", "Philadelphia", "PA"),
            ("Pam", "Beesly", "p.beesly@dundermifflin.com", "Scranton", "PA"),
            ("Dwight", "Schrute", "d.schrute@schrute-farms.biz", "Scranton", "PA"),
            ("Darryl", "Philbin", "d.philbin@warehouse.com", "Scranton", "PA"),
            ("Erin", "Hannon", "e.hannon@reception.com", "Scranton", "PA")
        ]
        
        products = Product.query.all()
        if not products:
            print("[ERROR] No products found.")
            return

        # Explicitly choosing in-progress style statuses
        statuses = ["Pending", "Processing"]
        
        new_orders = []
        for i in range(10):
            first, last, email, city, state = random.choice(customers)
            product_obj = random.choice(products)
            qty = random.randint(1, 2)
            
            order = Order(
                first_name=first,
                last_name=last,
                email=email,
                phone=f"570-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                street_address=f"{random.randint(100, 999)} Business Way",
                city=city,
                state=state,
                postal_code=str(random.randint(18400, 18600)),
                country="USA",
                product=product_obj.name,
                quantity=qty,
                unit_price=product_obj.price,
                total_amount=qty * product_obj.price,
                status=random.choice(statuses),
                user_id="guest_user"
            )
            new_orders.append(order)
            
        db.session.add_all(new_orders)
        db.session.commit()
        print(f"[SUCCESS] Added {len(new_orders)} in-progress orders!")

if __name__ == "__main__":
    seed_in_progress_orders()
