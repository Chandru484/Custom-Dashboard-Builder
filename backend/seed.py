import urllib.request
import json

url = "http://localhost:5000/api/orders/"

orders = [
    {
        "first_name": "Lando", "last_name": "Norris", "email": "lando@mclaren.com", "phone": "447700900000",
        "street_address": "Woking Tech Centre", "city": "Woking", "state": "Surrey", "postal_code": "GU21", "country": "UK",
        "product": "Enterprise Cloud Sub", "quantity": 10, "unit_price": 450, "status": "Completed", "created_by": "System"
    },
    {
        "first_name": "Charles", "last_name": "Leclerc", "email": "charles@ferrari.it", "phone": "33600000000",
        "street_address": "Maranello HQ", "city": "Maranello", "state": "Modena", "postal_code": "41053", "country": "Italy",
        "product": "Database Cluster", "quantity": 4, "unit_price": 1200, "status": "Pending", "created_by": "System"
    },
    {
        "first_name": "Max", "last_name": "Verstappen", "email": "max@redbull.com", "phone": "31200000000",
        "street_address": "Milton Keynes", "city": "Milton Keynes", "state": "Bucks", "postal_code": "MK7", "country": "UK",
        "product": "Performance Analytics", "quantity": 1, "unit_price": 5000, "status": "Completed", "created_by": "System"
    }
]

for order in orders:
    req = urllib.request.Request(url)
    req.add_header('Content-Type', 'application/json; charset=utf-8')
    jsondata = json.dumps(order).encode('utf-8')
    req.add_header('Content-Length', str(len(jsondata)))
    
    try:
        response = urllib.request.urlopen(req, jsondata)
        print(response.getcode(), response.read().decode('utf-8'))
    except Exception as e:
        print(f"Failed: {e}")
