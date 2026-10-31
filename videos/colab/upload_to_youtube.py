#!/usr/bin/env python3
"""Upload all DATA209 videos to YouTube from your own computer.
Setup (once):   pip install google-api-python-client google-auth requests
Run:            python upload_to_youtube.py  "C:\\path\\to\\folder\\with\\the 4 zip files"
You can stop with Ctrl+C at any time and run it again: finished uploads are skipped.
"""
import os, glob, json, time, subprocess, datetime as dt
from zoneinfo import ZoneInfo

# ------------------------- SETTINGS -------------------------
import sys
HOME = os.path.expanduser('~')
ZIP_DIR = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()   # folder that holds the 4 DATA209_final_part*_of_4.zip files
ZIP_FOLDERS = [ZIP_DIR]
STATE_FOLDER = os.path.join(ZIP_DIR, 'DATA209_upload_state')    # progress is saved here; you can stop (Ctrl+C) and run again
WORK = os.path.join(ZIP_DIR, 'DATA209_work')
START_DATE = None
TIMEZONE = 'Asia/Kolkata'
PUBLISH_TIME = '18:30'
SHORT_TIME = '12:00'
PUBLISH_DAYS = (0, 2, 4)
AUTO_WAIT = True
PUBLISH_MODE = 'public_now'   # 'public_now' = public as soon as uploaded; 'schedule' = private until its date
VERIFY_FIRST = True
TEST_FIRST = False
RETRY_SKIPPED_THUMBS = False  # set True after verifying your channel at youtube.com/verify
ADD_TO_PLAYLISTS = True
UPLOAD_CAPTIONS = True
# ------------------------------------------------------------

os.makedirs(STATE_FOLDER, exist_ok=True); os.makedirs(WORK, exist_ok=True)
import re
def find_zips():
    found = {}
    def add(paths):
        for z in paths:
            m = re.search(r'part([0-9])_of_4', os.path.basename(z))
            if m and (m.group(1) not in found or os.path.getmtime(z) > os.path.getmtime(found[m.group(1)])): found[m.group(1)] = z
    for folder in ZIP_FOLDERS:                                    # 1) the folders in the settings (names like "... (1).zip" are fine)
        add(glob.glob(f'{folder}/DATA209_final_part*_of_4*.zip'))
    if len(found) < 4 and False:  # 2) anywhere in My Drive (slower, only if needed)
        add(glob.glob('/content/drive/MyDrive/**/DATA209_final_part*_of_4*.zip', recursive=True))
    return [found[k] for k in sorted(found)]
zips = find_zips()
print('zip files found:', zips)
have = {re.search(r'part([0-9])_of_4', os.path.basename(z)).group(1) for z in zips}
if '4' not in have:
    others = glob.glob(os.path.join(ZIP_DIR, '**', '*DATA209*.zip'), recursive=True)[:15]
    raise SystemExit('STOP: DATA209_final_part4_of_4.zip is required (lists, Shorts, thumbnails), plus any of part1, part2, part3 - you can add those one by one. Put them in: ' + ZIP_DIR + '\n'
                     'Zip files I can see with DATA209 in the name: ' + (str(others) if others else 'none') +
                     '\nOlder files named DATA209_upload_part... or DATA209_update_... are NOT the final version.')
for z in zips:
    marker = os.path.join(WORK, f'.done_{os.path.basename(z)}_{os.path.getsize(z)}')
    if not os.path.exists(marker):
        import zipfile; zipfile.ZipFile(z).extractall(WORK)
        open(marker, 'w').close()
ROOT = os.path.join(WORK, 'DATA209_upload')
long_items = json.load(open(f'{ROOT}/upload_manifest.json'))
short_items = json.load(open(f'{ROOT}/shorts/shorts_manifest.json'))
missing = [it['file'] for it in long_items if not os.path.exists(f"{ROOT}/{it['file']}")] + \
          [it['file'] for it in short_items if not os.path.exists(f"{ROOT}/shorts/{it['file']}")]
print('parts available:', sorted(have), '- only videos whose files are present are uploaded; add the other zips later and run the script again')
print(sum(os.path.exists(f"{ROOT}/{it['file']}") for it in long_items), 'of', len(long_items), 'long videos and', sum(os.path.exists(f"{ROOT}/shorts/{it['file']}") for it in short_items), 'of', len(short_items), 'Shorts are ready to upload now')
if os.environ.get('DRY_RUN'): raise SystemExit('dry run ok')

import requests, time, getpass
CLIENT_ID = input('Client ID: ').strip()
CLIENT_SECRET = getpass.getpass('Client secret (typing is hidden): ').strip()
SCOPE = 'https://www.googleapis.com/auth/youtube'
dev = requests.post('https://oauth2.googleapis.com/device/code', data={'client_id': CLIENT_ID, 'scope': SCOPE}).json()
print('1) Open', dev['verification_url'], '\n2) Enter the code:', dev['user_code'], '\n3) Sign in with the account that owns your YouTube channel and allow access.')
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
print('Signed in as channel:', yt.channels().list(part='snippet', mine=True).execute()['items'][0]['snippet']['title'])

import json, os, time, datetime as dt
from zoneinfo import ZoneInfo
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

PUBLISH_MODE = globals().get('PUBLISH_MODE', 'public_now')   # 'public_now' or 'schedule'
VERIFY_FIRST = globals().get('VERIFY_FIRST', True)
TEST_FIRST = False                                           # replaced by the automatic check (VERIFY_FIRST)
RETRY_SKIPPED_THUMBS = globals().get('RETRY_SKIPPED_THUMBS', False)
import logging; logging.getLogger('googleapiclient.http').setLevel(logging.ERROR)   # hides the repeated 403 warnings
TZ = ZoneInfo(TIMEZONE)
STATE_PATH = f'{STATE_FOLDER}/state.json'; SCHED_PATH = f'{STATE_FOLDER}/schedule.json'
state = json.load(open(STATE_PATH)) if os.path.exists(STATE_PATH) else {}
def save_state(): json.dump(state, open(STATE_PATH, 'w'), indent=1)

# ---- publish schedule: computed once, then kept fixed in the state folder
def hm(s): return dt.time(int(s[:2]), int(s[3:5]))
if PUBLISH_MODE != 'schedule':
    sched = {}
elif os.path.exists(SCHED_PATH):
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
print('mode: PUBLIC AS SOON AS UPLOADED' if PUBLISH_MODE != 'schedule' else f"mode: scheduled, first {min(sched.values())[:16]} | last {max(sched.values())[:16]}")

jobs = [dict(key=it['file'], kind='long', item=it, path=f"{ROOT}/{it['file']}") for it in long_items] + \
       [dict(key='shorts/' + it['file'], kind='short', item=it, path=f"{ROOT}/shorts/{it['file']}", sched=it['file']) for it in short_items]
jobs = [j for j in jobs if os.path.exists(j['path'])]
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
    status = {'selfDeclaredMadeForKids': it['madeForKids'], 'containsSyntheticMedia': it['containsSyntheticMedia']}
    if PUBLISH_MODE == 'schedule': status.update({'privacyStatus': 'private', 'publishAt': utc(publish_time(job))})
    else: status['privacyStatus'] = 'public'
    body = {'snippet': {'title': it['title'], 'description': it['description'], 'tags': it['tags'], 'categoryId': it['categoryId']}, 'status': status}
    req = yt.videos().insert(part='snippet,status', body=body, media_body=MediaFileUpload(job['path'], chunksize=-1, resumable=True))
    resp = None
    while resp is None: _, resp = req.next_chunk(num_retries=3)
    return resp['id']

def step_video(job):
    st = state.setdefault(job['key'], {})
    if 'id' not in st:
        st['id'] = guarded(lambda: upload_video(job)); save_state()
        print('uploaded', job['item']['title'][:70], '->', 'https://youtu.be/' + st['id'], '| ' + ('public now' if PUBLISH_MODE != 'schedule' else 'publishes ' + publish_time(job)[:16]))
        return True
    return False
def step_thumb(job):
    st = state[job['key']]; th = job['item'].get('thumbnail')
    need = (not st.get('thumb')) or (st.get('thumb') == 'skipped' and RETRY_SKIPPED_THUMBS)
    if job['kind'] == 'long' and th and need and os.path.exists(f'{ROOT}/{th}'):
        try: guarded(lambda: yt.thumbnails().set(videoId=st['id'], media_body=MediaFileUpload(f'{ROOT}/{th}')).execute())
        except QuotaStop: raise
        except HttpError as e:
            if not state.get('_thumb_warned'): print('thumbnails are skipped for now (verify your channel at youtube.com/verify, then set RETRY_SKIPPED_THUMBS = True):', reason_of(e)); state['_thumb_warned'] = True
            st['thumb'] = 'skipped'
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

def first_upload_ok(vid):
    st = yt.videos().list(part='status', id=vid).execute()['items'][0]['status']
    ok = (st.get('privacyStatus') == 'public') if PUBLISH_MODE != 'schedule' else bool(st.get('publishAt'))
    return ok, st.get('privacyStatus')
def phase_videos():
    if VERIFY_FIRST and not state.get('_verified'):          # a video from an earlier run exists: check it before uploading more
        done_ids = [v['id'] for k, v in state.items() if not k.startswith('_') and v.get('id')]
        if done_ids:
            ok, shown = first_upload_ok(done_ids[0])
            if not ok: raise StopIteration('LOCKED:' + str(shown))
            state['_verified'] = True; save_state()
    for job in jobs:
        was_new = step_video(job); step_thumb(job)
        if was_new and VERIFY_FIRST and not state.get('_verified'):
            ok, shown = first_upload_ok(state[job['key']]['id'])
            if not ok: raise StopIteration('LOCKED:' + str(shown))
            state['_verified'] = True; save_state(); print('check passed: the first video is', shown, '- continuing with the rest')
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
    print(f"uploaded {n('id')}/{len(jobs)} | thumbnails {sum(1 for k, v in state.items() if not k.startswith('_') and v.get('thumb') is True)} (skipped {sum(1 for k, v in state.items() if not k.startswith('_') and v.get('thumb') == 'skipped')}) | playlists {n('playlist')} | captions {n('caption')}")

def run_all():
    while True:
        try:
            phase_videos(); phase_playlists(); phase_captions()
            summary(); print(('ALL AVAILABLE VIDEOS DONE (add the next zip and run the script again). ' if len(jobs) < len(long_items) + len(short_items) else 'ALL DONE. ') + ('Everything is public now.' if PUBLISH_MODE != 'schedule' else 'Videos publish on their scheduled dates.') + ' Check YouTube Studio.'); return True
        except StopIteration as stop:
            summary()
            if stop.args and str(stop.args[0]).startswith('LOCKED'):
                print('\nSTOPPED after the first video: YouTube shows it as "' + str(stop.args[0]).split(':', 1)[1] + '" instead of public.'
                      '\nThat means YouTube is restricting uploads from this Google Cloud project (unverified API project). Nothing more was uploaded.'
                      '\nOpen that video in YouTube Studio; if you cannot make it public, use YouTube Studio bulk upload instead.')
                return False
            print('\nTEST UPLOAD DONE. Open YouTube Studio -> Content, find the first video and check it is Private with a SCHEDULED date.'
                  '\nIf it shows as scheduled, run this cell again to upload the rest. If it is locked private with no schedule, stop and use YouTube Studio bulk upload.')
            return False
        except QuotaStop as q:
            summary()
            if not AUTO_WAIT: print('Daily limit reached. Run this cell again tomorrow; progress is saved.'); return False
            wait_for_reset(str(q))

run_all()