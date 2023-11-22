from __init__ import db, socket
from datetime import datetime
from flask import Blueprint, flash, request, redirect, render_template, url_for, abort
from flask import Blueprint, flash, request, redirect, render_template, url_for, abort
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import exc
from models import Users, session
from models import Users, session
from forms import RegistrationForm, LoginForm

auth = Blueprint('auth', __name__)


def login_required(func):
    def wrapper(*args, **kwargs):
        if Users.query.get(session['id']).is_authenticated:
            return func(*args, **kwargs)
        else:
            return abort(403, description="Unauthorized Access, you are not allowed to access this page.")

    wrapper.__name__ = func.__name__
    return wrapper


def title(string: str):
    dont_cap = {'a', 'an', 'the', 'but', 'or', 'on', 'in', 'with', 'and'}
    word_list = string.split(' ')
    string = ''
    for word in word_list:
        string += word.title() + ' ' if word not in dont_cap or word.isupper() else word + ' '
    return string.strip(' ').title()


def online(data):
    user = Users.query.get(data['id'])
    user.online = 1
    session['id'] = user.id
    session[str(user.id)] = True
    session['id'] = user.id
    session[str(user.id)] = True
    db.session.commit()
    socket.emit('connected', {'id': user.id})


def offline(data):
    user = Users.query.get(data['id'])
    user.online = 0
    session['id'] = 0
    session[str(user.id)] = False
    session.clear()
    session['dark_mode'] = user.dark_mode
    session['id'] = 0
    session[str(user.id)] = False
    session.clear()
    session['dark_mode'] = user.dark_mode
    db.session.commit()
    socket.emit('disconnected', {'id': user.id})


@auth.route('/register', methods=["POST", "GET"])
def register():
    if session.get('id'):
    if session.get('id'):
        # Bug if user logs in from phone it doesn't redirect to home_page. try and fix probably problem with csrf
        return redirect(url_for('pages.home_page'))

    form = RegistrationForm(meta={'csrf': False})

    if request.method == "POST":
        if form.validate_password.data != form.password.data:
            flash("Oops! The passwords did not match! fix the password validation.")
            return render_template("register.html", form=form)

        secured_password = generate_password_hash(form.password.data, salt_length=8)
        new_user = Users()
        new_user.email = form.email.data
        new_user.name = title(form.name.data)
        new_user.password = secured_password
        new_user.joined_date = datetime.now().strftime("%B %d, %Y")
        new_user.total_views = 0
        new_user.notification_seen = 0

        try:
            db.session.add(new_user)
            db.session.commit()
            online({'id': new_user.id})
        except exc.IntegrityError:
            db.session.rollback()
            flash("You already signed in with this email before, log in instead!")
            return redirect(url_for('auth.login'))
        else:

            # login_user(user=new_user)
            # login_user(user=new_user)
            return redirect(url_for('pages.home_page'))

    return render_template("register.html", form=form)


@auth.route('/login', methods=["POST", "GET"])
def login():
    if session.get('id'):
        # Bug if user logs in from phone it doesn't redirect to home_page. try and fix probably problem with csrf
        return redirect(url_for('pages.home_page'))

    form = LoginForm(meta={'csrf': False})

    if request.method == "POST":
        given_email = form.email.data
        given_password = form.password.data
        user = db.session.query(Users).filter_by(email=given_email).first()
        if user:
        user = db.session.query(Users).filter_by(email=given_email).first()
        if user:
            if check_password_hash(password=given_password, pwhash=user.password):
                online({'id': user.id})
                return redirect(url_for("pages.home_page"))

            flash("The password was Incorrect, try again")
            return render_template("login.html", form=form)

        flash("You Haven't Registered Before, Your Email Is Unknown")

    return render_template("login.html", form=form)


@auth.route('/logout/')
@login_required
def logout():
    offline({'id': session['id']})
    # logout_user()
    offline({'id': session['id']})
    # logout_user()
    return redirect(url_for('pages.home_page'))
