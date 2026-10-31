"""Generate thumbnails, Shorts specs, rewritten titles/descriptions and the publishing calendar.

usage: python3 make_marketing.py <output_all dir (with upload_manifest.json)> <work dir>
"""
import csv, datetime as dt, json, math, os, random, re, sys
from PIL import Image, ImageDraw, ImageFont

OUTD, WORK = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
for d in ("thumbs", "shorts_slides"):
    os.makedirs(f"{WORK}/{d}", exist_ok=True)
manifest = json.load(open(f"{OUTD}/upload_manifest.json"))
meta = {}
for l in open(f"{HERE}/marketing/meta.txt"):
    if l.strip() and not l.startswith("//"):
        k, title, big, sub, learn, h, p1, p2 = [x.strip() for x in l.split("|")]
        meta[k] = dict(title=title, big=big, sub=sub, learn=learn, hook=h, p1=p1, p2=p2)

PL = ["Module 1 - Statistical and Data Foundations for EDA", "Module 2 - Univariate, Bivariate, Multivariate EDA and Visualization",
      "Module 3 - Data Quality and Anomaly Management", "Module 4 - Feature Engineering, Transformation and Pipelines",
      "Course Guides - Roadmap, Assignments, Revision and Exams"]
MODCOL = [("#0b3c6f", "#1d7fd1"), ("#0b5b52", "#19b394"), ("#7a3b0a", "#f08a24"), ("#3d1d73", "#8b5cf6"), ("#7a1030", "#e11d6a")]
# extras: key -> (position in syllabus order, module index, badge text, kind letter)
EXTRA = {"C00": (0.0, 4, "START HERE", "G"), "R1": (3.5, 0, "REVISION M1", "G"), "A1": (7.2, 4, "ASSIGNMENT 1", "G"),
         "R2": (7.5, 1, "REVISION M2", "G"), "A2": (11.2, 4, "ASSIGNMENT 2", "G"), "R3": (11.5, 2, "REVISION M3", "G"),
         "R4": (15.5, 3, "REVISION M4", "G"), "LA": (15.6, 4, "LAB EXAM", "G"), "FP": (15.7, 4, "FINAL PROJECT", "G"),
         "W": (15.8, 4, "FULL COURSE", "G")}


def info(file):
    name = file[:-4]
    key = next(k for k in meta if name.startswith(k))
    if key in EXTRA:
        return name, key, "G", EXTRA[key][0], EXTRA[key][1]
    n = int(re.match(r"[LP](\d+)", name).group(1))
    mod = 0 if n <= 6 else 1 if n <= 14 else 2 if n <= 22 else 3
    return name, key, name[0], n, mod


FB = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
fb = lambda s: ImageFont.truetype(FB, s)
fr = lambda s: ImageFont.truetype(FR, s)


def wrap(d, text, fnt, width):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=fnt) <= width:
            cur = t
        else:
            lines.append(cur); cur = w
    lines.append(cur)
    return lines


def gradient(w, h, c1, c2):
    a, b = Image.new("RGB", (w, 1), c1), Image.new("RGB", (w, 1), c2)
    im = Image.new("RGB", (w, h))
    for y in range(h):
        im.paste(Image.blend(a, b, y / h), (0, y))
    return im


def shadow_text(d, xy, text, fnt, fill):
    x, y = xy
    d.text((x + 4, y + 5), text, font=fnt, fill="#00000099")
    d.text((x, y), text, font=fnt, fill=fill)


def thumb(name, kind, code, mod, m):
    c1, c2 = MODCOL[mod]
    im = gradient(1280, 720, c1, c2).convert("RGBA")
    rnd = random.Random(name)
    ov = Image.new("RGBA", im.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    for i in range(9):  # decorative bar chart motif
        h = rnd.randint(120, 440); x = 860 + i * 44
        od.rounded_rectangle((x, 640 - h, x + 30, 640), radius=8, fill=(255, 255, 255, 40 + 8 * i))
    pts = [(850 + i * 44, 560 - rnd.randint(0, 40) - i * 32) for i in range(9)]
    od.line(pts, fill=(255, 255, 255, 150), width=6)
    for p in pts:
        od.ellipse((p[0] - 10, p[1] - 10, p[0] + 10, p[1] + 10), fill=(255, 255, 255, 230))
    im = Image.alpha_composite(im, ov); d = ImageDraw.Draw(im)
    badge = EXTRA[code][2] if kind == "G" else f"{'LECTURE' if kind == 'L' else 'LAB'}  {code}"
    d.rounded_rectangle((50, 46, 50 + d.textlength(badge, font=fb(34)) + 44, 112), radius=14, fill="#ffffff")
    d.text((72, 56), badge, font=fb(34), fill=c1)
    text = m["big"].upper()
    for size in range(150, 60, -4):
        lines = wrap(d, text, fb(size), 770)
        if len(lines) <= 3 and len(lines) * (size + 8) <= 370 and all(d.textlength(l, font=fb(size)) <= 770 for l in lines):
            break
    y = 150
    for ln in lines:
        shadow_text(d, (50, y), ln, fb(size), "#ffffff"); y += size + 8
    d.rounded_rectangle((50, y + 14, 50 + d.textlength(m["sub"], font=fb(44)) + 48, y + 88), radius=14, fill="#fbbf24")
    d.text((74, y + 22), m["sub"], font=fb(44), fill="#111827")
    d.text((50, 660), "DATA209 · Advanced EDA", font=fb(30), fill="#ffffffcc")
    p = f"{WORK}/thumbs/{name}.png"
    im.convert("RGB").save(p, optimize=True)
    return p


def short_slides(name, kind, code, mod, m):
    c1, c2 = MODCOL[mod]
    out = []
    cards = [("QUICK TIP", m["hook"], 96), ("POINT 1", m["p1"], 80), ("POINT 2", m["p2"], 80),
             ("FULL LESSON ON THE CHANNEL", f"{m['big'].title()}\n{'Lecture' if kind == 'L' else 'Lab' if kind == 'P' else 'Course guide'} {code}", 70)]
    for i, (tag, text, size) in enumerate(cards, 1):
        im = gradient(1080, 1920, c1, c2); d = ImageDraw.Draw(im)
        d.text((70, 150), tag, font=fb(46), fill="#fbbf24")
        d.rectangle((70, 215, 330, 225), fill="#ffffff")
        tot = sum(len(wrap(d, pg, fb(size), 940)) * (size + 18) + 20 for pg in text.split("\n"))
        y = max(300, 960 - tot // 2)
        for para in text.split("\n"):
            lines = wrap(d, para, fb(size), 940)
            for ln in lines:
                shadow_text(d, (70, y), ln, fb(size), "#ffffff"); y += size + 18
            y += 20
        d.text((70, 1780), "DATA209 · Advanced EDA", font=fr(38), fill="#ffffffcc")
        d.rounded_rectangle((70, 1700, 70 + 150 * i // 1, 1712), radius=6, fill="#fbbf24") if False else None
        p = f"{WORK}/shorts_slides/{name}_{i}.png"; im.save(p); out.append(p)
    return out


def pretty_tags(m, title, kind):
    base = ["exploratory data analysis", "EDA", "data science", "python", "pandas", "DATA209", "data analysis tutorial"]
    parts = [x.strip().lower() for x in re.split(r"[,:()|]| and ", title) if 3 < len(x.strip()) <= 40]
    tags, total = [], 0
    for t in base + [m["big"].lower(), m["sub"].lower()] + parts:
        if t not in tags and total + len(t) + 1 < 450:
            tags.append(t); total += len(t) + 1
    return tags


def hashtags(m):
    words = re.findall(r"[A-Za-z]{3,}", m["big"] + " " + m["sub"])
    h = ["#python", "#datascience", "#eda"] + ["#" + w.lower() for w in words[:2]]
    return " ".join(dict.fromkeys(h))


# ---- order, schedule
items = []
for it in manifest:
    name, key, kind, n, mod = info(it["file"])
    pos = n if kind == "G" else (n + 1) // 2
    items.append((pos, 0 if kind in "LG" else 1, name, it, key, kind, n, mod))
items.sort(key=lambda x: (x[0], x[1], x[2]))
start = dt.date.fromisoformat(os.environ.get('START', '2026-11-16'))  # first publish date; must be a Monday (env START=YYYY-MM-DD)
IST = dt.timezone(dt.timedelta(hours=5, minutes=30))
slots = []
d0 = start
while len(slots) < len(items):
    for off in (0, 2, 4):  # Mon, Wed, Fri
        slots.append(d0 + dt.timedelta(days=off))
    d0 += dt.timedelta(days=7)

rows, shorts_slides = [], []
new_manifest = []
for slot, (_, _, name, it, key, kind, n, mod) in zip(slots, items):
    m = meta[key]
    code = name.split("_")[0].replace("-", "-")
    thumb_path = thumb(name, kind, code, mod, m)
    chap = it["description"].split("CHAPTERS\n")[1].split("\n\n")[0] if "CHAPTERS\n" in it["description"] else ""
    desc = (f"{m['title']}\n\nIn this {'lecture' if kind == 'L' else 'lab' if kind == 'P' else 'video'} you will learn {m['learn']}.\n\n"
            f"CHAPTERS\n{chap}\n\nPLAYLIST: {PL[mod]}\nCourse: Advanced Exploratory Data Analysis (DATA209), B.Tech Data Science.\n"
            "Notebook and dataset: ADD YOUR LINK HERE\n\nIf this helped, subscribe and share it with a classmate. "
            "Slides are from the course material; narration is AI-generated.\n\n" + hashtags(m))
    pub = dt.datetime.combine(slot, dt.time(18, 30), tzinfo=IST)
    it2 = dict(it, title=m["title"], description=desc, tags=pretty_tags(m, m["title"], kind),
               thumbnail=f"thumbs/{name}.png", playlist=PL[mod], publishAt=pub.isoformat())
    new_manifest.append(it2)
    sp = short_slides(name, kind, code, mod, m)
    narr = f"{m['hook']} {m['p1']} {m['p2']} Watch the full lesson on the channel."
    shorts_slides.append({"out_name": f"S_{name}", "voice": "en-US-JennyNeural", "size": [1080, 1920],
                          "slides": [{"image": sp[0], "text": m["hook"], "pdf": ""}, {"image": sp[1], "text": m["p1"], "pdf": ""},
                                     {"image": sp[2], "text": m["p2"], "pdf": ""},
                                     {"image": sp[3], "text": "Watch the full lesson on the channel.", "pdf": ""}]})
    rows.append([pub.strftime("%a %d %b %Y"), "18:30 IST", name, m["title"], PL[mod],
                 (slot + dt.timedelta(days=1)).strftime("%a %d %b %Y") + " 12:00 IST", f"S_{name}"])

os.makedirs(f"{WORK}/shorts_specs", exist_ok=True)
for s in shorts_slides:
    json.dump(s, open(f"{WORK}/shorts_specs/{s['out_name']}.json", "w"), indent=1)
json.dump(new_manifest, open(f"{OUTD}/upload_manifest.json", "w"), indent=1)
with open(f"{HERE}/marketing/publishing_calendar.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["Publish date", "Time", "Video file", "Title", "Playlist", "Short goes out", "Short file"]); w.writerows(rows)
with open(f"{HERE}/marketing/publishing_calendar.md", "w") as f:
    f.write("# Publishing calendar\n\nTimes are 18:30 Indian Standard Time (change the hour in `make_marketing.py` for another time zone). "
            "3 long videos per week (Mon, Wed, Fri) in syllabus order, each followed by its Short the next day at 12:00.\n\n"
            "| Date | Video | Playlist | Short |\n|---|---|---|---|\n")
    for r in rows:
        f.write(f"| {r[0]} | {r[3]} | {r[4].split(' - ')[0]} | {r[5]} |\n")
print(len(new_manifest), "videos;", rows[0][0], "to", rows[-1][0])
