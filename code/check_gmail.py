import os
import imaplib
import email
import argparse
from getpass import getpass


def decode_header_part(hdr):
    from email.header import decode_header
    parts = decode_header(hdr)
    decoded = []
    for part, enc in parts:
        if isinstance(part, bytes):
            try:
                decoded.append(part.decode(enc or 'utf-8', errors='replace'))
            except Exception:
                decoded.append(part.decode('utf-8', errors='replace'))
        else:
            decoded.append(part)
    return ''.join(decoded)


def connect_and_search(user, password, unread=True):
    M = imaplib.IMAP4_SSL('imap.gmail.com')
    M.login(user, password)
    M.select('INBOX')
    typ, data = M.search(None, 'UNSEEN' if unread else 'ALL')
    if typ != 'OK':
        raise RuntimeError('Search failed: ' + str(typ))
    ids = data[0].split()
    return M, ids


def fetch_message_summary(M, msg_id):
    typ, msg_data = M.fetch(msg_id, '(RFC822)')
    if typ != 'OK':
        return None
    raw = msg_data[0][1]
    msg = email.message_from_bytes(raw)
    subject = decode_header_part(msg.get('Subject', ''))
    from_ = decode_header_part(msg.get('From', ''))
    date = msg.get('Date', '')

    snippet = ''
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            disp = str(part.get('Content-Disposition'))
            if ctype == 'text/plain' and 'attachment' not in disp:
                try:
                    snippet = part.get_payload(decode=True).decode(part.get_content_charset() or 'utf-8', errors='replace')
                    break
                except Exception:
                    continue
    else:
        try:
            snippet = msg.get_payload(decode=True).decode(msg.get_content_charset() or 'utf-8', errors='replace')
        except Exception:
            snippet = ''

    snippet = snippet.strip().splitlines()
    snippet = snippet[0][:200] if snippet else ''
    return {'id': msg_id.decode() if isinstance(msg_id, bytes) else str(msg_id), 'subject': subject, 'from': from_, 'date': date, 'snippet': snippet}


def main():
    p = argparse.ArgumentParser(description='Check Gmail (IMAP) and list messages')
    p.add_argument('--user', help='Gmail address (or set GMAIL_USER env var)')
    p.add_argument('--password', help='App password or account password (or set GMAIL_PASS env var)')
    p.add_argument('--unread', action='store_true', help='Show only unread messages')
    p.add_argument('--all', action='store_true', help='Show all messages (overrides --unread)')
    p.add_argument('--limit', type=int, default=20, help='Maximum number of messages to show')
    args = p.parse_args()

    user = args.user or os.environ.get('GMAIL_USER')
    password = args.password or os.environ.get('GMAIL_PASS')
    if not user:
        user = input('Gmail address: ').strip()
    if not password:
        password = getpass('Gmail app password (or account password): ')

    try:
        M, ids = connect_and_search(user, password, unread=(not args.all))
    except imaplib.IMAP4.error as e:
        print('IMAP login/search failed:', e)
        return

    ids = ids[::-1]
    count = 0
    if not ids:
        print('No messages found.')
    for msg_id in ids:
        if count >= args.limit:
            break
        summary = fetch_message_summary(M, msg_id)
        if not summary:
            continue
        print(f"[{summary['id']}] {summary['subject']}")
        print(f"  From: {summary['from']}")
        print(f"  Date: {summary['date']}")
        if summary['snippet']:
            print('  Snippet:', summary['snippet'])
        print()
        count += 1

    M.close()
    M.logout()


if __name__ == '__main__':
    main()
