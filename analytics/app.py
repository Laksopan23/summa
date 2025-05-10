from flask import Flask, render_template
import os
import json
from glob import glob

app = Flask(__name__)


def get_latest_report():
    files = glob('analytics_report_*.json')
    if not files:
        return []
    latest_file = max(files, key=os.path.getctime)
    with open(latest_file, 'r') as f:
        return json.load(f)

@app.route('/')
def dashboard():
    reports = get_latest_report()
    return render_template('dashboard.html', reports=reports)

if __name__ == '__main__':
    app.run(debug=True) 