"""Build site/course-videos/videos.json (+ thumbnails) for the website's 'Course videos' tab.

usage: python3 make_site_data.py <output_all dir> <shorts_out dir> <website repo dir>
"""
import json, os, re, shutil, subprocess, sys

OUT, SHORTS, SITE = sys.argv[1:4]
dst = f"{SITE}/site/course-videos"
os.makedirs(f"{dst}/thumbs", exist_ok=True)


def minutes(path):
    s = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode())
    return f"{int(s // 60)}:{int(s % 60):02d}"


short = {x["file"]: x for x in json.load(open(f"{SHORTS}/shorts_manifest.json"))}
playlists, videos = [], []
for it in json.load(open(f"{OUT}/upload_manifest.json")):
    stem = it["file"][:-4]
    code = stem.split("_")[0]
    kind = ("Lab" if code.startswith("P") else "Lecture" if code.startswith("L") else
            "Revision" if code.startswith("R") else "Guide")
    desc = it["description"]
    learn = re.search(r"you will learn (.*?)\.\n\n", desc, re.S)
    chap = re.search(r"CHAPTERS\n(.*?)\n\nPLAYLIST", desc, re.S)
    chapters = [c.split(" ", 1) for c in chap.group(1).split("\n")] if chap else []
    if it["playlist"] not in playlists:
        playlists.append(it["playlist"])
    sh = short.get(f"S_{stem}.mp4")
    shutil.copy(f"{OUT}/{it['thumbnail']}", f"{dst}/thumbs/{stem}.png")
    videos.append({"id": stem, "code": code, "kind": kind, "title": it["title"], "summary": learn.group(1) if learn else "",
                   "playlist": it["playlist"], "minutes": minutes(f"{OUT}/{it['file']}"), "publish": it["publishAt"][:10],
                   "chapters": chapters, "thumb": f"course-videos/thumbs/{stem}.png", "youtubeId": "",
                   "short": {"title": sh["title"].replace(" #Shorts", ""), "minutes": minutes(f"{SHORTS}/{sh['file']}"),
                             "publish": sh["publishAt"][:10], "youtubeId": ""} if sh else None})
data = {"note": "Paste YouTube video IDs (the part after youtu.be/) into youtubeId, or run scripts/fill_youtube_links.py. Empty means 'coming soon'.",
        "playlists": [{"title": p, "url": ""} for p in playlists], "videos": videos}
json.dump(data, open(f"{dst}/videos.json", "w"), indent=1, ensure_ascii=False)
print(len(videos), "videos,", sum(1 for v in videos if v["short"]), "shorts,", len(playlists), "playlists")
