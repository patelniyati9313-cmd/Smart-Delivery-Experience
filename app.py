
from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

DATABASE = "delivery_data.db"


# Create database and table
def initialize_database():
    connection = sqlite3.connect(DATABASE)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS prototype_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            demo_order_id TEXT,
            success INTEGER,
            created_at TEXT
        )
    """)

    connection.commit()
    connection.close()


# Save a prototype event
def save_event(event_type, demo_order_id=None, success=None):

    connection = sqlite3.connect(DATABASE)

    connection.execute("""
        INSERT INTO prototype_events
        (event_type, demo_order_id, success, created_at)
        VALUES (?, ?, ?, ?)
    """, (
        event_type,
        demo_order_id,
        success,
        datetime.now().isoformat(timespec="seconds")
    ))

    connection.commit()
    connection.close()


# Homepage
@app.route("/")
def home():
    return render_template("index.html")


# Record tracking activity
@app.route("/api/track", methods=["POST"])
def track():

    data = request.get_json(silent=True) or {}

    order_id = data.get("order_id", "").strip().upper()

    # Only allow the prototype demo IDs
    valid_ids = ["SD1001", "SD1002"]

    success = 1 if order_id in valid_ids else 0

    save_event(
        event_type="tracking_attempt",
        demo_order_id=order_id[:20],
        success=success
    )

    if success:
        return jsonify({
            "success": True,
            "message": "Demo tracking request recorded."
        })

    return jsonify({
        "success": False,
        "message": "Demo ID not found."
    }), 400


# Record usability feedback
@app.route("/api/feedback", methods=["POST"])
def feedback():

    data = request.get_json(silent=True) or {}

    feedback_type = data.get("event_type", "feedback")

    # Limit what is stored in the database
    allowed_events = [
        "task_completed",
        "task_failed",
        "tracking_attempt",
        "prototype_feedback"
    ]

    if feedback_type not in allowed_events:
        return jsonify({"success": False}), 400

    save_event(
        event_type=feedback_type,
        success=data.get("success")
    )

    return jsonify({
        "success": True,
        "message": "Event recorded."
    })


# View anonymized project testing summary
@app.route("/api/summary")
def summary():

    connection = sqlite3.connect(DATABASE)

    total = connection.execute("""
        SELECT COUNT(*) FROM prototype_events
    """).fetchone()[0]

    successful = connection.execute("""
        SELECT COUNT(*) FROM prototype_events
        WHERE success = 1
    """).fetchone()[0]

    failed = connection.execute("""
        SELECT COUNT(*) FROM prototype_events
        WHERE success = 0
    """).fetchone()[0]

    connection.close()

    return jsonify({
        "total_events": total,
        "successful_events": successful,
        "failed_events": failed
    })


initialize_database()

if __name__ == "__main__":
    app.run(debug=True)