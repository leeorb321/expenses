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
        cur.execute('''INSERT INTO persons (person_name) VALUES (%s);''' % person)
    if len(persons) > 1:
        cur.execute('''INSERT INTO persons (person_name) VALUES ('together');''')

    for category in categories:
        cur.execute('''INSERT INTO categories (cat_name) VALUES (%s);''' % category)

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

def add_category(category_name):
    try:
        conn = psycopg2.connect(database="expenses")
        cur = conn.cursor()
        cur.execute('''INSERT INTO category (cat_name) SELECT %s''' % category_name)
        conn.commit()
        conn.close()

    except psycopg2.DatabaseError as e:
        print('Error %s' % e)
        sys.exit(1)

def display_data(category, person, from_date, to_date, sort_by):
    conn = psycopg2.connect(database="expenses")
    cur = conn.cursor()
    out = []

    if from_date == '':
        cur.execute("SELECT min(txn_date) FROM ledger")
        from_date = cur.fetchone()[0]

    if to_date == '':
        cur.execute("SELECT max(txn_date) FROM ledger")
        to_date = cur.fetchone()[0]

    basic_query = '''
            SELECT txn_date, amount, cat_name, description, person_name
            FROM ledger
            JOIN persons
                ON ledger.person_id=persons.id
            JOIN categories
                ON ledger.category_id=categories.id
            WHERE txn_date >= '%s' AND txn_date <= '%s'
            ''' % (from_date, to_date)

    if category == 'all' and person == 'all':
        cur.execute(basic_query)
        results = cur.fetchall()
    elif category != 'all' and person != 'all':
        cur.execute(basic_query + "AND cat_name = '%s' AND person_name = '%s'" % (category, person))
        results = cur.fetchall()
    elif category != 'all':
        cur.execute(basic_query + "AND cat_name = '%s'" % category)
        results = cur.fetchall()
    elif person != 'all':
        cur.execute(basic_query + "AND person_name = '%s'" % person)
        results = cur.fetchall()

    for row in results:
        row = list(row)
        row[1] = float(row[1])/100
        row = [ row[i].capitalize() if type(row[i]) == str else row[i] for i in range(len(row)) ]
        out.append(row)

    total = sum([row[1] for row in out])

    s_key = 0

    if sort_by == 'category':
        s_key = 2
    elif sort_by == 'person':
        s_key = 4
    elif sort_by == 'amount':
        s_key = 1

    out.sort(key=lambda row: row[s_key])

    conn.commit()
    conn.close()
    return out, total

def display_all_data():
    conn = psycopg2.connect(database="expenses")
    cur = conn.cursor()
    out = []

    cur.execute("SELECT min(txn_date) FROM ledger")
    from_date = cur.fetchone()[0]

    cur.execute("SELECT max(txn_date) FROM ledger")
    to_date = cur.fetchone()[0]

    query = '''
            SELECT txn_date, amount, cat_name, description, person_name
            FROM ledger
            JOIN persons
                ON ledger.person_id=persons.id
            JOIN categories
                ON ledger.category_id=categories.id
            WHERE txn_date >= '%s' AND txn_date <= '%s'
            ''' % (from_date, to_date)

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
            'person': row[4]
            })

    conn.commit()
    conn.close()
    return out_dicts, total
