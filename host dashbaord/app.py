from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

queue = {
    "current_number": 8,
    "next_number": 9,
    "counter": 3,
    "service_rate": 2
}


@app.route("/")
def admin():
    return render_template("index.html")


@app.route("/user")
def user():
    return render_template("user.html")


@app.route("/api/queue")
def get_queue():

    waiting = max(
        0,
        queue["next_number"] -
        queue["current_number"] - 1
    )

    return jsonify({
        **queue,
        "waiting": waiting
    })


@app.route("/api/join", methods=["POST"])
def join_queue():

    ticket = queue["next_number"]

    queue["next_number"] += 1

    people_ahead = max(
        0,
        ticket -
        queue["current_number"] - 1
    )

    return jsonify({
        "ticket": f"QZ-{ticket}",
        "position": people_ahead + 1,
        "people_ahead": people_ahead
    })


@app.route("/api/next", methods=["POST"])
def next_person():

    if queue["current_number"] < queue["next_number"] - 1:
        queue["current_number"] += 1

    return jsonify(queue)


@app.route("/api/add", methods=["POST"])
def add_person():

    queue["next_number"] += 1

    return jsonify(queue)


@app.route("/api/counter", methods=["POST"])
def change_counter():

    data = request.get_json()

    try:
        counter = int(data.get("counter", 3))
    except:
        return jsonify({
            "error": "Invalid counter"
        }), 400

    if counter < 1 or counter > 20:

        return jsonify({
            "error": "Counter must be between 1 and 20"
        }), 400

    queue["counter"] = counter

    return jsonify(queue)


@app.route("/api/service-rate", methods=["POST"])
def change_service_rate():

    data = request.get_json()

    try:
        rate = float(
            data.get("service_rate", 2)
        )
    except:
        return jsonify({
            "error": "Invalid service rate"
        }), 400

    if rate <= 0 or rate > 20:

        return jsonify({
            "error": "Rate must be between 0.1 and 20"
        }), 400

    queue["service_rate"] = rate

    return jsonify(queue)


@app.route("/api/reset", methods=["POST"])
def reset_queue():

    queue["current_number"] = 1
    queue["next_number"] = 2
    queue["counter"] = 3
    queue["service_rate"] = 2

    return jsonify(queue)


if __name__ == "__main__":
    app.run(debug=True)