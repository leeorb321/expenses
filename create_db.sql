CREATE DATABASE expenses;
\c expenses;

CREATE TABLE ledger
   (id SERIAL PRIMARY KEY,
   person_id   SERIAL NOT NULL,
   category_id SERIAL     NOT NULL,
   amount      NUMERIC(10) NOT NULL,
   txn_date    DATE        NOT NULL,
   description TEXT);

CREATE TABLE persons
    (id SERIAL PRIMARY KEY,
    person_name TEXT NOT NULL UNIQUE);

CREATE TABLE categories
    (id SERIAL PRIMARY KEY,
    cat_name TEXT NOT NULL UNIQUE);

