from flask import Flask, jsonify, request
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
# ADD INITIAL MENU
# ================================

def add_initial_menu():

    connection = get_db()

    existing_items = connection.execute(
        "SELECT COUNT(*) FROM menu_items"
    ).fetchone()[0]

    if existing_items == 0:

        menu_items = [
            (
                "Monday",
                "Idli",
                "4 pieces • Sambar • Chatni • Egg / Paneer",
                80,
                "canteen",
                1
            ),
            (
                "Tuesday",
                "Rice & Mixed Veg",
                "Daal • Salad • Curd",
                80,
                "canteen",
                1
            ),
            (
                "Wednesday",
                "Roti",
                "4 pieces • Mixed Veg • Egg Curry / Paneer • Salad • Curd",
                80,
                "canteen",
                1
            ),
            (
                "Thursday",
                "Veg Chila",
                "4 pieces • Salad • Paneer • Aachar • Curd",
                80,
                "canteen",
                1
            ),
            (
                "Thursday",
                "Chowmin",
                "Salad",
                80,
                "canteen",
                1
            ),
            (
                "Friday",
                "Dalia Khichdi",
                "Papor • Salad • Curd • Chatni",
                80,
                "canteen",
                1
            ),
            (
                "Saturday",
                "Parota",
                "4 pieces • Aalur Dom • Aachar",
                80,
                "canteen",
                1
            )
        ]

        connection.executemany("""
            INSERT INTO menu_items
            (day, name, description, price, category, available)
            VALUES (?, ?, ?, ?, ?, ?)
        """, menu_items)

        connection.commit()

    connection.close()


# ================================
# HOME
# ================================

@app.route("/")
def home():

    return jsonify({
        "message": "Aaheli's Aahar backend is running!"
    })


# ================================
# GET ALL MENU ITEMS
# ================================

@app.route("/api/menu", methods=["GET"])
def get_menu():

    connection = get_db()

    items = connection.execute("""
        SELECT * FROM menu_items
        ORDER BY id
    """).fetchall()

    connection.close()

    return jsonify([dict(item) for item in items])


# ================================
# ADD MENU ITEM
# ================================

@app.route("/api/menu", methods=["POST"])
def add_menu_item():

    data = request.get_json()

    required_fields = [
        "day",
        "name",
        "description",
        "price",
        "category"
    ]

    for field in required_fields:

        if field not in data:
            return jsonify({
                "error": f"Missing field: {field}"
            }), 400

    connection = get_db()

    cursor = connection.execute("""
        INSERT INTO menu_items
        (day, name, description, price, category, available)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        data["day"],
        data["name"],
        data["description"],
        data["price"],
        data["category"],
        data.get("available", 1)
    ))

    connection.commit()

    item = connection.execute(
        "SELECT * FROM menu_items WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()

    connection.close()

    return jsonify(dict(item)), 201


# ================================
# EDIT MENU ITEM
# ================================

@app.route("/api/menu/<int:item_id>", methods=["PUT"])
def update_menu_item(item_id):

    data = request.get_json()

    connection = get_db()

    existing_item = connection.execute(
        "SELECT * FROM menu_items WHERE id = ?",
        (item_id,)
    ).fetchone()

    if existing_item is None:

        connection.close()

        return jsonify({
            "error": "Menu item not found"
        }), 404

    connection.execute("""
        UPDATE menu_items
        SET day = ?,
            name = ?,
            description = ?,
            price = ?,
            category = ?,
            available = ?
        WHERE id = ?
    """, (
        data.get("day", existing_item["day"]),
        data.get("name", existing_item["name"]),
        data.get("description", existing_item["description"]),
        data.get("price", existing_item["price"]),
        data.get("category", existing_item["category"]),
        data.get("available", existing_item["available"]),
        item_id
    ))

    connection.commit()

    updated_item = connection.execute(
        "SELECT * FROM menu_items WHERE id = ?",
        (item_id,)
    ).fetchone()

    connection.close()

    return jsonify(dict(updated_item))


# ================================
# DELETE MENU ITEM
# ================================

@app.route("/api/menu/<int:item_id>", methods=["DELETE"])
def delete_menu_item(item_id):

    connection = get_db()

    existing_item = connection.execute(
        "SELECT * FROM menu_items WHERE id = ?",
        (item_id,)
    ).fetchone()

    if existing_item is None:

        connection.close()

        return jsonify({
            "error": "Menu item not found"
        }), 404

    connection.execute(
        "DELETE FROM menu_items WHERE id = ?",
        (item_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Menu item deleted successfully"
    })


# ================================
# ENABLE / DISABLE MENU ITEM
# ================================

@app.route("/api/menu/<int:item_id>/availability", methods=["PATCH"])
def change_availability(item_id):

    data = request.get_json()

    if "available" not in data:

        return jsonify({
            "error": "available field is required"
        }), 400

    connection = get_db()

    existing_item = connection.execute(
        "SELECT * FROM menu_items WHERE id = ?",
        (item_id,)
    ).fetchone()

    if existing_item is None:

        connection.close()

        return jsonify({
            "error": "Menu item not found"
        }), 404

    connection.execute("""
        UPDATE menu_items
        SET available = ?
        WHERE id = ?
    """, (
        data["available"],
        item_id
    ))

    connection.commit()

    updated_item = connection.execute(
        "SELECT * FROM menu_items WHERE id = ?",
        (item_id,)
    ).fetchone()

    connection.close()

    return jsonify(dict(updated_item))


# ================================
# START SERVER
# ================================

if __name__ == "__main__":

    create_database()
    add_initial_menu()

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )