NAME = "L13-14_Data_Visualization_Grammar_to_Storytelling_Lecture"
FOOT = "DATA209 · Advanced EDA · L13–14 · Data Visualization"


def anscombe(plt, path):
    xs = [[10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]] * 3 + [[8] * 7 + [19] + [8] * 3]
    ys = [[8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68],
          [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74],
          [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73],
          [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]]
    fig, axs = plt.subplots(1, 4, figsize=(13, 3.6), sharey=True, facecolor="#0f172a")
    for a, x, y, t in zip(axs, xs, ys, "IV"[0:0] or ["I", "II", "III", "IV"]):
        a.set_facecolor("#1e293b"); a.scatter(x, y, color="#38bdf8", s=45)
        a.plot([3, 20], [3 + 0.5 * 3, 3 + 0.5 * 20], color="#fbbf24")
        a.set_title(f"Dataset {t}", color="#e2e8f0"); a.tick_params(colors="#94a3b8")
        for sp in a.spines.values(): sp.set_color("#475569")
    fig.tight_layout(); fig.savefig(path, dpi=100, facecolor="#0f172a"); plt.close(fig)


def truncated(plt, path):
    names, vals = ["Q1", "Q2", "Q3", "Q4"], [96, 98, 99, 101]
    fig, axs = plt.subplots(1, 2, figsize=(12, 4.2), facecolor="#0f172a")
    for a, lim, t, c in zip(axs, [(95, 102), (0, 110)], ["Misleading: axis starts at 95", "Honest: axis starts at 0"], ["#f87171", "#34d399"]):
        a.set_facecolor("#1e293b"); a.bar(names, vals, color="#38bdf8"); a.set_ylim(*lim)
        a.set_title(t, color=c, fontsize=16); a.tick_params(colors="#94a3b8")
        for sp in a.spines.values(): sp.set_color("#475569")
    fig.tight_layout(); fig.savefig(path, dpi=100, facecolor="#0f172a"); plt.close(fig)


SLIDES = [
 dict(kind="title", tag="Module 2 · Lectures 13–14", title="Data Visualization", subtitle="Grammar of Graphics · Honest charts · Non-numeric data · Dashboards · Storytelling",
      foot="DATA209 · Advanced Exploratory Data Analysis", chapter="Introduction",
      text="Welcome to lectures thirteen and fourteen: data visualization. We will learn how charts are built using the Grammar of Graphics, how to tell good charts from misleading ones, how to visualize non-numeric data, how dashboards are organised, and how to turn a chart into a story. This also prepares you for assignment one."),
 dict(kind="cards", tag="Roadmap", title="Five ideas today", cards=[
      ("1 Grammar", "Build any chart from layers: data, aesthetics, geometry", "acc"),
      ("2 Honest charts", "Good versus misleading plots", "grn"),
      ("3 Non-numeric", "Categories, hierarchies, text, networks", "amb"),
      ("4 Dashboards", "Panels with one purpose", "red"),
      ("5 Storytelling", "From chart to message", "acc")],
      text="Five ideas today. One: the Grammar of Graphics, building any chart from layers. Two: good versus misleading charts. Three: visualizing non-numeric data such as categories, hierarchies, text and networks. Four: dashboard logic. And five: storytelling with data."),
 dict(kind="chart", fn=anscombe, tag="Why visualize", title="Same numbers, different data", chapter="Why we visualize",
      caption="All four datasets: same mean, same variance, same correlation (0.82), same fitted line.",
      text="Why visualize at all? These four datasets, known as Anscombe's quartet, have the same mean, the same variance, the same correlation of point eight two, and the same fitted line. Yet they look completely different: a clean linear trend, a curve, a line with one outlier, and a vertical stack with one extreme point. Summary statistics compress, and compression hides structure. Only the picture shows the difference."),
 dict(kind="bullets", tag="Grammar of Graphics", title="Every chart is built from layers", chapter="Grammar of Graphics", items=[
      ("Data", "The table you are plotting."),
      ("Aesthetics", "Which column controls x, y, colour, size or shape."),
      ("Geometry", "The shape that draws the data: points, lines, bars, boxes."),
      ("Scales, labels and theme", "Axis ranges, titles, colours, fonts.")],
      callout="Name the layers and you can build, or debug, any chart.",
      text="The Grammar of Graphics says every chart is built from layers. The data is the table you plot. Aesthetics decide which column controls x, y, colour, size or shape. Geometry is the shape that draws the data: points, lines, bars or boxes. And scales, labels and theme control axis ranges, titles, colours and fonts. If you can name the layers, you can build or debug any chart."),
 dict(kind="table", tag="Grammar of Graphics", title="Not all visual channels are equally accurate", cols=["Rank", "Channel", "Good for"], widths=[120, 380, 640], rows=[
      ["1", "Position on a common scale", "Comparing values precisely: scatter, dot plot"],
      ["2", "Length", "Bar charts"], ["3", "Angle and slope", "Pie slices, line slopes"],
      ["4", "Area", "Bubble size, treemaps"], ["5", "Colour intensity", "Heatmaps, highlighting"]],
      note="Put your most important comparison on the most accurate channel.",
      text="Not all visual channels are equally accurate. People judge position on a common scale best, then length, then angle and slope, then area, and colour intensity least precisely. That is why bar charts and dot plots beat pie charts for comparing values. Put your most important comparison on the most accurate channel."),
 dict(kind="table", tag="Grammar of Graphics", title="Choose the geometry from the question", cols=["Question", "Variables", "Geometry"], widths=[420, 360, 380], rows=[
      ["How is one number distributed?", "1 numeric", "Histogram, density, box plot"],
      ["How do two numbers relate?", "2 numeric", "Scatter plot, hexbin"],
      ["How does a number change over time?", "numeric + time", "Line chart"],
      ["How do groups compare?", "category + numeric", "Bar, box or violin plot"],
      ["How do two categories overlap?", "2 categorical", "Heatmap of a cross-tab, stacked bar"],
      ["What is the part of a whole?", "category + share", "Stacked bar, treemap"]],
      text="Choose the geometry from the question you are asking. How is one number distributed: histogram, density or box plot. How do two numbers relate: scatter plot. How does a number change over time: line chart. How do groups compare: bar, box or violin plot. How do two categories overlap: a heatmap of a cross-tab. And part of a whole: stacked bar or treemap."),
 dict(kind="bullets", tag="Grammar of Graphics", title="Facets: small multiples", items=[
      "Repeat the same chart once per group, in a grid.", "Every panel shares the same axes, so groups can be compared at a glance.",
      "One line of code instead of many separate charts: in seaborn, col equals the grouping column.",
      "Use facets instead of piling many lines or colours onto one cluttered plot."],
      text="Facets, also called small multiples, repeat the same chart once per group in a grid. Every panel shares the same axes, so groups can be compared at a glance. It takes one line of code, for example col equals the grouping column in seaborn, and it is almost always better than piling many lines or colours onto one cluttered plot."),
 dict(kind="chart", fn=truncated, tag="Good vs misleading plots", title="The truncated axis", chapter="Good vs misleading plots",
      caption="Same data. The left chart makes a 5% change look like a 5x change.",
      text="Now, good versus misleading charts. The most common trick is the truncated axis. These two bar charts show exactly the same four numbers. On the left the axis starts at ninety five, so a five percent rise looks like a five-fold jump. On the right the axis starts at zero and shows the true, modest change. When bars encode a quantity, the axis must start at zero."),
 dict(kind="cards", tag="Good vs misleading plots", title="Five other ways charts mislead", cards=[
      ("Dual axes", "Two y-axes can be scaled to fake any correlation", "red"),
      ("Cherry-picked range", "Showing only the dates that suit the story", "amb"),
      ("Distorted area", "Doubling radius quadruples area, and exaggerates", "red"),
      ("Clutter and 3D", "Decoration hides the data and bends the values", "amb"),
      ("Missing context", "No baseline, no sample size, no source", "acc")],
      text="Charts can also mislead in other ways. Dual axes can be scaled to fake any correlation. A cherry-picked range shows only the dates that suit the story. Distorted areas exaggerate: doubling a circle's radius quadruples its area. Clutter and three-D effects hide the data and bend the values. And missing context, with no baseline, sample size or source, leaves viewers guessing."),
 dict(kind="bullets", tag="Good vs misleading plots", title="Principles of an honest chart", items=[
      "Start bar charts at zero; line charts may zoom, but say so.", "Label axes with units, and give the chart an informative title.",
      "Use colour with purpose, and check it works for colour-blind readers.", "Remove decoration that carries no data: heavy gridlines, 3D, shadows.",
      "Show the sample size and the source."],
      text="Principles of an honest chart. Start bar charts at zero; line charts may zoom, but say so. Label axes with units and give an informative title. Use colour with purpose and check it works for colour-blind readers. Remove decoration that carries no data, such as heavy gridlines, three-D and shadows. And always show the sample size and the source."),
 dict(kind="cards", tag="Visualizing non-numeric data", title="Each data type needs its own picture", chapter="Visualizing non-numeric data", cards=[
      ("Categorical", "Sorted bar chart. Sort by value, not alphabet", "acc"),
      ("Hierarchical", "Treemap. Area shows share, nesting shows structure", "grn"),
      ("Text", "Word cloud or word-frequency bar chart", "amb"),
      ("Relationships", "Network diagram. Nodes are items, edges are links", "red")],
      text="Mean and correlation do not apply to categories, hierarchies or text, so each needs its own picture. For categorical data, use a sorted bar chart, sorted by value and not alphabetically. For hierarchical data, use a treemap, where area shows share and nesting shows structure. For text, use a word cloud or, better, a word-frequency bar chart. And for relationships, use a network diagram, where nodes are items and edges are links."),
 dict(kind="bullets", tag="Dashboard logic", title="A dashboard answers one purpose", chapter="Dashboard logic", items=[
      ("Start with the audience and the decision", "Who looks at this, and what will they do next?"),
      ("Key numbers first", "A row of K P I cards at the top."),
      ("Supporting detail below", "Trend, breakdown, and one comparison."),
      ("Consistent design", "Same colours, scales and filters across panels.")],
      callout="Fewer panels, each with a clear job.",
      text="Dashboard logic. A dashboard is several panels sharing one figure, organised around a single purpose. Start with the audience and the decision they have to make. Put the key numbers first, in a row of K P I cards. Add supporting detail below: a trend, a breakdown and one comparison. And keep the design consistent, with the same colours, scales and filters across panels. Fewer panels, each with a clear job."),
 dict(kind="cards", tag="Storytelling with data", title="Turn a chart into a message", chapter="Storytelling with data", cards=[
      ("Title states the insight", "'Central's discount stands out', not 'Discount by region'", "acc"),
      ("Highlight one thing", "Gray out the rest, colour the bar that matters", "grn"),
      ("Annotate the moment", "Label the key point directly on the chart", "amb"),
      ("Declutter", "Remove everything that does not support the message", "red")],
      text="Storytelling with data turns a chart into a message. Let the title state the insight, such as Central's discount stands out, rather than just naming the variables. Highlight one thing: gray out the rest and colour the bar that matters. Annotate the key moment directly on the chart. And declutter: remove everything that does not support the message."),
 dict(kind="cards", tag="Storytelling with data", title="A simple story structure", cards=[
      ("Context", "What is the situation and why does it matter?", "acc"),
      ("Conflict", "What did the data reveal that is surprising or wrong?", "red"),
      ("Resolution", "What action do you recommend, and what will it change?", "grn")],
      text="A simple story structure has three parts. Context: what is the situation and why does it matter. Conflict: what did the data reveal that is surprising or wrong. And resolution: what action do you recommend, and what will it change. Every chart in your presentation should serve one of these three parts."),
 dict(kind="table", tag="Assignment 1 preparation", title="Presentation checklist", chapter="Assignment 1 preparation", cols=["Part", "What to show"], widths=[360, 800], rows=[
      ["Problem statement", "Question, unit of observation, target variable"],
      ["Data audit", "Shape, types, missing values, duplicates, hidden zeros"],
      ["Univariate and bivariate EDA", "Skew, outliers, correlations, group comparisons, with honest charts"],
      ["Hypotheses", "Two or three, labelled exploratory"],
      ["Story", "Insight titles, one highlighted finding per slide, a recommendation"]],
      note="Every chart: honest axis, labels with units, an insight title.",
      text="To prepare for assignment one, structure your presentation like this. A problem statement with the question, unit of observation and target. A data audit: shape, types, missing values, duplicates and hidden zeros. Univariate and bivariate E D A with honest charts. Two or three hypotheses, labelled exploratory. And a story, with insight titles, one highlighted finding per slide, and a recommendation. Every chart needs an honest axis, labels with units, and an insight title."),
 dict(kind="bullets", tag="Summary", title="Key takeaways", chapter="Summary", items=[
      "Statistics hide structure; always plot (Anscombe's quartet).", "Every chart is data, aesthetics, geometry, scales and theme.",
      "Choose the geometry from the question; use facets for groups.", "Start bar axes at zero and avoid decoration that bends the data.",
      "Categories, hierarchies, text and networks each have a natural chart.", "Dashboards have one purpose; stories have a message."],
      text="Key takeaways. Statistics hide structure, so always plot; remember Anscombe's quartet. Every chart is data, aesthetics, geometry, scales and theme. Choose the geometry from the question and use facets for groups. Start bar axes at zero and avoid decoration that bends the data. Categories, hierarchies, text and networks each have a natural chart. And dashboards have one purpose, while stories have a message. In the lab you will build all of these in Python. Thanks for watching."),
]
