from flask import Flask, request, jsonify
import requests
from datetime import datetime

app = Flask(__name__)

PORT = 3000
OWNER_NAME = "ZEXX_CYBER"

# 🔑 Multiple Keys Database
KEYS_DB = {
    "ZEXX_TRY": {
        "expiry": "2026-12-31",
        "status": "Premium"
    },
    "OWNER_TEST": {
        "expiry": "2030-12-30",
        "status": "Owner"
    },
    "ZEXX@_9MNTH": {
        "expiry": "2026-04-15",
        "status": "Basic"
    },
    "Z3XX_1DAY": {
        "expiry": "2026-10-01",
        "status": "Premium"
    }
}

@app.route("/search", methods=["GET"])
def search():
    phone = request.args.get("phone")
    key = request.args.get("key")

    # 1️⃣ Key Validation
    if not key or key not in KEYS_DB:
        return jsonify({
            "success": False,
            "message": "Invalid Key!",
            "owner": OWNER_NAME
        }), 401

    # 2️⃣ Expiry Check (Hidden from response)
    today = datetime.now()
    expiry_date = datetime.strptime(KEYS_DB[key]["expiry"], "%Y-%m-%d")

    if today > expiry_date:
        return jsonify({
            "success": False,
            "message": "Key Expired!",
            "owner": OWNER_NAME
        }), 403

    # 3️⃣ Phone Check
    if not phone:
        return jsonify({
            "success": False,
            "message": "Phone parameter required",
            "owner": OWNER_NAME
        }), 400

    try:
        # 🔥 External API Call
        response = requests.get(
            "https://api.subhxcosmo.in/api",
            params={
                "key": "CYBERXZEXX",
                "type": "mobile",
                "term": phone
            },
            timeout=10
        )

        api_data = response.json()

        # 🔥 Owner Replace Fix
        if isinstance(api_data, dict):
            if "data" in api_data and isinstance(api_data["data"], dict):
                if "owner" in api_data["data"]:
                    api_data["data"]["owner"] = "CYBER×CHAT"

        return jsonify({
            "success": True,
            "owner": OWNER_NAME,
            "data": api_data.get("data", api_data)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "External API Error",
            "error": str(e),
            "owner": OWNER_NAME
        }), 500


@app.route("/")
def home():
    return jsonify({
        "message": "API Running Successfully 🚀",
        "owner": OWNER_NAME
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
