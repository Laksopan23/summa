# User Session Analytics Dashboard

This project analyzes user session data from MongoDB and displays insights on a modern, styled dashboard using Flask and Bootstrap.

## Features

- Connects to your MongoDB Atlas cluster
- Runs analytics on user session data (churn risk, session predictions, recommendations)
- Displays results in a beautiful web dashboard

---

## Prerequisites

- Python 3.8+
- MongoDB Atlas cluster with your session data
- (Optional) [Node.js](https://nodejs.org/) if you want to run the backend server

---

## Setup

1. **Clone the repository and navigate to the project folder:**
   ```sh
   git clone <your-repo-url>
   cd summa/analytics
   ```

2. **Create and activate a Python virtual environment:**
   ```sh
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

4. **Set your MongoDB connection string:**
   - Edit `run_analytics.py` if you need to change the `MONGO_URI` variable.
   - Or set it as an environment variable:
     ```sh
     set MONGO_URI=your-mongodb-uri
     ```

---

## Running Analytics

1. **Generate the analytics report from your MongoDB data:**
   ```sh
   python run_analytics.py
   ```
   - This will create a file like `analytics_report_YYYYMMDD_HHMMSS.json`.

---

## Starting the Dashboard

1. **Start the Flask web server:**
   ```sh
   python app.py
   ```

2. **Open your browser and go to:**
   ```
   http://localhost:5000/
   ```
   - You'll see a styled dashboard with user analytics.

---

## Project Structure

```
analytics/
├── app.py                  # Flask app for dashboard
├── run_analytics.py        # Script to fetch data and run analytics
├── session_analytics.py    # Analytics logic
├── requirements.txt        # Python dependencies
├── templates/
│   └── dashboard.html      # Dashboard HTML template
├── analytics_report_*.json # Generated analytics reports
└── real_sessions.json      # Raw session data (for debugging)
```

---

## Version Control & .gitignore

A `.gitignore` file is included to prevent committing sensitive, environment, and generated files:

- Python cache and virtual environment (`__pycache__/`, `venv/`)
- Environment variables (`.env`)
- Analytics reports and raw data (`analytics_report_*.json`, `real_sessions.json`)
- OS and editor files (`.DS_Store`, `.vscode/`)

**Do not commit your MongoDB credentials or any sensitive data.**

---

## Notes

- Make sure your MongoDB Atlas cluster is accessible from your IP.
- The dashboard will always show the latest generated analytics report.
- For production, use a production-ready WSGI server (e.g., Gunicorn) and secure your environment variables.

---

## License

MIT 