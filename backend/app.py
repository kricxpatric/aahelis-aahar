from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "database.db")


# ================================
# DATABASE
# ================================

def get_db():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


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
    connection.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT,
            items TEXT NOT NULL,
            total REAL NOT NULL,
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()
    connection.close()


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
def add_menu():

    data = request.get_json()

    print("ADD REQUEST:", data)

    if not data:
        return jsonify({"error": "No data received"}), 400

    day = data.get("day")
    name = data.get("name")
    description = data.get("description", "")
    price = data.get("price")
    category = data.get("category")

    if not day or not name or price is None or not category:
        return jsonify({"error": "Missing required fields"}), 400

    connection = get_db()

    cursor = connection.execute("""
        INSERT INTO menu_items
        (day, name, description, price, category, available)
        VALUES (?, ?, ?, ?, ?, 1)
    """, (
        day,
        name,
        description,
        price,
        category
    ))

    connection.commit()

    new_id = cursor.lastrowid

    connection.close()

    print("ADDED ITEM ID:", new_id)

    return jsonify({
        "message": "Menu item added",
        "id": new_id
    }), 201


# ================================
# EDIT MENU ITEM
# ================================

@app.route("/api/menu/<int:item_id>", methods=["PUT"])
def update_menu(item_id):

    data = request.get_json()

    print("UPDATE REQUEST:", item_id, data)

    if not data:
        return jsonify({"error": "No data received"}), 400

    day = data.get("day")
    name = data.get("name")
    description = data.get("description", "")
    price = data.get("price")
    category = data.get("category")

    if not day or not name or price is None or not category:
        return jsonify({"error": "Missing required fields"}), 400

    connection = get_db()

    cursor = connection.execute("""
        UPDATE menu_items
        SET
            day = ?,
            name = ?,
            description = ?,
            price = ?,
            category = ?
        WHERE id = ?
    """, (
        day,
        name,
        description,
        price,
        category,
        item_id
    ))

    connection.commit()

    changed = cursor.rowcount

    connection.close()

    print("ROWS UPDATED:", changed)

    if changed == 0:
        return jsonify({"error": "Menu item not found"}), 404

    return jsonify({
        "message": "Menu item updated"
    })


# ================================
# ENABLE / DISABLE
# ================================

@app.route("/api/menu/<int:item_id>/availability", methods=["PATCH"])
def toggle_availability(item_id):

    data = request.get_json()

    print("AVAILABILITY REQUEST:", item_id, data)

    available = data.get("available")

    if available is None:
        return jsonify({"error": "Availability missing"}), 400

    connection = get_db()

    cursor = connection.execute("""
        UPDATE menu_items
        SET available = ?
        WHERE id = ?
    """, (
        1 if available else 0,
        item_id
    ))

    connection.commit()

    changed = cursor.rowcount

    connection.close()

    print("AVAILABILITY UPDATED:", changed)

    if changed == 0:
        return jsonify({"error": "Menu item not found"}), 404

    return jsonify({
        "message": "Availability updated",
        "available": bool(available)
    })


# ================================
# DELETE
# ================================

@app.route("/api/menu/<int:item_id>", methods=["DELETE"])
def delete_menu(item_id):

    print("DELETE REQUEST:", item_id)

    connection = get_db()

    cursor = connection.execute("""
        DELETE FROM menu_items
        WHERE id = ?
    """, (item_id,))

    connection.commit()

    changed = cursor.rowcount

    connection.close()

    print("ROWS DELETED:", changed)

    if changed == 0:
        return jsonify({"error": "Menu item not found"}), 404

    return jsonify({
        "message": "Menu item deleted"
    })



# ================================
# ORDERS API
# ================================

# GET ALL ORDERS
@app.route("/api/orders", methods=["GET"])
def get_orders():

    connection = get_db()

    orders = connection.execute("""
        SELECT * FROM orders
        ORDER BY datetime(created_at) DESC
    """).fetchall()

    connection.close()

    return jsonify([dict(order) for order in orders])


# GET SINGLE ORDER
@app.route("/api/orders/<int:order_id>", methods=["GET"])
def get_order(order_id):

    connection = get_db()

    order = connection.execute("""
        SELECT * FROM orders
        WHERE id = ?
    """, (order_id,)).fetchone()

    connection.close()

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404

    return jsonify(dict(order))


# CREATE ORDER
@app.route("/api/orders", methods=["POST"])
def create_order():

    data = request.get_json()

    print("NEW ORDER:", data)

    if not data:
        return jsonify({
            "error": "No data received"
        }), 400

    customer_name = data.get("customer_name")
    phone = data.get("phone")
    address = data.get("address", "")
    items = data.get("items")
    total = data.get("total")

    if not customer_name or not phone or not items or total is None:
        return jsonify({
            "error": "Missing required fields"
        }), 400

    connection = get_db()

    cursor = connection.execute("""
        INSERT INTO orders
        (customer_name, phone, address, items, total, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        customer_name,
        phone,
        address,
        items,
        total,
        "Pending"
    ))

    connection.commit()

    order_id = cursor.lastrowid

    connection.close()

    print("ORDER CREATED:", order_id)

    return jsonify({
        "message": "Order created successfully",
        "id": order_id
    }), 201


# UPDATE ORDER STATUS
@app.route("/api/orders/<int:order_id>/status", methods=["PATCH"])
def update_order_status(order_id):

    data = request.get_json()

    if not data or "status" not in data:
        return jsonify({
            "error": "Status is required"
        }), 400

    status = data["status"]

    allowed_statuses = [
        "Pending",
        "Confirmed",
        "Preparing",
        "Ready",
        "Out for Delivery",
        "Completed",
        "Cancelled"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "error": "Invalid order status"
        }), 400

    connection = get_db()

    cursor = connection.execute("""
        UPDATE orders
        SET status = ?
        WHERE id = ?
    """, (
        status,
        order_id
    ))

    connection.commit()

    changed = cursor.rowcount

    connection.close()

    if changed == 0:
        return jsonify({
            "error": "Order not found"
        }), 404

    print(
        "ORDER STATUS UPDATED:",
        order_id,
        status
    )

    return jsonify({
        "message": "Order status updated",
        "status": status
    })


# DELETE ORDER
@app.route("/api/orders/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):

    connection = get_db()

    cursor = connection.execute("""
        DELETE FROM orders
        WHERE id = ?
    """, (order_id,))

    connection.commit()

    changed = cursor.rowcount

    connection.close()

    if changed == 0:
        return jsonify({
            "error": "Order not found"
        }), 404

    print("ORDER DELETED:", order_id)

    return jsonify({
        "message": "Order deleted"
    })

# ================================
# START SERVER
# ================================

if __name__ == "__main__":

    create_database()

    print("Database ready.")
    print("Starting Aaheli's Aahar backend...")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )