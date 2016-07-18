import psycopg2

def connect():
    conn = psycopg2.connect(database="expenses", user="Leeor", password="password")
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")
    if cur.rowcount == 0:
        cur.execute('''CREATE TABLE ledger
                       (id INT PRIMARY KEY NOT NULL,
                       account_id  TEXT        NOT NULL,
                       category_id INT     NOT NULL,
                       amount      NUMERIC(10) NOT NULL,
                       txn_date    DATE        NOT NULL
                    )''')

        cur.execute('''CREATE TABLE account
                       (account_id INT PRIMARY KEY NOT NULL,
                       name varchar(32) NOT NULL
                    )''')

        cur.execute('''CREATE TABLE person
                       (person_id INT PRIMARY KEY NOT NULL,
                       name varchar(32) NOT NULL
                    )''')

        cur.execute('''CREATE TABLE category
                       (category_id INT PRIMARY KEY NOT NULL,
                       name varchar(32) NOT NULL
                    )''')

        conn.commit()
        conn.close()


