from flask import Flask, url_for, redirect

app = Flask(__name__, static_url_path='', static_folder='staticpages')

# mapping
@app.route('/')
def index():
    return "<h1>hi there mom</h1>"

@app.route('/users', methods=['GET'])
def get_users():
    return "getting all users"

@app.route("/users/<username>", methods=['GET']) 
def get_user_byname(username):
    return f"hello {username}" 

@app.route("/users/<int:id>", methods=['GET']) 
def get_user_byid(id):
    return f"your id is {id}" 

@app.route('/users', methods=['POST'])
def create_user():
    return "createing a user"

@app.route('/users', methods=['PUT'])
def update_user():
    return "update a user"

@app.route('/invalid', methods=['GET'])
def testingredirect():
    return redirect(url_for('index'))

@app.route("/square/<int:id>", methods=['GET']) 
def square(id):
    return f"the square of {id} is {id**2}" 


if __name__ == "__main__":
    app.run(debug=True)
