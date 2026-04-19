from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allows React to talk to Flask

@app.route("/")
def home():
    return "Flask backend running!"

@app.route("/api/data", methods=["GET"])
def get_data():
    return jsonify({"message": "Hello from Flask 🚀"})

@app.route("/api/post", methods=["POST"])
def post_data():
    data = request.json
    return jsonify({"received": data})

if __name__ == "__main__":
    app.run(debug=True)