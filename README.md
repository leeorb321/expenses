# Expense Tracker

Collaboration by Leeor Baskin and Taylor Burgess at the [Recurse Center](http://recurse.com). Application allows multiple users to track personal expenses, visualize data and indentify trends.

## Architecture

The backend of this application is written in Python and handled by Flask with Postgres for the database. The frontend is vanilla JavaScript and uses Chart.js to display charts.

## Environment setup

1. Clone this repository in an appropriate folder:

	```
	$ git clone git@github.com:leeorb321/expenses.git
	```

2. Using Python 3.5.2, install virtualenv (if you don't already have it):

	```
	$ pip install virtualenv
	```

3. In the repository folder, create the virtual environment:

	```
	$ virtual venv
	```

4. Activate the environment:

	```
	$ . venv/bin/activate
	```

5. Install packages:

	```
	$ pip install -r requirements.txt
	```

6. [Install Postgres](https://www.postgresql.org/download/), if you haven't already.

7. Initialize the database (run script and follow instructions at command line):

	```
	$ python initialize.py
	```

## Using application locally

1. Ensure Postgres is running.

2. Start the app:

	```
	$ python expenses_app.py
	```

3. Navigate to [localhost](http://localhost:5000).


