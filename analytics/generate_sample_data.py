import json
import random
from datetime import datetime, timedelta
import numpy as np

def generate_sample_data(num_users=10, days=30, output_file='sample_sessions.json'):
    """Generate sample session data for testing analytics"""
    
    # Sample project names
    project_names = ['Meditation', 'Yoga', 'Breathing', 'Mindfulness', 'Sleep']
    
    # Generate data
    sessions = []
    start_date = datetime.now() - timedelta(days=days)
    
    for user_id in range(1, num_users + 1):
        # Generate 1-5 sessions per day for each user
        num_sessions = random.randint(days, days * 5)
        
        for _ in range(num_sessions):
            # Random start time within the last 'days' days
            start_time = start_date + timedelta(
                days=random.randint(0, days),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            # Random duration between 5 and 60 minutes
            duration = random.randint(5, 60)
            end_time = start_time + timedelta(minutes=duration)
            
            session = {
                'userId': f'user_{user_id}',
                'projectName': random.choice(project_names),
                'startTime': start_time.isoformat(),
                'endTime': end_time.isoformat(),
                'duration': duration * 60  # Convert to seconds
            }
            sessions.append(session)
    
    # Sort sessions by start time
    sessions.sort(key=lambda x: x['startTime'])
    
    # Save to file
    with open(output_file, 'w') as f:
        json.dump(sessions, f, indent=2)
    
    print(f"Generated {len(sessions)} sample sessions for {num_users} users")
    return sessions

if __name__ == "__main__":
    generate_sample_data() 