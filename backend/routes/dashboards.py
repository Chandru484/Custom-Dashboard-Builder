from flask import Blueprint, request, jsonify
from models import db, DashboardConfig

dashboards_bp = Blueprint('dashboards', __name__)

@dashboards_bp.route('/', methods=['GET'])
def get_dashboard_config():
    """Fetch the saved dashboard configuration"""
    try:
        user_id = "guest_user"
        config = DashboardConfig.query.filter_by(user_id=user_id).first()
        
        if not config:
            return jsonify({"widgets": []}), 200
            
        return jsonify({
            "_id": str(config.id),
            "user_id": config.user_id,
            "widgets": config.widgets
        }), 200
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
        config = DashboardConfig.query.filter_by(user_id=user_id).first()
        
        if config:
            config.widgets = data["widgets"]
        else:
            config = DashboardConfig(user_id=user_id, widgets=data["widgets"])
            db.session.add(config)
            
        db.session.commit()
        return jsonify({"message": "Dashboard saved successfully"}), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
