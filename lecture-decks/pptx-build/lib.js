// Shared helpers: tiny SVG plotting kit + deck builder used by both lecture decks.
const sharp = require("sharp");
const pptxgen = require("pptxgenjs");
const SKILL = require("fs").readdirSync("/root/.claude/skills/synced").map(d => `/root/.claude/skills/synced/${d}/pptx`).find(p => require("fs").existsSync(p + "/scripts/apply_theme.js"));
const { applyTheme } = require(SKILL + "/scripts/apply_theme.js");

const FONT = "Carlito, Calibri, Arial, sans-serif";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- SVG kit ----------
class Plot {
  constructor(parts, box, win, pal) {
    this.p = parts; [this.l, this.t, this.r, this.b] = box; [this.x0, this.x1, this.y0, this.y1] = win; this.pal = pal;
  }
  X(x) { return this.l + (x - this.x0) / (this.x1 - this.x0) * (this.r - this.l); }
  Y(y) { return this.b - (y - this.y0) / (this.y1 - this.y0) * (this.b - this.t); }
  raw(s) { this.p.push(s); }
  line(x1, y1, x2, y2, o = {}) { // data coords
    this.raw(`<line x1="${this.X(x1)}" y1="${this.Y(y1)}" x2="${this.X(x2)}" y2="${this.Y(y2)}" stroke="#${o.c || this.pal.ink}" stroke-width="${o.w || 3}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ""}/>`);
  }
  arrow(x1, y1, x2, y2, o = {}) { arrowPx(this.p, this.X(x1), this.Y(y1), this.X(x2), this.Y(y2), o.c || this.pal.ink, o.w || 4, o.both); }
  curve(fn, a, b, o = {}) {
    const n = o.n || 240; let d = "";
    for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; d += (i ? "L" : "M") + this.X(x).toFixed(1) + " " + this.Y(fn(x)).toFixed(1); }
    this.raw(`<path d="${d}" fill="none" stroke="#${o.c || this.pal.blue}" stroke-width="${o.w || 5}" stroke-linejoin="round" ${o.dash ? `stroke-dasharray="${o.dash}"` : ""}/>`);
  }
  poly(pts, o = {}) {
    this.raw(`<polygon points="${pts.map(([x, y]) => this.X(x).toFixed(1) + "," + this.Y(y).toFixed(1)).join(" ")}" fill="#${o.fill || this.pal.tint}" fill-opacity="${o.op ?? 0.5}" stroke="${o.stroke ? "#" + o.stroke : "none"}" stroke-width="${o.sw || 2}"/>`);
  }
  text(x, y, s, o = {}) { ptext(this.p, this.X(x) + (o.dx || 0), this.Y(y) + (o.dy || 0), s, o, this.pal); }
  dot(x, y, o = {}) { this.raw(`<circle cx="${this.X(x)}" cy="${this.Y(y)}" r="${o.r || 8}" fill="#${o.c || this.pal.accent}"/>`); }
  cross(x, y, o = {}) { // pole marker
    const cx = this.X(x), cy = this.Y(y), r = o.r || 11, c = o.c || this.pal.red;
    this.raw(`<line x1="${cx - r}" y1="${cy - r}" x2="${cx + r}" y2="${cy + r}" stroke="#${c}" stroke-width="5"/><line x1="${cx - r}" y1="${cy + r}" x2="${cx + r}" y2="${cy - r}" stroke="#${c}" stroke-width="5"/>`);
  }
  // axes crossing at (ax, ay) in data coords; optional axis labels
  axes(o = {}) {
    const ax = o.ax ?? this.x0, ay = o.ay ?? this.y0, c = o.c || "5B6472";
    this.raw(`<line x1="${this.X(this.x0)}" y1="${this.Y(ay)}" x2="${this.X(this.x1)}" y2="${this.Y(ay)}" stroke="#${c}" stroke-width="3"/>`);
    this.raw(`<line x1="${this.X(ax)}" y1="${this.Y(this.y0)}" x2="${this.X(ax)}" y2="${this.Y(this.y1)}" stroke="#${c}" stroke-width="3"/>`);
    if (o.xl) ptext(this.p, this.r, this.Y(ay) - 14, o.xl, { anchor: "end", size: 24, c: this.pal.mute }, this.pal);
    if (o.yl) ptext(this.p, this.X(ax) + 10, this.t - 8, o.yl, { anchor: "start", size: 24, c: this.pal.mute }, this.pal);
  }
  xtick(x, s, o = {}) { const px = this.X(x), py = this.Y(o.ay ?? this.y0); this.raw(`<line x1="${px}" y1="${py - 6}" x2="${px}" y2="${py + 6}" stroke="#5B6472" stroke-width="3"/>`); ptext(this.p, px, py + 32, s, { anchor: "middle", size: 22, c: this.pal.mute }, this.pal); }
  ytick(y, s, o = {}) { const py = this.Y(y), px = this.X(o.ax ?? this.x0); this.raw(`<line x1="${px - 6}" y1="${py}" x2="${px + 6}" y2="${py}" stroke="#5B6472" stroke-width="3"/>`); ptext(this.p, px - 12, py + 8, s, { anchor: "end", size: 22, c: this.pal.mute }, this.pal); }
}
function ptext(parts, x, y, s, o = {}, pal) {
  const lines = String(s).split("\n"), sz = Math.round((o.size || 26) * 1.3);
  lines.forEach((ln, i) => parts.push(`<text x="${x}" y="${y + i * (sz + 4)}" font-family="${FONT}" font-size="${sz}" font-weight="${o.bold ? 700 : 400}" font-style="${o.italic ? "italic" : "normal"}" text-anchor="${o.anchor || "start"}" fill="#${o.c || pal.ink}">${esc(ln)}</text>`));
}
function arrowPx(parts, x1, y1, x2, y2, c, w = 4, both = false) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 16;
  const head = (x, y, ang) => `<polygon points="${x},${y} ${x - h * Math.cos(ang - 0.4)},${y - h * Math.sin(ang - 0.4)} ${x - h * Math.cos(ang + 0.4)},${y - h * Math.sin(ang + 0.4)}" fill="#${c}"/>`;
  const sx = both ? x1 + (h - 3) * Math.cos(a) : x1, sy = both ? y1 + (h - 3) * Math.sin(a) : y1;
  parts.push(`<line x1="${sx}" y1="${sy}" x2="${x2 - (h - 3) * Math.cos(a)}" y2="${y2 - (h - 3) * Math.sin(a)}" stroke="#${c}" stroke-width="${w}"/>`);
  parts.push(head(x2, y2, a)); if (both) parts.push(head(x1, y1, a + Math.PI));
}
function rectPx(parts, x, y, w, h, o = {}) {
  parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 14}" fill="${o.fill ? "#" + o.fill : "none"}" stroke="${o.stroke ? "#" + o.stroke : "none"}" stroke-width="${o.sw || 3}"/>`);
}
function svg(W, H, pal, draw, o = {}) {
  const parts = [];
  if (!o.transparent) parts.push(`<rect width="${W}" height="${H}" rx="22" fill="#${o.bg || pal.card}"/>`);
  draw(parts, W, H);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join("")}</svg>`;
}
async function png(svgStr) { return "image/png;base64," + (await sharp(Buffer.from(svgStr), { density: 144 }).png().toBuffer()).toString("base64"); }

// ---------- deck builder ----------
// cfg: {theme, pal, file, footer, slides:[...]}. slide kinds: title, content, ex, quiz, mistakes, summary, refs
async function build(cfg) {
  const { theme, pal } = cfg;
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Prof. Mitesh Astik"; pres.title = cfg.title;
  pres.theme = { headFontFace: theme.headFontFace, bodyFontFace: theme.bodyFontFace };
  const HEAD = theme.headFontFace, BODY = theme.bodyFontFace;
  pres.defineSlideMaster({
    title: "TITLE_DARK", background: { color: pal.primary },
    objects: [{ text: { text: cfg.footer, options: { x: 0.6, y: 5.2, w: 6, h: 0.25, fontSize: 10, color: "C9D3E3", fontFace: BODY, margin: 0 } } }],
    slideNumber: undefined,
  });
  pres.defineSlideMaster({
    title: "CONTENT", background: { color: "FFFFFF" },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 9, h: 0.8, fontFace: HEAD, fontSize: 28, bold: true, color: pal.primary, valign: "middle", align: "left", margin: 0 }, text: "" } },
      { text: { text: cfg.footer, options: { x: 0.5, y: 5.3, w: 7, h: 0.25, fontSize: 10, color: pal.mute, fontFace: BODY, margin: 0 } } },
    ],
    slideNumber: { x: 9.0, y: 5.3, w: 0.5, h: 0.25, fontSize: 10, color: pal.mute, fontFace: BODY, align: "right" },
  });

  const bullets = (arr, size = 14) => arr.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < arr.length - 1, paraSpaceAfter: 7 } }));
  const strip = (s, lines, y = 4.45, h = 0.72) => {
    s.addShape(pres.ShapeType.roundRect, { x: 0.5, y, w: 9, h, fill: { color: pal.tint }, rectRadius: 0.08, objectName: "Key strip" });
    s.addText(lines.map((t, i) => ({ text: t, options: { breakLine: i < lines.length - 1, bold: i === 0 && cfg.boldFirst !== false } })),
      { x: 0.65, y, w: 8.7, h, fontSize: 14, color: pal.ink, fontFace: BODY, valign: "middle", margin: 0, isTextBox: true, objectName: "Key strip text" });
  };

  for (const sl of cfg.slides) {
    if (sl.kind === "title") {
      const s = pres.addSlide({ masterName: "TITLE_DARK" });
      s.addImage({ data: await png(sl.fig), x: 5.0, y: 0.9, w: 4.6, h: 3.7, objectName: "Title art" });
      s.addText(sl.title, { x: 0.6, y: 0.9, w: 4.4, h: 1.7, fontFace: HEAD, fontSize: 32, bold: true, color: "FFFFFF", valign: "top", margin: 0, isTextBox: true });
      s.addText(sl.sub.map((t, i) => ({ text: t, options: { breakLine: i < sl.sub.length - 1, paraSpaceAfter: 8, bold: i === sl.sub.length - 1, color: i === sl.sub.length - 1 ? pal.accentLight : "E5EAF3" } })),
        { x: 0.6, y: 2.75, w: 4.3, h: 2.1, fontSize: 15, fontFace: BODY, valign: "top", margin: 0, isTextBox: true });
      s.addNotes(sl.n); continue;
    }
    const s = pres.addSlide({ masterName: "CONTENT" });
    s.addText(sl.t, { placeholder: "title" });
    if (sl.kind === "content" || sl.kind === "ex" || sl.kind === "summary") {
      const ex = sl.kind === "ex";
      const tw = ex ? 5.1 : 4.3, fx = ex ? 5.75 : 4.95, fw = ex ? 3.75 : 4.55;
      s.addText(bullets(sl.b), { x: 0.5, y: 1.25, w: tw, h: 3.1, fontSize: 14, color: pal.ink, fontFace: BODY, valign: "top", margin: 0, isTextBox: true, objectName: "Bullets" });
      if (sl.fig) s.addImage({ data: await png(sl.fig), x: fx, y: 1.25, w: fw, h: 3.1, objectName: "Diagram", altText: sl.alt || sl.t });
      if (sl.f) strip(s, sl.f);
    } else if (sl.kind === "mistakes") {
      const col = (x, head, arr, color) => {
        s.addShape(pres.ShapeType.roundRect, { x, y: 1.25, w: 4.4, h: 3.9, fill: { color: pal.card }, rectRadius: 0.1, objectName: head + " card" });
        s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: 1.4, w: 0.45, h: 0.45, fill: { color }, objectName: head + " icon" });
        s.addText(head === "Common mistakes" ? "✕" : "✓", { x: x + 0.2, y: 1.4, w: 0.45, h: 0.45, align: "center", valign: "middle", fontSize: 16, bold: true, color: "FFFFFF", margin: 0, isTextBox: true });
        s.addText(head, { x: x + 0.8, y: 1.4, w: 3.4, h: 0.45, fontFace: HEAD, fontSize: 20, bold: true, color: pal.primary, valign: "middle", margin: 0, isTextBox: true });
        s.addText(bullets(arr), { x: x + 0.25, y: 2.05, w: 3.95, h: 3.0, fontSize: 16, color: pal.ink, fontFace: BODY, valign: "top", margin: 0, isTextBox: true });
      };
      col(0.5, "Common mistakes", sl.bad, pal.red); col(5.1, "Exam tips", sl.good, pal.green);
    } else if (sl.kind === "quiz") {
      sl.q.forEach((q, i) => {
        const y = 1.2 + i * 0.8;
        s.addShape(pres.ShapeType.roundRect, { x: 0.5, y, w: 9, h: 0.72, fill: { color: i % 2 ? "FFFFFF" : pal.card }, line: { color: pal.tint, width: 0.75 }, rectRadius: 0.08, objectName: `Q${i + 1} row` });
        s.addText([{ text: `Q${i + 1}. ${q.q}`, options: { bold: true, breakLine: true } }, { text: q.o, options: { color: pal.mute } }],
          { x: 0.65, y, w: 7.1, h: 0.72, fontSize: 14, fontFace: BODY, color: pal.ink, valign: "middle", margin: 0, isTextBox: true });
        s.addShape(pres.ShapeType.roundRect, { x: 7.95, y: y + 0.14, w: 1.4, h: 0.44, fill: { color: pal.green }, rectRadius: 0.1, objectName: `Q${i + 1} answer` });
        s.addText(`Ans: ${q.a}`, { x: 7.95, y: y + 0.14, w: 1.4, h: 0.44, align: "center", valign: "middle", fontSize: 14, bold: true, color: "FFFFFF", margin: 0, isTextBox: true });
      });
    } else if (sl.kind === "refs") {
      sl.refs.forEach((r, i) => {
        const y = 1.25 + i * 0.66;
        s.addShape(pres.ShapeType.ellipse, { x: 0.5, y: y + 0.06, w: 0.46, h: 0.46, fill: { color: pal.primary }, objectName: `Ref ${i + 1} badge` });
        s.addText(String(i + 1), { x: 0.5, y: y + 0.06, w: 0.46, h: 0.46, align: "center", valign: "middle", fontSize: 14, bold: true, color: "FFFFFF", margin: 0, isTextBox: true });
        s.addText([{ text: r[0], options: { bold: true, breakLine: true } }, { text: r[1], options: { color: pal.mute } }],
          { x: 1.15, y, w: 8.35, h: 0.6, fontSize: 14, fontFace: BODY, color: pal.ink, valign: "middle", margin: 0, isTextBox: true });
      });
      if (sl.f) strip(s, sl.f, 4.75, 0.45);
    }
    s.addNotes(sl.n);
  }
  await pres.writeFile({ fileName: cfg.file });
  await applyTheme(cfg.file, theme);
}
module.exports = { Plot, ptext, arrowPx, rectPx, svg, build, esc };
