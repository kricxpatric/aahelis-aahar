from flask import Flask, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "special_menus")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
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
    connection.execute("""
        CREATE TABLE IF NOT EXISTS special_menus (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            image_path TEXT NOT NULL,
            status TEXT DEFAULT 'Active',
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

# ========================================
# DASHBOARD STATISTICS
# ========================================

@app.route("/api/dashboard", methods=["GET"])
def dashboard_stats():

    connection = get_db()

    total_orders = connection.execute("""
        SELECT COUNT(*) AS count
        FROM orders
    """).fetchone()["count"]

    pending_orders = connection.execute("""
        SELECT COUNT(*) AS count
        FROM orders
        WHERE status = 'Pending'
    """).fetchone()["count"]

    completed_orders = connection.execute("""
        SELECT COUNT(*) AS count
        FROM orders
        WHERE status = 'Completed'
    """).fetchone()["count"]

    today_orders = connection.execute("""
        SELECT COUNT(*) AS count
        FROM orders
        WHERE date(created_at) = date('now', 'localtime')
    """).fetchone()["count"]

    today_sales = connection.execute("""
        SELECT COALESCE(SUM(total), 0) AS total
        FROM orders
        WHERE date(created_at) = date('now', 'localtime')
        AND status != 'Cancelled'
    """).fetchone()["total"]

    recent_orders = connection.execute("""
        SELECT *
        FROM orders
        ORDER BY datetime(created_at) DESC
        LIMIT 5
    """).fetchall()

    connection.close()

    return jsonify({
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "today_orders": today_orders,
        "today_sales": today_sales,
        "recent_orders": [dict(order) for order in recent_orders]
    })

@app.route("/api/special-menus", methods=["GET"])
def get_special_menus():

    connection = get_db()

    menus = connection.execute("""
        SELECT *
        FROM special_menus
        ORDER BY datetime(created_at) DESC
    """).fetchall()

    connection.close()

    result = []

    for menu in menus:
        item = dict(menu)

        item["image_url"] = (
            f"http://{request.host}/api/special-menus/image/"
            f"{item['image_path']}"
        )

        result.append(item)

    return jsonify(result)


@app.route("/api/special-menus", methods=["POST"])
def create_special_menu():

    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    status = request.form.get("status", "Active")

    image = request.files.get("image")

    if not title:
        return jsonify({"error": "Title is required"}), 400

    if not image:
        return jsonify({"error": "Menu image is required"}), 400

    filename = secure_filename(image.filename)

    if not filename:
        return jsonify({"error": "Invalid image file"}), 400

    # Add a unique prefix to avoid duplicate filenames
    import time

    filename = f"{int(time.time())}_{filename}"

    image.save(
        os.path.join(
            app.config["UPLOAD_FOLDER"],
            filename
        )
    )

    connection = get_db()

    cursor = connection.execute("""
        INSERT INTO special_menus
        (title, description, image_path, status)
        VALUES (?, ?, ?, ?)
    """, (
        title,
        description,
        filename,
        status
    ))

    connection.commit()

    menu_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "message": "Special menu created successfully",
        "id": menu_id
    }), 201


@app.route("/api/special-menus/<int:menu_id>", methods=["PUT"])
def update_special_menu(menu_id):

    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    status = request.form.get("status", "Active")

    image = request.files.get("image")

    connection = get_db()

    existing = connection.execute("""
        SELECT *
        FROM special_menus
        WHERE id = ?
    """, (menu_id,)).fetchone()

    if not existing:
        connection.close()
        return jsonify({"error": "Special menu not found"}), 404

    image_path = existing["image_path"]

    if image:

        filename = secure_filename(image.filename)

        if filename:

            import time

            filename = f"{int(time.time())}_{filename}"

            image.save(
                os.path.join(
                    app.config["UPLOAD_FOLDER"],
                    filename
                )
            )

            old_file = os.path.join(
                app.config["UPLOAD_FOLDER"],
                existing["image_path"]
            )

            if os.path.exists(old_file):
                os.remove(old_file)

            image_path = filename

    connection.execute("""
        UPDATE special_menus
        SET title = ?,
            description = ?,
            image_path = ?,
            status = ?
        WHERE id = ?
    """, (
        title,
        description,
        image_path,
        status,
        menu_id
    ))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Special menu updated successfully"
    })


@app.route("/api/special-menus/<int:menu_id>", methods=["DELETE"])
def delete_special_menu(menu_id):

    connection = get_db()

    existing = connection.execute("""
        SELECT *
        FROM special_menus
        WHERE id = ?
    """, (menu_id,)).fetchone()

    if not existing:
        connection.close()
        return jsonify({"error": "Special menu not found"}), 404

    image_file = os.path.join(
        app.config["UPLOAD_FOLDER"],
        existing["image_path"]
    )

    if os.path.exists(image_file):
        os.remove(image_file)

    connection.execute("""
        DELETE FROM special_menus
        WHERE id = ?
    """, (menu_id,))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Special menu deleted successfully"
    })


@app.route("/api/special-menus/<int:menu_id>/status", methods=["PATCH"])
def update_special_menu_status(menu_id):

    data = request.get_json()

    status = data.get("status")

    if status not in ["Active", "Hidden"]:
        return jsonify({"error": "Invalid status"}), 400

    connection = get_db()

    connection.execute("""
        UPDATE special_menus
        SET status = ?
        WHERE id = ?
    """, (
        status,
        menu_id
    ))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Status updated successfully"
    })


@app.route("/api/special-menus/image/<filename>")
def special_menu_image(filename):

    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )

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