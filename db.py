import psycopg2

def connect():
    try:
        conn = psycopg2.connect(database="expenses", user="Leeor", password="password")
        cur = conn.cursor()
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")
        if cur.rowcount == 0:
            cur.execute('''CREATE TABLE ledger
                           (id SERIAL PRIMARY KEY,
                           person_id   SERIAL NOT NULL,
                           category_id SERIAL     NOT NULL,
                           amount      NUMERIC(10) NOT NULL,
                           txn_date    DATE        NOT NULL,
                           description TEXT
                        )''')

            cur.execute('''CREATE TABLE persons
                           (id SERIAL PRIMARY KEY,
                           person_name TEXT NOT NULL UNIQUE
                        )''')

            cur.execute('''INSERT INTO persons (person_name) VALUES ('leeor'), ('marie'), ('together')''')

            cur.execute('''CREATE TABLE categories
                           (id SERIAL PRIMARY KEY,
                           cat_name TEXT NOT NULL UNIQUE
                        )''')

            cur.execute('''INSERT INTO categories (cat_name) VALUES ('food'), ('transportation'), ('entertainment'), ('car'), ('housing'), ('clothing'), ('books'), ('medical'), ('restaurants'), ('misc'), ('donations'), ('children'), ('travel'), ('gifts'), ('electronics')''')

        cur.execute('''SELECT person_name FROM persons''')
        persons = [ person[0] for person in list(cur.fetchall()) ]

        cur.execute('''SELECT cat_name FROM categories''')
        categories = [ category[0] for category in list(cur.fetchall()) ]

        conn.commit()
        conn.close()
        return persons, categories

    except psycopg2.DatabaseError as e:
        print('Error %s' % e)
        sys.exit(1)

    finally:
        if conn:
            conn.close()

def new_expense(person, expense_date, amount, category, description):
    try:
        conn = psycopg2.connect(database="expenses", user="Leeor", password="password")
        cur = conn.cursor()
        cur.execute('''INSERT INTO ledger (person_id, txn_date, amount, category_id, description)
                        SELECT (SELECT id FROM persons WHERE person_name='%s'), '%s', %d,
                        (SELECT id FROM categories WHERE cat_name='%s'), '%s' '''
                        % (person, expense_date, amount, category, description))
        conn.commit()
        conn.close()

    except psycopg2.DatabaseError as e:
        print('Error %s' % e)
        sys.exit(1)

    finally:
        if conn:
            conn.close()

def add_category(category_name):
    try:
        conn = psycopg2.connect(database="expenses", user="Leeor", password="password")
        cur = conn.cursor()
        cur.execute('''INSERT INTO category (cat_name) SELECT %s''' % category_name)
        conn.commit()
        conn.close()

    except psycopg2.DatabaseError as e:
        print('Error %s' % e)
        sys.exit(1)

    finally:
        if conn:
            conn.close()

def display_data(from_date, to_date, category, person):
    conn = psycopg2.connect(database="expenses", user="Leeor", password="password")
    cur = conn.cursor()
    out = []
    cur.execute('''
        SELECT txn_date, amount, cat_name, description, person_name
        FROM ledger
        JOIN persons
            ON ledger.person_id=persons.id
        JOIN categories
            ON ledger.category_id=categories.id
        WHERE txn_date > '%s' AND txn_date < '%s'
        ''' % (from_date, to_date))
    results = cur.fetchall()
    for row in results:
        row = list(row)
        row[1] = float(row[1])/100
        out.append(row)

    out.sort(key=lambda row: row[0])

    conn.commit()
    conn.close()
    return out

    # if category != None and person != None:
    # cur.execute('''WITH category AS (SELECT id FROM categories WHERE name='%s'),
    #                     person AS (SELECT id FROM persons WHERE name='%s')
    #                 SELECT * FROM ledger WHERE
    #                 ''')

    # % (category, person)
