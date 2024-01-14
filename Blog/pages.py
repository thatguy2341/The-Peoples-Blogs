from smtplib import SMTP
import os
from __init__ import db, session
from datetime import datetime
from flask import Blueprint, render_template, redirect, url_for, flash, abort, request, jsonify
from werkzeug.security import check_password_hash
from forms import CreatePostForm, RegistrationForm, CommentForm, CreateBlog, ContactForm, Confirm
from models import Users, Views, Blogs, BlogPost, Comments
from auth import login_required, title

MY_GMAIL = os.getenv("GMAIL")
TO_GMAIL = os.getenv("TO_GMAIL")
MY_PASS = os.getenv("PASS")
pages = Blueprint('pages', __name__)


@pages.route('/change_view/<change>', methods=['GET', 'POST'])
def change_view_mode(change):
    if change == '1':
        if session.get('id'):
            user = db.session.query(Users).get(session['id'])
            user.dark_mode = not user.dark_mode
            db.session.commit()
            session['dark_mode'] = user.dark_mode
        else:
            session['dark_mode'] = not session['dark_mode']

    return jsonify({'mode': session['dark_mode']})


# @pages.route('/get_page/<int:page>', methods=['GET'])
# def get_page(page=0):
#     if page and page <= db.session.query(Blogs).count() // 10:
#         session['page'] = page

#     return jsonify({'num': session['page']})


# ------------------------- Site Functionallity --------------------------------------

@pages.route("/", methods=["GET", "POST"])
def home_page():
    # session['page'] = request.args.get("num") if request.args.get("num") is not None else 0

    return render_template('blogs.html') #, page=session['page']


@pages.route("/edit_user/<int:user_id>", methods=["POST", "GET"])
@login_required
def edit_user(user_id):
    user = Users.query.get(user_id)
    if session['id'] == user.id:
        edit_form = RegistrationForm(
            name=user.name,
            email=user.email,
        )
        if request.method == 'POST':
            user.name = edit_form.name.data
            user.email = edit_form.email.data
            user.joined_date = user.joined_date
            user.total_views = user.total_views
            user.notification_seen = user.notification_seen
            db.session.commit()

            return redirect(url_for("pages.profile", user_id=user_id))

        return render_template("register.html", form=edit_form)

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@pages.route("/create_blog", methods=["GET", "POST"])
@login_required
def create_blog():
    current_user = db.session.get(Users, session['id'])
    if len(current_user.blogs) >= 2 and current_user.id != 1:
        flash("The Maximum Amount Of Blogs Is 2")
        return abort(403, description="The Maximum Amount Of Blogs, Currently Available For Each User Are Only 2")

    form = CreateBlog()
    if form.validate_on_submit():
        new_blog = Blogs()
        new_blog.name = title(form.name.data)
        new_blog.description = form.description.data
        new_blog.created_date = datetime.now().strftime("%B %d, %Y")
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
        new_post.date = datetime.now().strftime("%B %d, %Y")
        new_post.views = 0
        new_post.author = current_user
        db.session.add(new_post)
        db.session.add(new_blog)
        db.session.commit()
        return redirect(url_for('pages.get_all_posts', blog_id=new_blog.id))

    return render_template('create_blog.html', form=form, blog_id=None)


@pages.route("/blog/<int:blog_id>/edit-blog", methods=["POST", "GET"])
@login_required
def edit_blog(blog_id):
    blog = Blogs.query.get(blog_id)
    if session['id'] == blog.author_id:
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
            return redirect(url_for("pages.get_all_posts", blog_id=blog_id))

        return render_template("create_blog.html", form=edit_form, blog_id=blog_id)

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@pages.route("/view_profile/<int:user_id>", methods=['GET', 'POST'])
def profile(user_id):
    user = Users.query.get(user_id)
    blogs = user.blogs
    form = Confirm()
    if form.validate_on_submit():
        if check_password_hash(password=form.password.data, pwhash=user.password):
            return redirect(url_for('pages.edit_user', user_id=user_id))
        else:
            flash('wrong password')
            return render_template("profile_page.html", admin_user=user, blogs=blogs, form=form)

    return render_template("profile_page.html", admin_user=user, blogs=blogs, form=form)


@pages.route('/get-posts/<int:blog_id>')
def get_all_posts(blog_id):
    raise_view = request.args.get("raise_view")
    blog = Blogs.query.get(blog_id)
    posts = BlogPost.query.filter_by(blog_id=blog_id).all()
    admin_user = blog.author

    if session.get('id'):
        current_user = db.session.get(Users, session['id'])
        if db.session.query(Views).filter_by(user_id=current_user.id,
                                             blog_id=blog_id).first() is None and current_user != blog.author and raise_view:
            blog.views += 1
            blog.author.total_views += 1
            new_view = Views()
            new_view.user = current_user
            new_view.blog_id = blog_id
            db.session.add(new_view)

    db.session.commit()
    return render_template("index.html", all_posts=posts, admin_user=admin_user, blog=blog)


@pages.route("/blog/post/<int:post_id>", methods=["POST", "GET"])
def show_post(post_id):
    form = CommentForm()
    requested_post = BlogPost.query.get(post_id)
    raise_view = request.args.get("raise_view")
    if session.get('id'):
        current_user = db.session.get(Users, session['id'])
        if db.session.query(Views).filter_by(user_id=current_user.id, blog_id=requested_post.blog_id,
                                             post_id=post_id).first() is None and current_user != requested_post.blog.author and raise_view:
            requested_post.views += 1
            requested_post.author.total_views += 1
            new_view = Views()
            new_view.user = current_user
            new_view.post_id = post_id
            new_view.blog_id = requested_post.blog_id
            db.session.add(new_view)
            db.session.commit()

        if form.validate_on_submit():
            new_comment = Comments()
            new_comment.text = form.comment.data
            new_comment.author = current_user
            new_comment.inside_post = requested_post
            db.session.add(new_comment)
            db.session.commit()
    elif form.validate_on_submit():
        flash("You Need To Log In Or Register To Comment On Posts")
        return redirect(url_for("pages.login"))

    post_comments = requested_post.comments

    return render_template("post.html", post=requested_post, form=form, comments=post_comments)


@pages.route("/blog/<int:blog_id>/new-post", methods=["POST", "GET"])
@login_required
def add_new_post(blog_id):
    inside_blog = Blogs.query.get(blog_id)
    current_user = db.session.query(Users).get(session['id'])
    if current_user.id == inside_blog.author_id:
        form = CreatePostForm()
        if form.validate_on_submit():
            new_post = BlogPost()
            new_post.title = form.title.data
            new_post.subtitle = form.subtitle.data
            new_post.body = form.body.data
            new_post.img_url = form.img_url.data
            new_post.blog = inside_blog
            new_post.date = datetime.now().strftime("%B %d, %Y")
            new_post.views = 0
            new_post.author = current_user

            db.session.add(new_post)
            db.session.commit()
            return redirect(url_for("pages.get_all_posts", blog_id=blog_id))
        return render_template("make-post.html", form=form, post_id=None)

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@pages.route("/blog/<int:blog_id>/edit-post/<int:post_id>", methods=["POST", "GET"])
@login_required
def edit_post(post_id, blog_id):
    inside_blog = Blogs.query.get(blog_id)
    if session['id'] == inside_blog.author_id:
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
            return redirect(url_for("pages.show_post", post_id=post.id))

        return render_template("make-post.html", form=edit_form, post_id=post_id)

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@pages.route("/contact", methods=["POST", "GET"])
def contact():
    form = ContactForm()
    if request.method == "GET":
        return render_template("contact.html", form=form)
    else:
        try:
            # THIS IS SPAM DETECTING SYSTEM, DETECTS IF 2 MESSAGES 1 AFTER THE OTHER ARE THE SAME
            # CAN ADD A CHECK FOR THE SAME NAME ALSO, TOO TIRED THO.

            if len(request.form["message"].strip()) < 7 or session['message'] == form.message.data:
                flash("Spam Detected, please be patient while sending the message.")
                return render_template("contact.html", form=form)
            else:
                session['message'] = form.message.data
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
            return redirect(url_for("pages.home_page"))


@pages.route("/about")
def about():
    return render_template("about.html")
