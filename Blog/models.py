from . import db
from sqlalchemy import and_, DateTime
from sqlalchemy.orm import relationship
from flask import Blueprint
from flask_login import UserMixin


models = Blueprint('auth', __name__)


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
    online = db.Column(db.Integer, nullable=True, default=0)
    notifications = relationship('Notifications', back_populates="user")
    notification_seen = db.Column(db.Integer, nullable=True, default=0)

    def to_dict(self):
        data = {column.name: getattr(self, column.name) for column in self.__table__.columns
                if column.name not in ['password']}
        return data


class Friends(db.Model):
    __tablename__ = 'friends'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = relationship('Users', back_populates='friends', foreign_keys=[user_id])
    friend_name = db.Column(db.String(200), nullable=False)
    friend_id = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        data = {column.name: getattr(self, column.name) for column in self.__table__.columns}
        last_message = db.session.query(Messages).filter(and_(Messages.from_id == self.user_id,
                                                              Messages.to_id == self.friend_id) |
                                                         and_(Messages.from_id == self.friend_id,
                                                              Messages.to_id == self.user_id)).order_by(
            Messages.time.desc()).first()
        data.update({'last_message': last_message.message if last_message is not None else None})
        data.update({'online': db.session.query(Users).get(self.friend_id).online})
        return data


class Views(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user = relationship("Users", back_populates="views")
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    blog_id = db.Column(db.Integer, nullable=True)
    post_id = db.Column(db.Integer, nullable=True)


class Blogs(db.Model):
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


class BlogPost(db.Model):
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


class Comments(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    author = relationship("Users", back_populates='comments')
    post_id = db.Column(db.Integer, db.ForeignKey("blog_posts.id"))
    inside_post = relationship('BlogPost', back_populates="comments")


class Messages(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    to_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=False)
    from_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=False)
    time = db.Column(DateTime)
    type = db.Column(db.String(1), nullable=True)

    to = relationship('Users', foreign_keys=[to_id])
    from_ = relationship('Users', foreign_keys=[from_id])
    message = db.Column(db.Text, nullable=False, unique=False)

    def to_dict(self, recieved: chr):
        self.type = recieved
        data = {column.name: getattr(self, column.name) for column in self.__table__.columns}
        data.update({'time': self.time.strftime('%H:%M')})
        return data


class Notifications(db.Model):
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
        d.update({'message': type_dict.get(self.type_) + db.session.query(Users).get(self.from_id).name})

        return d