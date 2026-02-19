import imaplib
import email
from email.header import decode_header
from config import apikeys as cfg

# Configuration
EMAIL = "andrewbeattyireland@gmail.com"
APP_PASSWORD = cfg["gmail_app_password"]  # 16-character app password
IMAP_SERVER = "imap.gmail.com"
NUM_EMAILS = 20  # Number of recent emails to fetch

def decode_subject(subject):
    decoded, encoding = decode_header(subject)[0]
    if isinstance(decoded, bytes):
        return decoded.decode(encoding or "utf-8", errors="replace")
    return decoded

def get_email_subjects():
    # Connect to Gmail
    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    mail.login(EMAIL, APP_PASSWORD)
    mail.select("inbox")

    # Search for all emails
    status, messages = mail.search(None, "ALL")
    email_ids = messages[0].split()

    # Get the most recent emails
    recent_ids = email_ids[-NUM_EMAILS:][::-1]

    print(f"\n{'#':<5} {'Subject'}")
    print("-" * 60)

    for i, eid in enumerate(recent_ids, 1):
        status, msg_data = mail.fetch(eid, "(BODY[HEADER.FIELDS (SUBJECT)])")
        raw = msg_data[0][1].decode("utf-8", errors="replace")
        msg = email.message_from_string(raw)
        subject = msg.get("Subject", "(No Subject)")
        subject = decode_subject(subject)
        print(f"{i:<5} {subject}")

    mail.logout()

if __name__ == "__main__":
    get_email_subjects()