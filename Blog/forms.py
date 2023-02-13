from flask_ckeditor import CKEditorField
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField, SearchField
from wtforms.validators import DataRequired, URL, Email, Length


class CreatePostForm(FlaskForm):
    title = StringField("Post Title", validators=[DataRequired()])
    subtitle = StringField("Subtitle", validators=[DataRequired()])
    img_url = StringField("Post Main Image URL", validators=[DataRequired(), URL()])
    body = CKEditorField("Post Content", validators=[DataRequired()])
    submit = SubmitField("Submit Post")


class RegistrationForm(FlaskForm):
    name = StringField('Enter Your Name', validators=[DataRequired()])
    email = StringField('Enter Your Email', validators=[DataRequired(), Email()])
    password = PasswordField('Enter Password', validators=[DataRequired(), Length(min=8)])
    submit = SubmitField("Join The Community")


class LoginForm(FlaskForm):
    email = StringField('Enter Your Email', validators=[DataRequired(), Email()])
    password = PasswordField('Enter Password', validators=[DataRequired()])
    submit = SubmitField("Let me in")


class CommentForm(FlaskForm):
    comment = CKEditorField("Add Comment:", validators=[DataRequired()])
    submit = SubmitField('Submit Comment')


class CreateBlog(FlaskForm):
    name = StringField('Enter The Name For Your Blog', validators=[DataRequired()])
    description = CKEditorField("Add A Description Here:", validators=[Length(max=5000)])
    submit = SubmitField("Create Your Blog")

class SearchForm(FlaskForm):
    name = SearchField("Enter Blog Name", )
