import random
from flask import Flask
from database import db, init_db
from models import Order, Product
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

def seed_sample_orders():
    app = Flask(__name__)
    init_db(app)
    
    with app.app_context():
        print("[INFO] Generating 15 additional sample orders for MySQL...")
        
        customers = [
            ("Michael", "Scott", "m.scott@dundermifflin.com", "Scranton", "PA"),
            ("Pam", "Beesly", "p.beesly@dundermifflin.com", "Scranton", "PA"),
            ("Jim", "Halpert", "j.halpert@dundermifflin.com", "Philadelphia", "PA"),
            ("Dwight", "Schrute", "d.schrute@schrute-farms.biz", "Scranton", "PA"),
            ("Angela", "Martin", "a.martin@accounting.com", "Scranton", "PA"),
            ("Stanley", "Hudson", "s.hudson@crossword.net", "Scranton", "PA"),
            ("Kevin", "Malone", "k.malone@accounting.com", "Scranton", "PA"),
            ("Oscar", "Martinez", "o.martinez@accounting.com", "Scranton", "PA"),
            ("Kelly", "Kapoor", "k.kapoor@customer-service.com", "Scranton", "PA"),
            ("Ryan", "Howard", "r.howard@temp.com", "New York", "NY"),
            ("Toby", "Flenderson", "t.flenderson@hr.com", "San Jose", "CA"),
            ("Creed", "Bratton", "creed@creedthoughts.gov", "Scranton", "PA"),
            ("Meredith", "Palmer", "m.palmer@relations.com", "Scranton", "PA"),
            ("Phyllis", "Vance", "p.vance@vance-refrigeration.com", "Scranton", "PA"),
            ("Andy", "Bernard", "a.bernard@cornell.edu", "Ithaca", "NY")
        ]
        
        products = Product.query.all()
        if not products:
            print("[ERROR] No products found. Please ensure Products are seeded first.")
            return

        statuses = ["Completed", "Pending", "Shipped"]
        
        new_orders = []
        for first, last, email, city, state in customers:
            product_obj = random.choice(products)
            qty = random.randint(1, 3)
            
            order = Order(
                first_name=first,
                last_name=last,
                email=email,
                phone=f"570-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                street_address=f"{random.randint(100, 999)} Scranton Business Park",
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
            # Add some randomness to created_at within March to make the chart look okay but localized
            # (User didn't ask for full diversification again, just "some" data)
            new_orders.append(order)
            
        db.session.add_all(new_orders)
        db.session.commit()
        print(f"[SUCCESS] Added {len(new_orders)} new sample orders to MySQL!")

if __name__ == "__main__":
    seed_sample_orders()
