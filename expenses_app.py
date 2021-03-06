from flask import Flask, render_template, request, redirect, make_response
from os import system
from datetime import datetime
from db import *
import os
app = Flask(__name__)

@app.route('/')
def index():
    return redirect('/retrieve_data')

@app.route('/submit_expense', methods=['GET','POST'])
def submit_page():
    if request.method == 'GET':
        persons, categories = connect()
        return render_template(
            'submit_expense.html',
            categories=categories,
            persons=persons
        )
    elif request.method == 'POST':
        person = (request.form['person']).lower()
        expense_date = request.form['expense_date']
        amount = int(float(request.form['amount'])*100)
        category = (request.form['category']).lower()
        description = request.form['description']

        new_expense(person, expense_date, amount, category, description)

        return redirect('/')

@app.route('/add_category', methods=['POST'])
def add_category():
    category = (request.form['category_name']).lower()

    new_category(category)

    return redirect(request.referrer)

@app.route('/update_entry', methods=['POST'])
def update_entry():
    new_person = request.form['person']
    new_date = request.form['date']
    new_amount = int(request.form['amount'].replace('.','').replace('$',''))
    new_category = request.form['category']
    new_description = request.form['description']
    txn_id = request.form['txn_id']

    update_expense(new_person, new_date, new_amount, new_category, new_description, txn_id)

    return make_response()

@app.route('/delete_entry', methods=['DELETE'])
def delete_entry():
    txn_id = request.form['txn_id']

    delete_expense(txn_id)

    return make_response()

@app.route('/retrieve_data', methods=['GET'])
def retrieve_data():
    persons, categories = connect()
    data = display_all_data()

    return render_template(
        'results.html',
        data=data,
        persons=persons,
        categories=categories
    )

@app.route('/visualize', methods=['GET'])
def visualize():
    persons, categories = connect()
    data = display_all_data()

    if request.method == 'GET':
        chart_type = 'pie'
        date_from = 'None'
        date_to = 'None'
        selected_categories = categories
        selected_persons = persons
        display = 'category'

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
    redirect(request.referrer)

if __name__ == '__main__':
    if 'HEROKU_CHECK' in os.environ:
        app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT')))
    else:
        app.run(debug=True)
