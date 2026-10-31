"""Bulk-upload the rendered videos to YOUR YouTube channel, from your own computer.

Setup (once):
  1. pip install google-api-python-client google-auth-oauthlib
  2. Google Cloud console: create a project, enable "YouTube Data API v3",
     create an OAuth client ID of type "Desktop app", download it as client_secret.json.
  3. Put client_secret.json next to this script.

usage: python3 upload_to_youtube.py <folder with the .mp4/.srt files and upload_manifest.json> [--limit N]

Videos are uploaded as PRIVATE and scheduled: each manifest entry has a publishAt time, so YouTube makes it public
automatically on that date. (Create your 4 playlists in YouTube Studio first; to add videos to them automatically, put each
playlist's ID in a "playlistId" field in upload_manifest.json, otherwise add them in Studio.)
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
    status = {"privacyStatus": it["privacyStatus"], "selfDeclaredMadeForKids": it["madeForKids"],
              "containsSyntheticMedia": it["containsSyntheticMedia"]}
    if it.get("publishAt"):  # schedule: video stays private, then goes public automatically at this time
        status["privacyStatus"] = "private"
        status["publishAt"] = it["publishAt"]
    body = {"snippet": {"title": it["title"], "description": it["description"], "tags": it["tags"], "categoryId": it["categoryId"]},
            "status": status}
    req = yt.videos().insert(part="snippet,status", body=body,
                             media_body=MediaFileUpload(os.path.join(folder, it["file"]), chunksize=-1, resumable=True))
    resp = None
    while resp is None:
        status, resp = req.next_chunk()
    vid = resp["id"]
    yt.captions().insert(part="snippet", body={"snippet": {"videoId": vid, "language": "en", "name": "English"}},
                         media_body=MediaFileUpload(os.path.join(folder, it["captions"]))).execute()
    if it.get("thumbnail") and os.path.exists(os.path.join(folder, it["thumbnail"])):
        try:  # needs a verified channel (youtube.com/verify); skipped otherwise
            yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(os.path.join(folder, it["thumbnail"]))).execute()
        except Exception as e:
            print("thumbnail not set:", e)
    if it.get("playlistId"):
        yt.playlistItems().insert(part="snippet", body={"snippet": {"playlistId": it["playlistId"],
            "resourceId": {"kind": "youtube#video", "videoId": vid}}}).execute()
    done[it["file"]] = vid
    json.dump(done, open(done_path, "w"), indent=1)
    print("uploaded", it["title"], "->", f"https://youtu.be/{vid}")
    n += 1
