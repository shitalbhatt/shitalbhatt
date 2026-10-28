const { Plot, ptext, arrowPx, rectPx, svg, build } = require("./lib");

const pal = { ink: "1B2430", mute: "5B6472", blue: "1F5FBF", accent: "E08A00", accentLight: "FCA311", red: "C0392B", green: "2E8B57", tint: "E8EEF9", card: "F3F6FB", primary: "14213D" };
const theme = {
  name: "Control Systems", headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: pal.ink, lt1: "FFFFFF", dk2: pal.primary, lt2: pal.card, accent1: pal.blue, accent2: pal.accent, accent3: pal.green, accent4: pal.red, accent5: pal.mute, accent6: pal.accentLight, hlink: pal.blue, folHlink: pal.mute },
};
const W = 910, H = 620;
const resp = (z, wn) => t => {
  if (z === 0) return 1 - Math.cos(wn * t);
  if (z < 1) { const wd = wn * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * wn * t) / Math.sqrt(1 - z * z) * Math.sin(wd * t + Math.acos(z)); }
  if (z === 1) return 1 - (1 + wn * t) * Math.exp(-wn * t);
  const r = Math.sqrt(z * z - 1), p1 = wn * (z - r), p2 = wn * (z + r);
  return 1 - (p2 * Math.exp(-p1 * t) - p1 * Math.exp(-p2 * t)) / (p2 - p1);
};
const Mp = z => Math.exp(-Math.PI * z / Math.sqrt(1 - z * z));
const BOX = [90, 50, 880, 540];
function stepAxes(p, box, tmax, ymax, ticks) {
  const P = new Plot(p, box, [0, tmax, 0, ymax], pal);
  P.axes({ xl: "t (s)", yl: "c(t)" });
  P.line(0, 1, tmax, 1, { c: pal.mute, dash: "10 8", w: 2 });
  P.ytick(1, "1"); (ticks || []).forEach(t => P.xtick(t, String(t)));
  return P;
}
const legend = (p, x, y, items, size = 24) => items.forEach(([c, s], i) => { p.push(`<rect x="${x}" y="${y + i * (size + 10) - size + 6}" width="26" height="8" fill="#${c}"/>`); ptext(p, x + 38, y + i * (size + 10), s, { size }, pal); });
const cross = (p, cx, cy, c = pal.red, r = 11) => p.push(`<line x1="${cx - r}" y1="${cy - r}" x2="${cx + r}" y2="${cy + r}" stroke="#${c}" stroke-width="5"/><line x1="${cx - r}" y1="${cy + r}" x2="${cx + r}" y2="${cy - r}" stroke="#${c}" stroke-width="5"/>`);

// ---------- figures ----------
const figTitle = svg(W, H, pal, (p) => {
  const P = new Plot(p, [40, 90, 870, 520], [0, 8, 0, 1.6], { ...pal, ink: "FFFFFF" });
  P.axes({ c: "8FA0BF" });
  P.line(0, 1, 8, 1, { c: "8FA0BF", dash: "10 8", w: 2 });
  P.curve(t => 1 + Math.exp(-0.6 * t) / 0.954, 0, 8, { c: "5B6F96", dash: "8 8", w: 3 });
  P.curve(resp(0.3, 2), 0, 8, { c: pal.accentLight, w: 7 });
}, { transparent: true });

const figLO = svg(W, H, pal, (p) => {
  [[30, "Pole map"], [325, "Step response"], [620, "Numbers"]].forEach(([x, cap], i) => {
    rectPx(p, x, 130, 260, 300, { fill: "FFFFFF", stroke: "C9D3E3", sw: 3, rx: 20 });
    ptext(p, x + 130, 490, cap, { anchor: "middle", size: 30, bold: true, c: pal.primary }, pal);
    if (i === 0) { const P = new Plot(p, [x + 25, 160, x + 235, 400], [-2, 1, -2, 2], pal); P.axes({ ax: 0, ay: 0 }); P.cross(-0.8, 1.2); P.cross(-0.8, -1.2); }
    if (i === 1) { const P = new Plot(p, [x + 25, 170, x + 235, 400], [0, 7, 0, 1.6], pal); P.axes(); P.line(0, 1, 7, 1, { c: pal.mute, dash: "8 6", w: 2 }); P.curve(resp(0.35, 2), 0, 7, { w: 6 }); }
    if (i === 2) { ptext(p, x + 130, 245, "tr   tp", { anchor: "middle", size: 54, bold: true, c: pal.blue }, pal); ptext(p, x + 130, 350, "Mp   ts", { anchor: "middle", size: 54, bold: true, c: pal.accent }, pal); }
  });
  arrowPx(p, 300, 280, 320, 280, pal.mute, 5); arrowPx(p, 595, 280, 615, 280, pal.mute, 5);
});

const figRecap = svg(W, H, pal, (p) => {
  const rows = ["Unit step input:  R(s) = 1/s", "Output:  C(s) = G(s)·R(s)", "First order:  c(t) = 1 − e^(−t/τ)"];
  rows.forEach((cap, i) => {
    const y = 18 + i * 200;
    rectPx(p, 20, y, 870, 184, { fill: "FFFFFF", stroke: "C9D3E3", rx: 18 });
    ptext(p, 440, y + 100, cap, { size: 28, bold: true, c: pal.primary }, pal);
    if (i === 0) { const P = new Plot(p, [50, y + 24, 400, y + 150], [-0.5, 3, 0, 1.4], pal); P.axes({ ax: 0, ay: 0 }); P.line(-0.5, 0, 0, 0, { c: pal.blue, w: 6 }); P.line(0, 1, 3, 1, { c: pal.blue, w: 6 }); P.line(0, 0, 0, 1, { c: pal.blue, w: 6 }); }
    if (i === 1) {
      ptext(p, 50, y + 105, "R(s)", { size: 26, bold: true }, pal); arrowPx(p, 120, y + 92, 170, y + 92, pal.ink, 4);
      rectPx(p, 172, y + 56, 120, 72, { fill: pal.tint, stroke: pal.blue, sw: 4, rx: 10 }); ptext(p, 232, y + 102, "G(s)", { anchor: "middle", size: 30, bold: true, c: pal.blue }, pal);
      arrowPx(p, 292, y + 92, 340, y + 92, pal.ink, 4); ptext(p, 345, y + 105, "C(s)", { size: 26, bold: true }, pal);
    }
    if (i === 2) { const P = new Plot(p, [50, y + 24, 400, y + 150], [0, 5, 0, 1.2], pal); P.axes(); P.line(0, 1, 5, 1, { c: pal.mute, dash: "8 6", w: 2 }); P.curve(t => 1 - Math.exp(-t), 0, 5, { w: 6 }); P.dot(1, 0.632, { r: 7 }); P.text(1.1, 0.5, "63.2 % at t = τ", { size: 20, dx: 6, dy: 26, c: pal.accent }); }
  });
});

const figMotivation = svg(W, H, pal, (p) => {
  const P = stepAxes(p, BOX, 8, 1.9, [2, 4, 6, 8]);
  P.curve(resp(2, 1.5), 0, 8, { c: pal.red, w: 5 });
  P.curve(resp(0.12, 3), 0, 8, { c: pal.accent, w: 5 });
  P.curve(resp(0.7, 2), 0, 8, { c: pal.green, w: 7 });
  legend(p, 560, 118, [[pal.accent, "Too much overshoot"], [pal.red, "Too slow"], [pal.green, "Just right"]]);
});

const figBlock = svg(W, H, pal, (p) => {
  const y = 270;
  ptext(p, 30, y + 10, "R(s)", { size: 32, bold: true }, pal); arrowPx(p, 108, y, 190, y, pal.ink, 4);
  p.push(`<circle cx="225" cy="${y}" r="34" fill="#FFFFFF" stroke="#${pal.ink}" stroke-width="4"/>`);
  ptext(p, 160, y - 22, "+", { size: 34, bold: true }, pal); ptext(p, 238, y + 62, "−", { size: 40, bold: true }, pal);
  arrowPx(p, 259, y, 330, y, pal.ink, 4);
  rectPx(p, 330, 185, 320, 170, { fill: pal.tint, stroke: pal.blue, sw: 5, rx: 14 });
  ptext(p, 490, 255, "ωn²", { anchor: "middle", size: 36, bold: true, c: pal.blue }, pal);
  p.push(`<line x1="380" y1="272" x2="600" y2="272" stroke="#${pal.blue}" stroke-width="4"/>`);
  ptext(p, 490, 322, "s(s + 2ζωn)", { anchor: "middle", size: 36, bold: true, c: pal.blue }, pal);
  ptext(p, 490, 165, "G(s)", { anchor: "middle", size: 30, c: pal.mute }, pal);
  arrowPx(p, 650, y, 800, y, pal.ink, 4); ptext(p, 812, y + 11, "C(s)", { size: 32, bold: true }, pal);
  p.push(`<circle cx="730" cy="${y}" r="9" fill="#${pal.ink}"/>`);
  p.push(`<polyline points="730,${y} 730,470 225,470" fill="none" stroke="#${pal.ink}" stroke-width="4"/>`);
  arrowPx(p, 225, 470, 225, y + 36, pal.ink, 4);
  ptext(p, 480, 520, "unity feedback", { anchor: "middle", size: 28, italic: true, c: pal.mute }, pal);
});

const figPoles = svg(W, H, pal, (p) => {
  const panels = [["ζ = 0   undamped", [[0, 1.4], [0, -1.4]]], ["0 < ζ < 1   underdamped", [[-1, 1.4], [-1, -1.4]]], ["ζ = 1   critically damped", [[-1, 0]]], ["ζ > 1   overdamped", [[-0.5, 0], [-2, 0]]]];
  panels.forEach(([cap, poles], i) => {
    const x = 18 + (i % 2) * 448, y = 14 + Math.floor(i / 2) * 302;
    rectPx(p, x, y, 436, 290, { fill: "FFFFFF", stroke: "C9D3E3", rx: 16 });
    ptext(p, x + 18, y + 36, cap, { size: 26, bold: true, c: pal.primary }, pal);
    const P = new Plot(p, [x + 40, y + 58, x + 410, y + 268], [-3, 1, -2, 2], pal);
    P.axes({ ax: 0, ay: 0 });
    ptext(p, x + 408, y + 188, "σ", { anchor: "end", size: 22, c: pal.mute }, pal); ptext(p, P.X(0) + 8, y + 76, "jω", { size: 22, c: pal.mute }, pal);
    poles.forEach(([a, b]) => P.cross(a, b));
    if (i === 2) ptext(p, P.X(-1), P.Y(0) - 20, "×2", { anchor: "middle", size: 22, c: pal.red }, pal);
  });
});

const zU = 0.3, wU = 2, wdU = wU * Math.sqrt(1 - zU * zU), rU = resp(zU, wU);
const figUnder = svg(W, H, pal, (p) => {
  const P = stepAxes(p, BOX, 8, 1.7, [2, 4, 6, 8]);
  const env = s => t => 1 + s * Math.exp(-zU * wU * t) / Math.sqrt(1 - zU * zU);
  P.curve(env(1), 0, 8, { c: pal.accent, dash: "12 8", w: 3 }); P.curve(env(-1), 0, 8, { c: pal.accent, dash: "12 8", w: 3 });
  P.curve(rU, 0, 8, { w: 6 });
  const t1 = Math.PI / wdU, t2 = 3 * Math.PI / wdU;
  P.line(t1, 0, t1, rU(t1), { c: pal.mute, dash: "4 6", w: 2 }); P.line(t2, 0, t2, rU(t2), { c: pal.mute, dash: "4 6", w: 2 });
  P.arrow(t1, 0.25, t2, 0.25, { c: pal.red, both: true, w: 4 }); P.text((t1 + t2) / 2, 0.25, "Td = 2π/ωd", { anchor: "middle", dy: -14, size: 26, c: pal.red });
  legend(p, 600, 100, [[pal.blue, "c(t)"], [pal.accent, "envelope"]]);
});

const figCases = svg(W, H, pal, (p) => {
  const P = stepAxes(p, [90, 110, 880, 540], 8, 2.1, [2, 4, 6, 8]);
  [[0, pal.red], [0.5, pal.blue], [1, pal.green], [2, pal.accent]].forEach(([z, c]) => P.curve(resp(z, 2), 0, 8, { c, w: 5 }));
  [[pal.red, "ζ = 0"], [pal.blue, "ζ = 0.5"], [pal.green, "ζ = 1"], [pal.accent, "ζ = 2"]].forEach(([col, s], i) => { p.push(`<rect x="${90 + i * 200}" y="52" width="28" height="9" fill="#${col}"/>`); ptext(p, 128 + i * 200, 64, s, { size: 22 }, pal); });
});

const z9 = 0.4, w9 = 2, wd9 = w9 * Math.sqrt(1 - z9 * z9), tr9 = (Math.PI - Math.acos(z9)) / wd9, tp9 = Math.PI / wd9, r9 = resp(z9, w9);
const figTrTp = svg(W, H, pal, (p) => {
  const P = stepAxes(p, BOX, 6.5, 1.5, [2, 4, 6]);
  P.curve(r9, 0, 6.5, { w: 6 });
  P.line(tr9, 0, tr9, 1, { c: pal.green, dash: "6 6", w: 3 }); P.line(tp9, 0, tp9, r9(tp9), { c: pal.red, dash: "6 6", w: 3 });
  P.dot(tr9, 1, { c: pal.green }); P.dot(tp9, r9(tp9), { c: pal.red });
  P.text(tr9, 0.14, "tr", { anchor: "end", dx: -8, size: 28, c: pal.green, bold: true }); P.text(tp9, 0.14, "tp", { anchor: "start", dx: 8, size: 28, c: pal.red, bold: true });
  P.line(0, r9(tp9), tp9, r9(tp9), { c: pal.red, dash: "6 6", w: 2 }); P.text(0.05, r9(tp9), "1 + Mp", { dy: -10, dx: 8, size: 24, c: pal.red });
  P.text(3.2, 0.5, "tp = half a\ndamped cycle", { size: 24, c: pal.mute });
});

const figMp = svg(W, H, pal, (p) => {
  ptext(p, 250, 40, "Step response, ζ = 0.5", { anchor: "middle", size: 26, bold: true, c: pal.primary }, pal);
  const P = new Plot(p, [60, 70, 470, 520], [0, 6, 0, 1.5], pal); P.axes({ xl: "t" }); P.line(0, 1, 6, 1, { c: pal.mute, dash: "8 6", w: 2 });
  const r = resp(0.5, 2), tp = Math.PI / (2 * Math.sqrt(0.75)); P.curve(r, 0, 6, { w: 6 });
  P.line(tp, 1, tp + 1.3, 1, { c: pal.red, w: 2 }); P.line(tp, r(tp), tp + 1.3, r(tp), { c: pal.red, w: 2 });
  P.arrow(tp + 1.15, 1, tp + 1.15, r(tp), { c: pal.red, both: true, w: 4 }); P.text(tp + 1.2, 1.4, "Mp", { dx: 8, size: 28, bold: true, c: pal.red, dy: 0 });
  ptext(p, 690, 40, "%Mp against ζ", { anchor: "middle", size: 26, bold: true, c: pal.primary }, pal);
  const Q = new Plot(p, [520, 70, 860, 520], [0, 1, 0, 100], pal); Q.axes({ xl: "ζ" });
  [0.5, 1].forEach(z => Q.xtick(z, String(z))); [50, 100].forEach(y => Q.ytick(y, String(y)));
  Q.curve(z => 100 * Mp(z), 0.02, 0.999, { c: pal.accent, w: 6 }); Q.dot(0.5, 100 * Mp(0.5), { c: pal.red }); Q.text(0.5, 100 * Mp(0.5), "16.3 %", { dx: 14, dy: -12, size: 24, c: pal.red });
});

const z11 = 0.5, w11 = 2;
const figTs = svg(W, H, pal, (p) => {
  const P = stepAxes(p, BOX, 7, 1.5, [2, 4, 6]);
  P.poly([[0, 0.98], [7, 0.98], [7, 1.02], [0, 1.02]], { fill: pal.accentLight, op: 0.9 });
  const e = s => t => 1 + s * Math.exp(-z11 * w11 * t) / Math.sqrt(1 - z11 * z11);
  P.curve(e(1), 0, 7, { c: pal.accent, dash: "12 8", w: 3 }); P.curve(e(-1), 0, 7, { c: pal.accent, dash: "12 8", w: 3 });
  P.curve(resp(z11, w11), 0, 7, { w: 6 });
  P.line(4, 0, 4, 1, { c: pal.red, dash: "6 6", w: 3 }); P.dot(4, 1, { c: pal.red }); P.text(4, 0.14, "ts", { dx: 10, size: 30, bold: true, c: pal.red });
  P.text(4.6, 1.38, "±2 % band", { size: 24, c: pal.accent, bold: true });
  P.text(4.6, 1.26, "e^(−ζωn·ts) ≈ 0.02", { size: 22, c: pal.mute });
});

const figSplane = svg(W, H, pal, (p) => {
  const P = new Plot(p, [60, 25, 535, 595], [-4, 1, -3, 3], pal), u = 95, th = Math.atan2(2.4, 1.8);
  P.poly([[-1.2, -2.078], [-1.2, 2.078], [-1.732, 3], [-4, 3], [-4, -3], [-1.732, -3]], { fill: "BFE3CF", op: 0.55 });
  P.axes({ ax: 0, ay: 0 });
  p.push(`<path d="M ${P.X(0)} ${P.Y(0) - 3 * u} A ${3 * u} ${3 * u} 0 0 0 ${P.X(0)} ${P.Y(0) + 3 * u}" fill="none" stroke="#${pal.mute}" stroke-width="3" stroke-dasharray="10 8"/>`);
  P.line(0, 0, -1.8, 2.4, { c: pal.accent, w: 5 }); P.line(-1.8, 2.4, -1.8, 0, { c: pal.mute, dash: "6 6", w: 3 }); P.line(-1.8, 2.4, 0, 2.4, { c: pal.mute, dash: "6 6", w: 3 });
  P.cross(-1.8, 2.4); P.cross(-1.8, -2.4);
  p.push(`<path d="M ${P.X(-0.7)} ${P.Y(0)} A ${0.7 * u} ${0.7 * u} 0 0 1 ${P.X(0) - 0.7 * u * Math.cos(th)} ${P.Y(0) - 0.7 * u * Math.sin(th)}" fill="none" stroke="#${pal.red}" stroke-width="4"/>`);
  P.text(-0.95, 0.35, "θ", { size: 28, c: pal.red, bold: true });
  P.text(-0.9, 1.35, "ωn", { size: 28, c: pal.accent, bold: true, dx: 16 });
  P.text(-1.8, 0, "σ", { size: 26, dx: -6, dy: 30, c: pal.ink, anchor: "middle" }); P.text(0, 2.4, "ωd", { size: 26, dx: 12, dy: 8, c: pal.ink });
  ptext(p, 570, 120, "ωn = √(σ² + ωd²)", { size: 25, bold: true, c: pal.primary }, pal);
  ptext(p, 570, 175, "ζ = σ/ωn = cos θ", { size: 25, bold: true, c: pal.primary }, pal);
  ptext(p, 570, 250, "σ = ζωn  →  ts", { size: 25, c: pal.ink }, pal);
  ptext(p, 570, 295, "ωd  →  tp", { size: 25, c: pal.ink }, pal);
  p.push(`<rect x="570" y="360" width="30" height="30" fill="#BFE3CF"/>`); ptext(p, 612, 384, "fast ts and", { size: 23 }, pal); ptext(p, 612, 414, "small Mp", { size: 23 }, pal);
});

const figTrend = svg(W, H, pal, (p) => {
  const mk = (box, title, curves, labels, lx) => {
    ptext(p, (box[0] + box[2]) / 2, 40, title, { anchor: "middle", size: 26, bold: true, c: pal.primary }, pal);
    const P = new Plot(p, box, [0, 8, 0, 1.5], pal); P.axes({ xl: "t" }); P.line(0, 1, 8, 1, { c: pal.mute, dash: "8 6", w: 2 });
    curves.forEach(([f, c]) => P.curve(f, 0, 8, { c, w: 5 }));
    labels.forEach(([s, c], i) => { p.push(`<rect x="${lx + i * 130}" y="565" width="20" height="8" fill="#${c}"/>`); ptext(p, lx + 26 + i * 130, 576, s, { size: 22 }, pal); });
  };
  mk([55, 70, 440, 520], "ζ varies (ωn = 2)", [[resp(0.3, 2), pal.red], [resp(0.6, 2), pal.blue], [resp(1, 2), pal.green]], [["ζ=0.3", pal.red], ["ζ=0.6", pal.blue], ["ζ=1", pal.green]], 60);
  mk([505, 70, 880, 520], "ωn varies (ζ = 0.5)", [[resp(0.5, 1), pal.red], [resp(0.5, 2), pal.blue], [resp(0.5, 4), pal.green]], [["ωn=1", pal.red], ["ωn=2", pal.blue], ["ωn=4", pal.green]], 510);
});

const figSS = svg(W, H, pal, (p) => {
  const z = 0.6, wn = 1.2, wd = wn * 0.8, ph = Math.acos(z);
  const P = new Plot(p, [90, 40, 880, 250], [0, 8, 0, 1.4], pal); P.axes({ yl: "c(t)" }); P.line(0, 1, 8, 1, { c: pal.mute, dash: "10 8", w: 3 }); P.curve(resp(z, wn), 0, 8, { w: 6 });
  P.text(4.2, 0.3, "Unit step: ess = 0", { size: 26, bold: true, c: pal.green });
  const Q = new Plot(p, [90, 330, 880, 560], [0, 8, 0, 8], pal); Q.axes({ xl: "t (s)", yl: "c(t)" });
  Q.line(0, 0, 8, 8, { c: pal.mute, dash: "10 8", w: 3 });
  Q.curve(t => t - 2 * z / wn + Math.exp(-z * wn * t) / (wn * 0.8) * Math.sin(wd * t + 2 * ph), 0, 8, { w: 6 });
  Q.arrow(6.5, 5.5, 6.5, 6.5, { c: pal.red, both: true, w: 4 }); Q.text(6.35, 7.4, "ess = 2ζ/ωn", { anchor: "end", size: 24, c: pal.red, bold: true });
  legend(p, 130, 395, [[pal.mute, "input"], [pal.blue, "output"]], 22);
});

const z15 = 0.6, w15 = 5, r15 = resp(z15, w15);
const figEx1 = svg(800, H, pal, (p) => {
  const P = new Plot(p, [90, 50, 770, 540], [0, 2.5, 0, 1.3], pal); P.axes({ xl: "t (s)", yl: "c(t)" });
  P.line(0, 1, 2.5, 1, { c: pal.mute, dash: "10 8", w: 2 }); P.ytick(1, "1"); [0.5, 1, 1.5, 2].forEach(t => P.xtick(t, String(t)));
  P.poly([[0, 0.98], [2.5, 0.98], [2.5, 1.02], [0, 1.02]], { fill: pal.accentLight, op: 0.9 });
  P.curve(r15, 0, 2.5, { w: 6 });
  [[0.554, 1, pal.green, "tr"], [0.785, r15(0.785), pal.red, "tp"], [1.33, 1, pal.accent, "ts"]].forEach(([t, y, c, s]) => { P.line(t, 0, t, y, { c, dash: "6 6", w: 3 }); P.dot(t, y, { c }); P.text(t, 0.1, s, { dx: 8, size: 28, bold: true, c }); });
  P.text(0.95, 1.2, "Mp = 9.5 %", { size: 26, bold: true, c: pal.red, dx: 18 });
});

const z16 = 0.5912, wn16 = 1.9475, s16 = z16 * wn16, wd16 = Math.PI / 2;
const figEx2 = svg(800, H, pal, (p) => {
  const u = 110, P = new Plot(p, [60, 35, 500, 585], [-3, 1, -2.5, 2.5], pal);
  P.axes({ ax: 0, ay: 0 });
  p.push(`<path d="M ${P.X(0)} ${P.Y(0) - wn16 * u} A ${wn16 * u} ${wn16 * u} 0 0 0 ${P.X(0)} ${P.Y(0) + wn16 * u}" fill="none" stroke="#${pal.mute}" stroke-width="3" stroke-dasharray="10 8"/>`);
  P.line(0, 0, -s16, wd16, { c: pal.accent, w: 5 }); P.line(-s16, wd16, -s16, 0, { c: pal.mute, dash: "6 6", w: 3 }); P.line(-s16, wd16, 0, wd16, { c: pal.mute, dash: "6 6", w: 3 });
  P.cross(-s16, wd16); P.cross(-s16, -wd16);
  ptext(p, P.X(-s16) - 8, P.Y(0) + 32, "−1.15", { anchor: "middle", size: 22, c: pal.mute }, pal); ptext(p, P.X(0) + 12, P.Y(wd16) - 10, "1.57", { size: 22, c: pal.mute }, pal);
  [["σ = ζωn = 1.15", 150], ["ωd = 1.57", 195], ["ωn = 1.95", 240], ["ζ = 0.59", 285], ["θ = 53.8°", 330]].forEach(([s, y]) => ptext(p, 525, y, s, { size: 24, bold: true, c: pal.primary }, pal));
  P.text(-0.5, 0.45, "θ", { size: 28, c: pal.red, bold: true, dx: -42 });
});

const figSummary = figTrTp;

// ---------- slides ----------
const quiz = [
  { q: "A system with ζ = 0.4 is:", o: "(a) undamped  (b) underdamped  (c) critically damped  (d) overdamped", a: "(b)" },
  { q: "Peak overshoot depends only on:", o: "(a) ωn  (b) ζ  (c) K only  (d) ts", a: "(b)" },
  { q: "ζ = 0.5, ωn = 4 rad/s: ts (2 % band) =", o: "(a) 0.5 s  (b) 1 s  (c) 2 s  (d) 4 s", a: "(c)" },
  { q: "ωn = 10 rad/s, ζ = 0.6: peak time tp =", o: "(a) 0.314 s  (b) 0.393 s  (c) 0.524 s  (d) 0.785 s", a: "(b)" },
  { q: "Peak overshoot for ζ = 0.5 is about:", o: "(a) 5 %  (b) 16.3 %  (c) 25 %  (d) 50 %", a: "(b)" },
];

const slides = [
  { kind: "title", title: "Time Response of Second-Order Systems", fig: figTitle, sub: ["Control Systems (22EEG53)", "Unit 2: Time Domain Analysis of Control Systems", "Topic: Second-order response and time-domain specifications", "Prof. Mitesh Astik"],
    n: "Welcome everyone. Today we study how a second-order system reacts when we apply a step input. This is the most important system in Unit 2, because almost every real system is approximated by it for design. By the end, you will predict overshoot and settling time from just two numbers, ζ and ωn." },
  { kind: "content", t: "Learning Outcomes", fig: figLO, b: ["Write the standard second-order transfer function; locate its poles.", "Classify damping and sketch the unit-step response.", "Calculate tr, tp, Mp, ts from ζ and ωn.", "Find ζ and ωn from given specifications."], f: ["Linked to CO2", "Analyse first- and second-order systems' response to standard test signals."],
    n: "Read the outcomes aloud and tell students that all four are examinable. They map directly to Course Outcome 2 in the syllabus. Point out the picture: the pole location gives the curve, and the curve gives the numbers." },
  { kind: "content", t: "Recap: What You Already Know", fig: figRecap, b: ["Laplace transform of unit step is 1/s.", "Poles are roots of the denominator.", "Partial fractions give the time response.", "First-order step: c(t) = 1 − e^(−t/τ)."], f: ["C(s) = G(s)·R(s)", "C(s) output, G(s) transfer function, R(s) input"],
    n: "Ask who remembers the first-order step response and let two students answer. Remind them that C(s) equals G(s) times R(s) is the whole game. We will use partial fractions, but I give the final results to save time. First order had one pole; second order has two, and that changes everything." },
  { kind: "content", t: "Motivation: Why Overshoot Matters", fig: figMotivation, b: ["A lift must stop at the floor without bouncing.", "A disk-drive head must settle in milliseconds.", "Antenna and robot arm: fast but not shaky.", "Lab link: DC position control (Experiment 8).", "Specs: how fast, how much overshoot, how long to settle."], f: ["Design goal: fast rise, small overshoot, short settling time"],
    n: "A lift that overshoots the floor level is uncomfortable and unsafe. A disk head that rings for too long wastes read time. All of these are second-order position servos. Our job today is to turn words like fast and smooth into numbers, which you will check in Experiment 8 using MATLAB." },
  { kind: "content", t: "Standard Second-Order Model", fig: figBlock, b: ["A servo with unity feedback gives this form.", "Two parameters decide the whole response.", "ωn: how fast the system oscillates.", "ζ: how quickly oscillations die out."], f: ["C(s)/R(s) = ωn² / (s² + 2ζωn·s + ωn²)     G(s) = ωn² / [s(s + 2ζωn)]", "ωn natural frequency (rad/s), ζ damping ratio (no unit)"],
    n: "Here is our standard form. Every second-order problem in the exam is first rewritten into this form. Compare coefficients: the s term gives 2ζωn and the constant gives ωn squared. Remember the open-loop form as well, because a servo gives it directly. Keep this on the board all lecture." },
  { kind: "content", t: "Poles and Damping Cases", fig: figPoles, b: ["ζ = 0: poles on the imaginary axis.", "0 < ζ < 1: complex-conjugate pair.", "ζ = 1: repeated real pole.", "ζ > 1: two distinct real poles."], f: ["s1,2 = −ζωn ± jωd,   ωd = ωn√(1 − ζ²)", "ωd damped natural frequency (rad/s)"],
    n: "The roots of the denominator decide everything. When ζ is zero the poles sit on the imaginary axis and the output never dies out. As ζ increases the poles move into the left half-plane and the oscillation decays. At ζ equal to one they meet on the real axis, and beyond that they split apart and there is no oscillation at all." },
  { kind: "content", t: "Underdamped Step Response", fig: figUnder, b: ["Most useful case for design and exams.", "Response oscillates and settles at 1.", "Envelope decays as e^(−ζωn·t).", "Damped frequency ωd is below ωn."], f: ["c(t) = 1 − [e^(−ζωn·t)/√(1 − ζ²)]·sin(ωd·t + φ)", "φ = cos⁻¹ζ (rad),  ωd = ωn√(1 − ζ²) (rad/s)"],
    n: "This comes from the inverse Laplace transform of C(s) equal to ωn squared over s times the denominator. The sine term gives the oscillation and the exponential term gives the decay. The dashed envelope shows how fast the swings shrink. Remember the structure for the exam; the specification formulas come from this equation." },
  { kind: "content", t: "Other Damping Cases", fig: figCases, b: ["ζ = 0: c(t) = 1 − cos ωn·t, sustained oscillation.", "ζ = 1: c(t) = 1 − (1 + ωn·t)e^(−ωn·t).", "ζ > 1: slow, no overshoot.", "Critical damping: fastest without overshoot."], f: ["Poles for ζ > 1:  s = −ζωn ± ωn√(ζ² − 1)"],
    n: "Compare the four curves on one graph. Undamped never settles, like a frictionless swing. Critical damping reaches the final value fastest without crossing it. Overdamped is safe but slow. In practice we choose slightly underdamped, because a small overshoot buys us speed." },
  { kind: "content", t: "Rise Time and Peak Time", fig: figTrTp, b: ["tr: time to go from 0 to 100 % of final value.", "tp: time to reach the first peak.", "Both depend on ωd; larger ωd is faster."], f: ["tr = (π − φ)/ωd,  φ = cos⁻¹ζ in rad          tp = π/ωd", "tr, tp in s; ωd in rad/s"],
    n: "We get rise time by setting c(t) equal to 1, which gives sine of ωd·tr plus φ equal to zero. For peak time we set dc/dt to zero, and the first solution is ωd·tp equal to π. So the peak is exactly half a damped cycle. Be careful: use ωd, not ωn." },
  { kind: "content", t: "Peak Overshoot", fig: figMp, b: ["Mp: how far the peak rises above the final value.", "Depends only on ζ, not on ωn.", "Smaller ζ gives larger overshoot.", "Typical: ζ 0.5→16.3 %, 0.6→9.5 %, 0.7→4.6 %."], f: ["Mp = e^(−πζ/√(1 − ζ²)),  %Mp = 100·Mp", "ζ = ln(1/Mp) / √(π² + ln²(1/Mp))"],
    n: "Substitute tp into the response and you get this neat formula. Notice ωn has disappeared, so overshoot is fixed by the damping ratio alone. In design questions we are given Mp and must find ζ, so remember the inverse formula as well. For example, ζ of 0.5 gives about 16 per cent overshoot." },
  { kind: "content", t: "Settling Time and Delay Time", fig: figTs, b: ["ts: time after which response stays in a band.", "Band: ±2 % (or ±5 %) of final value.", "Set by the real part of the poles, σ = ζωn.", "td: time to reach 50 % of final value."], f: ["ts ≈ 4/(ζωn) for 2 % band;   ts ≈ 3/(ζωn) for 5 % band", "td ≈ (1 + 0.7ζ)/ωn"],
    n: "The envelope decays as e to the minus ζωn t. We ask when it falls to 2 per cent, and that gives ζωn·ts about 4. The 5 per cent band gives 3. Always say which criterion you use in the exam. Delay time is the time to reach half the final value and is only a rough guide." },
  { kind: "content", t: "Pole Location and Specifications", fig: figSplane, b: ["ωn = distance of the pole from the origin.", "ζ = cos θ, θ measured from negative real axis.", "Real part σ sets settling time.", "Imaginary part ωd sets peak time."], f: ["ωn = √(σ² + ωd²);   ζ = σ/ωn = cos θ"],
    n: "This slide ties everything together. Any pole pair on the s-plane tells you the specifications at a glance. Poles further left settle faster. Poles with a steeper angle from the real axis oscillate more and overshoot more. We shall use exactly this picture again in root locus in Unit 4." },
  { kind: "content", t: "Effect of ζ and ωn", fig: figTrend, b: ["Increase ζ: overshoot falls, peak comes later.", "Increase ωn: all times shrink; overshoot unchanged.", "Typical design choice: 0.4 ≤ ζ ≤ 0.8.", "Trade-off: speed against smoothness."], f: ["ζ changes the shape of the response; ωn changes its speed"],
    n: "Keep this picture in your head. Damping ratio changes the shape of the curve, and natural frequency only stretches it in time. If a designer wants a faster response without more overshoot, raise ωn and keep ζ fixed. In practice that costs more control effort, so there is always a trade-off." },
  { kind: "content", t: "Steady-State Link (Type 1)", fig: figSS, b: ["G(s) = ωn²/[s(s + 2ζωn)] is Type 1.", "Unit step input: ess = 0.", "Unit ramp input: finite error ess = 1/Kv.", "Raising ζ increases the ramp error."], f: ["Kv = lim s→0 s·G(s) = ωn/(2ζ);   ess(ramp) = 2ζ/ωn", "Kv velocity error constant (1/s), ess steady-state error"],
    n: "This slide connects the transient part to the steady-state part of Unit 2. Our servo has one integrator, so it follows a step exactly. For a ramp it follows with a constant lag of 2ζ over ωn. Notice the tension: raising ζ reduces overshoot but increases ramp error. We will meet static error constants in the next lecture." },
  { kind: "ex", t: "Solved Example 1: Find the Specs", fig: figEx1, b: ["Given G(s) = 25/[s(s + 6)], unity feedback, unit step.", "1. T(s) = 25/(s² + 6s + 25), so ωn = 5 rad/s.", "2. 2ζωn = 6, so ζ = 0.6; ωd = 5√0.64 = 4 rad/s.", "3. φ = cos⁻¹0.6 = 0.927 rad; tr = (π − 0.927)/4 = 0.554 s.", "4. tp = π/4 = 0.785 s.", "5. Mp = e^(−π·0.6/0.8) = 0.0948, i.e. 9.5 %.", "6. ts = 4/3 = 1.33 s (2 %); 3/3 = 1.0 s (5 %).", "7. Kv = 25/6; ess(ramp) = 2ζ/ωn = 0.24."], f: ["Answer: ωn = 5, ζ = 0.6, tr = 0.554 s, tp = 0.785 s, Mp = 9.5 %, ts = 1.33 s"],
    n: "Walk through slowly. Step one: close the loop and compare with the standard form. Steps two and three give ωn and ζ directly, and after that every specification is a single formula. Ask the class to compute tp themselves before showing it. Finally, verify with MATLAB in the lab." },
  { kind: "ex", t: "Solved Example 2: Design from Specs", fig: figEx2, b: ["Given G(s) = K/[s(s + a)], unity feedback. Need Mp = 10 %, tp = 2 s. Find K, a, ts.", "1. ζ = ln10/√(π² + ln²10) = 2.303/3.895 = 0.591.", "2. ωd = π/tp = 1.571 rad/s.", "3. ωn = ωd/√(1 − ζ²) = 1.571/0.807 = 1.947 rad/s.", "4. K = ωn² = 3.79.", "5. a = 2ζωn = 2.30.", "6. ts = 4/(ζωn) = 4/1.151 = 3.47 s (2 %)."], f: ["Answer: K = 3.79, a = 2.30, ts = 3.47 s; poles at −1.15 ± j1.57"],
    n: "This is the reverse problem and examiners love it. Overshoot gives the damping ratio. Peak time and ζ together give ωn. Then match the closed-loop denominator s squared plus a·s plus K with the standard form. Notice the poles sit at minus 1.15 plus or minus j1.57, which we can plot. Always check by computing ts." },
  { kind: "mistakes", t: "Common Mistakes and Exam Tips", bad: ["Using ωn instead of ωd in tr and tp.", "Mixing degrees and radians for φ.", "Writing Mp as a fraction but quoting it as %.", "Quoting ts without stating the 2 % or 5 % band.", "Using the overshoot formula outside 0 < ζ < 1."], good: ["Rewrite into standard form first.", "Compare coefficients to get ωn and ζ.", "Check that ζ lies between 0 and 1.", "Set the calculator to radians for φ.", "Show formula, substitution, answer with unit."],
    n: "These are the most common marks lost in the exam. Setting the calculator to radians for φ is a classic one. Also remember that the closed-loop standard form needs the constant term to match ωn squared, so check the gain. Writing units and the formula earns method marks even if the arithmetic slips." },
  { kind: "summary", t: "Summary", fig: figSummary, b: ["Standard form: ωn²/(s² + 2ζωn·s + ωn²).", "ζ decides response type; poles −ζωn ± jωd.", "tp = π/ωd;  tr = (π − φ)/ωd.", "Mp = e^(−πζ/√(1 − ζ²)); depends on ζ only.", "ts ≈ 4/(ζωn) for a 2 % band."], f: ["Pole position gives the specs; the specs give the pole position"],
    n: "Recap in one minute. Reduce to standard form, read ζ and ωn, and then every specification follows from the formulas. Pole position tells you the specification, and the specification tells you the pole position. Next class: static error constants and the generalized error series. Revise the two examples tonight." },
  { kind: "quiz", t: "Quick Quiz", q: quiz,
    n: "Give about one minute per question and ask for a show of hands. Question 4 is the trap: people divide by ωn and choose option (a). Discuss why the wrong options are attractive. Use the quiz as a quick check of understanding before leaving." },
  { kind: "refs", t: "References", refs: [
      ["I. J. Nagrath and M. Gopal, Control Systems Engineering", "5th Ed., New Age International (P) Ltd., 2008 (Unit 2 textbook)"],
      ["Benjamin C. Kuo, Automatic Control Systems", "7th Ed., PHI, 2007 (Units 3–5 textbook)"],
      ["K. Ogata, Modern Control Engineering", "5th Ed., Pearson Education Asia / PHI, 2009 (reference)"],
      ["P. S. Satyanarayana, Concepts of Control Systems", "2nd Ed., Dynaram Publishers, Bangalore, 2001 (reference)"],
      ["Lab: MATLAB / Simulink", "Experiments 1, 3 and 8: step response, time-domain specifications, DC position control"]],
    f: ["Next lecture: static error constants and generalized error series"],
    n: "Point students to the chapters on second-order time response in the Unit 2 textbook. Encourage solving the textbook problems on time-domain specifications. Remind them to use MATLAB to check their answers. Thank the class." },
];

build({ theme, pal, title: "Control Systems — Unit 2: Second-Order Time Response", footer: "Control Systems (22EEG53)  |  Prof. Mitesh Astik", file: "../Control_Systems_Unit2_Second_Order_Time_Response.pptx", slides, boldFirst: true })
  .then(() => console.log("control done")).catch(e => { console.error(e); process.exit(1); });
