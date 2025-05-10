import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import json
import os

class SessionAnalytics:
    def __init__(self, data_path=None):
        self.data = None
        if data_path and os.path.exists(data_path):
            self.load_data(data_path)
        
    def load_data(self, data_path):
        """Load session data from JSON file"""
        try:
            with open(data_path, 'r') as f:
                data = json.load(f)
            
            # Convert to DataFrame
            self.data = pd.DataFrame(data)
            
            # Convert timestamp strings to datetime objects
            if 'startTime' in self.data.columns:
                self.data['startTime'] = pd.to_datetime(self.data['startTime'])
            if 'endTime' in self.data.columns:
                self.data['endTime'] = pd.to_datetime(self.data['endTime'])
            
            # Calculate duration in minutes if not present
            if 'duration' not in self.data.columns and 'startTime' in self.data.columns and 'endTime' in self.data.columns:
                self.data['duration'] = (self.data['endTime'] - self.data['startTime']).dt.total_seconds() / 60
            
            print(f"Data loaded successfully. Shape: {self.data.shape}")
            print("Columns:", self.data.columns.tolist())
            
        except Exception as e:
            print(f"Error loading data: {e}")
            raise

    def predict_next_session_probability(self, user_id):
        """Calculate probability of a user having a session tomorrow"""
        if self.data is None or len(self.data) == 0:
            return "No data available"
        
        # Get user's session history
        user_data = self.data[self.data['userId'] == user_id]
        
        if len(user_data) == 0:
            return "No session history for this user"
        
        # Calculate daily session frequency
        daily_sessions = user_data.groupby(user_data['startTime'].dt.date).size()
        avg_sessions_per_day = daily_sessions.mean()
        
        # Calculate probability based on historical frequency
        probability = min(1.0, avg_sessions_per_day)
        
        return {
            'user_id': user_id,
            'probability': probability,
            'avg_sessions_per_day': avg_sessions_per_day,
            'total_sessions': len(user_data)
        }

    def predict_next_session_duration(self, user_id):
        """Predict the expected duration of the next session for a user"""
        if self.data is None or len(self.data) == 0:
            return "No data available"
        
        user_data = self.data[self.data['userId'] == user_id]
        
        if len(user_data) < 5:  # Need minimum sessions for prediction
            return "Insufficient session history for prediction"
        
        # Prepare features for prediction
        X = user_data[['duration']].values
        y = user_data['duration'].shift(-1).dropna().values
        X = X[:-1]  # Remove last row as we don't have next session duration for it
        
        if len(X) < 5:
            return "Insufficient data for prediction"
        
        # Train a simple regression model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)
        
        # Predict next session duration
        last_duration = user_data['duration'].iloc[-1]
        predicted_duration = model.predict([[last_duration]])[0]
        
        return {
            'user_id': user_id,
            'predicted_duration_minutes': round(predicted_duration, 2),
            'average_duration': round(user_data['duration'].mean(), 2),
            'last_session_duration': round(last_duration, 2)
        }

    def identify_churn_risk(self, days_threshold=7):
        """Identify users at risk of churning in the next week"""
        if self.data is None or len(self.data) == 0:
            return "No data available"
        
        current_date = datetime.now()
        churn_risk_users = []
        
        for user_id in self.data['userId'].unique():
            user_data = self.data[self.data['userId'] == user_id]
            last_session = user_data['startTime'].max()
            days_since_last_session = (current_date - last_session).days
            
            # Calculate user's average session frequency
            daily_sessions = user_data.groupby(user_data['startTime'].dt.date).size()
            avg_sessions_per_day = daily_sessions.mean()
            
            # Calculate churn risk score (0-1)
            risk_score = min(1.0, days_since_last_session / days_threshold)
            
            if risk_score > 0.5:  # High risk threshold
                churn_risk_users.append({
                    'user_id': user_id,
                    'risk_score': round(risk_score, 2),
                    'days_since_last_session': days_since_last_session,
                    'avg_sessions_per_day': round(avg_sessions_per_day, 2)
                })
        
        return sorted(churn_risk_users, key=lambda x: x['risk_score'], reverse=True)

    def recommend_session_type(self, user_id):
        """Recommend session type based on user's history"""
        if self.data is None or len(self.data) == 0:
            return "No data available"
        
        user_data = self.data[self.data['userId'] == user_id]
        
        if len(user_data) == 0:
            return "No session history for this user"
        
        # Calculate success rate for each session type
        session_types = user_data['projectName'].unique()
        type_success = {}
        
        for session_type in session_types:
            type_data = user_data[user_data['projectName'] == session_type]
            # Calculate success metrics (e.g., completion rate, average duration)
            avg_duration = type_data['duration'].mean()
            completion_rate = len(type_data) / len(user_data)
            
            type_success[session_type] = {
                'avg_duration': round(avg_duration, 2),
                'completion_rate': round(completion_rate, 2),
                'total_sessions': len(type_data)
            }
        
        # Recommend the session type with the best performance
        recommended_type = max(type_success.items(), 
                             key=lambda x: (x[1]['completion_rate'], x[1]['avg_duration']))
        
        return {
            'user_id': user_id,
            'recommended_type': recommended_type[0],
            'type_metrics': type_success,
            'reasoning': f"Recommended based on highest completion rate ({recommended_type[1]['completion_rate']}) and good average duration ({recommended_type[1]['avg_duration']} minutes)"
        }

    def generate_report(self, user_id):
        """Generate a comprehensive analytics report for a user"""
        report = {
            'user_id': user_id,
            'next_session_probability': self.predict_next_session_probability(user_id),
            'next_session_duration': self.predict_next_session_duration(user_id),
            'session_type_recommendation': self.recommend_session_type(user_id)
        }
        
        # Add churn risk if user is at risk
        churn_risk = self.identify_churn_risk()
        user_churn_risk = next((user for user in churn_risk if user['user_id'] == user_id), None)
        if user_churn_risk:
            report['churn_risk'] = user_churn_risk
        
        return report

def main():
    # Example usage
    analytics = SessionAnalytics('path_to_your_data.json')  # Replace with actual data path
    
    # Example user ID
    user_id = "example_user_id"
    
    # Generate report
    report = analytics.generate_report(user_id)
    
    # Print report
    print("\n=== User Analytics Report ===")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main() 