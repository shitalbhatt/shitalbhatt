"""Design slides (Pillow/matplotlib) from a Python content file and write a spec for build_deck_video.py.

content file defines: NAME (out name), FOOT (footer text), SLIDES = [dict(...)], each with
  kind: title|bullets|cards|table|image|code|chart , chapter (optional), text (narration), plus kind fields.
usage: python3 make_designed_deck.py content.py work_dir
"""
import json, os, runpy, sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw, ImageFont

C = runpy.run_path(sys.argv[1])
WORK = sys.argv[2]
os.makedirs(f"{WORK}/slides", exist_ok=True)
BG, PANEL, ACC, GRN, AMB, RED, TXT, MUT = "#0f172a", "#1e293b", "#38bdf8", "#34d399", "#fbbf24", "#f87171", "#e2e8f0", "#94a3b8"
COL = {"acc": ACC, "grn": GRN, "amb": AMB, "red": RED}
W, H = 1280, 720
FF = "/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
f = lambda s, b=False: ImageFont.truetype(FF % ("Bold" if b else "Regular"), s)
FOOT = C.get("FOOT", "DATA209 · Advanced EDA")


def wrap(d, text, fnt, width):
    out = []
    for para in text.split("\n"):
        cur = ""
        for w in para.split():
            t = (cur + " " + w).strip()
            if d.textlength(t, font=fnt) <= width:
                cur = t
            else:
                out.append(cur); cur = w
        out.append(cur)
    return out


def para(d, x, y, text, fnt, fill, width, gap=8):
    for ln in wrap(d, text, fnt, width):
        d.text((x, y), ln, font=fnt, fill=fill)
        y += fnt.size + gap
    return y


def base(s, big=False):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 12, H], fill=ACC)
    if not big:
        d.text((60, 30), s.get("tag", "").upper(), font=f(20, True), fill=ACC)
        d.text((60, 60), s["title"], font=f(42, True), fill=TXT)
        d.text((60, H - 38), FOOT, font=f(18), fill=MUT)
    return im, d


def chart_img(fn, name):
    p = f"{WORK}/slides/{name}_chart.png"
    fn(plt, p)
    return p


def render(s, name):
    k = s["kind"]
    if k == "title":
        im, d = base(s, True)
        d.text((80, 150), s.get("tag", "").upper(), font=f(26, True), fill=ACC)
        y = para(d, 80, 200, s["title"], f(76, True), TXT, 1100, 6)
        y = para(d, 80, y + 20, s["subtitle"], f(36), TXT, 1100)
        d.text((80, 610), s.get("foot", ""), font=f(24), fill=MUT)
    elif k == "bullets":
        im, d = base(s)
        y = 150
        for it in s["items"]:
            head, body = it if isinstance(it, tuple) else (None, it)
            d.ellipse((64, y + 12, 76, y + 24), fill=ACC)
            if head:
                d.text((96, y), head, font=f(30, True), fill=AMB); y += 40
            y = para(d, 96, y, body, f(28), TXT, 1080, 6) + 16
        if s.get("callout"):
            d.rounded_rectangle((60, 600 - 20 * len(wrap(d, s["callout"], f(26, True), 1120)), 1220, 650), radius=14, fill=PANEL, outline=AMB, width=2)
            para(d, 84, 610 - 20 * len(wrap(d, s["callout"], f(26, True), 1120)), s["callout"], f(26, True), AMB, 1120, 4)
    elif k == "cards":
        im, d = base(s)
        n = len(s["cards"]); cw = (1160 - 20 * (n - 1)) // n
        for i, (head, body, c) in enumerate(s["cards"]):
            x = 60 + i * (cw + 20)
            d.rounded_rectangle((x, 150, x + cw, 620), radius=16, fill=PANEL, outline=COL[c], width=2)
            y = para(d, x + 22, 172, head, f(32, True), COL[c], cw - 44, 4)
            para(d, x + 22, y + 14, body, f(25), TXT, cw - 44, 6)
    elif k == "table":
        im, d = base(s)
        cols = s["cols"]; widths = s["widths"]
        y = 150
        x0 = 60
        d.rectangle([x0 - 10, y - 8, x0 + sum(widths) - 10, y + 40], fill=PANEL)
        x = x0
        for c, w in zip(cols, widths):
            d.text((x, y), c, font=f(24, True), fill=MUT); x += w
        y += 56
        for row in s["rows"]:
            x = x0; mh = 0
            for cell, w in zip(row, widths):
                yy = y
                for ln in wrap(d, str(cell), f(23), w - 20):
                    d.text((x, yy), ln, font=f(23), fill=TXT); yy += 30
                mh = max(mh, yy - y); x += w
            y += mh + 14
        if s.get("note"):
            para(d, 60, H - 110, s["note"], f(24, True), AMB, 1150)
    elif k in ("image", "chart"):
        im, d = base(s)
        p = s["image"] if k == "image" else chart_img(s["fn"], name)
        ch = Image.open(p).convert("RGB")
        left = s.get("side")
        bx = (60, 130, 1220, 600) if not left else (400, 130, 1220, 620)
        if left:
            para(d, 60, 150, left, f(25), TXT, 320, 8)
        ch.thumbnail((bx[2] - bx[0], bx[3] - bx[1]))
        d.rounded_rectangle(bx, radius=14, fill=BG)
        im.paste(ch, (bx[0] + (bx[2] - bx[0] - ch.width) // 2, bx[1] + (bx[3] - bx[1] - ch.height) // 2))
        if s.get("caption"):
            para(d, 60, 625, s["caption"], f(24, True), AMB, 1150)
    elif k == "code":
        im, d = base(s)
        d.rounded_rectangle((50, 140, 1230, 140 + 30 * len(s["code"].split("\n")) + 40), radius=14, fill="#0b1220", outline="#334155", width=2)
        y = 160
        for ln in s["code"].split("\n"):
            d.text((70, y), ln, font=ImageFont.truetype(MONO, 22), fill=GRN if ln.strip().startswith("#") else TXT); y += 30
        if s.get("note"):
            para(d, 60, y + 40, s["note"], f(27), AMB, 1150)
    p = f"{WORK}/slides/{name}.png"
    im.save(p)
    return p


slides = []
for i, s in enumerate(C["SLIDES"], 1):
    slides.append({"image": render(s, f"{i:02}"), "chapter": s.get("chapter"), "text": s["text"], "pdf": ""})
json.dump({"out_name": C["NAME"], "voice": "en-US-JennyNeural", "slides": slides},
          open(f"{WORK}/{C['NAME']}.json", "w"), indent=1)
print(C["NAME"], len(slides), "slides", sum(len(x["text"].split()) for x in slides), "words")
