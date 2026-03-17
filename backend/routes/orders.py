from flask import Blueprint, request, jsonify
from models import Order, User
import json

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
def get_orders():
    """Fetch all orders (Everyone is admin now)"""
    try:
        orders = Order.objects.all()
        result = []
        for order in orders:
            order_data = {
                "_id": str(order.id),
                "first_name": order.first_name,
                "last_name": order.last_name,
                "email": order.email,
                "phone": order.phone,
                "street_address": order.street_address,
                "city": order.city,
                "state": order.state,
                "postal_code": order.postal_code,
                "country": order.country,
                "product": order.product,
                "quantity": order.quantity,
                "unit_price": order.unit_price,
                "total_amount": order.total_amount,
                "status": order.status,
                "user_id": order.user_id,
                "created_at": order.created_at.isoformat() if order.created_at else None
            }
            
            # Simplified owner/email logic for MongoDB
            if order.user_id == 'guest_user':
                order_data['owner_email'] = 'Guest'
            else:
                # In Mongo, we might not have a separate User doc for everyone, so stay safe
                user = User.objects.filter(id=order.user_id).first() if not order.user_id == 'guest_user' else None
                order_data['owner_email'] = user.email if user else 'System'
                
            result.append(order_data)
        return jsonify(result), 200
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
        total_amount = float(data["quantity"]) * float(data["unit_price"])
    except (ValueError, TypeError):
        return jsonify({"error": "quantity and unit_price must be numeric"}), 400

    try:
        new_order = Order(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            phone=data["phone"],
            street_address=data["street_address"],
            city=data["city"],
            state=data["state"],
            postal_code=data["postal_code"],
            country=data["country"],
            product=data["product"],
            quantity=int(data["quantity"]),
            unit_price=float(data["unit_price"]),
            total_amount=total_amount,
            status=data["status"],
            user_id=user_id
        )
        new_order.save()
        
        return jsonify({
            "_id": str(new_order.id),
            "first_name": new_order.first_name,
            "last_name": new_order.last_name,
            "product": new_order.product,
            "status": new_order.status
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/<order_id>', methods=['PUT'])
def update_order(order_id):
    """Update an existing customer order"""
    data = request.json or {}
    
    try:
        order = Order.objects(id=order_id).first()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        # Update fields
        for key, value in data.items():
            if hasattr(order, key) and key not in ['id', 'user_id']:
                setattr(order, key, value)
        
        # Recalculate total if price or qty changed
        if "quantity" in data or "unit_price" in data:
            order.total_amount = float(order.quantity) * float(order.unit_price)

        order.save()
        return jsonify({"_id": str(order.id), "message": "Order updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    """Delete a customer order"""
    try:
        order = Order.objects(id=order_id).first()
        if not order:
            return jsonify({"error": "Order not found"}), 404
            
        order.delete()
        return jsonify({"message": "Order deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
