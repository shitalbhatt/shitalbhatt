"""Build upload_manifest.json (title, description with chapters, tags, file, captions) for every rendered video.
usage: python3 make_manifest.py <vid_dir> <out_dir>   (vid_dir/<name>/<name>.mp4, captions.srt, chapters.txt)
"""
import json, os, re, shutil, sys

vid, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
items = []
for name in sorted(os.listdir(vid)):
    d = f"{vid}/{name}"
    mp4 = f"{d}/{name}.mp4"
    if not os.path.exists(mp4):
        continue
    code, _, rest = name.partition("_")
    kind = "Lab" if code.startswith("P") else "Lecture"
    pretty = rest.replace("_", " ")
    pretty = re.sub(r"^Lab ", "", pretty)
    pretty = re.sub(r" Lecture$", "", pretty)
    title = f"{pretty} | DATA209 Advanced EDA {kind} ({code})"[:100]
    chap = open(f"{d}/chapters.txt").read().strip() if os.path.exists(f"{d}/chapters.txt") else ""
    if chap and not chap.startswith("00:00"):
        chap = "00:00 Introduction\n" + chap
    desc = (f"{pretty}: {kind.lower()} {code} from the course Advanced Exploratory Data Analysis (DATA209).\n\n"
            f"CHAPTERS\n{chap}\n\nSlides are from the course material; narration is AI-generated.\n\n"
            "#python #pandas #datascience #eda #dataanalysis")
    tags = ["exploratory data analysis", "EDA", "data science", "python", "pandas", "data cleaning", "DATA209", pretty.lower()]
    for ext in ("mp4", "srt"):
        src = mp4 if ext == "mp4" else f"{d}/captions.srt"
        shutil.copy(src, f"{out}/{name}.{ext}")
    items.append({"file": f"{name}.mp4", "captions": f"{name}.srt", "title": title, "description": desc, "tags": tags,
                  "categoryId": "27", "privacyStatus": "private", "madeForKids": False, "containsSyntheticMedia": True})
json.dump(items, open(f"{out}/upload_manifest.json", "w"), indent=1)
print(len(items), "videos")
