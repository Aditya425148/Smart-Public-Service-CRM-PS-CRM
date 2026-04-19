import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.services.users import Users

load_dotenv()

ENDPOINT      = os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1")
PROJECT_ID    = os.getenv("APPWRITE_PROJECT_ID", "")
API_KEY       = os.getenv("APPWRITE_API_KEY", "")
DATABASE_ID   = os.getenv("APPWRITE_DATABASE_ID", "civicpulse_db")
COLLECTION_ID = os.getenv("APPWRITE_COLLECTION_ID", "complaints")
WORKERS_COLLECTION_ID = "workers"
MANAGERS_COLLECTION_ID = "managers"
BUCKET_ID     = os.getenv("APPWRITE_BUCKET_ID", "complaint_photos")

client = Client()
client.set_endpoint(ENDPOINT)
client.set_project(PROJECT_ID)
client.set_key(API_KEY)

databases = Databases(client)
storage   = Storage(client)
users     = Users(client)
