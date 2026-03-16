from flask import Blueprint, request, jsonify
import database
from bson.objectid import ObjectId

dashboards_bp = Blueprint('dashboards', __name__)

@dashboards_bp.route('/', methods=['GET'])
def get_dashboard_config():
    """Fetch the saved dashboard configuration"""
    try:
        user_id = "guest_user"
        config = database.dashboards_collection.find_one({"user_id": user_id})
        
        if not config:
            return jsonify({"widgets": []}), 200
            
        config['_id'] = str(config['_id'])
        return jsonify(config), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@dashboards_bp.route('/', methods=['POST'])
def save_dashboard_config():
    """Save the dashboard configuration"""
    data = request.json
    user_id = "guest_user"
    
    if "widgets" not in data:
        return jsonify({"error": "Missing 'widgets' array in payload"}), 400
        
    try:
        # Check if a config exists
        existing_config = database.dashboards_collection.find_one({"user_id": user_id})
        
        if existing_config:
            # Update existing
            database.dashboards_collection.update_one(
                {"_id": existing_config["_id"]},
                {"$set": {"widgets": data["widgets"]}}
            )
            return jsonify({"message": "Dashboard updated successfully"}), 200
        else:
            # Insert new
            database.dashboards_collection.insert_one({
                "user_id": user_id,
                "widgets": data["widgets"]
            })
            return jsonify({"message": "Dashboard saved successfully"}), 201
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
