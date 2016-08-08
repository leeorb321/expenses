from flask import Flask, render_template, request, redirect
from os import system
from datetime import datetime
from db import *
import os
app = Flask(__name__)

persons, categories = None, None
if (check_db_exists()):
    persons, categories = connect()

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

        users = [ person.lower().strip() for person in users.split(',') ]
        cats = [ category.lower().strip() for category in cats.split(',') ]
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

@app.route('/add_category', methods=['POST'])
def add_category():
    category = request.form['category_name']

    new_category(category)

    return redirect('/')

@app.route('/update_entry', methods=['POST'])
def update_entry():
    new_person = request.form['person']
    new_date = request.form['expense_date']
    new_amount = int(float(request.form['amount'])*100)
    new_category = request.form['category']
    new_description = request.form['description']
    txn_id = request.form['txn_id']
    print(new_person, new_date, new_amount, new_category, new_description, txn_id)

    update_expense(new_person, new_date, new_amount, new_category, new_description, txn_id)

    return redirect('/retrieve_data')

@app.route('/retrieve_data', methods=['GET'])
def retrieve_data():
    data, total = display_all_data()

    return render_template(
        'results.html',
        data=data,
        total=total,
        persons=persons,
        categories=categories
    )

@app.route('/visualize', methods=['GET','POST'])
def visualize():
    data, total = display_all_data()

    if request.method == 'GET':
        chart_type = 'pie'
        date_from = 'None'
        date_to = 'None'
        selected_categories = categories
        selected_persons = persons
        display = 'category'

    elif request.method == 'POST':
        chart_type = request.form['chart_type']
        display = request.form['display']

        if (request.form['date_from'] == ''):
            date_from = 'None'
        else:
            date_from = date_from = request.form['date_from']

        if (request.form['date_to'] == ''):
            date_to = 'None'
        else:
            date_to = request.form['date_to']

        selected_categories = request.form.getlist('categories_chosen')
        if (selected_categories == [] or selected_categories[0] == 'all'):
            selected_categories = categories

        selected_persons = request.form.getlist('persons_chosen')
        if (selected_persons == [] or selected_persons[0] == 'all'):
            selected_persons = persons

    return render_template(
        'visualize.html',
        data=data,
        categories=categories,
        persons=persons,
        chartType=chart_type,
        dateFrom = date_from,
        dateTo = date_to,
        categoriesSelected=selected_categories,
        personsSelected=selected_persons,
        display=display
    )

@app.route('/')
def backup_db():
    backup_name = str(datetime.now()).replace(':','-')
    bu_command = 'pg_dump expenses > %s' % backup_name
    system(bu_command)
    redirect('/')

if __name__ == '__main__':
    if 'HEROKU_CHECK' in os.environ:
        app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT')))
    else:
        app.run(debug=True)
