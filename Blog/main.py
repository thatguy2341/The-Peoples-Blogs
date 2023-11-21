from datetime import datetime
from flask_bootstrap import Bootstrap
from flask_ckeditor import CKEditor
from flask_gravatar import Gravatar
from flask_login import LoginManager
from __init__ import create_app
app = create_app()

ckeditor = CKEditor(app)
Bootstrap(app)
gravatar = Gravatar(app=app, size=50, default="mp")
login_manager = LoginManager(app=app)

@app.context_processor
def inject_current_year():
    from Blog.pages import DARKMODE
    return dict(year=datetime.now().year, DARKMODE=DARKMODE)


@login_manager.user_loader
def load_user(user_id):
    from Blog.models import Users
    return Users.query.get(user_id)


if __name__ == "__main__":
    app.run(debug=True)

# TODO: lazy loading images. DONE
# TODO: category for search. DONE
# TODO: profile. DONE
# TODO: messaging system. DONE
# TODO: confirmation system for deleting. DONE
