from flask import Flask, request, jsonify # type: ignore
import json
import requests # type: ignore
import secrets
from dotenv import load_dotenv # type: ignore
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Retrieve environment variables
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

# Helper functions
def get_new_code_verifier() -> str:
    token = secrets.token_urlsafe(100)
    return token[:128]

def generate_new_token(authorisation_code: str, code_verifier: str) -> dict:
    url = "https://myanimelist.net/v1/oauth2/token"
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": authorisation_code,
        "code_verifier": code_verifier,
        "grant_type": "authorization_code",
    }

    response = requests.post(url, data)
    response.raise_for_status()  # Check for HTTP errors
    token = response.json()
    response.close()

    return token

def fetch_user_recommendations(access_token: str):
    # This should contain your logic to get recommendations from the user's profile
    url = "https://api.myanimelist.net/v2/users/@me/animelist"  # Example endpoint
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()

    # Parse data (this is just an example; adjust as per your needs)
    data = response.json()
    recommendations = [
        {"title": anime["title"], "score": anime["score"], "genres": anime["genres"]}
        for anime in data.get("data", [])
    ]
    return recommendations

# Routes
@app.route("/authorize", methods=["GET"])
def authorize():
    code_verifier = get_new_code_verifier()
    code_challenge = code_verifier  # Simplification (or use actual code_challenge generation)
    url = f"https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id={CLIENT_ID}&code_challenge={code_challenge}"
    return jsonify({"auth_url": url, "code_verifier": code_verifier})

@app.route("/token", methods=["POST"])
def get_token():
    data = request.json
    authorisation_code = data.get("authorisation_code")
    code_verifier = data.get("code_verifier")

    if not authorisation_code or not code_verifier:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        token = generate_new_token(authorisation_code, code_verifier)
        return jsonify(token)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/recommendations", methods=["POST"])
def get_recommendations():
    data = request.json
    access_token = data.get("access_token")

    if not access_token:
        return jsonify({"error": "Missing access token"}), 400

    try:
        recommendations = fetch_user_recommendations(access_token)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
