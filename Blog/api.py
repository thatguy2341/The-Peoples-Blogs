from . import db
from datetime import datetime
from flask import redirect, url_for, abort, request, jsonify, Blueprint
from flask_login import login_required, current_user
from sqlalchemy import text, and_
from .models import Users, Friends, Messages, Notifications, Blogs, BlogPost


api = Blueprint('api', __name__)


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
    db.session.commit()

def offline(data):
    user = Users.query.get(data['id'])
    user.online = 0
    db.session.commit()

# ------------------------- Site API --------------------------------------

@api.route('/get_blogs/<search>/<category>', methods=['GET'])
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

    from Blog.pages import NUM
    return jsonify({'blogs': all_blogs_dict[NUM: (NUM + 1) * 10]}), 200


@api.route('/get_users/<search>', methods=['GET'])
def get_users(search):
    searcher = search.lower()
    ids = db.session.execute(
        text(f"SELECT users.id FROM users WHERE LOWER(users.name) LIKE '%{searcher}%'")).unique()
    ids = [id_[0] for id_ in ids]
    check_friend = [friend.friend_id for friend in current_user.friends]
    checked_ids = [id_ for id_ in ids if (id_ not in check_friend) and id_ != current_user.id]
    found_users = db.session.query(Users).filter(Users.id.in_(checked_ids))

    all_users_dict = [user.to_dict() for user in found_users]

    return jsonify({'users': all_users_dict}), 200


@api.route('/get_blogs_by_user/<int:user_id>', methods=['GET'])
def get_blogs_by_user(user_id):
    if user_id < 0 or user_id is None:
        return jsonify({'Error': f"Sorry, we couldn't find '{user_id}'"}), 404

    user_blogs = db.session.query(Blogs).filter(Blogs.author_id == user_id) \
        .order_by(Blogs.created_date.asc()).all()
    all_blogs_dict = [blog.to_dict() for blog in user_blogs]

    return jsonify({'blogs': all_blogs_dict})


@api.route('/get_posts_by_user/<int:user_id>', methods=['GET'])
def get_posts_by_user(user_id):
    if user_id < 0 or user_id is None:
        return jsonify({'Error': f"Sorry, we couldn't find '{user_id}'"}), 404

    user_posts = db.session.query(BlogPost).filter(BlogPost.author_id == user_id) \
        .order_by(BlogPost.date.asc()).all()
    all_posts_dict = [post.to_dict() for post in user_posts]

    return jsonify({'posts': all_posts_dict})


@api.route('/get_user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    if user_id < 0 or user_id is None:
        return jsonify({'Error': f"Sorry, we couldn't find '{user_id}'"}), 404

    user_dict = Users.query.get(user_id).to_dict()
    return jsonify({'user': user_dict}), 200


@api.route('/get_user_message/<int:friend_id>', methods=['GET'])
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


@api.route('/send_message/<int:friend_id>', methods=['GET'])
def send_message(friend_id):
    user_f = db.session.get(Friends, friend_id)
    if user_f in current_user.friends:
        new_message = Messages()
        new_message.to = db.session.query(Users).get(user_f.friend_id)
        new_message.message = request.args.get('message')
        new_message.from_ = current_user
        new_message.time = datetime.now()
        db.session.add(new_message)
        db.session.commit()
        return jsonify({'success': 'true'}), 200

    return jsonify({'failed': 'user not friend'}), 404


@api.route('/send_notification/<int:user_id>/<type_>', methods=['GET'])
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


@api.route('/get_friends/<int:user_id>', methods=['Get'])
@login_required
def get_friends(user_id):
    if current_user.id == user_id:
        user = db.session.query(Users).get(user_id)
        friends = [friend.to_dict() for friend in user.friends]
        return jsonify({'friends': friends}), 200

    return jsonify({'failed': 'user id doesnt match id in url'}), 404


@api.route('/add_friend/<int:friend_id>', methods=['Get'])
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


@api.route('/remove_friend/<int:friend_id>', methods=['Get'])
@login_required
def remove_friend(friend_id):
    friend = db.session.get(Friends, friend_id)
    if friend in current_user.friends:
        user_as_friend = db.session.query(Friends).filter(Friends.friend_id == current_user.id,
                                                          Friends.user_id == friend.friend_id).first()
        db.session.delete(user_as_friend)
        db.session.delete(friend)
        db.session.commit()
        return jsonify({}), 200

    return jsonify({'failed': 'user doesnt have that friend'}), 404


@api.route('/get_notifications/<int:user_id>', methods=['Get'])
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
@api.route('/remove_notification/<int:notification_id>')
def remove_notification(notification_id):
    notifi = Notifications.query.get(notification_id)
    if current_user.id == notifi.user_id:
        db.session.delete(notifi)
        db.session.commit()
        return jsonify({'success': 'notification deleted'}), 200
    return jsonify({'failed': 'unauthorized access'}), 404


@api.route("/blog/<int:blog_id>/delete")
def delete_blog(blog_id):
    inside_blog = Blogs.query.get(blog_id)

    if current_user.is_authenticated and current_user.id == inside_blog.author_id:
        db.session.delete(inside_blog)
        db.session.commit()
        return redirect(url_for('home_page'))

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")

@api.route("/next-page/<int:num>")
def next_page(num):
    if len(db.session.query(Blogs).all()) > 10:
        return redirect(url_for("home_page", num=num))

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")



@api.route("/blog/<int:blog_id>/delete/<int:post_id>")
def delete_post(post_id, blog_id):
    inside_blog = Blogs.query.get(blog_id)

    if current_user.is_authenticated and current_user.id == inside_blog.author_id:
        post_to_delete = BlogPost.query.get(post_id)
        db.session.delete(post_to_delete)
        db.session.commit()
        return redirect(url_for('get_all_posts', blog_id=blog_id))

    return abort(403, description="Unauthorized Access, you are not allowed to access this page.")