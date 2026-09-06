from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(os.path.dirname(__file__), "database.db")


# ================================
# DATABASE CONNECTION
# ================================

def get_db():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


# ================================
# CREATE DATABASE
# ================================

def create_database():

    connection = get_db()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            available INTEGER DEFAULT 1
        )
    """)

    connection.commit()
    connection.close()


# ================================
# HOME / TEST ROUTE
# ================================

@app.route("/")
def home():
    return jsonify({
        "message": "Aaheli's Aahar backend is running!"
    })


# ================================
# GET MENU
# ================================

@app.route("/api/menu", methods=["GET"])
def get_menu():

    connection = get_db()

    items = connection.execute("""
        SELECT * FROM menu_items
        WHERE available = 1
        ORDER BY id
    """).fetchall()

    connection.close()

    return jsonify([dict(item) for item in items])


# ================================
# START SERVER
# ================================

if __name__ == "__main__":

    create_database()

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )