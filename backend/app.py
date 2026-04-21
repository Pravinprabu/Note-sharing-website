import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)
# Allow CORS for main frontend routes
CORS(app)

MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_key")

client = MongoClient(MONGO_URI)
db = client.get_database() # Uses the default database in URI or specify
users_collection = db["users"]
notes_collection = db["notes"]

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Helper to verify token
def verify_token(token):
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return decoded["user_id"]
    except:
        return None

@app.route("/")
def home():
    return "Flask backend running! Note Sharing API."

@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"message": "Missing fields"}), 400

    if not email.endswith("@rmkec.ac.in"):
        return jsonify({"message": "Please register using your college email (@rmkec.ac.in)"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    user = {
        "name": name,
        "email": email,
        "password": hashed_password
    }
    users_collection.insert_one(user)
    return jsonify({"message": "User created successfully"}), 201

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    if bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        token = jwt.encode({
            "user_id": str(user["_id"]),
            "name": user["name"],
            "exp": datetime.utcnow() + timedelta(days=1)
        }, JWT_SECRET, algorithm="HS256")
        return jsonify({"token": token, "user": {"name": user["name"], "email": user["email"]}}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route("/api/upload", methods=["POST"])
def upload_file():
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        return jsonify({"message": "Unauthorized"}), 401
    
    token = token.split(" ")[1]
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"message": "Invalid token"}), 401

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    
    file = request.files['file']
    title = request.form.get("title", "Untitled Document")

    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    
    if file and file.filename.endswith('.pdf'):
        # Stored in a file in the name of the user
        username_safe = secure_filename(user["name"])
        original_filename = secure_filename(file.filename)
        
        # Create a user specific directory or file name
        new_filename = f"{username_safe}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{original_filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
        file.save(file_path)

        note = {
            "title": title,
            "filename": new_filename,
            "filepath": file_path,
            "uploader_id": user_id,
            "uploader_name": user["name"],
            "upload_date": datetime.utcnow()
        }
        notes_collection.insert_one(note)
        return jsonify({"message": "File uploaded successfully"}), 201

    return jsonify({"message": "Only PDF files are allowed"}), 400

@app.route("/api/notes", methods=["GET"])
def get_notes():
    notes = list(notes_collection.find({}).sort("upload_date", -1))
    for note in notes:
        note["_id"] = str(note["_id"])
        if "upload_date" in note:
            note["upload_date"] = note["upload_date"].isoformat()
    return jsonify(notes), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)