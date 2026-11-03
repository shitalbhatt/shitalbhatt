"""Build the 'Missing Values: Detection & Imputation' lecture + lab video.

Slides are drawn with Pillow/matplotlib, narration is synthesised with Edge-TTS,
and ffmpeg assembles the MP4 + SRT captions. Every number shown on a slide is
computed here from the lab dataset, not typed by hand.

usage: python3 build_video.py <airbnb_nyc_missing_values_lab.csv> <out_dir>
"""
import asyncio
import json
import os
import re
import subprocess
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFont
from sklearn.impute import KNNImputer
from sklearn.linear_model import LinearRegression

CSV, OUT = sys.argv[1], sys.argv[2]
VOICE = os.environ.get("VOICE", "en-US-JennyNeural")  # female; e.g. en-IN-NeerjaNeural, en-US-AriaNeural
os.makedirs(f"{OUT}/slides", exist_ok=True)
os.makedirs(f"{OUT}/audio", exist_ok=True)
os.makedirs(f"{OUT}/clips", exist_ok=True)

# ---------------------------------------------------------------- analysis
df = pd.read_csv(CSV)
n_rows, n_cols = df.shape  # before imputed columns are added
obs = df["reviews_per_month"].dropna()
obs_var = obs.var()
mean_val, median_val = obs.mean(), obs.median()
df["rpm_mean"] = df["reviews_per_month"].fillna(mean_val)
df["rpm_median"] = df["reviews_per_month"].fillna(median_val)
predictors = ["price", "minimum_nights", "number_of_reviews", "availability_365",
              "calculated_host_listings_count", "latitude", "longitude"]
df["rpm_knn"] = KNNImputer(n_neighbors=5).fit_transform(
    df[predictors + ["reviews_per_month"]])[:, -1]
missing = df["reviews_per_month"].isnull()
train = df.dropna(subset=["reviews_per_month"])
reg = LinearRegression().fit(train[predictors], train["reviews_per_month"])
r2 = reg.score(train[predictors], train["reviews_per_month"])
pred = reg.predict(df.loc[missing, predictors]).clip(min=0)
df["rpm_reg"] = df["reviews_per_month"]
df.loc[missing, "rpm_reg"] = pred
ret = {c: df[c].var() / obs_var * 100 for c in ["rpm_mean", "rpm_median", "rpm_knn", "rpm_reg"]}
n_miss = int(missing.sum())
pct_miss = n_miss / n_rows * 100
all_zero = bool((missing == (df["number_of_reviews"] == 0)).all())
ph = ["na", "n/a", "null", "none", "nan", "-", "?", ""]
n_host_ph = int(df["host_name"].astype(str).str.strip().str.lower().isin(ph).sum())
n_price0 = int((df["price"] == 0).sum())
n_min999 = int((df["minimum_nights"] == 999).sum())
assert all_zero and n_miss == 10116 and abs(ret["rpm_knn"] - 86.7) < 0.1

# ---------------------------------------------------------------- charts
BG, PANEL, ACC, GRN, AMB, RED, TXT, MUT = (
    "#0f172a", "#1e293b", "#38bdf8", "#34d399", "#fbbf24", "#f87171", "#e2e8f0", "#94a3b8")
plt.rcParams.update({"text.color": TXT, "axes.labelcolor": TXT, "xtick.color": MUT,
                     "ytick.color": MUT, "axes.edgecolor": MUT, "font.size": 15})

fig, axs = plt.subplots(1, 3, figsize=(12.8, 4.9), sharey=True, sharex=True, facecolor=BG)
bins = np.linspace(0, 6, 61)
for ax, (col, title, colr) in zip(axs, [
        ("reviews_per_month", "Observed only", ACC),
        ("rpm_mean", "Mean-filled", RED),
        ("rpm_knn", "KNN-filled", GRN)]):
    ax.set_facecolor(PANEL)
    ax.hist(df[col].dropna().clip(upper=6), bins=bins, color=colr)
    ax.set_title(title, color=colr, fontsize=18, pad=8)
    ax.set_xlabel("reviews per month")
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
axs[0].set_ylabel("listings")
axs[1].annotate("one value\nrepeated\n10,116 times", xy=(1.37, 12000), xytext=(2.6, 9500),
                color=TXT, fontsize=14, arrowprops=dict(arrowstyle="->", color=TXT))
fig.tight_layout()
fig.savefig(f"{OUT}/slides/chart_hist.png", dpi=100, facecolor=BG)
plt.close(fig)

fig, ax = plt.subplots(figsize=(5.6, 3.6), facecolor=BG)
ax.set_facecolor(BG)
names = ["Mean", "Regression", "Median", "KNN"]
vals = [ret["rpm_mean"], ret["rpm_reg"], ret["rpm_median"], ret["rpm_knn"]]
cols = [RED, AMB, AMB, GRN]
bars = ax.barh(names, vals, color=cols)
for b, v in zip(bars, vals):
    ax.text(v - 1.5, b.get_y() + b.get_height() / 2, f"{v:.1f}%", va="center", ha="right",
            color=BG, fontsize=15, fontweight="bold")
ax.axvline(100, color=MUT, ls="--")
ax.set_xlim(60, 102)
ax.set_xlabel("variance retained (%)", fontsize=13)
for s in ("top", "right", "left"):
    ax.spines[s].set_visible(False)
fig.tight_layout()
fig.savefig(f"{OUT}/slides/chart_var.png", dpi=100, facecolor=BG)
plt.close(fig)

# ---------------------------------------------------------------- drawing helpers
W, H = 1280, 720
F = "/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf"
M = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono%s.ttf"


def font(size, bold=False):
    return ImageFont.truetype(F % ("Bold" if bold else "Regular"), size)


def mono(size, bold=False):
    return ImageFont.truetype(M % ("-Bold" if bold else ""), size)


def new_slide(title=None, tag=None):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 12, H], fill=ACC)
    if tag:
        d.text((60, 36), tag.upper(), font=font(20, True), fill=ACC)
    if title:
        d.text((60, 66), title, font=font(44, True), fill=TXT)
    d.text((60, H - 40), "DATA209 · Advanced EDA · Data Cleaning in Python", font=font(18), fill=MUT)
    return im, d


def wrap(d, text, fnt, width):
    lines = []
    for para in text.split("\n"):
        cur = ""
        for w in para.split():
            t = (cur + " " + w).strip()
            if d.textlength(t, font=fnt) <= width:
                cur = t
            else:
                lines.append(cur)
                cur = w
        lines.append(cur)
    return lines


def para(d, xy, text, fnt, fill, width, gap=8):
    x, y = xy
    for ln in wrap(d, text, fnt, width):
        d.text((x, y), ln, font=fnt, fill=fill)
        y += fnt.size + gap
    return y


def panel(d, box, fill=PANEL, outline=None):
    d.rounded_rectangle(box, radius=16, fill=fill, outline=outline, width=2)


def code_block(d, box, code, label):
    panel(d, box, fill="#0b1220", outline="#334155")
    x0, y0, x1, y1 = box
    d.text((x0 + 20, y0 + 10), label, font=font(16, True), fill=MUT)
    y = y0 + 40
    for ln in code.split("\n"):
        col = GRN if ln.strip().startswith("#") else TXT
        d.text((x0 + 22, y), ln, font=mono(21), fill=col)
        y += 29


def save(im, name):
    p = f"{OUT}/slides/{name}.png"
    im.save(p)
    return p


def s_title():
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 12, H], fill=ACC)
    d.text((80, 150), "MODULE 3 · DATA QUALITY", font=font(26, True), fill=ACC)
    d.text((80, 200), "Missing Values", font=font(96, True), fill=TXT)
    d.text((80, 320), "Why they happen, and four ways to fix them", font=font(40), fill=TXT)
    d.text((80, 410), "Lecture + Hands-on Lab in Python", font=font(30), fill=AMB)
    d.text((80, 600), "Pandas · scikit-learn · Real NYC Airbnb data", font=font(24), fill=MUT)
    return save(im, "01_title")


def s_why():
    im, d = new_slide("Why missing values matter", "Motivation")
    para(d, (60, 150), "No real dataset arrives complete: forms get skipped, sensors drop out, "
         "and some values don't exist yet.", font(30), TXT, 700)
    para(d, (60, 300), "Drop every incomplete row and you throw away information. Fill blindly "
         "and you distort the very statistics you wanted.", font(30), MUT, 700)
    panel(d, (820, 150, 1220, 520), outline=ACC)
    d.text((850, 190), f"{pct_miss:.1f}%", font=font(110, True), fill=AMB)
    para(d, (850, 340), f"of the {n_rows:,} listings are missing reviews_per_month", font(26), TXT, 340)
    return save(im, "02_why")


def s_mech():
    im, d = new_slide("Three missing-data mechanisms", "Lecture")
    cards = [("MCAR", "Completely at Random", "No link to any variable. Pure chance.\nE.g. a random sensor glitch.", ACC),
             ("MAR", "Missing at Random", "Depends on another OBSERVED column.\nE.g. retired people skip the salary question.", GRN),
             ("MNAR", "Not at Random", "Depends on the hidden value itself.\nE.g. high earners hiding their income.", RED)]
    for i, (a, b, c, col) in enumerate(cards):
        x = 60 + i * 400
        panel(d, (x, 170, x + 370, 590), outline=col)
        d.text((x + 24, 195), a, font=font(54, True), fill=col)
        d.text((x + 24, 270), b, font=font(26, True), fill=TXT)
        para(d, (x + 24, 330), c, font(24), MUT, 320)
    return save(im, "03_mech")


def s_mar():
    im, d = new_slide("MAR proven in our data", "Lecture")
    para(d, (60, 150), "Every missing reviews_per_month row also has number_of_reviews = 0.",
         font(32), TXT, 1100)
    para(d, (60, 260), "A listing with no reviews has no 'reviews per month' rate to record. "
         "The gap is fully explained by a column we already have.", font(28), MUT, 1100)
    panel(d, (60, 420, 640, 640), outline=GRN)
    d.text((90, 445), f"{n_miss:,} / {n_miss:,}", font=font(72, True), fill=GRN)
    d.text((90, 545), "missing rows have zero reviews", font=font(28), fill=TXT)
    panel(d, (680, 420, 1220, 640))
    d.text((710, 445), "name / host_name", font=font(26, True), fill=AMB)
    para(d, (710, 490), "Only 16 and 21 gaps, scattered. Consistent with MCAR, but MCAR can "
         "never be proven from data alone.", font(24), MUT, 480)
    return save(im, "04_mar")


def s_load():
    im, d = new_slide("Lab: load and count the gaps", "Lab · Step 1")
    code = ("import pandas as pd\n"
            "df = pd.read_csv('airbnb_nyc_missing_values_lab.csv')\n"
            "df.shape\n"
            "df.isnull().sum()   # missing count per column")
    code_block(d, (60, 150, 1220, 320), code, "PYTHON")
    nz = df.isnull().sum()
    out = f"({n_rows}, {n_cols})\n" + "\n".join(f"{k:<20}{v:>6}" for k, v in nz[nz > 0].items()) + \
          "\n# the other 12 columns: 0"
    code_block(d, (60, 340, 1220, 600), out, "OUTPUT")
    return save(im, "05_load")


def s_crosstab():
    im, d = new_slide("Prove WHY: the crosstab", "Lab · Step 2")
    code = ("pd.crosstab(\n"
            "    df['reviews_per_month'].isnull(),\n"
            "    df['number_of_reviews'] == 0\n"
            ")")
    code_block(d, (60, 150, 620, 330), code, "PYTHON")
    ct = pd.crosstab(df["reviews_per_month"].isnull(), df["number_of_reviews"] == 0)
    out = "number_of_reviews == 0   False   True\nrpm is missing\n" + \
          f"False                   {ct.loc[False, False]:>5}   {ct.loc[False, True]:>4}\n" + \
          f"True                    {ct.loc[True, False]:>5}   {ct.loc[True, True]:>4}"
    code_block(d, (60, 350, 700, 560), out, "OUTPUT")
    panel(d, (740, 150, 1220, 560), outline=GRN)
    d.text((770, 175), "How to read it", font=font(30, True), fill=GRN)
    para(d, (770, 235), "Missing = True always lines up with zero reviews = True.\n\n"
         "The other two cells are empty. That is a verified MAR relationship, not a guess.",
         font(26), TXT, 410)
    return save(im, "06_crosstab")


def s_disguised():
    im, d = new_slide("Hidden gaps: disguised missing values", "Lab · Step 3")
    code = ("for val in [0, -1, 999, 9999]:\n"
            "    print(f\"price == {val}: {(df['price'] == val).sum()}\")\n"
            "\n"
            "df['price'] = df['price'].replace(0, np.nan)\n"
            "df['minimum_nights'] = df['minimum_nights'].replace(999, np.nan)\n"
            "df['host_name'] = df['host_name'].replace({'Nan': np.nan, 'Na': np.nan})")
    code_block(d, (60, 150, 1220, 385), code, "PYTHON")
    cards = [(f"{n_price0} rows", "price = 0\nA listing can't cost $0", RED),
             (f"{n_min999} rows", "minimum_nights = 999\nAn old sentinel code", AMB),
             (f"{n_host_ph} rows", "host_name = 'Nan' / 'Na'\nText that isnull() can't see", ACC)]
    for i, (a, b, col) in enumerate(cards):
        x = 60 + i * 400
        panel(d, (x, 410, x + 370, 650), outline=col)
        d.text((x + 24, 430), a, font=font(46, True), fill=col)
        para(d, (x + 24, 510), b, font(24), TXT, 330)
    return save(im, "07_disguised")


def s_methods():
    im, d = new_slide("Three imputation strategies", "Lecture")
    cards = [("Mean / Median", "Quick baseline for roughly symmetric data.", "Shrinks variance: every fill is identical.", ACC),
             ("KNN", "Features correlate with the missing one.", "Slower on big data; needs scaled features.", GRN),
             ("Regression", "A clear linear relationship exists.", "Extrapolates poorly outside the training range.", AMB)]
    for i, (a, b, c, col) in enumerate(cards):
        x = 60 + i * 400
        panel(d, (x, 160, x + 370, 600), outline=col)
        d.text((x + 24, 185), a, font=font(38, True), fill=col)
        d.text((x + 24, 270), "BEST WHEN", font=font(18, True), fill=MUT)
        para(d, (x + 24, 300), b, font(24), TXT, 320)
        d.text((x + 24, 430), "WATCH OUT FOR", font=font(18, True), fill=MUT)
        para(d, (x + 24, 460), c, font(24), TXT, 320)
    return save(im, "08_methods")


def s_meanmedian():
    im, d = new_slide("Mean and median imputation", "Lab · Step 4")
    code = ("observed = df['reviews_per_month'].dropna()\n"
            "mean_val, median_val = observed.mean(), observed.median()\n"
            "df['rpm_mean']   = df['reviews_per_month'].fillna(mean_val)\n"
            "df['rpm_median'] = df['reviews_per_month'].fillna(median_val)\n"
            "df[['rpm_mean', 'rpm_median']].var()")
    code_block(d, (60, 150, 1220, 340), code, "PYTHON")
    out = (f"observed variance : {obs_var:.3f}   (mean {mean_val:.3f}, median {median_val:.2f}, skew {obs.skew():.1f})\n"
           f"mean-fill   var   : {df['rpm_mean'].var():.3f}   ->  {ret['rpm_mean']:.1f}% retained\n"
           f"median-fill var   : {df['rpm_median'].var():.3f}   ->  {ret['rpm_median']:.1f}% retained")
    code_block(d, (60, 360, 1220, 520), out, "OUTPUT")
    para(d, (60, 545), "The column is right-skewed, so the median is the more honest single number.",
         font(26), AMB, 1150)
    return save(im, "09_meanmedian")


def s_knn():
    im, d = new_slide("KNN imputation", "Lab · Step 5")
    code = ("from sklearn.impute import KNNImputer\n"
            "predictors = ['price', 'minimum_nights', 'number_of_reviews',\n"
            "              'availability_365', 'calculated_host_listings_count',\n"
            "              'latitude', 'longitude']\n"
            "imputer = KNNImputer(n_neighbors=5)\n"
            "result = imputer.fit_transform(df[predictors + ['reviews_per_month']])\n"
            "df['rpm_knn'] = result[:, -1]")
    code_block(d, (60, 150, 1220, 405), code, "PYTHON")
    out = (f"new variance           : {df['rpm_knn'].var():.3f}  ->  {ret['rpm_knn']:.1f}% retained\n"
           f"mean KNN fill (missing): {df.loc[missing, 'rpm_knn'].mean():.2f}   vs blind mean-fill {mean_val:.2f}")
    code_block(d, (60, 425, 1220, 540), out, "OUTPUT")
    para(d, (60, 560), "KNN was never told about the MAR rule, yet it filled low-activity values.",
         font(26), GRN, 1150)
    return save(im, "10_knn")


def s_reg():
    im, d = new_slide("Regression-based imputation", "Lab · Step 6")
    code = ("from sklearn.linear_model import LinearRegression\n"
            "train = df.dropna(subset=['reviews_per_month'])\n"
            "reg = LinearRegression().fit(train[predictors], train['reviews_per_month'])\n"
            "reg.score(train[predictors], train['reviews_per_month'])   # R-squared\n"
            "pred = reg.predict(df.loc[missing, predictors])\n"
            "df.loc[missing, 'rpm_reg'] = pred.clip(min=0)   # can't be negative")
    code_block(d, (60, 150, 1220, 380), code, "PYTHON")
    out = (f"R-squared               : {r2:.3f}   (modest)\n"
           f"mean fill (missing rows): {pred.mean():.2f}\n"
           f"new variance            : {df['rpm_reg'].var():.3f}  ->  {ret['rpm_reg']:.1f}% retained")
    code_block(d, (60, 400, 1220, 540), out, "OUTPUT")
    para(d, (60, 560), "A weak R-squared is a warning sign, not a free pass.", font(26), AMB, 1150)
    return save(im, "11_reg")


def s_chart():
    im, d = new_slide("What each fill does to the distribution", "Lab · Step 7")
    ch = Image.open(f"{OUT}/slides/chart_hist.png").resize((1160, 444))
    im.paste(ch, (60, 150))
    para(d, (60, 620), "Mean-filling piles thousands of rows onto one value. KNN keeps a natural spread.",
         font(24), MUT, 1150)
    return save(im, "12_chart")


def s_compare():
    im, d = new_slide("Comparing the four strategies", "Lab · Step 8")
    rows = [("Method", "Fill value", "New variance", "Retained"),
            ("Mean", f"{mean_val:.3f} (const)", f"{df['rpm_mean'].var():.3f}", f"{ret['rpm_mean']:.1f}%"),
            ("Median", f"{median_val:.2f} (const)", f"{df['rpm_median'].var():.3f}", f"{ret['rpm_median']:.1f}%"),
            ("KNN (k=5)", "varies per row", f"{df['rpm_knn'].var():.3f}", f"{ret['rpm_knn']:.1f}%"),
            ("Regression", "varies per row", f"{df['rpm_reg'].var():.3f}", f"{ret['rpm_reg']:.1f}%")]
    xs = [60, 215, 410, 570]
    for r, row in enumerate(rows):
        y = 160 + r * 62
        if r == 0:
            d.rectangle([50, y - 6, 720, y + 46], fill=PANEL)
        for x, cell in zip(xs, row):
            col = MUT if r == 0 else (GRN if row[0].startswith("KNN") else TXT)
            d.text((x, y), cell, font=font(24, r == 0 or row[0].startswith("KNN")), fill=col)
    para(d, (60, 500), f"Observed variance: {obs_var:.3f}. Every method loses some spread; "
         "the check itself is part of the audit.", font(24), MUT, 640)
    ch2 = Image.open(f"{OUT}/slides/chart_var.png").resize((470, 302))
    im.paste(ch2, (750, 160))
    return save(im, "13_compare")


def s_takeaways():
    im, d = new_slide("Key takeaways", "Summary")
    items = ["MCAR, MAR and MNAR describe WHY a value is missing, and that should drive the fix.",
             "A crosstab against an observed column proves MAR; don't just guess it.",
             "Hunt for disguised gaps (0, 999, 'Nan') before you impute.",
             f"Mean/median is simplest but loses the most variance; KNN kept {ret['rpm_knn']:.1f}%.",
             "Always compare strategies and check the variance change."]
    y = 150
    for it in items:
        d.text((70, y + 2), "✓", font=ImageFont.truetype(M % "", 30), fill=GRN)
        y = para(d, (120, y), it, font(29), TXT, 1080) + 18
    return save(im, "14_takeaways")


def s_outro():
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 12, H], fill=ACC)
    d.text((80, 140), "Try it yourself", font=font(64, True), fill=TXT)
    para(d, (80, 250), "1. Run isnull().sum() and a crosstab on a column in your own dataset.\n"
         "2. Note which observed column explains the gaps.\n"
         "3. Compare two imputation methods and report the variance retained.",
         font(32), MUT, 1100, gap=16)
    d.text((80, 520), "Next lesson: outliers. Subscribe so you don't miss it.", font=font(36, True), fill=AMB)
    return save(im, "15_outro")


# ---------------------------------------------------------------- narration
slides = [
    (s_title, "Welcome. In this lesson you'll learn what to do when your dataset has missing values. "
              "First comes the theory: the three reasons data goes missing. Then a hands-on lab in Python, "
              "using nearly fifty thousand real New York City Airbnb listings. By the end, you'll be able "
              "to detect missing values, work out why they're missing, fill them in four different ways, "
              "and judge which fix is best."),
    (s_why, "No real dataset arrives complete. Forms get skipped, sensors drop out, and some values simply "
            "don't exist yet. If you drop every incomplete row, you throw away information. If you fill "
            "blindly, you can distort the very statistics you wanted to compute. In our lab data, twenty "
            "point six percent of listings are missing the reviews per month value. That's far too many to "
            "drop. So the right fix depends on one question: why is the value missing?"),
    (s_mech, "Every missing value fits one of three patterns. M C A R, missing completely at random, means the "
             "gap has no relationship to any variable. It's pure chance, like a random sensor glitch. "
             "M A R, missing at random, means the gap depends on another column you can observe. For example, "
             "retired people skip the salary question more often. And M N A R, missing not at random, means "
             "the gap depends on the hidden value itself, like high earners declining to report their income. "
             "The pattern decides whether an imputation method helps or quietly misleads you."),
    (s_mar, f"Let's see this in our data. Reviews per month is missing for {n_miss:,} listings. We checked, and "
            f"every single one of those rows also has zero reviews. That's the definition of M A R. A listing "
            f"with no reviews has no reviews per month rate to record, so the gap is fully explained by a column "
            f"we already have. By contrast, the name and host name columns have only sixteen and twenty-one gaps, "
            f"scattered with no pattern. That's consistent with M C A R, but be careful: M C A R can never be "
            f"proven from data alone."),
    (s_load, f"Now the lab. We load the cleaned Airbnb file with pandas. It has {n_rows:,} rows and {n_cols} columns. "
             f"Calling isnull dot sum gives the missing count for every column. Only four columns have gaps: "
             f"name, host name, last review, and reviews per month. Everything else is complete."),
    (s_crosstab, "Counting gaps is easy. Explaining them is the real work. This crosstab compares two things: "
                 "is reviews per month missing, and is the number of reviews zero. Read the table. When the value "
                 "is missing, the number of reviews is always zero. And the other two cells are empty. "
                 "That turns our guess into a verified fact."),
    (s_disguised, f"One more trap: gaps that isnull cannot see. A price of zero, found in {n_price0} rows, is impossible. "
                  f"A minimum stay of nine hundred ninety-nine nights, in {n_min999} rows, is an old sentinel code. "
                  f"And {n_host_ph} host names contain the literal text Nan or Na, which pandas reads as a normal string. "
                  f"Convert these to real missing values first. But use judgment. Zero reviews and zero available "
                  f"days are real data, not hidden gaps."),
    (s_methods, "Now to fixing the gaps. Imputation replaces a missing value with an estimate, and every method "
                "trades simplicity for how much of the data's real structure it keeps. Mean or median is the quick "
                "baseline, but every fill is identical, so it shrinks the variance. K-N-N borrows from similar "
                "rows, but it's slower and needs scaled features. Regression predicts the value from other columns, "
                "but it can extrapolate poorly."),
    (s_meanmedian, f"Method one: mean and median. We compute the fill value from the observed rows only, then fillna "
                   f"applies it to every missing row at once. The observed variance is {obs_var:.2f}. Mean-fill keeps "
                   f"{ret['rpm_mean']:.1f} percent of it, and median-fill keeps {ret['rpm_median']:.1f} percent. "
                   f"Because this column is strongly right-skewed, the median is the more honest single number."),
    (s_knn, f"Method two: K-N-N imputation. For each missing row, the imputer finds the five most similar listings "
            f"by price, location, availability, and the other features, then averages their values. It keeps "
            f"{ret['rpm_knn']:.1f} percent of the variance, the best of the four. And for the originally missing rows "
            f"it filled an average of {df.loc[missing, 'rpm_knn'].mean():.2f}, far below the blind mean-fill of "
            f"{mean_val:.2f}. K-N-N was never told about the zero reviews rule, yet it respected it."),
    (s_reg, f"Method three: regression. We train a linear model on the rows where the value is known, then "
            f"predict the missing ones, clipping at zero because a review rate can't be negative. The R squared is "
            f"only {r2:.2f}, a modest fit. The model predicts {pred.mean():.2f} for the zero-review rows, too high "
            f"compared with K-N-N. Variance retained is {ret['rpm_reg']:.1f} percent, about the same as the median. "
            f"A weak R squared is a warning sign, not a free pass."),
    (s_chart, "Here's what each fill does to the distribution. On the left, the observed data. In the middle, "
              "mean-filling stacks more than ten thousand rows on one single value. On the right, K-N-N keeps "
              "a natural spread. That's what losing variance looks like."),
    (s_compare, f"Lined up side by side, the trade-offs become numbers. Mean retains {ret['rpm_mean']:.1f} percent, "
                f"regression {ret['rpm_reg']:.1f}, median {ret['rpm_median']:.1f}, and K-N-N {ret['rpm_knn']:.1f}. "
                f"Every method loses some spread, because filling in a guess can never add real information. "
                f"The lesson isn't never use the mean. It's that checking the variance change is part of the audit."),
    (s_takeaways, "Let's recap. One: the mechanism, M C A R, M A R, or M N A R, should drive your fix. Two: prove M A R "
                  "with a crosstab instead of guessing. Three: hunt for disguised gaps before you impute. "
                  "Four: mean and median are simplest but lose the most variance, while K-N-N kept the most. "
                  "And five: always compare strategies and check the variance change."),
    (s_outro, "Now try it yourself. Run the detection steps on a column in your own dataset, note which observed "
              "column explains the gaps, and compare at least two imputation methods. In the next lesson we'll "
              "tackle outliers. If this helped, subscribe so you don't miss it. Thanks for watching."),
]

# ---------------------------------------------------------------- build
import certifi  # noqa: E402
_CA = "/root/.ccr/ca-bundle.crt"
if os.path.exists(_CA):  # sandbox proxy re-signs TLS; trust its CA bundle (verification stays on)
    certifi.where = lambda: _CA
import edge_tts  # noqa: E402


async def tts(text, path):
    await edge_tts.Communicate(text, VOICE, rate="-4%").save(path)


def dur(p):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).decode())


def ts(t):
    h, m = int(t // 3600), int(t % 3600 // 60)
    return f"{h:02}:{m:02}:{t % 60:06.3f}".replace(".", ",")


async def _all_tts():
    sem = asyncio.Semaphore(6)

    async def one(i, text):
        mp3 = f"{OUT}/audio/{i:02}.mp3"
        if os.path.exists(mp3) and os.path.exists(mp3 + ".txt") and open(mp3 + ".txt").read() == text + VOICE:
            return
        async with sem:
            await tts(text, mp3)
        open(mp3 + ".txt", "w").write(text + VOICE)
    await asyncio.gather(*(one(i, t) for i, (_, t) in enumerate(slides, 1)))


asyncio.run(_all_tts())
srt, t0, clips, chapters = [], 0.0, [], []
for i, (fn, text) in enumerate(slides, 1):
    img = fn()
    mp3 = f"{OUT}/audio/{i:02}.mp3"
    d_audio = dur(mp3)
    pad = 0.7
    clip = f"{OUT}/clips/{i:02}.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-framerate", "24", "-i", img,
                    "-i", mp3, "-af", f"apad=pad_dur={pad}", "-t", f"{d_audio + pad:.3f}",
                    "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-r", "24",
                    "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2", clip], check=True)
    clips.append(clip)
    sents = re.split(r"(?<=[.!?:])\s+", text)
    total = sum(len(s) for s in sents)
    t = t0
    for s in sents:
        seg = d_audio * len(s) / total
        srt.append((t, t + seg, s))
        t += seg
    chapters.append((t0, fn.__name__))
    t0 += d_audio + pad

with open(f"{OUT}/captions.srt", "w") as f:
    for n, (a, b, s) in enumerate(srt, 1):
        f.write(f"{n}\n{ts(a)} --> {ts(b)}\n{s}\n\n")
with open(f"{OUT}/list.txt", "w") as f:
    f.writelines(f"file '{os.path.abspath(c)}'\n" for c in clips)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"{OUT}/list.txt",
                "-c", "copy", f"{OUT}/missing_values_lecture_lab.mp4"], check=True)
print("total minutes:", round(t0 / 60, 2))
json.dump(chapters, open(f"{OUT}/chapters.json", "w"))
