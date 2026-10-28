// Shared kit for the full-syllabus decks: palettes, math (roots, Bode), circuit symbols, boilerplate slides.
const { Plot, ptext, arrowPx, rectPx, svg, build } = require("./lib");
const W = 910, H = 620;

const palC = { ink: "1B2430", mute: "5B6472", blue: "1F5FBF", accent: "E08A00", accentLight: "FCA311", red: "C0392B", green: "2E8B57", tint: "E8EEF9", card: "F3F6FB", primary: "14213D" };
const palB = { ink: "1B2A30", mute: "5B6B72", blue: "0E7C86", accent: "E4572E", accentLight: "FF8A5B", red: "C0392B", green: "2E8B57", tint: "DDF0F0", card: "F1F8F8", primary: "0B3C49" };
const themeOf = (name, pal) => ({ name, headFontFace: "Cambria", bodyFontFace: "Calibri", colors: { dk1: pal.ink, lt1: "FFFFFF", dk2: pal.primary, lt2: pal.card, accent1: pal.blue, accent2: pal.accent, accent3: pal.green, accent4: pal.red, accent5: pal.mute, accent6: pal.accentLight, hlink: pal.blue, folHlink: pal.mute } });

// ---------- complex math ----------
const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]], csub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
const polyEval = (c, s) => { let r = [0, 0]; for (const k of c) r = cadd(cmul(r, s), [k, 0]); return r; };
function roots(c) { // Durand–Kerner; c highest power first
  while (c.length > 1 && Math.abs(c[0]) < 1e-12) c = c.slice(1);
  const n = c.length - 1; if (n < 1) return [];
  const a = c.map(x => x / c[0]); let z = []; let base = [0.4, 0.9], cur = [1, 0];
  for (let i = 0; i < n; i++) { z.push(cur); cur = cmul(cur, base); }
  for (let it = 0; it < 300; it++) for (let i = 0; i < n; i++) {
    let den = [1, 0]; for (let j = 0; j < n; j++) if (j !== i) den = cmul(den, csub(z[i], z[j]));
    z[i] = csub(z[i], cdiv(polyEval(a, z[i]), den));
  }
  return z.map(r => [Math.abs(r[0]) < 1e-9 ? 0 : r[0], Math.abs(r[1]) < 1e-9 ? 0 : r[1]]);
}
const padd = (a, b) => { const n = Math.max(a.length, b.length), A = Array(n - a.length).fill(0).concat(a), B = Array(n - b.length).fill(0).concat(b); return A.map((x, i) => x + B[i]); };
const pmul = (a, b) => { const r = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => r[i + j] += x * y)); return r; };
// Root-locus branches for 1 + K·num/den = 0; returns array of branches, each an array of [re, im] points
function locus(num, den, Ks) {
  let prev = null, br = [];
  for (const K of Ks) {
    let r = roots(padd(den, num.map(x => x * K)));
    if (prev) { const used = new Set(), ord = prev.map(p => { let bi = -1, bd = 1e18; r.forEach((q, i) => { if (used.has(i)) return; const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2; if (d < bd) { bd = d; bi = i; } }); used.add(bi); return r[bi]; }); r = ord; }
    else br = r.map(() => []);
    r.forEach((q, i) => br[i].push(q)); prev = r;
  }
  return br;
}
// Frequency response of num/den at w (rad/s): magnitude (dB), phase (deg, unwrapped over the array)
function bodeData(num, den, ws) {
  const mag = [], ph = []; let last = null;
  for (const w of ws) {
    const h = cdiv(polyEval(num, [0, w]), polyEval(den, [0, w]));
    mag.push(20 * Math.log10(Math.hypot(h[0], h[1])));
    let a = Math.atan2(h[1], h[0]) * 180 / Math.PI;
    if (last !== null) while (a - last > 180) a -= 360; if (last !== null) while (a - last < -180) a += 360;
    ph.push(a); last = a;
  }
  return { mag, ph };
}
const logspace = (a, b, n) => Array.from({ length: n }, (_, i) => Math.pow(10, a + (b - a) * i / (n - 1)));

// ---------- circuit symbols (local frame: start at (0,0), run along +x for length L; placed with translate/rotate) ----------
const K = "1B2A30";
const place = (p, x, y, deg, inner) => p.push(`<g transform="translate(${x} ${y}) rotate(${deg})" fill="none" stroke="#${K}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`);
const sym = {
  res: (p, x, y, L, deg = 0) => { const a = (L - 80) / 2; let d = `M0 0 L${a} 0`; const seg = 80 / 6; for (let i = 0; i < 6; i++) d += ` L${a + seg * (i + 0.5)} ${i % 2 ? 16 : -16}`; d += ` L${a + 80} 0 L${L} 0`; place(p, x, y, deg, `<path d="${d}"/>`); },
  cap: (p, x, y, L, deg = 0) => place(p, x, y, deg, `<path d="M0 0 L${L / 2 - 8} 0 M${L / 2 + 8} 0 L${L} 0"/><path d="M${L / 2 - 8} -30 L${L / 2 - 8} 30 M${L / 2 + 8} -30 L${L / 2 + 8} 30"/>`),
  ind: (p, x, y, L, deg = 0) => { const a = (L - 100) / 2; let d = `M0 0 L${a} 0`; for (let i = 0; i < 4; i++) d += ` a12.5 12.5 0 0 1 25 0`; d += ` L${L} 0`; place(p, x, y, deg, `<path d="${d}"/>`); },
  dc: (p, x, y, L, deg = 0) => place(p, x, y, deg, `<path d="M0 0 L${L / 2 - 8} 0 M${L / 2 + 8} 0 L${L} 0"/><path d="M${L / 2 - 8} -32 L${L / 2 - 8} 32" /><path d="M${L / 2 + 8} -16 L${L / 2 + 8} 16" stroke-width="9"/>`),
  ac: (p, x, y, L, deg = 0) => place(p, x, y, deg, `<path d="M0 0 L${L / 2 - 34} 0 M${L / 2 + 34} 0 L${L} 0"/><circle cx="${L / 2}" cy="0" r="34"/><path d="M${L / 2 - 20} 0 q10 -22 20 0 t20 0" stroke-width="4"/>`),
  diode: (p, x, y, L, deg = 0, zener = false) => place(p, x, y, deg, `<path d="M0 0 L${L / 2 - 20} 0 M${L / 2 + 20} 0 L${L} 0"/><path d="M${L / 2 - 20} -26 L${L / 2 - 20} 26 L${L / 2 + 20} 0 Z" fill="#DDF0F0"/><path d="${zener ? `M${L / 2 + 28} -26 L${L / 2 + 20} -26 L${L / 2 + 20} 26 L${L / 2 + 12} 26` : `M${L / 2 + 20} -26 L${L / 2 + 20} 26`}"/>`),
  lamp: (p, x, y, L, deg = 0) => place(p, x, y, deg, `<path d="M0 0 L${L / 2 - 28} 0 M${L / 2 + 28} 0 L${L} 0"/><circle cx="${L / 2}" cy="0" r="28"/><path d="M${L / 2 - 20} -20 L${L / 2 + 20} 20 M${L / 2 - 20} 20 L${L / 2 + 20} -20"/>`),
};
const wire = (p, pts, c = K, w = 5) => p.push(`<polyline points="${pts.map(q => q.join(",")).join(" ")}" fill="none" stroke="#${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);
const node = (p, x, y, r = 8) => p.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#${K}"/>`);
const gnd = (p, x, y) => p.push(`<g stroke="#${K}" stroke-width="5" stroke-linecap="round"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 14}"/><line x1="${x - 26}" y1="${y + 14}" x2="${x + 26}" y2="${y + 14}"/><line x1="${x - 16}" y1="${y + 26}" x2="${x + 16}" y2="${y + 26}"/><line x1="${x - 7}" y1="${y + 38}" x2="${x + 7}" y2="${y + 38}"/></g>`);
const opamp = (p, x, y, s = 1) => { // left-center point (x,y); triangle pointing right; returns {inv:[x,y],non:[x,y],out:[x,y]}
  const w = 170 * s, h = 190 * s;
  p.push(`<path d="M${x} ${y - h / 2} L${x} ${y + h / 2} L${x + w} ${y} Z" fill="#FFFFFF" stroke="#${K}" stroke-width="5" stroke-linejoin="round"/>`);
  ptext(p, x + 16, y - 40 * s + 12, "−", { size: 26, bold: true }, { ink: K });
  ptext(p, x + 16, y + 40 * s + 12, "+", { size: 26, bold: true }, { ink: K });
  return { inv: [x, y - 40 * s], non: [x, y + 40 * s], out: [x + w, y] };
};
const lbl = (p, x, y, s, o = {}) => ptext(p, x, y, s, { size: 24, bold: true, c: o.c || K, anchor: o.anchor || "middle", italic: o.italic }, { ink: K });

// ---------- generic figure helpers ----------
const sv = (pal, draw, o) => svg(W, H, pal, draw, o);
function titleArt(pal, kind) {
  return svg(W, H, pal, p => {
    const P = new Plot(p, [40, 90, 870, 520], [0, 8, -1.3, 1.6], { ...pal, ink: "FFFFFF" });
    if (kind === "bode") { const P2 = new Plot(p, [40, 90, 870, 520], [-1, 3, -60, 40], { ...pal, ink: "FFFFFF" }); P2.axes({ ay: 0, c: "8FA0BF" }); P2.curve(x => 20 - 20 * Math.log10(Math.sqrt(1 + 10 ** (2 * (x - 0.5)))) , -1, 3, { c: pal.accentLight, w: 7 }); return; }
    if (kind === "locus") { P.axes({ ax: 4, ay: 0, c: "8FA0BF" }); [[0, 3], [1, 2.5]].forEach(() => { }); P.curve(x => 1.2 * Math.sqrt(Math.max(0, 1 - ((x - 4) / 3.2) ** 2)) * 1.0, 0.8, 7.2, { c: pal.accentLight, w: 7 }); P.curve(x => -1.2 * Math.sqrt(Math.max(0, 1 - ((x - 4) / 3.2) ** 2)), 0.8, 7.2, { c: pal.accentLight, w: 7 }); return; }
    if (kind === "wave") { P.axes({ ay: 0, c: "8FB3B8" }); P.curve(x => Math.sin(x * 1.6), 0, 8, { c: pal.accentLight, w: 7 }); P.curve(x => 0.6 * Math.sin(x * 1.6 - 1), 0, 8, { c: "7FD1D8", w: 4, dash: "10 8" }); return; }
    if (kind === "circuit") { const wp = [[120, 200], [120, 450], [770, 450], [770, 200], [120, 200]]; p.push(`<polyline points="${wp.map(q => q.join(",")).join(" ")}" fill="none" stroke="#${pal.accentLight}" stroke-width="7"/>`); p.push(`<rect x="380" y="170" width="160" height="60" fill="#${pal.primary}" stroke="#${pal.accentLight}" stroke-width="7"/><circle cx="120" cy="325" r="34" fill="#${pal.primary}" stroke="#${pal.accentLight}" stroke-width="7"/><path d="M730 290 l40 35 l40 -35 z" fill="#${pal.primary}" stroke="#${pal.accentLight}" stroke-width="6" transform="translate(-30 0)"/>`); return; }
    P.axes({ c: "8FA0BF" }); P.line(0, 1, 8, 1, { c: "8FA0BF", dash: "10 8", w: 2 });
    P.curve(t => 1 - Math.exp(-0.3 * 2 * t) / 0.954 * Math.sin(1.9 * t + 1.27), 0, 8, { c: pal.accentLight, w: 7 });
  }, { transparent: true });
}

// ---------- boilerplate slide factories ----------
const BS = (pal, footer, courseShort) => {
  const f = {};
  f.title = (title, unit, topic, art) => ({ kind: "title", title, fig: titleArt(pal, art), sub: [courseShort, unit, "Topic: " + topic, "Prof. Mitesh Astik"], vis: "Full-bleed dark title slide; course, unit and topic left; faint relevant plot or circuit art right.",
    n: `Welcome everyone. Today's topic is ${topic}. It belongs to ${unit}. By the end of this session you will be able to use it in numerical problems. Keep your notebooks ready because we will solve two examples.` });
  f.lo = (los, co, coText, topic) => ({ kind: "content", t: "Learning Outcomes", b: los, f: [`Linked to ${co}`, coText], fig: loFig(pal, los.length), vis: "Numbered outcomes left; right a row of 3 icon cards showing the flow of the lecture; strip names the Course Outcome.",
    n: `Read the outcomes aloud. They map to ${co} of the syllabus. Tell students that these are examinable and that the two solved examples follow the same pattern. Ask them to tick off each outcome at the end of the lecture.` });
  f.mistakes = (bad, good, topic) => ({ kind: "mistakes", t: "Common Mistakes and Exam Tips", bad, good, vis: "Two cards: red cross list of mistakes, green tick list of tips.",
    n: `These are the points where marks are lost most often in ${topic}. Give one quick example for each mistake. Remind students that writing the formula, substitution and the unit earns method marks even if the arithmetic slips. Encourage them to check the answer for reasonableness.` });
  f.summary = (b, fk, fig, next, topic) => ({ kind: "summary", t: "Summary", b, f: fk, fig, vis: "Five summary bullets left; the key diagram of the lecture right; key relation in the strip.",
    n: `Recap in one minute. Say each point and ask the class to recall the formula for it. If they remember these ideas, most numerical problems on ${topic} are within reach. Next lecture: ${next}. Revise the two solved examples tonight.` });
  f.quiz = (q, topic) => ({ kind: "quiz", t: "Quick Quiz", q, vis: "One question per row with four options; green answer chip on the right (reveal on click).",
    n: `Give about one minute per question and take a show of hands. Discuss why the wrong options are tempting, especially the one that uses a wrong formula. Use the quiz as a quick check on ${topic} before leaving.` });
  f.refs = (refs, next, topic) => ({ kind: "refs", t: "References", refs, f: ["Next lecture: " + next], vis: "Numbered reference list from the syllabus; next-lecture strip at the bottom.",
    n: `Point students to the textbooks listed in the syllabus for ${topic}. Ask them to solve at least three textbook problems on this topic before the next class. Thank the class and preview the next lecture.` });
  return f;
};
function loFig(pal, n) {
  return svg(W, H, pal, p => {
    ["Concept", "Formula", "Numerical"].forEach((cap, i) => {
      const x = 30 + i * 290; rectPx(p, x, 160, 250, 260, { fill: "FFFFFF", stroke: "C9D3E3", sw: 3, rx: 22 });
      ptext(p, x + 125, 470, cap, { anchor: "middle", size: 28, bold: true, c: pal.primary }, pal);
      if (i === 0) { p.push(`<circle cx="${x + 125}" cy="290" r="62" fill="none" stroke="#${pal.blue}" stroke-width="7"/><circle cx="${x + 125}" cy="290" r="14" fill="#${pal.accent}"/>`); }
      if (i === 1) ptext(p, x + 125, 315, "f(x)", { anchor: "middle", size: 60, bold: true, c: pal.blue, italic: true }, pal);
      if (i === 2) ptext(p, x + 125, 315, "= ?", { anchor: "middle", size: 66, bold: true, c: pal.accent }, pal);
      if (i < 2) arrowPx(p, x + 252, 290, x + 288, 290, pal.mute, 5);
    });
  });
}

// ---------- block-diagram + response helpers ----------
const blk = (p, x, y, w, h, s, o = {}) => { rectPx(p, x, y, w, h, { fill: o.fill || "E8EEF9", stroke: o.stroke || "1F5FBF", sw: 4, rx: 12 }); const ls = String(s).split("\n"); ls.forEach((t, i) => ptext(p, x + w / 2, y + h / 2 + 9 + (i - (ls.length - 1) / 2) * 34, t, { anchor: "middle", size: o.size || 24, bold: true, c: o.c || "14213D" }, { ink: "14213D" })); };
const sumj = (p, x, y, r = 28, s1 = "+", s2 = "−") => { p.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" stroke="#1B2430" stroke-width="4"/><line x1="${x - r * 0.7}" y1="${y - r * 0.7}" x2="${x + r * 0.7}" y2="${y + r * 0.7}" stroke="#1B2430" stroke-width="3"/><line x1="${x - r * 0.7}" y1="${y + r * 0.7}" x2="${x + r * 0.7}" y2="${y - r * 0.7}" stroke="#1B2430" stroke-width="3"/>`); ptext(p, x - r - 14, y - r * 0.5, s1, { size: 22, bold: true }, { ink: "1B2430" }); ptext(p, x - 8, y + r + 30, s2, { size: 22, bold: true }, { ink: "1B2430" }); };
const resp = (z, wn) => t => {
  if (z === 0) return 1 - Math.cos(wn * t);
  if (z < 1) { const wd = wn * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * wn * t) / Math.sqrt(1 - z * z) * Math.sin(wd * t + Math.acos(z)); }
  if (z === 1) return 1 - (1 + wn * t) * Math.exp(-wn * t);
  const r = Math.sqrt(z * z - 1), p1 = wn * (z - r), p2 = wn * (z + r);
  return 1 - (p2 * Math.exp(-p1 * t) - p1 * Math.exp(-p2 * t)) / (p2 - p1);
};
const arr = (p, x1, y1, x2, y2, c = "1B2430", w = 4) => arrowPx(p, x1, y1, x2, y2, c, w);

// Two-panel Bode figure (magnitude over phase) on a 910x620 canvas; returns {A, Bp} for annotation
function bodeFig(p, pal, num, den, lw, hw, mwin, pwin, o = {}) {
  const ws = logspace(lw, hw, 260), d = bodeData(num, den, ws);
  const A = new Plot(p, [110, 40, 880, 300], [lw, hw, mwin[0], mwin[1]], pal), Bp = new Plot(p, [110, 345, 880, 570], [lw, hw, pwin[0], pwin[1]], pal);
  for (let e = Math.ceil(lw); e <= hw; e++) { A.line(e, mwin[0], e, mwin[1], { c: "E1E6EF", w: 2 }); Bp.line(e, pwin[0], e, pwin[1], { c: "E1E6EF", w: 2 }); }
  A.axes({ ay: mwin[0], yl: "|G| dB" }); Bp.axes({ ay: pwin[0], yl: "∠G (°)" }); ptext(p, 880, 612, "ω (rad/s)", { anchor: "end", size: 22, c: pal.mute }, pal);
  if (mwin[0] < 0 && mwin[1] > 0) A.line(lw, 0, hw, 0, { c: pal.mute, dash: "10 8", w: 2 });
  if (pwin[0] < 0 && pwin[1] > 0) Bp.line(lw, 0, hw, 0, { c: pal.mute, dash: "10 8", w: 2 });
  for (let e = Math.ceil(lw); e <= hw; e++) Bp.xtick(e, String(Math.pow(10, e)));
  (o.mt || []).forEach(v => A.ytick(v, String(v))); (o.pt || []).forEach(v => Bp.ytick(v, String(v)));
  const at = arr => x => arr[Math.max(0, Math.min(ws.length - 1, Math.round((x - lw) / (hw - lw) * (ws.length - 1))))];
  A.curve(at(d.mag), lw, hw, { w: 6, n: 259 }); Bp.curve(at(d.ph), lw, hw, { w: 6, c: pal.accent, n: 259 });
  return { A, Bp, d, ws };
}
const REF = {
  nagrath: ["I. J. Nagrath and M. Gopal, Control Systems Engineering", "5th Ed., New Age International (P) Ltd., 2008 (Units 1, 2 textbook)"],
  kuo: ["Benjamin C. Kuo, Automatic Control Systems", "7th Ed., PHI, 2007 (Units 3, 4, 5 textbook)"],
  ogata: ["K. Ogata, Modern Control Engineering", "5th Ed., Pearson Education Asia / PHI, 2009 (reference)"],
  satya: ["P. S. Satyanarayana, Concepts of Control Systems", "2nd Ed., Dynaram Publishers, Bangalore, 2001 (reference)"],
  gopal: ["M. Gopal, Control Systems Principles and Design", "4th Ed., TMH, 1999 (reference, Units 4, 5)"],
  dazzo: ["J. J. D'Azzo and C. H. Houpis, Feedback Control System Analysis and Synthesis", "4th Ed., McGraw Hill International, 1999 (reference, Unit 5)"],
  hughes: ["Hughes Edward, Electrical Technology", "10th Ed., Pearson Education, 2010 (Units 1, 2 textbook)"],
  boyle: ["Boylestad Robert L. and Nashelsky Louis, Electronic Devices and Circuit Theory", "11th Ed., PHI, 2016 (Units 3, 4, 5 textbook)"],
  cotton: ["H. Cotton, Electrical Technology", "7th Ed., CBS Publishers, 2005 (reference)"],
  bell: ["David A. Bell, Operational Amplifier and Linear ICs", "3rd Ed., Oxford University Press, 2011 (reference, Unit 5)"],
};
function mkDeck(pal, theme, footer, mdMeta) {
  return (file, title, slides) => build({ theme, pal, title, footer, file: file + ".pptx", md: file + ".md", mdMeta, slides })
    .then(() => console.log("built", file)).catch(e => { console.error(file, e); process.exit(1); });
}
module.exports = { bodeFig, blk, sumj, resp, arr, Plot, ptext, arrowPx, rectPx, svg, W, H, palC, palB, themeOf, roots, locus, bodeData, logspace, padd, pmul, cmul, cadd, cdiv, polyEval, sym, wire, node, gnd, opamp, lbl, place, sv, titleArt, BS, REF, mkDeck };
