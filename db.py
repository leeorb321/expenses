import sys
from os import system
import psycopg2
import urllib.parse
import os

def check_heroku_db():
    if 'DATABASE_URL' in os.environ and os.environ['DATABASE_URL']:
        urllib.parse.uses_netloc.append("postgres")
        url = urllib.parse.urlparse(os.environ["DATABASE_URL"])

        conn = psycopg2.connect(
            database=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port
        )
        return conn
    else:
        conn = psycopg2.connect(database="expenses")
        return conn

    return False

def connect():
    try:
        conn = check_heroku_db()
        cur = conn.cursor()

        print(conn)

        cur.execute('''SELECT person_name FROM persons;''')
        persons = [ person[0] for person in list(cur.fetchall()) ]

        cur.execute('''SELECT cat_name FROM categories;''')
        categories = [ category[0] for category in list(cur.fetchall()) ]

        conn.commit()
        conn.close()
        return persons, categories

    except psycopg2.DatabaseError as e:
        print('Error %s' % e)
        sys.exit(1)

def new_expense(person, expense_date, amount, category, description):
    try:
        conn = check_heroku_db()
        cur = conn.cursor()
        cur.execute('''INSERT INTO ledger (person_id, txn_date, amount, category_id, description)
                        SELECT (SELECT id FROM persons WHERE person_name='%s'), '%s', %d,
                        (SELECT id FROM categories WHERE cat_name='%s'), '%s' ;'''
                        % (person, expense_date, amount, category, description))
        conn.commit()
        conn.close()

    except psycopg2.DatabaseError as e:
        print('Error %s' % e)
        sys.exit(1)

def new_category(category_name):
    try:
        conn = check_heroku_db()
        cur = conn.cursor()
        cur.execute('''INSERT INTO categories (cat_name) VALUES (%s)''', (category_name,))
        conn.commit()
        conn.close()

    except psycopg2.DatabaseError as e:
        print('Error %s' % e)
        sys.exit(1)

def update_expense(new_person, new_date, new_amount, new_category, new_description, txn_id):
    try:
        conn = psycopg2.connect(database="expenses")
        cur = conn.cursor()
        cur.execute('''UPDATE ledger SET
                        person_id = (SELECT id FROM persons WHERE person_name = '%s'),
                        txn_date = '%s',
                        amount = '%s',
                        category_id = (SELECT id FROM categories WHERE cat_name = '%s'),
                        description = '%s'
                        WHERE id = '%s';
                    ''' % (new_person, new_date, new_amount, new_category, new_description, txn_id))
        conn.commit()
        conn.close()
    except psycopg2.DatabaseError as e:
        print('Error %s' % e)
        sys.exit(1)

def delete_expense(txn_id):
    try:
        conn = psycopg2.connect(database="expenses")
        cur = conn.cursor()
        cur.execute('''DELETE FROM ledger WHERE id = '%s';''' % txn_id)

        conn.commit()
        conn.close()
    except psycopg2.DatabaseError as e:
        print('Error %s' % e)
        sys.exit(1)

def display_all_data():
    conn = check_heroku_db()
    cur = conn.cursor()
    out = []

    query = '''
            SELECT txn_date, amount, cat_name, description, person_name, ledger.id
            FROM ledger
            JOIN persons
                ON ledger.person_id=persons.id
            JOIN categories
                ON ledger.category_id=categories.id
            '''

    cur.execute(query)
    results = cur.fetchall()

    for row in results:
        row = list(row)
        row[1] = float(row[1])/100
        row = [ row[i].capitalize() if type(row[i]) == str and i != 3 else row[i] for i in range(len(row)) ]
        out.append(row)

    out.sort(key=lambda row: row[0])

    out_dicts = []
    for row in out:
        out_dicts.append({
            'date': row[0],
            'amount': row[1],
            'category': row[2],
            'description': row[3],
            'person': row[4],
            'id': row[5]
            })

    conn.commit()
    conn.close()
    return out_dicts
