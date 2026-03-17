import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database initialization
from database import init_db

# Import Blueprints
from routes.orders import orders_bp
from routes.dashboards import dashboards_bp
from routes.products import products_bp


def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    
    # Enable CORS for React frontend (Vite defaults to 5173)
    # Allows our frontend to make requests to this backend without browser blocking it
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Connect to MySQL
    init_db(app)

    # Register API blueprints
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(dashboards_bp, url_prefix="/api/dashboards")
    app.register_blueprint(products_bp, url_prefix="/api/products")

    @app.errorhandler(Exception)
    def handle_exception(e):
        # Pass through HTTP errors
        if hasattr(e, 'code'):
            return jsonify({"error": str(e)}), e.code
        # Handle non-HTTP exceptions only
        app.logger.error(f"Server Error: {str(e)}")
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {"status": "Backend is running!"}, 200

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
