from flask import Blueprint, request, jsonify
from models import Product

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    """List all products"""
    try:
        products = Product.objects.all()
        result = []
        for p in products:
            result.append({
                "_id": str(p.id),
                "name": p.name,
                "price": p.price
            })
        return jsonify(result), 200
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
        if Product.objects.filter(name=name).first():
            return jsonify({"error": "Product already exists"}), 400
            
        new_p = Product(name=name, price=float(price))
        new_p.save()
        
        return jsonify({
            "_id": str(new_p.id),
            "name": new_p.name,
            "price": new_p.price
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route('/<id>', methods=['PUT'])
def update_product(id):
    """Update a product"""
    data = request.json or {}
    
    try:
        product = Product.objects(id=id).first()
        if not product:
            return jsonify({"error": "Product not found"}), 404
            
        if 'name' in data:
            product.name = data['name']
        if 'price' in data:
            product.price = float(data['price'])
            
        product.save()
        return jsonify({
            "_id": str(product.id),
            "name": product.name,
            "price": product.price
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route('/<id>', methods=['DELETE'])
def delete_product(id):
    """Remove a product"""
    try:
        product = Product.objects(id=id).first()
        if not product:
            return jsonify({"error": "Product not found"}), 404
            
        product.delete()
        return jsonify({"message": "Product removed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
