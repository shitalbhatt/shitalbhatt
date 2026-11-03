"""Turn slide-deck PDF pages + narration into an MP4 (AI voice) with SRT captions and chapters.

spec.json:
{"out_name": "L01-02_...", "voice": "en-US-JennyNeural",
 "slides": [{"pdf": "path.pdf", "page": 4, "chapter": "optional title", "text": "narration"}, ...]}

usage: python3 build_deck_video.py spec.json out_dir
"""
import asyncio, json, os, re, subprocess, sys
import certifi

_CA = "/root/.ccr/ca-bundle.crt"
if os.path.exists(_CA):  # sandbox proxy re-signs TLS; trust its CA bundle (verification stays on)
    certifi.where = lambda: _CA
import edge_tts

spec = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
PROVIDER = os.environ.get("TTS_PROVIDER", "edge")
VOICE = os.environ.get("VOICE", spec.get("voice", "en-US-JennyNeural"))
if PROVIDER == "elevenlabs":
    VOICE = "eleven:" + os.environ.get("ELEVEN_VOICE_ID", "")   # part of the cache key, so switching voice re-renders
for d in ("img", "audio", "clips"):
    os.makedirs(f"{OUT}/{d}", exist_ok=True)
slides = spec["slides"]


def render(pdf, page, dest):
    if os.path.exists(dest):
        return
    base = dest[:-4]
    subprocess.run(["pdftoppm", "-png", "-f", str(page), "-l", str(page), "-scale-to-x", "1280",
                    "-scale-to-y", "720", "-singlefile", pdf, base], check=True)


def split_text(t, limit=4000):
    parts, cur = [], ""
    for sent in re.split(r"(?<=[.!?:])\s+", t):
        if cur and len(cur) + len(sent) + 1 > limit:
            parts.append(cur); cur = sent
        else:
            cur = (cur + " " + sent).strip()
    return parts + [cur] if cur else parts


def eleven_tts(text, mp3):
    """Speak `text` in a cloned voice via the ElevenLabs API (needs ELEVEN_API_KEY and ELEVEN_VOICE_ID)."""
    import requests, time
    base = os.environ.get("ELEVEN_BASE_URL", "https://api.elevenlabs.io")
    url = f"{base}/v1/text-to-speech/{os.environ['ELEVEN_VOICE_ID']}?output_format=mp3_44100_128"
    hdr = {"xi-api-key": os.environ["ELEVEN_API_KEY"], "Content-Type": "application/json"}
    body = lambda t: {"text": t, "model_id": os.environ.get("ELEVEN_MODEL", "eleven_multilingual_v2"),
                      "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.0, "use_speaker_boost": True}}
    files = []
    for k, part in enumerate(split_text(text)):
        for attempt in range(6):
            r = requests.post(url, headers=hdr, json=body(part), timeout=180)
            if r.status_code == 200:
                break
            if r.status_code in (429, 500, 502, 503):
                time.sleep(3 * (attempt + 1)); continue
            raise RuntimeError(f"ElevenLabs error {r.status_code}: {r.text[:300]}")
        else:
            raise RuntimeError("ElevenLabs: too many retries")
        f = f"{mp3}.part{k}.mp3"; open(f, "wb").write(r.content); files.append(f)
    if len(files) == 1:
        os.replace(files[0], mp3)
    else:
        lst = mp3 + ".list.txt"; open(lst, "w").write("".join(f"file '{os.path.abspath(f)}'\n" for f in files))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", mp3], check=True)
        for f in files + [lst]:
            os.remove(f)


async def tts_all():
    sem = asyncio.Semaphore(int(os.environ.get("TTS_CONCURRENCY", "2" if PROVIDER == "elevenlabs" else "6")))

    async def one(i, s):
        mp3 = f"{OUT}/audio/{i:03}.mp3"
        key = s["text"] + VOICE
        if os.path.exists(mp3) and os.path.exists(mp3 + ".txt") and open(mp3 + ".txt").read() == key:
            return
        for attempt in range(4):
            try:
                async with sem:
                    if PROVIDER == "elevenlabs":
                        await asyncio.to_thread(eleven_tts, s["text"], mp3)
                    else:
                        await edge_tts.Communicate(s["text"], VOICE, rate="-4%").save(mp3)
                break
            except Exception:
                await asyncio.sleep(2 * (attempt + 1))
        else:
            raise RuntimeError(f"TTS failed for slide {i}")
        open(mp3 + ".txt", "w").write(key)
    await asyncio.gather(*(one(i, s) for i, s in enumerate(slides, 1)))


def dur(p):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).decode())


def ts(t):
    return f"{int(t // 3600):02}:{int(t % 3600 // 60):02}:{t % 60:06.3f}".replace(".", ",")


for i, s in enumerate(slides, 1):
    if "image" in s:  # ready-made slide image instead of a PDF page
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", s["image"], "-vf", "scale=%d:%d" % tuple(spec.get("size", [1280, 720])),
                        f"{OUT}/img/{i:03}.png"], check=True)
    else:
        render(s["pdf"], s["page"], f"{OUT}/img/{i:03}.png")
asyncio.run(tts_all())

srt, chapters, clips, t0 = [], [], [], 0.0
for i, s in enumerate(slides, 1):
    mp3, img = f"{OUT}/audio/{i:03}.mp3", f"{OUT}/img/{i:03}.png"
    da, pad = dur(mp3), 0.8
    clip = f"{OUT}/clips/{i:03}.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-framerate", "12", "-i", img, "-i", mp3,
                    "-af", f"apad=pad_dur={pad}", "-t", f"{da + pad:.3f}", "-c:v", "libx264", "-tune", "stillimage",
                    "-pix_fmt", "yuv420p", "-r", "12", "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2", clip],
                   check=True)
    clips.append(clip)
    sents = re.split(r"(?<=[.!?:])\s+", s["text"])
    tot, t = sum(len(x) for x in sents), t0
    for x in sents:
        seg = da * len(x) / tot
        srt.append((t, t + seg, x))
        t += seg
    if s.get("chapter"):
        chapters.append((t0, s["chapter"]))
    t0 += da + pad

with open(f"{OUT}/captions.srt", "w") as f:
    for n, (a, b, x) in enumerate(srt, 1):
        f.write(f"{n}\n{ts(a)} --> {ts(b)}\n{x}\n\n")
with open(f"{OUT}/chapters.txt", "w") as f:
    for t, c in chapters:
        f.write(f"{int(t // 60):02}:{int(t % 60):02} {c}\n")
with open(f"{OUT}/list.txt", "w") as f:
    f.writelines(f"file '{os.path.abspath(c)}'\n" for c in clips)
name = spec["out_name"]
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"{OUT}/list.txt",
                "-c", "copy", f"{OUT}/{name}.mp4"], check=True)
print(name, "minutes:", round(t0 / 60, 2))
