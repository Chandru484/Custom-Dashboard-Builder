from flask import Blueprint, request, jsonify
import database
from bson.objectid import ObjectId

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
def get_orders():
    """Fetch all orders (Everyone is admin now)"""
    try:
        query = {} 
        orders = []
        user_cache = {}

        for order in database.orders_collection.find(query):
            order['_id'] = str(order['_id'])
            
            uid = order.get('user_id')
            if uid == 'guest_user':
                order['owner_email'] = 'Guest'
            elif uid:
                if uid not in user_cache:
                    try:
                        u = database.users_collection.find_one({"_id": ObjectId(uid)})
                        user_cache[uid] = u.get('email') if u else 'Unknown'
                    except:
                        user_cache[uid] = 'Unknown'
                order['owner_email'] = user_cache[uid]
            else:
                order['owner_email'] = 'System'
                    
            orders.append(order)
        return jsonify(orders), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/', methods=['POST'])
def create_order():
    """Create a new customer order"""
    data = request.json or {}
    user_id = "guest_user"

    # Required fields
    required_fields = [
        "first_name", "last_name", "email", "phone",
        "street_address", "city", "state", "postal_code", "country",
        "product", "quantity", "unit_price", "status"
    ]

    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    # Auto-calculate total amount
    try:
        data["total_amount"] = float(data["quantity"]) * float(data["unit_price"])
    except (ValueError, TypeError):
        return jsonify({"error": "quantity and unit_price must be numeric"}), 400

    data["user_id"] = user_id

    try:
        result = database.orders_collection.insert_one(data)
        new_order = database.orders_collection.find_one({"_id": result.inserted_id})
        new_order['_id'] = str(new_order['_id'])
        return jsonify(new_order), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/<order_id>', methods=['PUT'])
def update_order(order_id):
    """Update an existing customer order"""
    data = request.json or {}

    # Recalculate total if price or qty changed
    if "quantity" in data and "unit_price" in data:
        try:
            data["total_amount"] = float(data["quantity"]) * float(data["unit_price"])
        except (ValueError, TypeError):
            pass

    # Remove _id from data to avoid MongoDB immutability error if sent by frontend
    data.pop("_id", None)
    data.pop("user_id", None)

    query = {"_id": ObjectId(order_id)}

    try:
        result = database.orders_collection.update_one(
            query,
            {"$set": data}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Order not found"}), 404

        updated = database.orders_collection.find_one({"_id": ObjectId(order_id)})
        updated['_id'] = str(updated['_id'])
        return jsonify(updated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    """Delete a customer order"""
    query = {"_id": ObjectId(order_id)}

    try:
        result = database.orders_collection.delete_one(query)
        if result.deleted_count == 0:
            return jsonify({"error": "Order not found"}), 404
        return jsonify({"message": "Order deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
