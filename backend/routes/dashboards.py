from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import database
from bson.objectid import ObjectId

dashboards_bp = Blueprint('dashboards', __name__)

@dashboards_bp.route('/', methods=['GET'])
@jwt_required()
def get_dashboard_config():
    """Fetch the saved dashboard configuration for the current user"""
    try:
        user_id = get_jwt_identity()
        config = database.db.dashboards.find_one({"user_id": user_id})
        
        if not config:
            return jsonify({"widgets": []}), 200
            
        config['_id'] = str(config['_id'])
        return jsonify(config), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@dashboards_bp.route('/', methods=['POST'])
@jwt_required()
def save_dashboard_config():
    """Save the dashboard configuration for the current user"""
    data = request.json
    user_id = get_jwt_identity()
    
    if "widgets" not in data:
        return jsonify({"error": "Missing 'widgets' array in payload"}), 400
        
    try:
        # Check if a config exists for this user
        existing_config = database.db.dashboards.find_one({"user_id": user_id})
        
        if existing_config:
            # Update existing
            database.db.dashboards.update_one(
                {"_id": existing_config["_id"]},
                {"$set": {"widgets": data["widgets"]}}
            )
            return jsonify({"message": "Dashboard updated successfully"}), 200
        else:
            # Insert new
            database.db.dashboards.insert_one({
                "user_id": user_id,
                "widgets": data["widgets"]
            })
            return jsonify({"message": "Dashboard saved successfully"}), 201
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
