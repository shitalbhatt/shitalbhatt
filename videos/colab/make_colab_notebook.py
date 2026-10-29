"""Generate colab_auto_uploader.ipynb (cells are defined here so they can also be tested)."""
import json, sys

MD1 = """# DATA209 auto-uploader for YouTube (Google Colab)

Uploads all the videos and Shorts from the zip files, schedules their publish dates, and keeps going day after day when YouTube's daily limit stops it.

## Before you run (one time)
1. **Put the zip files in your Google Drive** in a folder called `DATA209_zips` (or upload them to the Colab *Files* panel). You need these 6:
   `DATA209_upload_part1_of_4.zip`, `part2_of_4`, `part3_of_4`, `part4_of_4`, `DATA209_update_A_new_videos_10.zip`, `DATA209_update_B_new_shorts_and_all_manifests.zip`.
2. In [Google Cloud console](https://console.cloud.google.com): create a project, enable **YouTube Data API v3**, add your own Google account as a **test user** on the OAuth consent screen, and create an **OAuth client ID** of type **TVs and Limited Input devices**. Keep the Client ID and Client secret private.

## How it behaves
- It uploads **one video first, then stops** so you can open YouTube Studio and check the video shows as *Scheduled* (not locked private). Run the upload cell again to continue.
- It uploads videos and thumbnails first, then playlists, then captions (captions use the most quota).
- When YouTube says the daily limit is reached it **waits for the reset (midnight US Pacific time) and carries on**. This only works while this Colab tab stays open. If Colab disconnects, reconnect and run cells 2, 3, 4 and 5 again; progress is saved in your Drive folder `DATA209_upload_state`, so nothing is uploaded twice.
- Publish dates: Monday, Wednesday and Friday at 18:30 India time for the long videos, and each Short the next day at 12:00. Change the settings in cell 3."""

CELL2 = """from google.colab import drive
drive.mount('/content/drive')
import subprocess
subprocess.run(['pip', '-q', 'install', 'google-api-python-client', 'google-auth', 'requests'], check=True)"""

CELL3 = """import os, glob, json, time, subprocess, datetime as dt
from zoneinfo import ZoneInfo

# ------------------------- SETTINGS (edit if you need to) -------------------------
ZIP_FOLDERS = ['/content/drive/MyDrive/DATA209_zips', '/content']   # where your zip files are
STATE_FOLDER = '/content/drive/MyDrive/DATA209_upload_state'        # progress is saved here and survives Colab restarts
WORK = '/content/DATA209_work'                                      # zips are unpacked here (temporary)
START_DATE = None        # first publish date 'YYYY-MM-DD' (a Monday). None = first Monday at least 14 days from today
TIMEZONE = 'Asia/Kolkata'
PUBLISH_TIME = '18:30'   # long videos
SHORT_TIME = '12:00'     # each Short goes out the day after its long video
PUBLISH_DAYS = (0, 2, 4) # Monday, Wednesday, Friday
AUTO_WAIT = True         # at the daily limit, wait for the reset and continue (keep this tab open)
TEST_FIRST = True        # upload ONE video, then stop so you can check it in YouTube Studio
ADD_TO_PLAYLISTS = True
UPLOAD_CAPTIONS = True
# -----------------------------------------------------------------------------------

os.makedirs(STATE_FOLDER, exist_ok=True); os.makedirs(WORK, exist_ok=True)
parts, updates = [], []
for folder in ZIP_FOLDERS:
    parts += glob.glob(f'{folder}/DATA209_upload_part*.zip')
    updates += glob.glob(f'{folder}/DATA209_update_*.zip')
zips = sorted(set(parts)) + sorted(set(updates))   # part files first, then the updates that overwrite them
print('zip files found:', [os.path.basename(z) for z in zips])
for z in zips:
    marker = os.path.join(WORK, f'.done_{os.path.basename(z)}_{os.path.getsize(z)}')
    if not os.path.exists(marker):
        subprocess.run(['unzip', '-o', '-q', z, '-d', WORK], check=True)
        open(marker, 'w').close()
ROOT = os.path.join(WORK, 'DATA209_upload')
long_items = json.load(open(f'{ROOT}/upload_manifest.json'))
short_items = json.load(open(f'{ROOT}/shorts/shorts_manifest.json'))
missing = [it['file'] for it in long_items if not os.path.exists(f"{ROOT}/{it['file']}")] + \\
          [it['file'] for it in short_items if not os.path.exists(f"{ROOT}/shorts/{it['file']}")]
print(len(long_items), 'long videos,', len(short_items), 'Shorts in the manifests;', 'MISSING FILES:' if missing else 'all files present', missing[:10])"""

CELL4 = """import requests, time, getpass
CLIENT_ID = input('Client ID: ').strip()
CLIENT_SECRET = getpass.getpass('Client secret: ').strip()
SCOPE = 'https://www.googleapis.com/auth/youtube'
dev = requests.post('https://oauth2.googleapis.com/device/code', data={'client_id': CLIENT_ID, 'scope': SCOPE}).json()
print('1) Open', dev['verification_url'], '\\n2) Enter the code:', dev['user_code'], '\\n3) Sign in with the account that owns your YouTube channel and allow access.')
while True:
    tok = requests.post('https://oauth2.googleapis.com/token', data={'client_id': CLIENT_ID, 'client_secret': CLIENT_SECRET,
        'device_code': dev['device_code'], 'grant_type': 'urn:ietf:params:oauth:grant-type:device_code'}).json()
    if 'access_token' in tok: break
    if tok.get('error') not in ('authorization_pending', 'slow_down'): raise SystemExit(tok)
    time.sleep(dev.get('interval', 5))
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
creds = Credentials(tok['access_token'], refresh_token=tok.get('refresh_token'), token_uri='https://oauth2.googleapis.com/token',
                    client_id=CLIENT_ID, client_secret=CLIENT_SECRET, scopes=[SCOPE])
yt = build('youtube', 'v3', credentials=creds)
print('Signed in as channel:', yt.channels().list(part='snippet', mine=True).execute()['items'][0]['snippet']['title'])"""

CELL5 = """import json, os, time, datetime as dt
from zoneinfo import ZoneInfo
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

TZ = ZoneInfo(TIMEZONE)
STATE_PATH = f'{STATE_FOLDER}/state.json'; SCHED_PATH = f'{STATE_FOLDER}/schedule.json'
state = json.load(open(STATE_PATH)) if os.path.exists(STATE_PATH) else {}
def save_state(): json.dump(state, open(STATE_PATH, 'w'), indent=1)

# ---- publish schedule: computed once, then kept fixed in the state folder
def hm(s): return dt.time(int(s[:2]), int(s[3:5]))
if os.path.exists(SCHED_PATH):
    sched = json.load(open(SCHED_PATH))
else:
    if START_DATE: start = dt.date.fromisoformat(START_DATE)
    else:
        start = dt.datetime.now(TZ).date() + dt.timedelta(days=14)
        start += dt.timedelta(days=(7 - start.weekday()) % 7)         # next Monday on/after that day (gives time to upload everything first)
    slots, d0 = [], start
    while len(slots) < len(long_items):
        slots += [d0 + dt.timedelta(days=o) for o in PUBLISH_DAYS]; d0 += dt.timedelta(days=7)
    sched = {}
    for it, day in zip(long_items, slots):
        sched[it['file']] = dt.datetime.combine(day, hm(PUBLISH_TIME), TZ).isoformat()
        sched['S_' + it['file']] = dt.datetime.combine(day + dt.timedelta(days=1), hm(SHORT_TIME), TZ).isoformat()
    json.dump(sched, open(SCHED_PATH, 'w'), indent=1)
print('first publish:', min(sched.values())[:16], '| last publish:', max(sched.values())[:16])

jobs = [dict(key=it['file'], kind='long', item=it, path=f"{ROOT}/{it['file']}") for it in long_items] + \\
       [dict(key='shorts/' + it['file'], kind='short', item=it, path=f"{ROOT}/shorts/{it['file']}", sched=it['file']) for it in short_items]
for j in jobs: j['sched_key'] = j.get('sched', j['key'])

QUOTA = {'quotaExceeded', 'dailyLimitExceeded', 'rateLimitExceeded', 'uploadLimitExceeded'}
class QuotaStop(Exception): pass
def reason_of(e):
    try: return json.loads(e.content)['error']['errors'][0]['reason']
    except Exception: return str(e)[:200]
def guarded(fn):
    try: return fn()
    except HttpError as e:
        r = reason_of(e)
        if r in QUOTA: raise QuotaStop(r)
        raise

def utc(iso): return dt.datetime.fromisoformat(iso).astimezone(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
def publish_time(job):
    when = dt.datetime.fromisoformat(sched[job['sched_key']])
    soonest = dt.datetime.now(TZ) + dt.timedelta(minutes=15)          # YouTube needs a future time
    return max(when, soonest).isoformat()

def upload_video(job):
    it = job['item']
    status = {'privacyStatus': 'private', 'publishAt': utc(publish_time(job)),
              'selfDeclaredMadeForKids': it['madeForKids'], 'containsSyntheticMedia': it['containsSyntheticMedia']}
    body = {'snippet': {'title': it['title'], 'description': it['description'], 'tags': it['tags'], 'categoryId': it['categoryId']}, 'status': status}
    req = yt.videos().insert(part='snippet,status', body=body, media_body=MediaFileUpload(job['path'], chunksize=-1, resumable=True))
    resp = None
    while resp is None: _, resp = req.next_chunk(num_retries=3)
    return resp['id']

def step_video(job):
    st = state.setdefault(job['key'], {})
    if 'id' not in st:
        st['id'] = guarded(lambda: upload_video(job)); save_state()
        print('uploaded', job['item']['title'][:70], '->', 'https://youtu.be/' + st['id'], '| publishes', publish_time(job)[:16])
        return True
    return False
def step_thumb(job):
    st = state[job['key']]; th = job['item'].get('thumbnail')
    if job['kind'] == 'long' and th and not st.get('thumb') and os.path.exists(f'{ROOT}/{th}'):
        try: guarded(lambda: yt.thumbnails().set(videoId=st['id'], media_body=MediaFileUpload(f'{ROOT}/{th}')).execute())
        except QuotaStop: raise
        except HttpError as e: print('thumbnail skipped (verify your channel at youtube.com/verify):', reason_of(e)); st['thumb'] = 'skipped'
        else: st['thumb'] = True
        save_state()
def step_playlist(job):
    st = state[job['key']]
    if not (ADD_TO_PLAYLISTS and job['kind'] == 'long' and job['item'].get('playlist')) or st.get('playlist'): return
    pls = state.setdefault('_playlists', {}); title = job['item']['playlist']
    if title not in pls:
        pls[title] = guarded(lambda: yt.playlists().insert(part='snippet,status', body={'snippet': {'title': title, 'description': 'DATA209 Advanced Exploratory Data Analysis'},
                         'status': {'privacyStatus': 'public'}}).execute())['id']; save_state()
    guarded(lambda: yt.playlistItems().insert(part='snippet', body={'snippet': {'playlistId': pls[title], 'resourceId': {'kind': 'youtube#video', 'videoId': st['id']}}}).execute())
    st['playlist'] = True; save_state()
def step_caption(job):
    st = state[job['key']]; srt = f"{ROOT}/{job['item'].get('captions')}"
    if UPLOAD_CAPTIONS and job['kind'] == 'long' and job['item'].get('captions') and not st.get('caption') and os.path.exists(srt):
        guarded(lambda: yt.captions().insert(part='snippet', body={'snippet': {'videoId': st['id'], 'language': 'en', 'name': 'English'}}, media_body=MediaFileUpload(srt)).execute())
        st['caption'] = True; save_state(); print('caption added:', job['item']['title'][:60])

def phase_videos():
    for job in jobs:
        was_new = step_video(job); step_thumb(job)
        if was_new and TEST_FIRST and not state.get('_tested'):
            state['_tested'] = True; save_state()
            raise StopIteration('TEST')
def phase_playlists():
    for job in jobs:
        if 'id' in state.get(job['key'], {}): step_playlist(job)
def phase_captions():
    for job in jobs:
        if 'id' in state.get(job['key'], {}): step_caption(job)

def wait_for_reset(reason):
    la = ZoneInfo('America/Los_Angeles'); now = dt.datetime.now(la)
    target = (now + dt.timedelta(days=1)).replace(hour=0, minute=10, second=0, microsecond=0)   # quota resets at midnight Pacific
    if reason == 'uploadLimitExceeded': target = now + dt.timedelta(hours=6)
    print(f'YouTube limit reached ({reason}). Waiting until {target:%Y-%m-%d %H:%M} US Pacific, then continuing. Keep this tab open.')
    last = 0
    while dt.datetime.now(la) < target:
        time.sleep(min(300, max(1, (target - dt.datetime.now(la)).total_seconds())))
        if time.time() - last > 1800: last = time.time(); print('  still waiting...', f'{(target - dt.datetime.now(la)).total_seconds() / 3600:.1f} h left')

def summary():
    n = lambda f: sum(1 for k, v in state.items() if not k.startswith('_') and v.get(f))
    print(f"uploaded {n('id')}/{len(jobs)} | thumbnails {n('thumb')} | playlists {n('playlist')} | captions {n('caption')}")

def run_all():
    while True:
        try:
            phase_videos(); phase_playlists(); phase_captions()
            summary(); print('ALL DONE. Videos publish on their scheduled dates; check YouTube Studio.'); return True
        except StopIteration:
            summary()
            print('\\nTEST UPLOAD DONE. Open YouTube Studio -> Content, find the first video and check it is Private with a SCHEDULED date.'
                  '\\nIf it shows as scheduled, run this cell again to upload the rest. If it is locked private with no schedule, stop and use YouTube Studio bulk upload.')
            return False
        except QuotaStop as q:
            summary()
            if not AUTO_WAIT: print('Daily limit reached. Run this cell again tomorrow; progress is saved.'); return False
            wait_for_reset(str(q))

run_all()"""

def build():
    def md(t): return {"cell_type": "markdown", "metadata": {}, "source": t.splitlines(True)}
    def code(t): return {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": t.splitlines(True)}
    cells = [md(MD1), code(CELL2), code(CELL3), code(CELL4), code(CELL5)]
    return {"cells": cells, "metadata": {"colab": {"provenance": []}, "kernelspec": {"name": "python3", "display_name": "Python 3"}}, "nbformat": 4, "nbformat_minor": 5}

if __name__ == "__main__":
    json.dump(build(), open(sys.argv[1], "w"), indent=1)
    print("written", sys.argv[1])
