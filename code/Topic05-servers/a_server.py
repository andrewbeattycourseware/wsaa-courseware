# very simple flask server

from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
        return "Hello Mamm\zdf\sdfy"

@app.route('/blah2')
def blah():
        return "this is blah2"

if __name__ == "__main__":
    app.run(debug = True)
