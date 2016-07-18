from flask_wtf import Form
from wtforms import TextField, SelectField, DateField

class NewExpenseForm(Form):
    account = SelectField('Account', choices=[
        ('together', 'Together'),
        ('leeor', 'Leeor'),
        ('marie', 'Marie')
    ])
    date = DateField()
    category = SelectField('Category', choices=[
        GET CATEGORIES

    ])
