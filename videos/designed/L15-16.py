NAME = "L15-16_Data_Quality_Integration_and_Validation_Lecture"
FOOT = "DATA209 · Advanced EDA · L15–16 · Data Quality"


def labels(plt, path):
    names = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Is.", "manhattan", "brooklyn", "queens", "bronx", "staten is."]
    vals = [21985, 20376, 5751, 1107, 376, 131, 122, 39, 5, 3]
    cols = ["#38bdf8"] * 5 + ["#f87171"] * 5
    fig, ax = plt.subplots(figsize=(10, 4.6), facecolor="#0f172a")
    ax.set_facecolor("#0f172a"); ax.barh(names[::-1], vals[::-1], color=cols[::-1])
    ax.tick_params(colors="#e2e8f0", labelsize=13); ax.set_xlabel("listings", color="#94a3b8")
    for sp in ("top", "right"): ax.spines[sp].set_visible(False)
    for sp in ("left", "bottom"): ax.spines[sp].set_color("#475569")
    fig.tight_layout(); fig.savefig(path, dpi=100, facecolor="#0f172a"); plt.close(fig)


SLIDES = [
 dict(kind="title", tag="Module 3 · Lectures 15–16", title="Data Quality, Integration & Validation", subtitle="Accuracy · Completeness · Consistency · Validity · Merging sources · Duplicates · Encoding · Rules",
      foot="DATA209 · Advanced Exploratory Data Analysis", chapter="Introduction",
      text="Welcome to lectures fifteen and sixteen: data quality, integration and validation. We learn the four dimensions of data quality, how to combine data from multiple sources, how to detect duplicates, how to fix inconsistent encoding, and how to write validation rules. The lab that follows runs all of this on a real merged Airbnb file."),
 dict(kind="table", tag="Clean vs raw data", title="Raw data is not analysis-ready data", cols=["Raw data", "Clean data"], widths=[580, 580], rows=[
      ["Collected for another purpose", "Shaped for the question you are asking"],
      ["Duplicates, gaps, mixed spellings", "One row per entity, gaps explained, one spelling"],
      ["Hidden sentinels: 0, 999, 'N/A'", "Sentinels converted to real missing values"],
      ["Several files, different schemas", "One integrated, documented table"]],
      note="Rule: audit first, fix second, and re-audit after every fix.",
      text="Raw data is collected for another purpose. It has duplicates, gaps and mixed spellings, hidden sentinel values like zero, nine ninety nine or N A, and often comes as several files with different schemas. Clean data is shaped for your question: one row per entity, gaps explained, one spelling, sentinels converted to real missing values, and one integrated, documented table. The rule: audit first, fix second, and re-audit after every fix."),
 dict(kind="cards", tag="Data quality dimensions", title="Four dimensions of quality", chapter="Quality dimensions", cards=[
      ("Accuracy", "Is the value correct in the real world?", "acc"),
      ("Completeness", "Is everything we need present?", "grn"),
      ("Consistency", "Is one fact stored one way everywhere?", "amb"),
      ("Validity", "Does the value obey the rules?", "red")],
      text="Data quality has four dimensions. Accuracy: is the value correct in the real world? Completeness: is everything we need present? Consistency: is one fact stored one way everywhere? And validity: does the value obey the rules? We will look at each in turn, with examples from the New York City Airbnb data."),
 dict(kind="bullets", tag="Accuracy", title="Accuracy needs a reference", items=[
      "Accuracy is checked against reality, a trusted source, or a peer group.", "Example: a private room in Queens listed at 10,000 dollars a night, against a peer median of 59.",
      "Proxy reference: the median price of listings with the same borough and room type.", "Flag suspicious values, do not delete them: the true value is unknown, and deleting real rows biases the data."],
      callout="Flag first. Decide cap, fix or remove later, once you know why.",
      text="Accuracy needs a reference. You check a value against reality, a trusted source, or a peer group. For example, a private room in Queens listed at ten thousand dollars a night, against a peer median of fifty nine. A good proxy reference is the median price of listings with the same borough and room type. Flag suspicious values rather than deleting them: the true value is unknown, and deleting real rows biases the data. Decide whether to cap, fix or remove later, once you know why."),
 dict(kind="bullets", tag="Completeness", title="Completeness: how much, and why", items=[
      "Measure missing share per column, and the share of rows with no gap at all.", "In the Airbnb data, 20.6% of listings lack last review and reviews per month; only 79.4% of rows are fully complete.",
      "Ask why. Every one of those listings has zero reviews: the gap is structural, not random.", "Coverage matters too: a column can be fully filled and still never contain January or April."],
      text="Completeness asks how much is missing and why. Measure the missing share per column, and the share of rows with no gap at all. In the Airbnb data, twenty point six percent of listings lack a last review date and reviews per month, and only seventy nine point four percent of rows are fully complete. But why? Every one of those listings has zero reviews, so the gap is structural, not random. Coverage matters too: a column can be fully filled and still never contain January or April."),
 dict(kind="chart", fn=labels, tag="Consistency", title="Consistency: one borough, two spellings", chapter="Consistency",
      caption="10 labels for 5 boroughs: a group-by splits every statistic in two.",
      text="Consistency means one fact is stored one way everywhere. Here are the borough labels in the merged Airbnb file: ten labels for five boroughs, because lowercase copies of Manhattan, Brooklyn, Queens, Bronx and Staten Island sit next to the proper-case versions. A group by on this column gives ten groups instead of five and splits every statistic in two."),
 dict(kind="cards", tag="Consistency", title="Consistency across three directions", cards=[
      ("Across rows", "One borough, two spellings", "acc"),
      ("Across columns", "Price and price in dollars hold the same fact twice", "amb"),
      ("Across sources", "Source A says Manhattan, source B says manhattan", "red")],
      text="Consistency can break in three directions. Across rows: one borough with two spellings. Across columns: the price and price in dollars columns hold the same fact twice. And across sources: one team's file says Manhattan while another's says manhattan. The fix in each case is to choose one standard form and apply it everywhere."),
 dict(kind="table", tag="Validity", title="Validity: write the rules, then test every row", chapter="Validity", cols=["Rule type", "Example", "Failures in the lab"], widths=[280, 520, 360], rows=[
      ["Range", "price at least 0; availability 0 to 365", "0"],
      ["Set", "room type in {Entire, Private, Shared}", "300 (lowercase labels)"],
      ["Format and type", "last review is a date; price is an integer", "0"],
      ["Geographic box", "latitude 40.50 to 40.91", "5 (real Staten Island listings)"],
      ["Uniqueness", "id is unique", "300 repeated ids"]],
      note="Validity asks: is it possible? Accuracy asks: is it correct?",
      text="Validity means the value obeys the rules, so write the rules first and test every row against every rule. Range rules, like price at least zero. Set rules, like room type being one of three allowed values: three hundred failures from lowercase labels. Format and type rules. A geographic box rule: five latitude failures, which turned out to be real Staten Island listings, so rules need review too. And uniqueness rules. Remember: validity asks, is it possible? Accuracy asks, is it correct? A ten thousand dollar room passes every validity rule and is still wrong."),
 dict(kind="cards", tag="Data integration", title="Four steps to combine sources", chapter="Data integration", cards=[
      ("1 Match key", "Find a shared identifier, and check it is unique in each source", "acc"),
      ("2 Align schema", "Rename columns so both sources use the same names and types", "grn"),
      ("3 Resolve conflicts", "Where sources disagree, decide which one wins and why", "amb"),
      ("4 Re-audit", "Check the merged table for duplicates, gaps and new conflicts", "red")],
      text="Data integration has four steps. Match a key: find a shared identifier and check it is unique in each source. Align the schema: rename columns so both sources use the same names and types. Resolve conflicts: where sources disagree, decide which one wins and why. And re-audit the merged table for duplicates, gaps and new conflicts."),
 dict(kind="bullets", tag="Data integration", title="Merge on the key, then count the conflicts", items=[
      "An outer merge with an indicator column shows which rows are in A only, B only, or both.", "Example: 47,895 in A only, 1,000 in both, 0 in B only.",
      "Compare matched rows field by field: 300 borough conflicts, 300 room type conflicts, 0 price conflicts.", "All conflicts were case only, so keep source A's spelling. Result: 48,895 rows, no duplicates."],
      text="After aligning the schema, merge on the key with an outer join and an indicator column, which shows whether each row is in A only, B only, or both. In our example forty seven thousand eight hundred ninety five rows are in A only, one thousand are in both, and none are in B only. Then compare the matched rows field by field: three hundred borough conflicts, three hundred room type conflicts, and zero price conflicts. All were case differences only, so we keep source A's spelling. The result is forty eight thousand eight hundred ninety five rows with no duplicates."),
 dict(kind="cards", tag="Duplicate detection", title="Three kinds of duplicates", chapter="Duplicates", cards=[
      ("Exact", "Every column identical. 700 rows in the lab.", "acc"),
      ("Same key", "Same id, other fields differ. 1,000 rows: the 700 copies plus 300 lowercase rows.", "amb"),
      ("Near-duplicates", "Almost the same after cleaning text: same host, similar name. 481 candidates to review.", "red")],
      text="There are three kinds of duplicates. Exact duplicates have every column identical: seven hundred rows in the lab. Same-key duplicates share an I D but other fields differ: one thousand rows, the seven hundred copies plus three hundred lowercase rows. And near-duplicates are almost the same after cleaning the text, such as the same host with a similar name: four hundred eighty one candidates. Exact duplicates can be dropped automatically; near-duplicates should be reviewed by a person."),
 dict(kind="bullets", tag="Inconsistent encoding", title="Standardize, then re-audit", chapter="Encoding and re-audit", items=[
      "Strip whitespace, fix the case, collapse repeated spaces.", "For messy codes, use a mapping: BK, Bklyn and brooklyn all become Brooklyn.",
      "Standardizing can create new duplicates: after title-casing, 300 lowercase rows became exact copies.", "Order matters: re-run the audit after every fix."],
      callout="Brooklyn is not equal to brooklyn, until you standardize it.",
      text="To fix inconsistent encoding, strip whitespace, fix the case, and collapse repeated spaces. For messy codes, use a mapping, so that B K, Bklyn and brooklyn all become Brooklyn. But standardising can create new duplicates: after title-casing, the three hundred lowercase rows became exact copies of other rows, which drop duplicates had not been able to see before. Order matters, so re-run the audit after every fix."),
 dict(kind="table", tag="Validation rules", title="One reusable rule table", chapter="Validation rules", cols=["Rule", "Type"], widths=[700, 460], rows=[
      ["price at least 0", "Range"], ["availability between 0 and 365", "Range"], ["price is an integer", "Type"],
      ["id is unique", "Uniqueness"], ["no duplicate rows or columns", "Uniqueness"], ["room type and borough in allowed sets", "Set"]],
      note="Write the rules once, then re-run them on every new load.",
      text="Collect your checks into one reusable rule table. Range rules like price at least zero and availability between zero and three sixty five. Type rules like price being an integer. Uniqueness rules like unique I Ds and no duplicate rows or columns. And set rules like room type and borough being in the allowed sets. Write the rules once, and re-run them on every new load. In the lab, all twelve rules pass after cleaning."),
 dict(kind="cards", tag="Workflow", title="The quality workflow", cards=[
      ("Audit", "Shape, types, missing, duplicates", "acc"), ("Diagnose", "Accuracy, completeness, consistency, validity", "grn"),
      ("Fix", "Integrate, deduplicate, standardize", "amb"), ("Validate", "Re-run rules, re-audit, document", "red")],
      text="Putting it together, the quality workflow has four stages. Audit: shape, types, missing values and duplicates. Diagnose: test accuracy, completeness, consistency and validity. Fix: integrate sources, deduplicate and standardise. And validate: re-run the rules, re-audit, and document what you did, so that someone else can trust and repeat it."),
 dict(kind="bullets", tag="Summary", title="Key takeaways", chapter="Summary", items=[
      "Four dimensions: accuracy, completeness, consistency, validity.", "Validity is checked against rules; accuracy against reality.",
      "Completeness includes why data is missing and which categories never appear.", "Integrate on a key, align schemas, resolve conflicts, then re-audit.",
      "Standardizing can create new duplicates, so re-audit after every fix.", "Document the rules and re-run them on every load."],
      text="Key takeaways. Data quality has four dimensions: accuracy, completeness, consistency and validity. Validity is checked against rules, accuracy against reality. Completeness includes why data is missing and which categories never appear. Integrate sources on a key, align schemas, resolve conflicts, then re-audit. Standardising can create new duplicates, so re-audit after every fix. And document the rules and re-run them on every load. Next, the lab. Thanks for watching."),
]
