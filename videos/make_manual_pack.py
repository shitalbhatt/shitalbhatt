import json, csv, os, shutil, zipfile
O='output_all'; S='shorts_out'; P='manual_pack'
shutil.rmtree(P, ignore_errors=True); os.makedirs(P)
man={m['file'][:-4]:m for m in json.load(open(f'{O}/upload_manifest.json'))}
sh={m['file'][:-4]:m for m in json.load(open(f'{S}/shorts_manifest.json'))}
rows=list(csv.DictReader(open('marketing/publishing_calendar.csv')))
index=[]
for n,r in enumerate(rows,1):
    k=r['Video file']; m=man[k]; s=sh.get('S_'+k)
    d=f'{P}/{n:02d}_{k}'; os.makedirs(d)
    shutil.copy(f'{O}/{k}.mp4', d); shutil.copy(f'{O}/{k}.srt', d); shutil.copy(f"{O}/{m['thumbnail']}", d)
    if s: shutil.copy(f'{S}/S_{k}.mp4', d)
    t=f"""UPLOAD SHEET  -  VIDEO {n} OF {len(rows)}
==========================================================
FILES IN THIS FOLDER
  Video ........ {k}.mp4   (Indian English female AI voice)
  Captions ..... {k}.srt
  Thumbnail .... {k}.png
  Short ........ S_{k}.mp4

STEP 1  Upload the video   (YouTube Studio > Create > Upload videos > choose {k}.mp4)

STEP 2  TITLE  (copy and paste; max 100 characters)
{m['title']}

STEP 3  DESCRIPTION  (copy everything between the lines)
----------------------------------------------------------
{__import__('re').sub(r'#python #datascience #eda( #\w+)*\s*$','#python #datascience #eda',m['description'].replace('ADD YOUR LINK HERE','PASTE YOUR GITHUB / COLAB / DRIVE LINK'))}
----------------------------------------------------------

STEP 4  THUMBNAIL   Upload {k}.png  (needs a verified channel: youtube.com/verify)

STEP 5  PLAYLIST    {m['playlist']}   (create it the first time, then just tick it)

STEP 6  AUDIENCE    "No, it's not made for kids"

STEP 7  SHOW MORE
  Tags (paste as one line):  {', '.join(m['tags'])}
  Language: English | Category: Education
  Altered or synthetic content: YES  (the voice is AI-generated; YouTube requires this to be disclosed)
  Subtitles: Subtitles tab > Add language English > Upload file > With timing > {k}.srt

STEP 8  VISIBILITY
  Publish now  ->  choose Public
  OR schedule  ->  Schedule, date: {r['Publish date']} at {r['Time']} (keep this order for the course)

STEP 9  AFTER IT IS PUBLIC
  - Pin a comment: "Which step of this video was new for you? Ask your doubts here."
  - Add the link of the NEXT video of the course to the pinned comment
  - Paste your notebook / dataset link into the description if you left the placeholder
  - Share the link in your class group / LMS
"""
    if s:
        t+=f"""
----------------------------------------------------------
YOUTUBE SHORT  (upload the day after: {r['Short goes out']})
  File ......... S_{k}.mp4
  Title ........ {s['title']}
  Description .. 
{s['description']}
  Tags ......... {', '.join(s['tags'])}
  Visibility ... Public (or schedule as above). Same settings: not for kids, synthetic content YES.
"""
    open(f'{d}/UPLOAD_SHEET.txt','w').write(t)
    z=f'{P}/{n:02d}_{k}.zip'
    with zipfile.ZipFile(z,'w',zipfile.ZIP_STORED) as zf:
        for f in os.listdir(d): zf.write(f'{d}/{f}', f'{n:02d}_{k}/{f}')
    index.append((n,k,r['Publish date'],m['title'],os.path.getsize(z)/1e6))
with open(f'{P}/00_MASTER_INDEX.txt','w') as f:
    f.write("UPLOAD ORDER (upload in this order; each zip = 1 video + thumbnail + captions + Short + UPLOAD_SHEET.txt)\n\n")
    for n,k,dte,ti,mb in index: f.write(f"{n:02d}. {dte}  {ti}  [{mb:.0f} MB]\n")
print(len(index), 'packs', sum(i[4] for i in index), 'MB')
