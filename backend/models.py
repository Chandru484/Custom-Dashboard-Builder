from datetime import datetime
from flask_mongoengine import MongoEngine

db = MongoEngine()

class User(db.Document):
    meta = {'collection': 'users'}
    username = db.StringField(unique=True, required=True)
    email = db.StringField(unique=True, required=True)
    password_hash = db.StringField(required=True)
    created_at = db.DateTimeField(default=datetime.utcnow)

class Product(db.Document):
    meta = {'collection': 'products'}
    name = db.StringField(unique=True, required=True)
    price = db.FloatField(required=True)
    created_at = db.DateTimeField(default=datetime.utcnow)

class Order(db.Document):
    meta = {'collection': 'orders'}
    first_name = db.StringField(required=True)
    last_name = db.StringField(required=True)
    email = db.StringField(required=True)
    phone = db.StringField(required=True)
    street_address = db.StringField(required=True)
    city = db.StringField(required=True)
    state = db.StringField(required=True)
    postal_code = db.StringField(required=True)
    country = db.StringField(required=True)
    product = db.StringField(required=True)
    quantity = db.IntField(required=True)
    unit_price = db.FloatField(required=True)
    total_amount = db.FloatField(required=True)
    status = db.StringField(required=True, default='Pending')
    user_id = db.StringField(default='guest_user')
    created_at = db.DateTimeField(default=datetime.utcnow)

class DashboardConfig(db.Document):
    meta = {'collection': 'dashboard_configs'}
    user_id = db.StringField(unique=True, required=True)
    widgets = db.ListField(db.DictField(), required=True)
    updated_at = db.DateTimeField(default=datetime.utcnow)
