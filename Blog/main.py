import os
import time
from datetime import date
from smtplib import SMTP

from dotenv import load_dotenv  # DO NOT DELETE

from flask import Flask, render_template, redirect, url_for, flash, abort, request, jsonify
from flask_bootstrap import Bootstrap
from flask_ckeditor import CKEditor
from flask_gravatar import Gravatar
from flask_login import UserMixin, login_user, LoginManager, login_required, current_user, logout_user
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import exc, text
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from forms import CreatePostForm, RegistrationForm, LoginForm, CommentForm, CreateBlog, ContactForm

app = Flask(__name__)
load_dotenv(".env")  # DO NOT DELETE
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
ckeditor = CKEditor(app)
Bootstrap(app)

if os.environ.get("LOCAL") == "True":
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")

MY_GMAIL = os.getenv("GMAIL")
TO_GMAIL = os.getenv("TO_GMAIL")
MY_PASS = os.getenv("PASS")
app.app_context().push()
db = SQLAlchemy(app)
gravatar = Gravatar(app=app, size=50, default="mp")
DARKMODE = False
NUM = 0


class Users(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    joined_date = db.Column(db.String(100), nullable=False)
    comments = relationship('Comments', back_populates='author')
    blogs = relationship('Blogs', back_populates="author")
    views = relationship('Views', back_populates="user")  # lazy='dynamic' lets us use query with views from users.
    total_views = db.Column(db.Integer, nullable=False)
    posts = relationship('BlogPost', back_populates='author')
    message_seen = db.Column(db.Integer, nullable=True, unique=True)

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns
                if column.name != 'password'}


class Views(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    user = relationship("Users", back_populates="views")
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    blog_id = db.Column(db.Integer, nullable=True)
    post_id = db.Column(db.Integer, nullable=True)


class Blogs(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(150), nullable=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    author = relationship("Users", back_populates='blogs')
    created_date = db.Column(db.String(100), nullable=False)
    posts = relationship("BlogPost", back_populates="blog")
    views = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        d = {column.name: getattr(self, column.name) for column in self.__table__.columns}
        d.update({'author': self.author.name})

        return d


class BlogPost(db.Model, UserMixin):
    __tablename__ = "blog_posts"
    id = db.Column(db.Integer, primary_key=True)
    blog_id = db.Column(db.Integer, db.ForeignKey("blogs.id"))
    blog = relationship("Blogs", back_populates="posts")
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    author = relationship("Users", back_populates="posts")
    title = db.Column(db.String(250), unique=False, nullable=False)
    subtitle = db.Column(db.String(250), nullable=False)
    date = db.Column(db.String(100), nullable=False)
    body = db.Column(db.Text, nullable=False)
    img_url = db.Column(db.String(250), nullable=False)
    comments = relationship('Comments', back_populates='inside_post')
    views = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        d = {column.name: getattr(self, column.name) for column in self.__table__.columns}
        d.update({'author': self.author.name})

        return d


class Comments(db.Model, UserMixin):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    author = relationship("Users", back_populates='comments')
    post_id = db.Column(db.Integer, db.ForeignKey("blog_posts.id"))
    inside_post = relationship('BlogPost', back_populates="comments")


class Messages(db.Model, UserMixin):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    to_id = db.Column(db.Integer, nullable=False, unique=False)
    from_id = db.Column(db.Integer, nullable=False, unique=False)
    message = db.Column(db.Text, nullable=False, unique=False)


with app.app_context():
    db.create_all()

login_manager = LoginManager(app=app)


@app.context_processor
def inject_current_year():
    return dict(year=date.today().year, DARKMODE=DARKMODE)


@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(user_id)


def title(string: str):
    dont_cap = {'a', 'an', 'the', 'but', 'or', 'on', 'in', 'with', 'and'}
    word_list = string.split(' ')
    string = ''
    for word in word_list:
        string += word.title() + ' ' if word not in dont_cap or word.isupper() else word + ' '
    return string.strip(' ').title()


# ------------------------- Site Functionality --------------------------------------


@app.route("/", methods=["GET", "POST"])
def home_page():
    global NUM
    NUM = request.args.get("num") if request.args.get("num") is not None else 0

    return render_template('blogs.html', page=NUM)


@app.route('/get_page/<int:page>', methods=['GET'])
def get_page(page=0):
    global NUM
    if page and page <= db.session.query(Blogs).count() // 10:
        NUM = page
        return

    return jsonify({'num': NUM})


@app.route('/get_blogs/<search>/<category>', methods=['GET'])
def get_blogs(search, category='Recent'):
    if search == 'null':
        found_blogs = db.session.query(Blogs)

    else:
        searcher = search.lower()
        ids = db.session.execute(
            text(f"SELECT blogs.id FROM blogs, users WHERE (LOWER(users.name) LIKE '%{searcher}%' "
                 f"AND blogs.author_id = users.id) OR (LOWER(blogs.name) LIKE '%{searcher}%')")).unique()
        ids = (id_[0] for id_ in ids)
        found_blogs = db.session.query(Blogs).get(ids)

    category_keywords = {
        'Recent': Blogs.created_date.asc(),
        'Popular': Blogs.views.desc(),
        'Latest': Blogs.created_date.desc()
    }
    all_blogs = found_blogs.order_by(category_keywords[category]).all()

    all_blogs_dict = [blog.to_dict() for blog in all_blogs]
    if not all_blogs:
        return jsonify({'Error': f"Sorry, we couldn't find '{search}'"}), 404

    return jsonify({'blogs': all_blogs_dict[NUM: (NUM + 1) * 10]}), 200


@app.route('/get_blogs_by_user/<int:user_id>', methods=['GET'])
def get_blogs_by_user(user_id):
    if user_id < 0 or user_id is None:
        return jsonify({'Error': f"Sorry, we couldn't find '{user_id}'"}), 404

    user_blogs = db.session.query(Blogs).filter(Blogs.id == user_id) \
        .order_by(Blogs.created_date.asc()).all()
    all_blogs_dict = [blog.to_dict() for blog in user_blogs]

    return jsonify({'blogs': all_blogs_dict})


@app.route('/get_posts_by_user/<int:user_id>', methods=['GET'])
def get_posts_by_user(user_id):
    if user_id < 0 or user_id is None:
        return jsonify({'Error': f"Sorry, we couldn't find '{user_id}'"}), 404

    user_posts = db.session.query(BlogPost).filter(BlogPost.author_id == user_id) \
        .order_by(BlogPost.date.asc()).all()
    all_posts_dict = [post.to_dict() for post in user_posts]

    return jsonify({'posts': all_posts_dict})


@app.route('/get_user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    if user_id < 0 or user_id is None:
        return jsonify({'Error': f"Sorry, we couldn't find '{user_id}'"}), 404

    user_dict = db.session.query(Users).get(user_id).to_dict()
    return jsonify({'user': user_dict})


@app.route("/create_blog", methods=["GET", "POST"])
@login_required
def create_blog():
    if len(current_user.blogs) >= 2 and current_user.id != 1:
        flash("The Maximum Amount Of Blogs Is 2")
        return abort(403, description="The Maximum Amount Of Blogs, Currently Available For Each User Are Only 2")

    form = CreateBlog()
    if form.validate_on_submit():
        new_blog = Blogs()
        new_blog.name = title(form.name.data)
        new_blog.description = form.description.data
        new_blog.created_date = date.today().strftime("%B %d, %Y")
        new_blog.author = current_user
        new_blog.views = 0
        new_post = BlogPost()
        new_post.title = f"{current_user.name} First Post"
        new_post.subtitle = "Here will be the subtitle"
        new_post.body = "This is where your post text goes, feel free to write anything.<br>" \
                        "You can Add Images, using buttons or copy pasting, " \
                        "decorate your text, the only thing left is your creativity!"
        new_post.img_url = "https://media.istockphoto.com/id/811268074/photo/laptop-computer-desktop-pc-human-hand-office-soft-focus-picture-vintage-concept.jpg?s=612x612&w=is&k=20&c=TdryUCJfxWqCEpnTU9Uqs7_GprlMa4UqoYml4wL_0BU="
        new_post.blog = new_blog
        new_post.date = date.today().strftime("%B %d, %Y")
        new_post.views = 0
        new_post.author = current_user
        db.session.add(new_post)
        db.session.add(new_blog)
        db.session.commit()
        return redirect(url_for('get_all_posts', blog_id=new_blog.id))

    return render_template('create_blog.html', form=form, blog_id=None)


@app.route("/view_profile/<int:user_id>")
def profile(user_id):
    user = Users.query.get(user_id)
    blogs = user.blogs

    return render_template("profile_page.html", admin_user=user, blogs=blogs)


@app.route("/blog/<int:blog_id>/delete")
def delete_blog(blog_id):
    inside_blog = Blogs.query.get(blog_id)

    if current_user.is_authenticated and current_user.id == inside_blog.author_id:
        db.session.delete(inside_blog)
        db.session.commit()
        return redirect(url_for('home_page'))

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@app.route("/blog/<int:blog_id>/edit-blog", methods=["POST", "GET"])
def edit_blog(blog_id):
    blog = Blogs.query.get(blog_id)

    if current_user.is_authenticated and current_user.id == blog.author_id:
        edit_form = CreateBlog(
            name=blog.name,
            description=blog.description,
        )
        if edit_form.validate_on_submit():
            blog.name = edit_form.name.data
            blog.description = edit_form.description.data
            blog.created_date = blog.created_date
            blog.views = blog.views
            db.session.commit()
            return redirect(url_for("get_all_posts", blog_id=blog_id))

        return render_template("create_blog.html", form=edit_form, blog_id=blog_id)

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@app.route("/next-page/<int:num>")
def next_page(num):
    if len(db.session.query(Blogs).all()) > 10:
        return redirect(url_for("home_page", num=num))

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@app.route('/get-posts/<int:blog_id>')
def get_all_posts(blog_id):
    raise_view = request.args.get("raise_view")
    blog = Blogs.query.get(blog_id)
    posts = BlogPost.query.filter_by(blog_id=blog_id).all()
    admin_user = blog.author

    if current_user.is_authenticated and current_user != blog.author and raise_view:
        if db.session.query(Views).filter_by(user_id=current_user.id, blog_id=blog_id).first() is None:
            blog.views += 1
            blog.author.total_views += 1
            new_view = Views()
            new_view.user = current_user
            new_view.blog_id = blog_id
            db.session.add(new_view)

    db.session.commit()
    return render_template("index.html", all_posts=posts, user=current_user, admin_user=admin_user, blog=blog)


@app.route('/register', methods=["POST", "GET"])
def register():
    if current_user.is_authenticated:
        # Bug if user logs in from phone it doesn't redirect to home_page. try and fix probably problem with csrf
        return redirect(url_for('home_page'))

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
        new_user.joined_date = date.today().strftime("%B %d, %Y")
        new_user.total_views = 0

        try:
            db.session.add(new_user)
            db.session.commit()
        except exc.IntegrityError:
            db.session.rollback()
            flash("You already signed in with this email before, log in instead!")
            return redirect(url_for('login'))
        else:
            new_message = Messages()
            new_message.from_id = 1
            new_message.to_id = new_user.id
            new_message.message = 'Welcome to The People\'s Blogs by Guy Newman'
            db.session.add(new_message)
            db.session.commit()

            login_user(user=new_user)
            return redirect(url_for('home_page'))

    return render_template("register.html", form=form)


@app.route('/login', methods=["POST", "GET"])
def login():
    if current_user.is_authenticated:
        # Bug if user logs in from phone it doesn't redirect to home_page. try and fix probably problem with csrf
        return redirect(url_for('home_page'))

    form = LoginForm(meta={'csrf': False})

    if request.method == "POST":
        given_email = form.email.data
        given_password = form.password.data
        user = Users.query.filter_by(email=given_email).first()
        if user is not None:
            if check_password_hash(password=given_password, pwhash=user.password):
                login_user(user)
                return redirect(url_for("home_page"))

            flash("The password was Incorrect, try again")
            return render_template("login.html", form=form)

        flash("You Haven't Registered Before, Your Email Is Unknown")

    return render_template("login.html", form=form)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home_page'))


@app.route("/blog/post/<int:post_id>", methods=["POST", "GET"])
def show_post(post_id):
    form = CommentForm()
    requested_post = BlogPost.query.get(post_id)
    raise_view = request.args.get("raise_view")
    if current_user.is_authenticated and current_user != requested_post.blog.author and raise_view:
        if db.session.query(Views).filter_by(user_id=current_user.id, blog_id=requested_post.blog_id,
                                             post_id=post_id).first() is None:
            requested_post.views += 1
            requested_post.author.total_views += 1
            new_view = Views()
            new_view.user = current_user
            new_view.post_id = post_id
            new_view.blog_id = requested_post.blog_id
            db.session.add(new_view)
    db.session.commit()
    post_comments = requested_post.comments
    if current_user.is_authenticated and form.validate_on_submit():
        new_comment = Comments()
        new_comment.text = form.comment.data
        new_comment.author = current_user
        new_comment.inside_post = requested_post
        db.session.add(new_comment)
        db.session.commit()
    elif form.validate_on_submit():
        flash("You Need To Log In Or Register To Comment On Posts")
        return redirect(url_for("login"))

    return render_template("post.html", post=requested_post, user=current_user, form=form, comments=post_comments)


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact", methods=["POST", "GET"])
def contact():
    form = ContactForm()
    if request.method == "GET":
        return render_template("contact.html", form=form)
    else:
        try:
            # THIS IS SPAM DETECTING SYSTEM, DETECTS IF 2 MESSAGES 1 AFTER THE OTHER ARE THE SAME
            # CAN ADD A CHECK FOR THE SAME NAME ALSO, TOO TIRED THO.
            with open("message", "rt") as file:
                message_li = [value.strip("\r").strip() for value in form.message.data.split("\n")]
                message_last = [value.strip() for value in file.readlines()[::2] if
                                value.strip() is not None or value != "\n"]

            if len(request.form["message"].strip()) < 7 or message_last == message_li:
                flash("Spam Detected, please be patient while sending the message.")
                return render_template("contact.html", form=form)
            else:
                with open("message", "wt") as file:
                    file.write(form.message.data)

                with SMTP("smtp.gmail.com") as connection:
                    connection.starttls()
                    connection.login(user=MY_GMAIL, password=MY_PASS)
                    connection.sendmail(from_addr=request.form["email"],
                                        to_addrs="gamenewman2@gmail.com",
                                        msg=f"Subject:Message From Blog Website\n\n"
                                            f"Name: {form.name.data}.\n"
                                            f"Email: {form.email.data}\n"
                                            f"Phone Number: {form.phone_number.data}\n"
                                            f"Message: {form.message.data}")
        except KeyError:
            flash("There Was An Error While Sending Your Message, please try again.")
            return render_template("contact.html", form=form)

        else:
            return redirect(url_for("home_page"))


@app.route("/blog/<int:blog_id>/new-post", methods=["POST", "GET"])
def add_new_post(blog_id):
    inside_blog = Blogs.query.get(blog_id)

    if current_user.is_authenticated and current_user.id == inside_blog.author_id:
        form = CreatePostForm()
        if form.validate_on_submit():
            new_post = BlogPost()
            new_post.title = form.title.data
            new_post.subtitle = form.subtitle.data
            new_post.body = form.body.data
            new_post.img_url = form.img_url.data
            new_post.blog = inside_blog
            new_post.date = date.today().strftime("%B %d, %Y")
            new_post.views = 0
            new_post.author = current_user

            db.session.add(new_post)
            db.session.commit()
            return redirect(url_for("get_all_posts", blog_id=blog_id))
        return render_template("make-post.html", form=form, post_id=None)

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@app.route("/blog/<int:blog_id>/edit-post/<int:post_id>", methods=["POST", "GET"])
def edit_post(post_id, blog_id):
    inside_blog = Blogs.query.get(blog_id)

    if current_user.is_authenticated and current_user.id == inside_blog.author_id:
        post = BlogPost.query.get(post_id)
        edit_form = CreatePostForm(
            title=post.title,
            subtitle=post.subtitle,
            img_url=post.img_url,
            body=post.body
        )
        if edit_form.validate_on_submit():
            post.title = edit_form.title.data
            post.subtitle = edit_form.subtitle.data
            post.img_url = edit_form.img_url.data
            post.blog = inside_blog
            post.body = edit_form.body.data
            post.views = post.views
            db.session.commit()
            return redirect(url_for("show_post", post_id=post.id))

        return render_template("make-post.html", form=edit_form, post_id=post_id)

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@app.route("/blog/<int:blog_id>/delete/<int:post_id>")
def delete_post(post_id, blog_id):
    inside_blog = Blogs.query.get(blog_id)

    if current_user.is_authenticated and current_user.id == inside_blog.author_id:
        post_to_delete = BlogPost.query.get(post_id)
        db.session.delete(post_to_delete)
        db.session.commit()
        return redirect(url_for('get_all_posts', blog_id=blog_id))

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@app.route('/change_view/<change>', methods=['GET', 'POST'])
def change_view_mode(change):
    global DARKMODE
    if change == '1':
        DARKMODE = not DARKMODE
    return jsonify({'mode': DARKMODE})


if __name__ == "__main__":
    app.run(debug=True)

# TODO: lazy loading images. DONE
# TODO: category for search. DONE
# TODO: profile.
# TODO: messaging system.
# TODO: confirmation system for deleting.
