from flask import Flask, render_template, request, redirect
from db import connect, new_expense, display_data
app = Flask(__name__)

persons, categories = connect()

@app.route('/')
def index():
    return render_template(
        'index.html'
    )

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

@app.route('/show_data', methods=['GET', 'POST'])
def show_data():
    if request.method == 'GET':
        return render_template(
            'show_data.html',
            categories=categories,
            persons=persons
        )
    elif request.method == 'POST':
        from_date = request.form['from_date']
        to_date = request.form['to_date']
        category = request.form['category']
        person = request.form['person']

        data = display_data(from_date, to_date, category=None, person=None)

        return render_template(
            'display_data.html',
            data=data)

if __name__ == '__main__':
    app.run(debug=True)
