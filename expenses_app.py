from flask import Flask, render_template, request, redirect
from os import system
from datetime import datetime
from db import *
app = Flask(__name__)
app.jinja_env.add_extension('jinja2.ext.do')

persons, categories = None, None

@app.route('/')
def index():
    global persons
    global categories
    if (check_db_exists() == False):
        return redirect('/initialize')
    else:
        persons, categories = connect()
        return render_template('index.html')

@app.route('/initialize', methods=['GET','POST'])
def initialize():
    global persons
    global categories
    if request.method == 'GET':
        init_db()
        return render_template('initialize.html')
    elif request.method == 'POST':
        print('HELLO')
        users = request.form['persons']
        cats = request.form['categories']

        users = [ person.lower() for person in users.split(',') ]
        cats = [ category.lower() for category in cats.split(',') ]
        init_tables(users, cats)
        return redirect('/')

@app.route('/submit_expense', methods=['GET','POST'])
def submit_page():
    if request.method == 'GET':
        return render_template(
            'submit_expense.html',
            categories=categories,
            persons=persons
        )
    elif request.method == 'POST':
        person = request.form['person']
        expense_date = request.form['expense_date']
        amount = int(float(request.form['amount'])*100)
        category = request.form['category']
        description = request.form['description']

        new_expense(person, expense_date, amount, category, description)

        return redirect('/')

@app.route('/retrieve_data', methods=['GET'])
def retrieve_data():
    if request.method == 'GET':
        data, total = display_all_data()

        return render_template(
            'results.html',
            data=data,
            total=total,
            persons=persons
        )

@app.route('/')
def backup_db():
    backup_name = str(datetime.now()).replace(':','-')
    bu_command = 'pg_dump expenses > %s' % backup_name
    system(bu_command)
    redirect('/')

if __name__ == '__main__':
    app.run(debug=True)
