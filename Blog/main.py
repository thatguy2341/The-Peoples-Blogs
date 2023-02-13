import os
from datetime import date

from flask import Flask, render_template, redirect, url_for, flash, abort, request
from flask_bootstrap import Bootstrap
from flask_ckeditor import CKEditor
from flask_gravatar import Gravatar
from flask_login import UserMixin, login_user, LoginManager, login_required, current_user, logout_user
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import exc
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash

from forms import CreatePostForm, RegistrationForm, LoginForm, CommentForm, CreateBlog

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY")
ckeditor = CKEditor(app)
Bootstrap(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.app_context().push()
db = SQLAlchemy(app)
gravatar = Gravatar(app=app, size=50, default="mp")


class Users(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    joined_date = db.Column(db.String(100), nullable=False)
    comments = relationship('Comments', back_populates='author')
    blogs = relationship('Blogs', back_populates="author")


class Blogs(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(5000), nullable=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    author = relationship("Users", back_populates='blogs')
    created_date = db.Column(db.String(100), nullable=False)
    posts = relationship("BlogPost", back_populates="blog")


class BlogPost(db.Model):
    __tablename__ = "blog_posts"
    id = db.Column(db.Integer, primary_key=True)
    blog_id = db.Column(db.Integer, db.ForeignKey("blogs.id"))
    blog = relationship("Blogs", back_populates="posts")
    title = db.Column(db.String(250), unique=False, nullable=False)
    subtitle = db.Column(db.String(250), nullable=False)
    date = db.Column(db.String(100), nullable=False)
    body = db.Column(db.Text, nullable=False)
    img_url = db.Column(db.String(250), nullable=False)
    comments = relationship('Comments', back_populates='inside_post')


class Comments(db.Model, UserMixin):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    author = relationship("Users", back_populates='comments')
    post_id = db.Column(db.Integer, db.ForeignKey("blog_posts.id"))
    inside_post = relationship('BlogPost', back_populates="comments")


db.create_all()
login_manager = LoginManager(app=app)


@app.context_processor
def inject_current_year():
    return dict(year=date.today().year)


@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(user_id)


# ------------------------- Site Functionality --------------------------------------


@app.route("/", methods=["GET", "POST"])
def home_page():

    if request.method == "POST":
        search = request.form.get("search")
        all_blogs = db.session.query(Blogs).filter(Blogs.name.contains(search) | Users.name.contains(search))
        try:
            all_blogs[0]
        except IndexError:
            all_blogs = db.session.query(Blogs).all()
        return render_template('blogs.html', all_blogs=all_blogs)

    all_blogs = db.session.query(Blogs).all()
    return render_template('blogs.html', all_blogs=all_blogs)


@app.route("/create_blog", methods=["GET", "POST"])
@login_required
def create_blog():
    if len(current_user.blogs) >= 2:
        flash("The Maximum Amount Of Blogs Is 2")
        return abort(403, description="The Maximum Amount Of Blogs, Currently Available For Each User Are Only 2")

    form = CreateBlog()
    if form.validate_on_submit():
        new_blog = Blogs()
        new_blog.name = form.name.data
        new_blog.description = form.description.data
        new_blog.created_date = date.today().strftime("%B %d, %Y")
        new_blog.author = current_user
        new_post = BlogPost()
        new_post.title="Your First Post"
        new_post.subtitle="Here will be the subtitle"
        new_post.body="This is where your post text goes, feel free to write anything.<br>" \
                      "You can Add Images, using buttons or copy pasting, "\
                      "decorate your text, the only thing left is your creativity!"
        new_post.img_url="https://media.istockphoto.com/id/811268074/photo/laptop-computer-desktop-pc-human-hand-office-soft-focus-picture-vintage-concept.jpg?s=612x612&w=is&k=20&c=TdryUCJfxWqCEpnTU9Uqs7_GprlMa4UqoYml4wL_0BU=",
        new_post.blog=new_blog
        new_post.date=date.today().strftime("%B %d, %Y")

        db.session.add(new_post)
        db.session.add(new_blog)
        db.session.commit()
        return redirect(url_for('get_all_posts', blog_id=new_blog.id))

    return render_template('create_blog.html', form=form, blog_id=None)


@app.route("/view_profie/<int:user_id>")
@login_required
def profile(user_id):
    user = Users.query.get(user_id)
    return render_template("profile_page.html", user=user)


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
            blog.name = edit_form.name
            blog.description = edit_form.description
            db.session.commit()
            return redirect(url_for("get_all_posts", blog_id=blog_id))

        return render_template("create_blog.html", form=edit_form, blog_id=blog_id)

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@app.route('/get-posts/<int:blog_id>')
def get_all_posts(blog_id):
    blog = Blogs.query.get(blog_id)
    posts = BlogPost.query.filter_by(blog_id=blog_id).all()
    admin_user = blog.author
    return render_template("index.html", all_posts=posts, user=current_user, admin_user=admin_user, blog=blog)


@app.route('/register', methods=["POST", "GET"])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        secured_password = generate_password_hash(form.password.data, salt_length=8)
        new_user = Users()
        new_user.email = form.email.data
        new_user.name = form.name.data
        new_user.password = secured_password
        new_user.joined_date = date.today().strftime("%B %d, %Y")
        try:
            db.session.add(new_user)
            db.session.commit()
        except exc.IntegrityError:
            db.session.rollback()
            flash("You already signed in with this email before, log in instead!")
            return redirect(url_for('login'))
        else:
            login_user(user=new_user)
            return redirect(url_for('home_page'))

    return render_template("register.html", form=form)


@app.route('/login', methods=["POST", "GET"])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        given_email = form.email.data
        given_password = form.password.data

        for user in db.session.query(Users).all():
            if user.email == given_email:
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
    post_comments = requested_post.comments
    if form.validate_on_submit():
        if current_user.is_authenticated:
            new_comment = Comments()
            new_comment.text = form.comment.data
            new_comment.author = current_user
            new_comment.inside_post = requested_post
            db.session.add(new_comment)
            db.session.commit()
        else:
            flash("You Need To Log In Or Register To Comment On Posts")
            return redirect(url_for("login"))

    return render_template("post.html", post=requested_post, user=current_user, form=form, comments=post_comments)


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/blog/<int:blog_id>/new-post", methods=["POST", "GET"])
def add_new_post(blog_id):
    inside_blog = Blogs.query.get(blog_id)

    if current_user.is_authenticated and current_user.id == inside_blog.author_id:
        form = CreatePostForm()
        if form.validate_on_submit():
            new_post = BlogPost()
            new_post.title=form.title.data
            new_post.subtitle=form.subtitle.data
            new_post.body=form.body.data
            new_post.img_url=form.img_url.data
            new_post.blog=inside_blog
            new_post.date=date.today().strftime("%B %d, %Y")

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


if __name__ == "__main__":
    app.run(debug=True)

# TODO: add a show my blogs button.
# TODO: add maybe a rating system.
