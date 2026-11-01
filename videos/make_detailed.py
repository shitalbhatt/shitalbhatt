"""Build a detailed video: welcome card (instructor photo) + original slides with extra narration + closing card + presenter frame.
usage: VOICE=en-IN-NeerjaNeural python3 make_detailed.py OUT_NAME [OUT_NAME ...]
Extra narration lives in detail/<OUT_NAME>.txt as blocks:  #INTRO  / #OUTRO / #<slide index starting at 0>
"""
import csv, json, os, re, subprocess, sys, textwrap
from PIL import Image, ImageDraw, ImageFont

V = os.path.dirname(os.path.abspath(__file__))
os.chdir(V)
WORK = os.environ.get('DWORK', '/tmp/claude-0/-home-user/b3644d76-0373-536c-89d2-71ac9e4a6be5/scratchpad/detailed')
OUTDIR = 'output_detailed'
os.makedirs(OUTDIR, exist_ok=True)
rows = list(csv.DictReader(open('marketing/publishing_calendar.csv')))
order = [r['Video file'] for r in rows]
man = {m['file'][:-4]: m for m in json.load(open('output_all/upload_manifest.json'))}
F = lambda n, s: ImageFont.truetype(f'/usr/share/fonts/truetype/dejavu/DejaVu{n}.ttf', s)
photo = Image.open('presenter/badge.png').convert('RGBA')


def card(path, kicker, title, lines, big_photo=True):
    im = Image.new('RGB', (1280, 720), (14, 30, 62)); d = ImageDraw.Draw(im)
    d.ellipse((1010, -230, 1530, 290), fill=(224, 120, 92)); d.ellipse((1060, 470, 1480, 890), fill=(40, 155, 142))
    p = photo.resize((300, 300), Image.LANCZOS); im.paste(p, (90, 150), p)
    x = 440
    d.text((x, 120), kicker, font=F('Sans-Bold', 20), fill=(240, 168, 120))
    y = 160
    for ln in textwrap.wrap(title, 34):
        d.text((x, y), ln, font=F('Serif-Bold', 40), fill=(255, 255, 255)); y += 54
    y += 14
    for ln in lines:
        d.text((x, y), ln, font=F('Sans', 22), fill=(205, 220, 245)); y += 34
    d.text((90, 480), 'Dr. Shital D. Bhatt', font=F('Sans-Bold', 26), fill=(255, 255, 255))
    d.text((90, 516), 'Associate Professor', font=F('Sans', 20), fill=(190, 210, 240))
    d.text((90, 544), 'School of Engineering and Technology', font=F('Sans', 17), fill=(190, 210, 240))
    d.text((90, 568), 'Vidyashilp University', font=F('Sans', 17), fill=(190, 210, 240))
    im.save(path)


def parse(name):
    out, key = {}, None
    for ln in open(f'detail/{name}.txt').read().splitlines():
        m = re.match(r'#(\w+)\s*$', ln)
        if m: key = m.group(1); out[key] = ''
        elif key is not None: out[key] += (' ' if out[key] else '') + ln.strip()
    return out


def build(name):
    spec = json.load(open(f'specs/{name}.json'))
    ex = parse(name)
    m = man[name]
    i = order.index(name)
    nxt = man[order[i + 1]]['title'] if i + 1 < len(order) else None
    learn = re.search(r'In this \w+ you will learn (.*?)\.\n', m['description'])
    learn = learn.group(1) if learn else 'the key ideas of this topic'
    w = os.path.join(WORK, name); os.makedirs(w, exist_ok=True)
    short_title = m['title'].split(':')[0][:70]
    card(f'{w}/intro.png', 'DATA209 · ADVANCED EXPLORATORY DATA ANALYSIS', m['title'][:110],
         ['B.Tech (Hons.) Data Science', 'Semester III · 4 credits', 'A complete, detailed walkthrough'])
    card(f'{w}/outro.png', 'THANK YOU FOR WATCHING', 'Practise it, then move on',
         (['Next video:'] + textwrap.wrap(nxt, 52)[:3]) if nxt else ['You have reached the end of the course videos.'])
    intro = ex.get('INTRO') or (
        f"Namaste, and welcome to Data two oh nine, Advanced Exploratory Data Analysis. I am Doctor Shital Bhatt. "
        f"In this video you will learn {learn}. We will go step by step, with examples, small calculations, and a few stories "
        f"from real projects, so please take your time, pause whenever you like, and keep a notebook beside you.")
    outro = ex.get('OUTRO') or (
        "That brings us to the end of this video. Take a minute to recall the main ideas in your own words, and then try the practice task "
        "before the next class. " + (f"In the next video we cover: {nxt}. " if nxt else "") +
        "If this video helped you, please like it, subscribe to the channel, and share it with a classmate. Thank you for watching, and see you in the next video.")
    slides = [{'image': f'{w}/intro.png', 'chapter': 'Welcome', 'text': intro}]
    for k, s in enumerate(spec['slides']):
        s = dict(s); extra = ex.get(str(k), '')
        s['text'] = (s['text'].rstrip() + ' ' + extra).strip() if extra else s['text']
        slides.append(s)
    slides.append({'image': f'{w}/outro.png', 'chapter': 'Summary and next steps', 'text': outro})
    json.dump({'out_name': name, 'voice': spec.get('voice', 'en-IN-NeerjaNeural'), 'slides': slides}, open(f'{w}/spec.json', 'w'))
    env = dict(os.environ, VOICE=os.environ.get('VOICE', 'en-IN-NeerjaNeural'))
    subprocess.run(['python3', 'build_deck_video.py', f'{w}/spec.json', w], check=True, env=env)
    final = f'{OUTDIR}/{name}.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{w}/{name}.mp4', '-i', 'presenter/frame_rgba.png', '-filter_complex',
                    '[0:v]scale=1100:619,pad=1280:720:14:50:color=0x0e1e3e[p];[p][1:v]overlay=0:0', '-c:v', 'libx264', '-preset', 'veryfast',
                    '-tune', 'stillimage', '-crf', '24', '-r', '12', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', final], check=True)
    for f, dst in (('captions.srt', f'{OUTDIR}/{name}.srt'), ('chapters.txt', f'{OUTDIR}/{name}.chapters.txt')):
        subprocess.run(['cp', f'{w}/{f}', dst], check=True)
    print('built', final, os.path.getsize(final) // 10**6, 'MB')


for n in sys.argv[1:]:
    build(n)
