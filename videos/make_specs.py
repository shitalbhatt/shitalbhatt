"""Parse narration/*.txt into spec JSON files for build_deck_video.py.

Format:
  @src /path/to/pdf/folder
  @voice en-US-JennyNeural            (optional)
  @pdf alias filename.pdf             (declare a deck)
  @video out_name                     (start a new video)
  alias:page | chapter title or - | narration text   (one slide; alias optional after first use)

usage: python3 make_specs.py narration/U01.txt specs_dir
"""
import json, os, sys

src_dir, voice, pdfs, cur, vids, last = ".", "en-US-JennyNeural", {}, None, {}, None
for raw in open(sys.argv[1]):
    line = raw.strip()
    if not line or line.startswith("//"):
        continue
    if line.startswith("@src "):
        src_dir = line.split(None, 1)[1]
    elif line.startswith("@voice "):
        voice = line.split(None, 1)[1]
    elif line.startswith("@pdf "):
        _, alias, fn = line.split(None, 2)
        pdfs[alias] = os.path.join(src_dir, fn)
    elif line.startswith("@video "):
        cur = line.split(None, 1)[1]
        vids[cur] = []
    else:
        head, chap, text = [x.strip() for x in line.split("|", 2)]
        if ":" in head:
            last, page = head.split(":")
        else:
            page = head
        vids[cur].append({"pdf": pdfs[last], "page": int(page), "chapter": None if chap == "-" else chap,
                          "text": text})
os.makedirs(sys.argv[2], exist_ok=True)
for name, sl in vids.items():
    json.dump({"out_name": name, "voice": voice, "slides": sl}, open(f"{sys.argv[2]}/{name}.json", "w"), indent=1)
    words = sum(len(s["text"].split()) for s in sl)
    print(f"{name}: {len(sl)} slides, {words} words, ~{words / 150:.1f} min")
