"""Bulk-upload the rendered videos to YOUR YouTube channel, from your own computer.

Setup (once):
  1. pip install google-api-python-client google-auth-oauthlib
  2. Google Cloud console: create a project, enable "YouTube Data API v3",
     create an OAuth client ID of type "Desktop app", download it as client_secret.json.
  3. Put client_secret.json next to this script.

usage: python3 upload_to_youtube.py <folder with the .mp4/.srt files and upload_manifest.json> [--limit N]

Videos are uploaded as PRIVATE so you can review them in YouTube Studio and publish when ready.
Note: a new API project gets about 10,000 quota units a day and each upload costs about 1,600,
so expect roughly 6 uploads a day; re-run the script each day, it skips videos already uploaded.
"""
import json, os, sys
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow

folder = sys.argv[1]
limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else 10 ** 9
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.force-ssl"]
creds = InstalledAppFlow.from_client_secrets_file("client_secret.json", SCOPES).run_local_server(port=0)
yt = build("youtube", "v3", credentials=creds)
done_path = os.path.join(folder, "uploaded.json")
done = json.load(open(done_path)) if os.path.exists(done_path) else {}
n = 0
for it in json.load(open(os.path.join(folder, "upload_manifest.json"))):
    if it["file"] in done or n >= limit:
        continue
    body = {"snippet": {"title": it["title"], "description": it["description"], "tags": it["tags"], "categoryId": it["categoryId"]},
            "status": {"privacyStatus": it["privacyStatus"], "selfDeclaredMadeForKids": it["madeForKids"],
                       "containsSyntheticMedia": it["containsSyntheticMedia"]}}
    req = yt.videos().insert(part="snippet,status", body=body,
                             media_body=MediaFileUpload(os.path.join(folder, it["file"]), chunksize=-1, resumable=True))
    resp = None
    while resp is None:
        status, resp = req.next_chunk()
    vid = resp["id"]
    yt.captions().insert(part="snippet", body={"snippet": {"videoId": vid, "language": "en", "name": "English"}},
                         media_body=MediaFileUpload(os.path.join(folder, it["captions"]))).execute()
    done[it["file"]] = vid
    json.dump(done, open(done_path, "w"), indent=1)
    print("uploaded", it["title"], "->", f"https://youtu.be/{vid}")
    n += 1
