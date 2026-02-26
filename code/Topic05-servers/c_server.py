from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return "hello mum"

@app.route("/inquery")
def inquery():
    name = request.args["name"]
    return request.args

@app.route("/inbody", methods=["POST"])
def inbody():
    name = request.json["name"]
    age = request.json["age"]
    #print (request.json)
    return f"you are {name} and aged {age} {type(age)}"

@app.route('/user')
def getuser():
    user={
        'name': "andrew",
        'age' : 21
    }
    return jsonify(user)

if __name__ == "__main__":
    app.run(debug = True)
