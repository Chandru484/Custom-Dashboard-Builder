from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import database
from bson.objectid import ObjectId

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    """Fetch orders for the current user (or all for admin)"""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')

        query = {"user_id": user_id}
        is_admin = (role == 'admin')
        if is_admin:
            query = {} # Admin sees everything
            
        orders = []
        # Cache for user emails to avoid redundant DB hits
        user_cache = {}

        for order in database.orders_collection.find(query):
            order['_id'] = str(order['_id'])
            
            if is_admin:
                uid = order.get('user_id')
                if uid:
                    if uid not in user_cache:
                        u = database.users_collection.find_one({"_id": ObjectId(uid)})
                        user_cache[uid] = u.get('email') if u else 'Unknown'
                    order['owner_email'] = user_cache[uid]
                else:
                    order['owner_email'] = 'System'
                    
            orders.append(order)
        return jsonify(orders), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new customer order for the current user"""
    data = request.json or {}
    user_id = get_jwt_identity()

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
@jwt_required()
def update_order(order_id):
    """Update an existing customer order (only if it belongs to current user or if admin)"""
    data = request.json or {}
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role')

    # Recalculate total if price or qty changed
    if "quantity" in data and "unit_price" in data:
        try:
            data["total_amount"] = float(data["quantity"]) * float(data["unit_price"])
        except (ValueError, TypeError):
            pass

    query = {"_id": ObjectId(order_id)}
    if role != 'admin':
        query["user_id"] = user_id

    try:
        result = database.orders_collection.update_one(
            query,
            {"$set": data}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Order not found or unauthorized"}), 404

        updated = database.orders_collection.find_one({"_id": ObjectId(order_id)})
        updated['_id'] = str(updated['_id'])
        return jsonify(updated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/<order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    """Delete a customer order (only if it belongs to current user or if admin)"""
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role')

    query = {"_id": ObjectId(order_id)}
    if role != 'admin':
        query["user_id"] = user_id

    try:
        result = database.orders_collection.delete_one(query)
        if result.deleted_count == 0:
            return jsonify({"error": "Order not found or unauthorized"}), 404
        return jsonify({"message": "Order deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
