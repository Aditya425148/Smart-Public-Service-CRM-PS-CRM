import os
import sys
from appwrite.client import Client
from appwrite.services.databases import Databases

# Ensure we can import from the backend directory if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def keep_alive():
    endpoint = os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1")
    project_id = os.getenv("APPWRITE_PROJECT_ID")
    api_key = os.getenv("APPWRITE_API_KEY")
    database_id = os.getenv("APPWRITE_DATABASE_ID", "civicpulse_db")

    if not project_id or not api_key:
        print("Error: APPWRITE_PROJECT_ID and APPWRITE_API_KEY must be set.")
        return

    client = Client()
    client.set_endpoint(endpoint)
    client.set_project(project_id)
    client.set_key(api_key)

    databases = Databases(client)

    try:
        # Just list databases or a specific one to trigger activity
        print(f"Triggering activity for project: {project_id}...")
        databases.get(database_id)
        print("Success: Appwrite project activity triggered.")
    except Exception as e:
        print(f"Warning: Could not get database {database_id}, attempting to list databases instead.")
        try:
            databases.list()
            print("Success: Appwrite project activity triggered via listing.")
        except Exception as e2:
            print(f"Error: Failed to trigger activity: {str(e2)}")

if __name__ == "__main__":
    keep_alive()
