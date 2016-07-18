from flask import Flask, render_template, request, redirect
from init_db import connect
app = Flask(__name__)

app.vars = {}

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
            categories={'food': 'Food',
                        'home': 'Home',
                        'dining': 'Dining'
                        'add_new': 'Add New Category'
                        },
            accounts={'citi_checking': 'Citibank Checking',
                        'amex': 'American Express'
                    }
        )
    elif request.method == 'POST':
        app.vars['account'] = request.form['account']
        app.vars['expense_date'] = request.form['expense_date']
        app.vars['amount'] = int(float(request.form['amount'])*100)
        app.vars['category'] = request.form['category']

        f = open('temp.txt', 'w')
        f.write('Person: %s\n' % app.vars['person'])
        f.write('Date: %s\n' % app.vars['expense_date'])
        f.write('Amount: %d\n' % app.vars['amount'])
        f.write('Category: %s\n' % app.vars['category'])
        f.write('Account: %s\n' % app.vars['account'])
        f.close()

        return redirect('/')

@app.route('/get_data', methods=['GET'])
def retrieve_data():
    pass


if __name__ == '__main__':
    app.run(debug=True)
