from datetime import datetime
from mongoengine import Document, StringField, FloatField, DateTimeField, IntField, ListField, DictField

class User(Document):
    meta = {'collection': 'users'}
    username = StringField(unique=True, required=True)
    email = StringField(unique=True, required=True)
    password_hash = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

class Product(Document):
    meta = {'collection': 'products'}
    name = StringField(unique=True, required=True)
    price = FloatField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

class Order(Document):
    meta = {'collection': 'orders'}
    first_name = StringField(required=True)
    last_name = StringField(required=True)
    email = StringField(required=True)
    phone = StringField(required=True)
    street_address = StringField(required=True)
    city = StringField(required=True)
    state = StringField(required=True)
    postal_code = StringField(required=True)
    country = StringField(required=True)
    product = StringField(required=True)
    quantity = IntField(required=True)
    unit_price = FloatField(required=True)
    total_amount = FloatField(required=True)
    status = StringField(required=True, default='Pending')
    user_id = StringField(default='guest_user')
    created_at = DateTimeField(default=datetime.utcnow)

class DashboardConfig(Document):
    meta = {'collection': 'dashboard_configs'}
    user_id = StringField(unique=True, required=True)
    widgets = ListField(DictField(), required=True)
    updated_at = DateTimeField(default=datetime.utcnow)
