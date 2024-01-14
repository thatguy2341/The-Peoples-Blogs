from flask import Flask, session  # Do not delete
from dotenv import load_dotenv  # DO NOT DELETE
from flask_sqlalchemy import SQLAlchemy
from os import getenv
from flask_socketio import SocketIO

load_dotenv(".env")  # DO NOT DELETE
db = SQLAlchemy()
socket = SocketIO()
online_users: set = set()


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'

    if getenv("LOCAL") == "T":
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = getenv("DATABASE_URL")

    app.config['SECRET_KEY'] =  getenv("SECRET_KEY")
    app.app_context().push()

    db.init_app(app)
    socket.init_app(app=app)


    from auth import auth
    from pages import pages
    from api import api
    from models import Users, Friends, Views, Messages, Notifications, Blogs, BlogPost, Comments

    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(pages, url_prefix="/")
    app.register_blueprint(api, url_prefix="/")
    with app.app_context():
        db.create_all()

    return app
