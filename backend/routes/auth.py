from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
import database
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    role = data.get('role', 'user') # 'user' or 'admin'

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    if database.users_collection.find_one({"email": email}):
        return jsonify({"msg": "User already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    user_data = {
        "email": email,
        "password": hashed_password.decode('utf-8'), # Store as string for consistency
        "full_name": full_name,
        "role": role
    }

    database.users_collection.insert_one(user_data)
    return jsonify({"msg": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    user = database.users_collection.find_one({"email": email})
    
    if user:
        stored_password = user['password']
        # If stored as string, encode to bytes for bcrypt
        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')
            
        if bcrypt.checkpw(password.encode('utf-8'), stored_password):
            access_token = create_access_token(
                identity=str(user['_id']), 
                additional_claims={"role": user['role']},
                expires_delta=timedelta(days=1)
            )
            return jsonify(access_token=access_token, role=user['role'], full_name=user['full_name']), 200
    
    return jsonify({"msg": "Bad email or password"}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    from bson.objectid import ObjectId
    user = database.users_collection.find_one({"_id": ObjectId(current_user_id)})
    if user:
        return jsonify({
            "id": str(user['_id']),
            "email": user['email'],
            "full_name": user.get('full_name'),
            "role": user.get('role')
        }), 200
    return jsonify({"msg": "User not found"}), 404
@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    from bson.objectid import ObjectId
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    fullname = data.get('full_name')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    user = database.users_collection.find_one({"_id": ObjectId(current_user_id)})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    update_data = {}
    if fullname:
        update_data["full_name"] = fullname

    if new_password:
        if not old_password:
            return jsonify({"msg": "Old password required to set new password"}), 400
        
        stored_password = user['password']
        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')

        if not bcrypt.checkpw(old_password.encode('utf-8'), stored_password):
            return jsonify({"msg": "Incorrect old password"}), 401
        
        update_data["password"] = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    if not update_data:
        return jsonify({"msg": "No data provided to update"}), 400

    database.users_collection.update_one(
        {"_id": ObjectId(current_user_id)},
        {"$set": update_data}
    )
    
    return jsonify({"msg": "Profile updated successfully"}), 200
