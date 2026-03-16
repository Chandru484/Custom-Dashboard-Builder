import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database initialization
from database import init_db

# Import Blueprints
from routes.orders import orders_bp
from routes.dashboards import dashboards_bp
from routes.auth import auth_bp
from routes.products import products_bp


def create_app():
    app = Flask(__name__)
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
    jwt = JWTManager(app)
    app.url_map.strict_slashes = False
    
    # Enable CORS for React frontend (Vite defaults to 5173)
    # Allows our frontend to make requests to this backend without browser blocking it
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Connect to MongoDB
    init_db(app)

    # Register API blueprints
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(dashboards_bp, url_prefix="/api/dashboards")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(products_bp, url_prefix="/api/products")

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {"status": "Backend is running!"}, 200

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
