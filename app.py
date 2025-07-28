from flask import Flask, jsonify, send_from_directory
import requests
import os

app = Flask(__name__, static_folder="frontend/dist", static_url_path="")

@app.route("/api/berlin-courses")
def get_berlin_courses():
    external_url = "https://www.berlin.de/sen/arbeit/weiterbildung/bildungszeit/suche/index.php/index/all.json?q="
    try:
        response = requests.get(external_url)
        response.raise_for_status()
        data = response.json()  # Ensure this is valid JSON
        # print(data)  # Check your Flask logs
        return jsonify(data)
    except requests.RequestException as e:
        print(f"Error fetching data from {external_url}: {e}")
        return jsonify({"error": str(e)}), 500

# Frontend routes
@app.route("/")
@app.route("/map")
@app.route("/combined")
def serve_react():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")