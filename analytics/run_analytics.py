from session_analytics import SessionAnalytics
import json
from datetime import datetime
from pymongo import MongoClient
import os
import pandas as pd
from urllib.parse import urlparse

# Use the correct database and collection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://diven:1234@cluster0.darpxde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
DB_NAME = 'test'
COLLECTION_NAME = 'timeentries'

def get_database_name(uri):
    """Extract database name from MongoDB URI"""
    parsed = urlparse(uri)
    path = parsed.path.strip('/')
    if path:
        return path
    return 'Cluster0'  # Default database name

def get_session_data():
    """Query real session data from MongoDB and convert to proper format"""
    try:
        print("Connecting to MongoDB...")
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        print(f"\nUsing database: {DB_NAME}")
        print("\nAvailable collections:")
        for collection in db.list_collection_names():
            print(f"- {collection}")
        
        collection = db[COLLECTION_NAME]
        count = collection.count_documents({})
        print(f"\nDocuments in {COLLECTION_NAME}: {count}")
        if count == 0:
            print("\nNo data found in the collection!")
            return []
        
        sessions = collection.find()
        session_list = list(sessions)
        if session_list:
            print("\nSample document structure:")
            print(json.dumps(session_list[0], default=str, indent=2))
        
        # Convert to proper format for analytics
        formatted_sessions = []
        for s in session_list:
            try:
                formatted_session = {
                    'userId': str(s.get('userId', '')),
                    'projectName': s.get('projectName', ''),
                    'startTime': s.get('startTime', ''),
                    'endTime': s.get('endTime', ''),
                    'duration': s.get('duration', 0),
                    'isRunning': s.get('isRunning', False)
                }
                formatted_sessions.append(formatted_session)
            except Exception as e:
                print(f"Error formatting session: {e}")
                continue
        return formatted_sessions
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return []

def generate_analytics_report():
    # Get and save session data
    session_data = get_session_data()
    print(f"\nTotal sessions found: {len(session_data)}")
    
    if len(session_data) == 0:
        print("No session data found. Please check your MongoDB connection and collection.")
        return []
    
    # Save to JSON file
    with open('real_sessions.json', 'w') as f:
        json.dump(session_data, f, indent=2, default=str)
    
    # Initialize analytics
    analytics = SessionAnalytics('real_sessions.json')
    
    # Generate reports
    reports = []
    user_ids = list(set(session['userId'] for session in session_data))
    print(f"Total unique users: {len(user_ids)}")
    
    for user_id in user_ids:
        try:
            report = analytics.generate_report(user_id)
            reports.append(report)
        except Exception as e:
            print(f"Error generating report for user {user_id}: {e}")
            continue
    
    # Save reports
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = f'analytics_report_{timestamp}.json'
    
    with open(output_file, 'w') as f:
        json.dump(reports, f, indent=2)
    
    print(f"\nReports saved to {output_file}")
    
    # Print summary
    print("\n=== Analytics Summary ===")
    print(f"Total users analyzed: {len(reports)}")
    
    # Count users at risk of churning
    at_risk_users = sum(1 for report in reports if 'churn_risk' in report)
    print(f"Users at risk of churning: {at_risk_users}")
    
    # Print some example insights
    print("\nExample Insights:")
    for report in reports[:3]:  # Show first 3 users as examples
        print(f"\nUser: {report['user_id']}")
        print(f"Next session probability: {report['next_session_probability']['probability']:.2%}")
        if isinstance(report['next_session_duration'], dict):
            print(f"Predicted next session duration: {report['next_session_duration']['predicted_duration_minutes']} minutes")
        print(f"Recommended session type: {report['session_type_recommendation']['recommended_type']}")
    
    return reports

if __name__ == "__main__":
    generate_analytics_report() 