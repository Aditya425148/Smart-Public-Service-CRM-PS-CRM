import os
import sys
import time
import schedule
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.users import Users
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Ensure we can import from the backend directory if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def send_notification(status: str, message: str):
    """Sends an email notification via SMTP."""
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT", "587")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    admin_email = os.getenv("ADMIN_EMAIL")

    if not all([smtp_server, smtp_user, smtp_pass, admin_email]):
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Skipping email: SMTP credentials not fully configured.")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = admin_email
        msg['Subject'] = f"CivicPulse Cron: {status}"

        body = f"Cron job execution report:\n\nTime: {time.strftime('%Y-%m-%d %H:%M:%S')}\nStatus: {status}\nDetails: {message}"
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(smtp_server, int(smtp_port))
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Notification email sent to {admin_email}.")
    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Failed to send email: {str(e)}")

def keep_alive():
    """Operation to keep Appwrite project active."""
    endpoint = os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1")
    project_id = os.getenv("APPWRITE_PROJECT_ID")
    api_key = os.getenv("APPWRITE_API_KEY")
    database_id = os.getenv("APPWRITE_DATABASE_ID", "civicpulse_db")

    if not project_id or not api_key:
        error_msg = "APPWRITE_PROJECT_ID and APPWRITE_API_KEY must be set."
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Error: {error_msg}")
        send_notification("FAILED", error_msg)
        return

    client = Client()
    client.set_endpoint(endpoint)
    client.set_project(project_id)
    client.set_key(api_key)

    databases = Databases(client)

    try:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Pinging Appwrite project: {project_id}...")
        databases.get(database_id)
        success_msg = f"Activity Triggered: Database {database_id} OK."
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {success_msg}")
        send_notification("SUCCESS", success_msg)
    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Database check failed, fallback to listing...")
        try:
            databases.list()
            success_msg = "Activity Triggered: Listing OK."
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {success_msg}")
            send_notification("SUCCESS", success_msg)
        except Exception as e2:
            error_msg = f"CRITICAL: Activity failed: {str(e2)}"
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {error_msg}")
            send_notification("FAILED", error_msg)


def setup_cron():
    """Configures the schedule."""
    # Runs every 48 hours to be well within the 7-day pause window
    schedule.every(2).days.at("00:00").do(keep_alive)
    
    # Run once immediately on startup to verify 
    keep_alive()
    
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Cron service started. Waiting for next run...")
    
    while True:
        schedule.run_pending()
        time.sleep(60) # Check every minute

if __name__ == "__main__":
    setup_cron()
