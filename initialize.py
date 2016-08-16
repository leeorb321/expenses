from os import system
import psycopg2

system('psql -U postgres postgres -f create_db.sql')


persons = input("Enter all users of the Expenses Tracker, separated by commas: ")
persons = persons.split(',')
categories = input("Enter all expected expense categories, separated by commas (you can add more later): ")
categories = categories.split(',')

conn = psycopg2.connect(database="expenses")
cur = conn.cursor()


for person in persons:
    cur.execute('''INSERT INTO persons (person_name) VALUES (%s);''', (person.strip(), ))
if len(persons) > 1:
    cur.execute('''INSERT INTO persons (person_name) VALUES ('together');''')

for category in categories:
    cur.execute('''INSERT INTO categories (cat_name) VALUES (%s);''', (category.strip(), ))


conn.commit()
conn.close()
