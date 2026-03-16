from flask import Blueprint, request, jsonify
import database
from bson.objectid import ObjectId

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    """List all products"""
    try:
        products = []
        for p in database.products_collection.find():
            p['_id'] = str(p['_id'])
            products.append(p)
        return jsonify(products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route('/', methods=['POST'])
def add_product():
    """Add a new product"""
    data = request.json or {}
    name = data.get('name')
    price = data.get('price', 0)
    
    if not name:
        return jsonify({"error": "Product name is required"}), 400
        
    try:
        # Check if exists
        if database.products_collection.find_one({"name": name}):
            return jsonify({"error": "Product already exists"}), 400
            
        result = database.products_collection.insert_one({
            "name": name,
            "price": float(price)
        })
        new_p = database.products_collection.find_one({"_id": result.inserted_id})
        new_p['_id'] = str(new_p['_id'])
        return jsonify(new_p), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route('/<id>', methods=['PUT'])
def update_product(id):
    """Update a product"""
    data = request.json or {}
    update_data = {}
    if 'name' in data:
        update_data['name'] = data['name']
    if 'price' in data:
        try:
            update_data['price'] = float(data['price'])
        except (ValueError, TypeError):
            return jsonify({"error": "Price must be a number"}), 400
            
    if not update_data:
        return jsonify({"error": "No data to update"}), 400
        
    try:
        result = database.products_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Product not found"}), 404
            
        updated = database.products_collection.find_one({"_id": ObjectId(id)})
        updated['_id'] = str(updated['_id'])
        return jsonify(updated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route('/<id>', methods=['DELETE'])
def delete_product(id):
    """Remove a product"""
    try:
        result = database.products_collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Product not found"}), 404
        return jsonify({"message": "Product removed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
