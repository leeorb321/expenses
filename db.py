import sys
from os import system
import psycopg2

def check_db_exists():
    try:
        conn = psycopg2.connect(database="expenses")
        return True
    except:
        return False

def init_db():
    p = system('psql -U postgres postgres -f create_db.sql')
    conn = psycopg2.connect(database="expenses")
    cur = conn.cursor()

    cur.execute('''CREATE TABLE ledger
                   (id SERIAL PRIMARY KEY,
                   person_id   SERIAL NOT NULL,
                   category_id SERIAL     NOT NULL,
                   amount      NUMERIC(10) NOT NULL,
                   txn_date    DATE        NOT NULL,
                   description TEXT);
                ''')

    cur.execute('''CREATE TABLE persons
                    (id SERIAL PRIMARY KEY,
                    person_name TEXT NOT NULL UNIQUE);
                ''')

    cur.execute('''CREATE TABLE categories
                    (id SERIAL PRIMARY KEY,
                    cat_name TEXT NOT NULL UNIQUE);
                ''')

    conn.commit()
    conn.close()


def init_tables(persons, categories):
    conn = psycopg2.connect(database="expenses")
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")

    print(persons, categories)

    for person in persons:
        cur.execute('''INSERT INTO persons (person_name) VALUES (%s);''', (person, ))
    if len(persons) > 1:
        cur.execute('''INSERT INTO persons (person_name) VALUES ('together');''')

    for category in categories:
        cur.execute('''INSERT INTO categories (cat_name) VALUES (%s);''', (category, ))

    conn.commit()
    conn.close()
    return persons, categories

def connect():
    try:
        conn = psycopg2.connect(database="expenses")
        cur = conn.cursor()

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
        conn = psycopg2.connect(database="expenses")
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
        conn = psycopg2.connect(database="expenses")
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

def display_all_data():
    conn = psycopg2.connect(database="expenses")
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
        row = [ row[i].capitalize() if type(row[i]) == str else row[i] for i in range(len(row)) ]
        out.append(row)

    total = sum([row[1] for row in out])
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
    return out_dicts, total
