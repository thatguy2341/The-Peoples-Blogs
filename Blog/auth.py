from __init__ import db
from datetime import datetime
from flask import Blueprint, flash, request, redirect, render_template, url_for
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import exc
from api import title
from models import Users
from forms import RegistrationForm, LoginForm

auth = Blueprint('auth', __name__)

def online(data):
    user = Users.query.get(data['id'])
    user.online = 1
    db.session.commit()

def offline(data):
    user = Users.query.get(data['id'])
    user.online = 0
    db.session.commit()


@auth.route('/register', methods=["POST", "GET"])
def register():
    if current_user.is_authenticated:
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

            login_user(user=new_user)
            return redirect(url_for('pages.home_page'))

    return render_template("register.html", form=form)


@auth.route('/login', methods=["POST", "GET"])
def login():
    if current_user.is_authenticated:
        # Bug if user logs in from phone it doesn't redirect to home_page. try and fix probably problem with csrf
        return redirect(url_for('pages.home_page'))

    form = LoginForm(meta={'csrf': False})

    if request.method == "POST":
        given_email = form.email.data
        given_password = form.password.data
        user = Users.query.filter_by(email=given_email).first()
        if user is not None:
            if check_password_hash(password=given_password, pwhash=user.password):
                online({'id': user.id})
                login_user(user)
                return redirect(url_for("pages.home_page"))

            flash("The password was Incorrect, try again")
            return render_template("login.html", form=form)

        flash("You Haven't Registered Before, Your Email Is Unknown")

    return render_template("login.html", form=form)


@auth.route('/logout/')
@login_required
def logout():
    offline({'id': current_user.id})
    logout_user()
    return redirect(url_for('pages.home_page'))