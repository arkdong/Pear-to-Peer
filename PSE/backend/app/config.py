"""Configuration for the flask app"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import secrets
import os
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import timedelta


# Creates and returns a secret key saved in file_path
def get_or_create_secret_key(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            secret_key = f.read().strip()
    else:
        secret_key = secrets.token_hex(32)
        with open(file_path, 'w') as f:
            f.write(secret_key)
    return str(secret_key)


backend_dir = os.getcwd()
project_dir = os.path.dirname(backend_dir)
SECRETS_FOLDER = os.path.join(project_dir, "backend/secrets")
FLASK_TOKEN_FILE = os.path.join(SECRETS_FOLDER, "flask_token.txt")
JWT_TOKEN_FILE = os.path.join(SECRETS_FOLDER, "jwt_token.txt")

# Initilize flask application
app = Flask(__name__, template_folder='../templates')
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_host=1)


# Allow to send cross origin request to the app
CORS(app)

# Create the instance bound secrets folder
os.makedirs(SECRETS_FOLDER, exist_ok=True)

# Specifying the location of local SQLite db
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase.db"
# Disable tracking for all modifications to the db
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = get_or_create_secret_key(FLASK_TOKEN_FILE)

# JWT authentication
app.config["JWT_SECRET_KEY"] = get_or_create_secret_key(JWT_TOKEN_FILE)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)

# Create a db instance and provide access to the db
db = SQLAlchemy(app)
