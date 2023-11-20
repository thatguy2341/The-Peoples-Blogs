import os
from datetime import datetime
from smtplib import SMTP

from dotenv import load_dotenv  # DO NOT DELETE

from flask import Flask, render_template, redirect, url_for, flash, abort, request, jsonify
from flask_socketio import SocketIO
from flask_bootstrap import Bootstrap
from flask_ckeditor import CKEditor
from flask_gravatar import Gravatar
from flask_login import UserMixin, login_user, LoginManager, login_required, current_user, logout_user
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import exc, text, and_, DateTime
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from forms import CreatePostForm, RegistrationForm, LoginForm, CommentForm, CreateBlog, ContactForm, Confirm

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
socket = SocketIO(app)
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
    friends = relationship('Friends', back_populates='user')
    online = db.Column(db.Integer, nullable=True)
    notifications = relationship('Notifications', back_populates="user")
    notification_seen = db.Column(db.Integer, nullable=True, default=0)

    def to_dict(self):
        data = {column.name: getattr(self, column.name) for column in self.__table__.columns
                if column.name not in ['password']}
        return data


class Friends(db.Model, UserMixin):
    __tablename__ = 'friends'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = relationship('Users', back_populates='friends', foreign_keys=[user_id])
    friend_name = db.Column(db.String(200), nullable=False)
    friend_id = db.Column(db.Integer, nullable=False)
    message_seen = db.Column(db.Integer, nullable=True, default=0)
    online = db.Column(db.Integer, nullable=True, default=0)

    def to_dict(self):
        data = {column.name: getattr(self, column.name) for column in self.__table__.columns}
        last_message = db.session.query(Messages).filter(and_(Messages.from_id == self.user_id,
                                                              Messages.to_id == self.friend_id) |
                                                         and_(Messages.from_id == self.friend_id,
                                                              Messages.to_id == self.user_id)).order_by(
            Messages.time.desc()).first()
        data.update({'last_message': last_message.message if last_message is not None else None})
        data.update({'online': self.online})
        return data


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
    to_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=False)
    from_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=False)
    time = db.Column(DateTime, default=datetime.now())
    type = db.Column(db.String(1), nullable=True)

    to = relationship('Users', foreign_keys=[to_id])
    from_ = relationship('Users', foreign_keys=[from_id])
    message = db.Column(db.Text, nullable=False, unique=False)

    def to_dict(self, recieved: chr):
        self.type = recieved
        data = {column.name: getattr(self, column.name) for column in self.__table__.columns}
        data.update({'time': self.time.strftime('%H:%M')})
        return data


class Notifications(db.Model, UserMixin):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user = relationship('Users', back_populates='notifications')
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    type_ = db.Column(db.String(20))
    from_id = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        d = {column.name: getattr(self, column.name) for column in self.__table__.columns
             if column.name not in ['user_id']}
        type_dict = {
            'message': 'You have recieved a new message from ',
            'friend_req': 'You have recieved a friend request from ',
        }
        d.update({'message': type_dict.get(self.type_) + Users.query.get(self.from_id).name})

        return d


with app.app_context():
    db.create_all()

login_manager = LoginManager(app=app)


@app.context_processor
def inject_current_year():
    return dict(year=datetime.now().year, DARKMODE=DARKMODE)


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


@socket.on('online')
def online(data):
    user = Users.query.get(data['id'])
    user.online = 1
    friends = db.session.query(Friends).filter(Friends.friend_id == data['id'])
    for friend in friends:
        friend.online = 1


@socket.on('offline')
def disconnect(data):
    user = Users.query.get(data['id'])
    user.online = 0
    friends = db.session.query(Friends).filter(Friends.friend_id == data['id'])
    for friend in friends:
        friend.online = 0


@app.route('/get_blogs/<search>/<category>', methods=['GET'])
def get_blogs(search, category='Recent'):
    if search == 'null':
        found_blogs = db.session.query(Blogs)

    else:
        searcher = search.lower()
        ids = db.session.execute(
            text(f"SELECT blogs.id FROM blogs, users WHERE (LOWER(users.name) LIKE '%{searcher}%' "
                 f"AND blogs.author_id = users.id) OR (LOWER(blogs.name) LIKE '%{searcher}%')")).unique()
        ids = [id_[0] for id_ in ids]
        found_blogs = db.session.query(Blogs).filter(Blogs.id.in_(ids))

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


@app.route('/get_users/<search>', methods=['GET'])
def get_users(search):
    if search == 'null':
        found_users = current_user.friends

    else:
        searcher = search.lower()
        ids = db.session.execute(
            text(f"SELECT users.id FROM users WHERE LOWER(users.name) LIKE '%{searcher}%'")).unique()
        ids = [id_[0] for id_ in ids]
        check_friend = [friend.friend_id for friend in current_user.friends]
        checked_ids = [id_ for id_ in ids if id_ not in check_friend]
        found_users = db.session.query(Users).filter(Users.id.in_(checked_ids))

    all_users_dict = [user.to_dict() for user in found_users]

    return jsonify({'users': all_users_dict}), 200


@app.route('/get_blogs_by_user/<int:user_id>', methods=['GET'])
def get_blogs_by_user(user_id):
    if user_id < 0 or user_id is None:
        return jsonify({'Error': f"Sorry, we couldn't find '{user_id}'"}), 404

    user_blogs = db.session.query(Blogs).filter(Blogs.author_id == user_id) \
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

    user_dict = Users.query.get(user_id).to_dict()
    return jsonify({'user': user_dict}), 200


@app.route("/edit_user/<int:user_id>", methods=["POST", "GET"])
def edit_user(user_id):
    user = Users.query.get(user_id)
    if current_user.is_authenticated and current_user.id == user.id:
        edit_form = RegistrationForm(
            name=user.name,
            email=user.email,
        )
        if request.method == 'POST':
            user.name = edit_form.name.data
            user.email = edit_form.email.data
            user.joined_date = user.joined_date
            user.total_views = user.total_views
            user.message_seen = user.message_seen
            db.session.commit()

            return redirect(url_for("profile", user_id=user_id))

        return render_template("register.html", form=edit_form)

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@app.route('/get_user_message/<int:friend_id>', methods=['GET'])
def get_user_messages(friend_id):
    user_f = db.session.get(Friends, friend_id)
    if user_f in current_user.friends:
        messages_friend = db.session.query(Messages).filter(and_(Messages.to_id == current_user.id,
                                                                 Messages.from_id == user_f.friend_id) |
                                                            and_(Messages.from_id == current_user.id,
                                                                 Messages.to_id == user_f.friend_id)).order_by(
            Messages.time.asc())

        messages_dict = [msg.to_dict('r') if msg.to_id == current_user.id else msg.to_dict('s') for msg in
                         messages_friend]

        return jsonify({'messages': messages_dict}), 200

    return jsonify({'failed': 'user not friend'}), 404


@app.route('/send_message/<int:user_id>', methods=['GET'])
def send_message(user_id):
    user = db.session.get(Users, user_id)
    if [friend.friend_id for friend in user.friends if friend.friend_id == current_user.id]:
        new_message = Messages()
        new_message.to = user
        new_message.message = request.args.get('message')
        new_message.from_ = current_user
        new_message.time = datetime.now()
        db.session.add(new_message)
        db.session.commit()
        return jsonify({'success': 'true'}), 200

    return jsonify({'failed': 'user not friend'}), 404


@app.route('/send_notification/<int:user_id>/<type_>', methods=['GET'])
def send_notification(user_id, type_):
    if type_ in ['message', 'friend_req']:
        user = Users.query.get(user_id)
        for notification in user.notifications:
            if notification.type_ == type_ and notification.from_id == current_user.id:
                return jsonify({'failed': 'spam notification'}), 404

        new_notification = Notifications()
        new_notification.from_id = current_user.id
        new_notification.user = user
        new_notification.type_ = type_
        db.session.add(new_notification)
        db.session.commit()
        return jsonify({'success': 'true'}), 200

    return jsonify({'failed': 'wrong type'}), 404


@app.route('/get_friends/<int:user_id>', methods=['Get'])
@login_required
def get_friends(user_id):
    if current_user.id == user_id:
        user = Users.query.get(user_id)
        friends = [friend.to_dict() for friend in user.friends]
        return jsonify({'friends': friends}), 200

    return jsonify({'failed': 'user id doesnt match id in url'}), 404


@app.route('/add_friend/<int:friend_id>', methods=['Get'])
@login_required
def add_friend(friend_id):
    other_user = Users.query.get(friend_id)
    # add friend at other user
    new_friend1 = Friends()
    new_friend1.friend_id = current_user.id
    new_friend1.friend_name = current_user.name
    new_friend1.user = other_user
    db.session.add(new_friend1)

    # add friend at the current user.
    new_friend2 = Friends()
    new_friend2.friend_id = other_user.id
    new_friend2.friend_name = other_user.name
    new_friend2.user = current_user
    db.session.add(new_friend2)
    db.session.commit()

    return jsonify({}), 200


@app.route('/remove_friend/<int:friend_id>', methods=['Get'])
@login_required
def remove_friend(friend_id):
    friend = db.session.get(Friends, friend_id)
    if friend in current_user.friends:
        user_as_friend = db.session.query(Friends).filter(Friends.friend_id == current_user.id,
                                                          Friends.user_id == friend.friend_id)
        db.session.delete(user_as_friend)
        db.session.delete(friend)
        db.session.commit()
        return jsonify({}), 200

    return jsonify({'failed': 'user doesnt have that friend'}), 404


@app.route('/get_notifications/<int:user_id>', methods=['Get'])
@login_required
def get_notifications(user_id):
    if current_user.id == user_id:
        user = Users.query.get(user_id)
        notifications_dict = [notifi.to_dict() for notifi in user.notifications]
        user.notification_seen = user.notifications[-1].id if user.notifications else 0
        db.session.commit()
        return jsonify({'notifications': notifications_dict})

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")


@login_required
@app.route('/remove_notification/<int:notification_id>')
def remove_notification(notification_id):
    notifi = Notifications.query.get(notification_id)
    if current_user.id == notifi.user_id:
        db.session.delete(notifi)
        db.session.commit()
        return jsonify({'success': 'notification deleted'}), 200
    return jsonify({'failed': 'unauthorized access'}), 404


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
        return redirect(url_for('get_all_posts', blog_id=new_blog.id))

    return render_template('create_blog.html', form=form, blog_id=None)


@app.route("/view_profile/<int:user_id>", methods=['GET', 'POST'])
def profile(user_id):
    user = Users.query.get(user_id)
    blogs = user.blogs
    form = Confirm()
    if form.validate_on_submit():
        if check_password_hash(password=form.password.data, pwhash=user.password):
            return redirect(url_for('edit_user', user_id=user_id))
        else:
            flash('wrong password')
            return render_template("profile_page.html", admin_user=user, blogs=blogs, form=form)

    return render_template("profile_page.html", admin_user=user, blogs=blogs, form=form)


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
        new_user.joined_date = datetime.now().strftime("%B %d, %Y")
        new_user.total_views = 0
        new_user.notification_seen = 0
        socket.emit('online', {'id': new_user.id})
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
                socket.emit('online', {'id': user.id})
                login_user(user)
                return redirect(url_for("home_page"))

            flash("The password was Incorrect, try again")
            return render_template("login.html", form=form)

        flash("You Haven't Registered Before, Your Email Is Unknown")

    return render_template("login.html", form=form)


@app.route('/logout/')
@login_required
def logout():
    socket.emit('offline', {'id': current_user.id})
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
            new_post.date = datetime.now().strftime("%B %d, %Y")
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
