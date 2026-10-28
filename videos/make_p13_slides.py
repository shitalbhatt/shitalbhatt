"""Build slide images + spec for the P13-14 Data Visualization lab video from the lab notebook's own saved charts.

usage: python3 make_p13_slides.py <P13_14 notebook.ipynb> <work_dir>
"""
import base64, io, json, os, sys
from PIL import Image, ImageDraw, ImageFont

NB, WORK = sys.argv[1], sys.argv[2]
os.makedirs(f"{WORK}/slides", exist_ok=True)
nb = json.load(open(NB))
cells = nb["cells"]
BG, PANEL, ACC, GRN, AMB, TXT, MUT = "#0f172a", "#1e293b", "#38bdf8", "#34d399", "#fbbf24", "#e2e8f0", "#94a3b8"
W, H = 1280, 720
F = "/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf"
M = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
font = lambda s, b=False: ImageFont.truetype(F % ("Bold" if b else "Regular"), s)


def base(title, tag):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 12, H], fill=ACC)
    d.text((60, 30), tag.upper(), font=font(20, True), fill=ACC)
    d.text((60, 60), title, font=font(40, True), fill=TXT)
    d.text((60, H - 38), "DATA209 · Advanced EDA · Lab P13-14 · Data Visualization", font=font(18), fill=MUT)
    return im, d


def wrap(d, text, f, width):
    out = []
    for para in text.split("\n"):
        cur = ""
        for w in para.split():
            t = (cur + " " + w).strip()
            if d.textlength(t, font=f) <= width:
                cur = t
            else:
                out.append(cur)
                cur = w
        out.append(cur)
    return out


def chart(cell_idx):
    for o in cells[cell_idx].get("outputs", []):
        if "data" in o and "image/png" in o["data"]:
            return Image.open(io.BytesIO(base64.b64decode(o["data"]["image/png"]))).convert("RGB")


def code_of(cell_idx, max_lines=14, max_chars=52):
    lines = [l.rstrip() for l in "".join(cells[cell_idx]["source"]).split("\n") if l.strip()]
    lines = lines[:max_lines]
    return "\n".join(l if len(l) <= max_chars else l[: max_chars - 1] + "…" for l in lines)


def slide_chart(name, title, tag, cell_idx, show_code=True):
    im, d = base(title, tag)
    ch = chart(cell_idx)
    if show_code:
        d.rounded_rectangle((50, 130, 600, 650), radius=14, fill="#0b1220", outline="#334155", width=2)
        y = 148
        for ln in code_of(cell_idx).split("\n"):
            d.text((66, y), ln, font=ImageFont.truetype(M, 16), fill=GRN if ln.strip().startswith("#") else TXT)
            y += 24
        box = (620, 130, 1240, 650)
    else:
        box = (60, 130, 1220, 650)
    bw, bh = box[2] - box[0], box[3] - box[1]
    ch.thumbnail((bw, bh))
    d.rounded_rectangle(box, radius=14, fill="#ffffff")
    im.paste(ch, (box[0] + (bw - ch.width) // 2, box[1] + (bh - ch.height) // 2))
    p = f"{WORK}/slides/{name}.png"
    im.save(p)
    return p


def slide_text(name, title, tag, bullets, big=None):
    im, d = base(title, tag)
    y = 150
    for b in bullets:
        d.ellipse((64, y + 12, 76, y + 24), fill=ACC)
        for ln in wrap(d, b, font(30), 1080):
            d.text((96, y), ln, font=font(30), fill=TXT)
            y += 42
        y += 18
    if big:
        d.rounded_rectangle((60, y + 10, 1220, y + 100), radius=14, fill=PANEL, outline=AMB, width=2)
        for i, ln in enumerate(wrap(d, big, font(28, True), 1120)):
            d.text((84, y + 28 + i * 36), ln, font=font(28, True), fill=AMB)
    p = f"{WORK}/slides/{name}.png"
    im.save(p)
    return p


S = []
def add(img, chapter, text):
    S.append({"image": img, "chapter": chapter, "text": text})

add(slide_text("01", "Data visualization in Python", "Lab P13-14",
    ["Grammar of Graphics: building a chart layer by layer", "Good versus misleading plots",
     "Visualizing non-numeric data: categories, hierarchies, text, networks",
     "Dashboard logic and storytelling with data"], "Dataset: Superstore Retail Orders, 9,994 orders, 21 columns"),
    "Introduction",
    "Welcome to practicals thirteen and fourteen: data visualization in Python. We cover the Grammar of Graphics, good versus misleading plots, visualizing non-numeric data, dashboard logic, and storytelling with data. We use the Superstore retail orders dataset, with nine thousand nine hundred ninety four orders.")
add(slide_text("02", "Setup", "Step 1",
    ["Import pandas, numpy, seaborn and matplotlib, plus squarify for treemaps, networkx for networks, and wordcloud.",
     "Load the Superstore file and drop the rows with a blank segment.",
     "New this time: convert the order date from plain text into a real datetime, which we need for the monthly trend chart."]),
    "Setup",
    "First, setup. Import pandas, numpy, seaborn and matplotlib, plus squarify for treemaps, network x for network diagrams, and word cloud. Load the Superstore file the same way as in earlier labs, with one addition: convert the order date from plain text into a real datetime type, which we need for the monthly trend chart later.")
add(slide_text("03", "Grammar of Graphics", "Section 2",
    ["Every chart is composed the same way:", "data → aesthetics (x, y, color) → geometry (plot type) → scale labels → theme",
     "Once you can name the layers, you can build or debug any chart."]),
    "Grammar of Graphics",
    "Section two: the Grammar of Graphics, building a chart layer by layer. Every chart is composed the same way: data, then aesthetics such as x, y and colour, then geometry, the plot type, then scale labels and a theme. Once you can name these layers, you can build or debug any chart.")
add(slide_chart("04", "Grammar in one chart", "Section 2", 6), None,
    "Here is one chart mapped to the grammar. The data layer is the data frame. The aesthetics layer is x equals category, y equals sales, and colour by region. The geometry layer is the bar plot itself, with the mean as the estimator. Then we add a title and labels. Reading the code layer by layer is exactly how you would build or debug it.")
add(slide_chart("05", "Facets: one chart, many groups", "Section 2", 8), None,
    "Facets repeat the same chart once per group. With col equals region and col wrap equals two, we get one small bar chart of average profit by segment for each region, arranged in a grid, from one line of code instead of four separate charts. This is the grammar's answer to how do I compare a chart across many groups.")
add(slide_text("06", "Good vs misleading plots", "Section 3",
    ["The same data, drawn two ways, can leave a viewer with very different impressions.", "The most common culprit: the y-axis baseline."]),
    "Good vs misleading plots",
    "Section three: good versus misleading plots. The same data, drawn two different ways, can leave a viewer with very different impressions. The most common culprit is the y axis baseline.")
add(slide_chart("07", "Truncated axis vs honest axis", "Section 3", 13), None,
    "On the left, the y axis is forced to start at point one oh, making Central's discount look several times taller than West's. On the right, the axis starts at zero and shows the true, much smaller difference. Same data, different story. When bars encode a quantity, the axis must start at zero.")
add(slide_chart("08", "Categorical data: sort by value", "Section 4.1", 17), "Visualizing non-numeric data",
    "Section four: visualizing non-numeric data. Numeric summaries like mean and correlation do not apply to categories, hierarchies or text, so each needs its own technique. For categories, use a sorted bar chart. The order argument sorts bars by value instead of alphabetically, so Phones and Chairs lead and Fasteners and Labels trail. Sorting lets the pattern make the point on its own.")
add(slide_chart("09", "Hierarchical data: treemap", "Section 4.2", 20), None,
    "For hierarchical data, use a treemap. Squarify draws one rectangle per category, with area proportional to total sales. Technology, furniture and office supplies are close in size, which a treemap makes easy to compare without reading exact numbers off an axis.")
add(slide_chart("10", "Text data: word cloud", "Section 4.3", 23), None,
    "For text, use a word cloud. Join every product name into one long string, and word cloud counts word frequency and sizes each word by how often it appears. It is good for a quick skim of what dominates a text field, though not for precise comparison.")
add(slide_chart("11", "Relationships: network diagram", "Section 4.4", 26), None,
    "For relationships, use a network diagram. We connect each of the top fifteen customers to every sub-category they have bought from. That makes a bipartite network, with two kinds of nodes, customers and sub-categories. It shows which sub-categories are shared across customers and which are niche.")
add(slide_chart("12", "Dashboard layout: one grid, many panels", "Section 5", 29), "Dashboard logic",
    "Section five: dashboard logic. A dashboard is several panels sharing one figure, organised around a purpose: key numbers first, supporting detail below. Here is the layout. Add gridspec reserves a three by three grid, with a shorter top row for the three K P I cards, and a taller row below with a wide trend panel and a smaller mix panel. Each add subplot claims a region of that grid. Then each panel is filled the normal way: ax text for the K P I cards showing orders, total sales and total profit, a seaborn line plot for the monthly sales trend, and a bar plot for the sales share by category. The only new idea is that every plotting call targets a specific panel instead of the whole figure.")
add(slide_chart("13", "Highlight the one bar that matters", "Section 6.1", 35), "Storytelling with data",
    "Section six: storytelling with data. First, highlight the one bar that matters. A short list comprehension picks one strong colour for Central and a muted grey for every other bar: gray out the rest. And the chart title states the insight, Central's discount rate stands out from the rest, instead of just naming the variables.")
add(slide_chart("14", "Annotate the key moment", "Section 6.2", 38), None,
    "Second, annotate the key moment directly on the chart. Idx min finds the exact month where profit was lowest, so we let the data locate the annotation instead of guessing. Then annotate draws a label and an arrow pointing at that point. A short label at the key moment saves the viewer from hunting for it.")
add(slide_chart("15", "Second dataset: Titanic bars", "Section 7", 41), "Second dataset: Titanic",
    "Section seven: the same techniques on a second dataset, Titanic. The same grammar pattern as before: data, aesthetics with passenger class on x, fare on y and sex as colour, and bars for geometry.")
add(slide_chart("16", "Titanic treemap", "Section 7", 43), None,
    "And the same treemap pattern, now showing the relative size of each passenger class. Swap the data frame and column names, and the same techniques apply to any dataset.")
add(slide_text("17", "Practice exercises", "Section 8",
    ["Rebuild the Section 2 bar chart with x = Region instead of x = Category. Does the story change?",
     "Make a treemap of Sub-Category sales within a single Category.",
     "Redraw the discount chart with an honest axis and a highlighted bar, then write an insight title."],
    "Swap the DataFrame and column names: the same techniques apply to any dataset."),
    "Practice exercises",
    "To practise, try these. Rebuild the grammar bar chart with region on the x axis and see whether the story changes. Make a treemap of sub-category sales within a single category. And redraw the discount chart with an honest axis and a highlighted bar, then write an insight title. The code patterns in this lab, layered charts, honest axes, treemaps, word clouds, network diagrams, gridspec dashboards and annotated highlights, are general purpose. Swap the data and the same techniques apply to any dataset. Thanks for watching.")
for s in S:
    s["pdf"] = ""
json.dump({"out_name": "P13-14_Lab_Data_Visualization_Grammar_to_Storytelling", "voice": "en-US-JennyNeural", "slides": S},
          open(f"{WORK}/P13-14_Lab_Data_Visualization_Grammar_to_Storytelling.json", "w"), indent=1)
print(len(S), "slides", sum(len(s["text"].split()) for s in S), "words")
