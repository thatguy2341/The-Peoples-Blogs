from datetime import datetime
from flask_bootstrap import Bootstrap
from flask_ckeditor import CKEditor
from flask_gravatar import Gravatar
from __init__ import create_app
from models import Users, session

app = create_app()

ckeditor = CKEditor(app)
Bootstrap(app)
gravatar = Gravatar(app=app, size=50, default="mp")

@app.context_processor
def inject_current_data():
    if session.get('dark_mode') is None:
        session['dark_mode'] = False

    if session.get('id'):
        user = Users.query.get(session['id'])
        session['current_user'] = user.to_dict()
        return dict(year=datetime.now().year, DARKMODE=user.dark_mode, is_authenticated=True)

    session['current_user'] = Users().to_dict()
    return dict(year=datetime.now().year, DARKMODE=session['dark_mode'], is_authenticated=False)

if __name__ == "__main__":
    app.run(debug=True)

# TODO: lazy loading images. DONE
# TODO: category for search. DONE
# TODO: profile. DONE
# TODO: messaging system. DONE
# TODO: confirmation system for deleting. DONE
