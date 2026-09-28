import os
from flask import Flask, jsonify, request, send_file, abort
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import gridfs
import io

load_dotenv()

app = Flask(__name__)
# Allow CORS for main frontend routes
CORS(app)

MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_key")

client = MongoClient(MONGO_URI)
db = client.get_database("notesharing") # Explicitly specify the database
users_collection = db["users"]
notes_collection = db["notes"]
fs = gridfs.GridFS(db)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Helper to verify token
def verify_token(token):
    if not token:
        return None
    if token.startswith("Bearer "):
        token = token.split(" ")[1]
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return decoded["user_id"]
    except Exception:
        return None

def serialize_note(note):
    note["_id"] = str(note["_id"])
    if "upload_date" in note and isinstance(note["upload_date"], datetime):
        note["upload_date"] = note["upload_date"].isoformat()
    note["downloads"] = note.get("downloads", 0)
    note["average_rating"] = round(float(note.get("average_rating", 0)), 1)
    note["rating_count"] = len(note.get("ratings", []))
    note["department"] = note.get("department", "")
    note["subject"] = note.get("subject", "")
    return note

@app.route("/")
def home():
    return "Flask backend running! Note Sharing API."

# ----------------- AUTHENTICATION -----------------

@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.json or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    department = data.get("department", "").strip()

    if not name or not email or not password:
        return jsonify({"message": "Missing required fields"}), 400

    if not email.endswith("@rmkec.ac.in"):
        return jsonify({"message": "Please register using your college email (@rmkec.ac.in)"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists with this email"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    user = {
        "name": name,
        "email": email,
        "department": department,
        "password": hashed_password,
        "followers": [],
        "following": [],
        "saved_notes": [],
        "created_at": datetime.utcnow()
    }
    result = users_collection.insert_one(user)
    return jsonify({
        "message": "User created successfully",
        "user_id": str(result.inserted_id)
    }), 201

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    if bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        user_id_str = str(user["_id"])
        token = jwt.encode({
            "user_id": user_id_str,
            "name": user["name"],
            "exp": datetime.utcnow() + timedelta(days=7)
        }, JWT_SECRET, algorithm="HS256")
        return jsonify({
            "token": token,
            "user": {
                "id": user_id_str,
                "name": user["name"],
                "email": user["email"],
                "department": user.get("department", ""),
                "following": user.get("following", []),
                "saved_notes": user.get("saved_notes", [])
            }
        }), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# ----------------- USER PROFILE & SOCIAL -----------------

@app.route("/api/users/me", methods=["GET"])
def get_current_user():
    token = request.headers.get("Authorization")
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Calculate user's uploaded notes stats
    user_notes = list(notes_collection.find({"uploader_id": user_id}))
    total_downloads = sum(n.get("downloads", 0) for n in user_notes)
    ratings = [n.get("average_rating", 0) for n in user_notes if n.get("average_rating", 0) > 0]
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0.0

    return jsonify({
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "department": user.get("department", ""),
        "followers_count": len(user.get("followers", [])),
        "following_count": len(user.get("following", [])),
        "followers": user.get("followers", []),
        "following": user.get("following", []),
        "saved_notes": user.get("saved_notes", []),
        "uploads_count": len(user_notes),
        "total_downloads": total_downloads,
        "avg_rating": avg_rating
    }), 200

@app.route("/api/users/<user_id>", methods=["GET"])
def get_user_profile(user_id):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "User not found"}), 404

        user_notes = list(notes_collection.find({"uploader_id": user_id}))
        total_downloads = sum(n.get("downloads", 0) for n in user_notes)
        ratings = [n.get("average_rating", 0) for n in user_notes if n.get("average_rating", 0) > 0]
        avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0.0

        return jsonify({
            "id": str(user["_id"]),
            "name": user["name"],
            "department": user.get("department", ""),
            "followers_count": len(user.get("followers", [])),
            "following_count": len(user.get("following", [])),
            "uploads_count": len(user_notes),
            "total_downloads": total_downloads,
            "avg_rating": avg_rating
        }), 200
    except Exception:
        return jsonify({"message": "Invalid user ID"}), 400

@app.route("/api/users/<target_user_id>/follow", methods=["POST"])
def toggle_follow(target_user_id):
    token = request.headers.get("Authorization")
    current_user_id = verify_token(token)
    if not current_user_id:
        return jsonify({"message": "Unauthorized"}), 401

    if current_user_id == target_user_id:
        return jsonify({"message": "You cannot follow yourself"}), 400

    try:
        target_obj_id = ObjectId(target_user_id)
        current_obj_id = ObjectId(current_user_id)
    except Exception:
        return jsonify({"message": "Invalid user ID"}), 400

    target_user = users_collection.find_one({"_id": target_obj_id})
    current_user = users_collection.find_one({"_id": current_obj_id})

    if not target_user or not current_user:
        return jsonify({"message": "User not found"}), 404

    current_following = current_user.get("following", [])

    if target_user_id in current_following:
        # Unfollow
        users_collection.update_one({"_id": current_obj_id}, {"$pull": {"following": target_user_id}})
        users_collection.update_one({"_id": target_obj_id}, {"$pull": {"followers": current_user_id}})
        is_following = False
        message = f"Unfollowed {target_user['name']}"
    else:
        # Follow
        users_collection.update_one({"_id": current_obj_id}, {"$addToSet": {"following": target_user_id}})
        users_collection.update_one({"_id": target_obj_id}, {"$addToSet": {"followers": current_user_id}})
        is_following = True
        message = f"Now following {target_user['name']}"

    return jsonify({
        "message": message,
        "is_following": is_following
    }), 200

# ----------------- NOTE UPLOAD & FILE MANAGEMENT -----------------

@app.route("/api/upload", methods=["POST"])
def upload_file():
    token = request.headers.get("Authorization")
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if 'file' not in request.files:
        return jsonify({"message": "No file attached"}), 400
    
    file = request.files['file']
    title = request.form.get("title", "Untitled Document").strip()
    department = request.form.get("dept", request.form.get("department", "")).strip()
    subject = request.form.get("subject", "").strip()

    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    
    # Check file size (10 MB limit)
    file.seek(0, os.SEEK_END)
    file_length = file.tell()
    file.seek(0, os.SEEK_SET) # reset file pointer
    
    if file_length > 10 * 1024 * 1024:
        return jsonify({"message": "File exceeds 10MB limit. Please compress it or use ZIP files."}), 400

    filename_lower = file.filename.lower()
    if filename_lower.endswith(('.pdf', '.zip')):
        username_safe = secure_filename(user["name"])
        original_filename = secure_filename(file.filename)
        new_filename = f"{username_safe}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{original_filename}"
        
        file_id = fs.put(file, filename=new_filename, content_type=file.content_type)

        note = {
            "title": title or "Untitled Document",
            "department": department,
            "subject": subject,
            "filename": new_filename,
            "original_filename": original_filename,
            "file_id": str(file_id),
            "uploader_id": user_id,
            "uploader_name": user["name"],
            "upload_date": datetime.utcnow(),
            "downloads": 0,
            "ratings": [],
            "average_rating": 0.0
        }
        res = notes_collection.insert_one(note)
        note["_id"] = str(res.inserted_id)
        return jsonify({"message": "Notes uploaded successfully!", "note": serialize_note(note)}), 201

    return jsonify({"message": "Only PDF and ZIP files are allowed"}), 400

@app.route("/api/files/<file_id>", methods=["GET"])
def get_file(file_id):
    try:
        grid_out = fs.get(ObjectId(file_id))
        
        # Increment downloads count for associated note
        notes_collection.update_one({"file_id": file_id}, {"$inc": {"downloads": 1}})

        return send_file(
            io.BytesIO(grid_out.read()),
            mimetype=grid_out.content_type or 'application/octet-stream',
            as_attachment=False,
            download_name=grid_out.filename
        )
    except gridfs.errors.NoFile:
        abort(404, description="File not found")
    except Exception:
        abort(500, description="Error retrieving file")

@app.route("/api/notes/<note_id>", methods=["DELETE"])
def delete_note(note_id):
    token = request.headers.get("Authorization")
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        note = notes_collection.find_one({"_id": ObjectId(note_id)})
        if not note:
            return jsonify({"message": "Note not found"}), 404

        if note.get("uploader_id") != user_id:
            return jsonify({"message": "Permission denied. You can only delete your own notes."}), 403

        # Delete file from GridFS
        if "file_id" in note:
            try:
                fs.delete(ObjectId(note["file_id"]))
            except Exception:
                pass

        # Remove from notes collection
        notes_collection.delete_one({"_id": ObjectId(note_id)})
        # Also clean up from any user's saved_notes
        users_collection.update_many({}, {"$pull": {"saved_notes": note_id}})

        return jsonify({"message": "Note deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Error deleting note: {str(e)}"}), 500

# ----------------- NOTE BROWSING, SEARCH & INTERACTIONS -----------------

@app.route("/api/notes", methods=["GET"])
def get_notes():
    dept = request.args.get("dept", "").strip()
    search = request.args.get("search", "").strip()
    sort_by = request.args.get("sort", "recent").strip()
    uploader_id = request.args.get("uploader_id", "").strip()

    query = {}
    if dept and dept.lower() != "all":
        query["department"] = {"$regex": f"^{dept}$", "$options": "i"}

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"subject": {"$regex": search, "$options": "i"}},
            {"uploader_name": {"$regex": search, "$options": "i"}},
            {"department": {"$regex": search, "$options": "i"}}
        ]

    if uploader_id:
        query["uploader_id"] = uploader_id

    cursor = notes_collection.find(query)

    if sort_by == "popular":
        cursor = cursor.sort("downloads", -1)
    elif sort_by == "rated":
        cursor = cursor.sort("average_rating", -1)
    else: # recent
        cursor = cursor.sort("upload_date", -1)

    notes = [serialize_note(note) for note in cursor]
    return jsonify(notes), 200

@app.route("/api/notes/feed", methods=["GET"])
def get_feed_notes():
    token = request.headers.get("Authorization")
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    following_ids = user.get("following", [])
    if not following_ids:
        return jsonify([]), 200

    notes = list(notes_collection.find({"uploader_id": {"$in": following_ids}}).sort("upload_date", -1))
    return jsonify([serialize_note(note) for note in notes]), 200

@app.route("/api/notes/saved", methods=["GET"])
def get_saved_notes():
    token = request.headers.get("Authorization")
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    saved_note_ids = user.get("saved_notes", [])
    if not saved_note_ids:
        return jsonify([]), 200

    valid_object_ids = []
    for nid in saved_note_ids:
        try:
            valid_object_ids.append(ObjectId(nid))
        except Exception:
            pass

    notes = list(notes_collection.find({"_id": {"$in": valid_object_ids}}).sort("upload_date", -1))
    return jsonify([serialize_note(note) for note in notes]), 200

@app.route("/api/notes/<note_id>/favorite", methods=["POST"])
def toggle_favorite(note_id):
    token = request.headers.get("Authorization")
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    saved_notes = user.get("saved_notes", [])
    if note_id in saved_notes:
        users_collection.update_one({"_id": ObjectId(user_id)}, {"$pull": {"saved_notes": note_id}})
        is_favorite = False
        message = "Removed from saved notes"
    else:
        users_collection.update_one({"_id": ObjectId(user_id)}, {"$addToSet": {"saved_notes": note_id}})
        is_favorite = True
        message = "Saved to favorites"

    return jsonify({"message": message, "is_favorite": is_favorite}), 200

@app.route("/api/notes/<note_id>/rate", methods=["POST"])
def rate_note(note_id):
    token = request.headers.get("Authorization")
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.json or {}
    try:
        rating_value = int(data.get("rating", 0))
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid rating format"}), 400

    if rating_value < 1 or rating_value > 5:
        return jsonify({"message": "Rating must be between 1 and 5"}), 400

    try:
        note = notes_collection.find_one({"_id": ObjectId(note_id)})
        if not note:
            return jsonify({"message": "Note not found"}), 404

        # Remove previous rating from this user if exists
        ratings = [r for r in note.get("ratings", []) if r.get("user_id") != user_id]
        ratings.append({
            "user_id": user_id,
            "rating": rating_value,
            "created_at": datetime.utcnow()
        })

        avg_rating = round(sum(r["rating"] for r in ratings) / len(ratings), 1)

        notes_collection.update_one(
            {"_id": ObjectId(note_id)},
            {"$set": {"ratings": ratings, "average_rating": avg_rating}}
        )

        return jsonify({
            "message": "Rating submitted successfully",
            "average_rating": avg_rating,
            "rating_count": len(ratings)
        }), 200
    except Exception as e:
        return jsonify({"message": f"Error saving rating: {str(e)}"}), 500

# ----------------- LEADERBOARD -----------------

@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    try:
        # Aggregate top contributors
        all_notes = list(notes_collection.find({}))
        uploader_stats = {}
        for note in all_notes:
            uid = note.get("uploader_id")
            if not uid:
                continue
            if uid not in uploader_stats:
                uploader_stats[uid] = {
                    "id": uid,
                    "name": note.get("uploader_name", "Anonymous"),
                    "dept": note.get("department", "General"),
                    "uploads": 0,
                    "downloads": 0,
                    "score": 0
                }
            uploader_stats[uid]["uploads"] += 1
            uploader_stats[uid]["downloads"] += note.get("downloads", 0)

        # Lookup departments from user records if blank
        for uid, stat in uploader_stats.items():
            if not stat["dept"] or stat["dept"] == "General":
                try:
                    u = users_collection.find_one({"_id": ObjectId(uid)})
                    if u and u.get("department"):
                        stat["dept"] = u["department"]
                except Exception:
                    pass
            # Score formula: 15 points per upload + 2 points per download
            stat["score"] = (stat["uploads"] * 15) + (stat["downloads"] * 2)

        top_students = sorted(list(uploader_stats.values()), key=lambda x: x["score"], reverse=True)[:10]

        # Top rated notes (sorted by rating, then downloads)
        top_notes_cursor = notes_collection.find({}).sort([("average_rating", -1), ("downloads", -1)]).limit(10)
        top_notes = [
            {
                "id": str(n["_id"]),
                "title": n.get("title", "Untitled"),
                "subject": n.get("subject", n.get("department", "General")),
                "author": n.get("uploader_name", "Anonymous"),
                "rating": round(float(n.get("average_rating", 0)), 1),
                "downloads": n.get("downloads", 0)
            }
            for n in top_notes_cursor
        ]

        return jsonify({
            "top_students": top_students,
            "top_notes": top_notes
        }), 200
    except Exception as e:
        return jsonify({"message": f"Error calculating leaderboard: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)