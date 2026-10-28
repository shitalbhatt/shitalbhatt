const { Plot, ptext, arrowPx, rectPx, svg, build } = require("./lib");

const pal = { ink: "1B2A30", mute: "5B6B72", blue: "0E7C86", accent: "E4572E", accentLight: "FF8A5B", red: "C0392B", green: "2E8B57", tint: "DDF0F0", card: "F1F8F8", primary: "0B3C49" };
const theme = {
  name: "BEEE", headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: pal.ink, lt1: "FFFFFF", dk2: pal.primary, lt2: pal.card, accent1: pal.blue, accent2: pal.accent, accent3: pal.green, accent4: pal.red, accent5: pal.mute, accent6: pal.accentLight, hlink: pal.blue, folHlink: pal.mute },
};
const W = 910, H = 620, BOX = [90, 50, 880, 540], D = Math.PI / 180;
const sin = x => Math.sin(x * D);
function wave(p, box, win, o = {}) {
  const P = new Plot(p, box, win, pal); P.axes({ ay: 0, xl: o.xl ?? "ωt (°)", yl: o.yl });
  (o.ticks || [90, 180, 270, 360]).forEach(t => P.xtick(t, String(t), { ay: win[2] }));
  return P;
}
const legend = (p, x, y, items, size = 24) => items.forEach(([c, s], i) => { p.push(`<rect x="${x}" y="${y + i * (size * 1.3 + 10) - size + 4}" width="26" height="8" fill="#${c}"/>`); ptext(p, x + 38, y + i * (size * 1.3 + 10), s, { size }, pal); });

// ---------- figures ----------
const figTitle = svg(W, H, pal, p => {
  const P = new Plot(p, [40, 90, 870, 520], [0, 720, -1.3, 1.3], { ...pal, ink: "FFFFFF" });
  P.axes({ ay: 0, c: "8FB3B8" }); P.curve(sin, 0, 720, { c: pal.accentLight, w: 7 }); P.curve(x => sin(x - 60) * 0.6, 0, 720, { c: "7FD1D8", w: 4, dash: "10 8" });
}, { transparent: true });

const figLO = svg(W, H, pal, p => {
  const caps = ["Generation", "T, f, Vav, V", "Kf and Kp", "Phasors"];
  caps.forEach((cap, i) => {
    const x = 17 + i * 230;
    rectPx(p, x, 150, 185, 270, { fill: "FFFFFF", stroke: "BBD5D8", sw: 3, rx: 20 });
    ptext(p, x + 92, 480, cap, { anchor: "middle", size: 24, bold: true, c: pal.primary }, pal);
    const cx = x + 92, cy = 285;
    if (i === 0) { rectPx(p, cx - 80, cy - 70, 26, 140, { fill: "E4572E", rx: 4 }); rectPx(p, cx + 54, cy - 70, 26, 140, { fill: pal.blue, rx: 4 }); p.push(`<line x1="${cx - 35}" y1="${cy - 45}" x2="${cx + 35}" y2="${cy + 45}" stroke="#${pal.ink}" stroke-width="7"/><circle cx="${cx - 35}" cy="${cy - 45}" r="9" fill="#${pal.ink}"/><circle cx="${cx + 35}" cy="${cy + 45}" r="9" fill="#${pal.ink}"/>`); }
    if (i === 1) { const P = new Plot(p, [x + 20, cy - 70, x + 165, cy + 70], [0, 360, -1, 1], pal); P.axes({ ay: 0 }); P.curve(sin, 0, 360, { c: pal.blue, w: 6 }); }
    if (i === 2) { p.push(`<path d="M ${cx - 75} ${cy + 50} A 80 80 0 0 1 ${cx + 75} ${cy + 50}" fill="none" stroke="#${pal.mute}" stroke-width="6"/><line x1="${cx}" y1="${cy + 50}" x2="${cx + 40}" y2="${cy - 25}" stroke="#${pal.accent}" stroke-width="7"/><circle cx="${cx}" cy="${cy + 50}" r="9" fill="#${pal.ink}"/>`); ptext(p, cx, cy + 105, "1.11   1.414", { anchor: "middle", size: 20, bold: true, c: pal.blue }, pal); }
    if (i === 3) { p.push(`<circle cx="${cx}" cy="${cy}" r="78" fill="none" stroke="#BBD5D8" stroke-width="4"/>`); arrowPx(p, cx, cy, cx + 60, cy - 50, pal.accent, 7); p.push(`<line x1="${cx - 85}" y1="${cy}" x2="${cx + 85}" y2="${cy}" stroke="#${pal.mute}" stroke-width="3"/>`); }
  });
});

const figRecap = svg(W, H, pal, p => {
  const rows = ["DC: V and I are constant", "Faraday: e = −N·dφ/dt", "Angles: degrees and radians"];
  rows.forEach((cap, i) => {
    const y = 18 + i * 200;
    rectPx(p, 20, y, 870, 184, { fill: "FFFFFF", stroke: "BBD5D8", rx: 18 });
    ptext(p, 440, y + 100, cap, { size: 26, bold: true, c: pal.primary }, pal);
    if (i === 0) {
      p.push(`<line x1="50" y1="${y + 60}" x2="50" y2="${y + 125}" stroke="#${pal.ink}" stroke-width="7"/><line x1="75" y1="${y + 75}" x2="75" y2="${y + 110}" stroke="#${pal.ink}" stroke-width="7"/>`);
      p.push(`<line x1="50" y1="${y + 92}" x2="30" y2="${y + 92}" stroke="#${pal.ink}" stroke-width="3"/>`);
      const P = new Plot(p, [120, y + 30, 410, y + 150], [0, 4, 0, 1.4], pal); P.axes(); P.line(0, 1, 4, 1, { c: pal.blue, w: 6 });
    }
    if (i === 1) {
      rectPx(p, 40, y + 45, 40, 95, { fill: "E4572E", rx: 4 }); rectPx(p, 130, y + 45, 40, 95, { fill: pal.blue, rx: 4 });
      arrowPx(p, 84, y + 70, 126, y + 70, pal.mute, 3); arrowPx(p, 84, y + 115, 126, y + 115, pal.mute, 3);
      p.push(`<rect x="215" y="${y + 55}" width="60" height="75" fill="none" stroke="#${pal.ink}" stroke-width="6" transform="rotate(-15 245 ${y + 92})"/>`);
      ptext(p, 295, y + 100, "EMF", { size: 24, bold: true, c: pal.accent }, pal);
    }
    if (i === 2) {
      const cx = 235, cy = y + 92;
      p.push(`<circle cx="${cx}" cy="${cy}" r="62" fill="none" stroke="#${pal.mute}" stroke-width="4"/><line x1="${cx - 80}" y1="${cy}" x2="${cx + 80}" y2="${cy}" stroke="#${pal.mute}" stroke-width="2"/><line x1="${cx}" y1="${cy - 80}" x2="${cx}" y2="${cy + 80}" stroke="#${pal.mute}" stroke-width="2"/>`);
      ptext(p, cx + 68, cy - 8, "0°", { size: 18 }, pal); ptext(p, cx - 15, cy - 68, "90°", { size: 18 }, pal); ptext(p, cx - 100, cy - 8, "180°", { size: 18 }, pal); ptext(p, cx - 20, cy + 92, "270°", { size: 18 }, pal);
    }
  });
});

const figMot = svg(W, H, pal, p => {
  rectPx(p, 30, 150, 250, 250, { fill: "FFFFFF", stroke: pal.ink, sw: 6, rx: 30 });
  [95, 205].forEach(x => p.push(`<rect x="${x}" y="215" width="20" height="55" rx="6" fill="#${pal.ink}"/>`));
  p.push(`<circle cx="155" cy="335" r="14" fill="#${pal.ink}"/>`);
  ptext(p, 155, 450, "230 V, 50 Hz", { anchor: "middle", size: 24, bold: true, c: pal.primary }, pal);
  const P = new Plot(p, [360, 60, 880, 540], [0, 720, -380, 380], pal); P.axes({ ay: 0, xl: "ωt (°)" });
  [180, 360, 540, 720].forEach(t => P.xtick(t, String(t), { ay: -380 }));
  P.curve(x => 325 * sin(x), 0, 720, { c: pal.blue, w: 6 });
  P.line(0, 325, 720, 325, { c: pal.mute, dash: "8 6", w: 2 }); P.line(0, 230, 720, 230, { c: pal.accent, dash: "10 6", w: 4 });
  P.text(195, 325, "325 V (peak)", { dy: -14, size: 24, c: pal.mute }); P.text(195, 230, "230 V (RMS)", { dy: -14, size: 24, c: pal.accent, bold: true });
});

const figGen = svg(W, H, pal, p => {
  rectPx(p, 20, 140, 90, 320, { fill: pal.accent, rx: 8 }); rectPx(p, 340, 140, 90, 320, { fill: pal.blue, rx: 8 });
  ptext(p, 65, 315, "N", { anchor: "middle", size: 40, bold: true, c: "FFFFFF" }, pal); ptext(p, 385, 315, "S", { anchor: "middle", size: 40, bold: true, c: "FFFFFF" }, pal);
  [200, 300, 400].forEach(y => arrowPx(p, 115, y, 335, y, pal.mute, 3));
  ptext(p, 225, 185, "B", { anchor: "middle", size: 26, bold: true, c: pal.mute }, pal);
  const cx = 225, cy = 300, a = 38 * D, dx = 75 * Math.cos(a), dy = 75 * Math.sin(a);
  p.push(`<line x1="${cx - dx}" y1="${cy + dy}" x2="${cx + dx}" y2="${cy - dy}" stroke="#${pal.ink}" stroke-width="8"/><circle cx="${cx - dx}" cy="${cy + dy}" r="11" fill="#${pal.ink}"/><circle cx="${cx + dx}" cy="${cy - dy}" r="11" fill="#${pal.ink}"/>`);
  p.push(`<path d="M ${cx + 105} ${cy} A 105 105 0 0 0 ${cx + 105 * Math.cos(-50 * D)} ${cy + 105 * Math.sin(-50 * D)}" fill="none" stroke="#${pal.green}" stroke-width="5"/>`);
  ptext(p, cx + 112, cy - 40, "ω", { size: 30, bold: true, c: pal.green }, pal);
  ptext(p, 225, 505, "coil of N turns, area A", { anchor: "middle", size: 22, c: pal.mute }, pal);
  const P = new Plot(p, [490, 90, 890, 520], [0, 360, -1.3, 1.3], pal); P.axes({ ay: 0 });
  [90, 180, 270, 360].forEach(t => P.xtick(t, String(t), { ay: -1.3 })); ptext(p, 890, 580, "ωt (°)", { anchor: "end", size: 22, c: pal.mute }, pal);
  ptext(p, 690, 55, "e = Em sin ωt", { anchor: "middle", size: 26, bold: true, c: pal.primary }, pal);
  P.curve(sin, 0, 360, { c: pal.blue, w: 6 });
  [[0, "e = 0"], [90, "Em"], [180, "e = 0"], [270, "−Em"]].forEach(([t, s]) => { P.dot(t, sin(t), { c: pal.accent }); P.text(t, sin(t), s, { dx: t === 0 ? 14 : (t === 180 ? 8 : 0), dy: t === 270 ? 40 : (t === 90 ? -16 : -14), anchor: t === 90 || t === 270 ? "middle" : "start", size: 22, c: pal.accent, bold: true }); });
});

const figTerms = svg(W, H, pal, p => {
  const P = wave(p, [90, 140, 880, 560], [0, 720, -1.3, 1.3], { ticks: [180, 360, 540, 720] });
  P.curve(sin, 0, 720, { c: pal.blue, w: 6 });
  P.arrow(0, 1.3, 360, 1.3, { c: pal.red, both: true, w: 4 }); P.text(180, 1.3, "T (one cycle)", { anchor: "middle", dy: -14, size: 26, c: pal.red, bold: true });
  ptext(p, 120, 80, "f = 1/T     ω = 2πf", { size: 28, bold: true, c: pal.primary }, pal);
  ptext(p, 600, 80, "50 Hz: T = 20 ms", { size: 26, c: pal.accent, bold: true }, pal);
});

const figPhase = svg(W, H, pal, p => {
  const P = wave(p, BOX, [0, 400, -1.4, 1.4], {});
  P.curve(sin, 0, 400, { c: pal.blue, w: 6 }); P.curve(x => sin(x - 50), 0, 400, { c: pal.accent, w: 6 });
  P.arrow(0, 0.0, 50, 0.0, { c: pal.red, both: true, w: 4 }); P.text(25, 0.0, "φ", { anchor: "middle", dy: -18, size: 30, c: pal.red, bold: true });
  legend(p, 600, 110, [[pal.blue, "v (reference)"], [pal.accent, "i lags v by φ"]]);
});

const figAvg = svg(W, H, pal, p => {
  const P = wave(p, BOX, [0, 360, -1.4, 1.4], { ticks: [90, 180, 270, 360] });
  const pts = []; for (let x = 0; x <= 180; x += 5) pts.push([x, sin(x)]); pts.push([180, 0]);
  P.poly(pts, { fill: pal.blue, op: 0.25 });
  P.curve(sin, 0, 360, { c: pal.blue, w: 6 });
  P.poly([[0, 0], [180, 0], [180, 0.637], [0, 0.637]], { fill: pal.accentLight, op: 0.0, stroke: pal.accent, sw: 4 });
  P.text(190, 0.637, "Vav = 0.637 Vm", { dx: 8, dy: -12, size: 26, bold: true, c: pal.accent }); P.text(100, 1.0, "Vm", { dx: 0, dy: -14, size: 26, c: pal.mute });
  P.text(8, -0.8, "full cycle: Vav = 0", { size: 24, c: pal.mute });
});

const figRms = svg(W, H, pal, p => {
  const A = new Plot(p, [90, 40, 880, 270], [0, 720, -1.3, 1.3], pal); A.axes({ ay: 0 }); A.curve(sin, 0, 720, { c: pal.blue, w: 6 }); A.text(560, 1.15, "v(t)", { size: 26, bold: true, c: pal.blue });
  const B = new Plot(p, [90, 340, 880, 560], [0, 720, 0, 1.3], pal); B.axes({ xl: "ωt (°)" }); [180, 360, 540, 720].forEach(t => B.xtick(t, String(t)));
  B.curve(x => sin(x) ** 2, 0, 720, { c: pal.accent, w: 6 }); B.line(0, 0.5, 720, 0.5, { c: pal.red, dash: "10 8", w: 4 });
  B.text(560, 1.18, "v² (squared)", { size: 26, bold: true, c: pal.accent }); B.text(10, 1.18, "dashed: mean = Vm²/2", { size: 24, c: pal.red, bold: true });
});

const figLevels = svg(W, H, pal, p => {
  const P = wave(p, [90, 50, 880, 540], [0, 450, -1.3, 1.3], {});
  P.curve(sin, 0, 360, { c: pal.blue, w: 6 });
  P.line(0, 1, 450, 1, { c: pal.mute, dash: "8 6", w: 2 }); P.line(0, 0.707, 450, 0.707, { c: pal.accent, dash: "10 6", w: 4 }); P.line(0, 0.637, 450, 0.637, { c: pal.green, dash: "10 6", w: 4 });
  P.text(200, 1.0, "Vm", { dy: -12, size: 26, c: pal.mute, bold: true }); P.text(190, 0.707, "V = 0.707 Vm", { dy: -12, size: 26, c: pal.accent, bold: true }); P.text(190, 0.637, "Vav = 0.637 Vm", { dy: 36, size: 26, c: pal.green, bold: true });
  P.text(345, -0.85, "Kf = 1.11\nKp = 1.414", { size: 26, c: pal.primary, bold: true });
});

const figPhasor = svg(W, H, pal, p => {
  const cx = 230, cy = 310, r = 170, a = 40 * D, tx = cx + r * Math.cos(a), ty = cy - r * Math.sin(a);
  p.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#BBD5D8" stroke-width="4"/><line x1="${cx - r - 15}" y1="${cy}" x2="${cx + r + 15}" y2="${cy}" stroke="#${pal.mute}" stroke-width="3"/><line x1="${cx}" y1="${cy - r - 15}" x2="${cx}" y2="${cy + r + 15}" stroke="#${pal.mute}" stroke-width="3"/>`);
  arrowPx(p, cx, cy, tx, ty, pal.accent, 7);
  p.push(`<path d="M ${cx + 70} ${cy} A 70 70 0 0 0 ${cx + 70 * Math.cos(a)} ${cy - 70 * Math.sin(a)}" fill="none" stroke="#${pal.red}" stroke-width="4"/>`);
  ptext(p, cx + 82, cy - 14, "φ", { size: 28, bold: true, c: pal.red }, pal); ptext(p, tx - 8, ty - 14, "V∠φ", { size: 26, bold: true, c: pal.accent }, pal);
  p.push(`<path d="M ${cx - 118} ${cy - 60} A 130 130 0 0 1 ${cx - 70} ${cy - 112}" fill="none" stroke="#${pal.green}" stroke-width="4"/>`); ptext(p, cx - 150, cy - 112, "ω", { size: 26, bold: true, c: pal.green }, pal);
  const P = new Plot(p, [470, 140, 850, 480], [0, 360, -1, 1], pal); P.axes({ ay: 0, xl: "ωt (°)" }); P.curve(sin, 0, 360, { c: pal.blue, w: 6 });
  P.xtick(180, "180"); P.xtick(360, "360");
  p.push(`<line x1="${tx}" y1="${ty}" x2="${P.X(40)}" y2="${P.Y(sin(40))}" stroke="#${pal.accent}" stroke-width="3" stroke-dasharray="6 6"/>`); P.dot(40, sin(40), { c: pal.accent });
  ptext(p, 680, 100, "projection = v(t)", { anchor: "middle", size: 24, bold: true, c: pal.primary }, pal);
});

const figComplex = svg(W, H, pal, p => {
  const A = new Plot(p, [50, 70, 430, 520], [-0.3, 4, -0.3, 3], pal); A.axes({ ax: 0, ay: 0, xl: "Re", yl: "Im" });
  A.arrow(0, 0, 3.2, 2.2, { c: pal.accent, w: 6 }); A.line(0, 0, 3.2, 0, { c: pal.blue, w: 4, dash: "8 6" }); A.line(3.2, 0, 3.2, 2.2, { c: pal.blue, w: 4, dash: "8 6" });
  A.text(1.6, 0, "a", { dy: 36, anchor: "middle", size: 26, bold: true, c: pal.blue }); A.text(3.2, 1.1, "jb", { dx: 12, size: 26, bold: true, c: pal.blue });
  A.text(1.2, 1.55, "∣V∣", { dx: -62, size: 28, bold: true, c: pal.accent }); A.text(0.7, 0.18, "θ", { size: 26, bold: true, c: pal.red });
  ptext(p, 240, 40, "V = a + jb = ∣V∣∠θ", { anchor: "middle", size: 22, bold: true, c: pal.primary }, pal);
  const B = new Plot(p, [490, 70, 880, 520], [-0.3, 4.2, -0.3, 3], pal); B.axes({ ax: 0, ay: 0, xl: "Re" });
  B.arrow(0, 0, 2.5, 0, { c: pal.blue, w: 6 }); B.arrow(0, 0, 1.25, 2.165, { c: pal.accent, w: 6 }); B.arrow(0, 0, 3.75, 2.165, { c: pal.green, w: 7 });
  B.line(2.5, 0, 3.75, 2.165, { c: pal.mute, dash: "8 6", w: 3 }); B.line(1.25, 2.165, 3.75, 2.165, { c: pal.mute, dash: "8 6", w: 3 });
  B.text(1.25, 0, "V1", { anchor: "middle", dy: 36, size: 26, bold: true, c: pal.blue }); B.text(0.6, 1.2, "V2", { dx: -40, size: 26, bold: true, c: pal.accent }); B.text(2.0, 2.6, "V1 + V2", { size: 26, bold: true, c: pal.green });
  ptext(p, 685, 40, "Adding phasors", { anchor: "middle", size: 22, bold: true, c: pal.primary }, pal);
});

const figEx1 = svg(800, H, pal, p => {
  const P = new Plot(p, [100, 50, 770, 540], [0, 20, -380, 380], pal); P.axes({ ay: 0, xl: "t (ms)", yl: "v (V)" });
  [5, 10, 15, 20].forEach(t => P.xtick(t, String(t), { ay: -380 })); [325, -325].forEach(v => P.ytick(v, String(v)));
  P.curve(t => 325 * Math.sin(2 * Math.PI * t / 20), 0, 20, { c: pal.blue, w: 6 });
  P.line(0, 230, 20, 230, { c: pal.accent, dash: "10 6", w: 4 }); P.line(0, 207, 20, 207, { c: pal.green, dash: "10 6", w: 4 });
  P.text(10.4, 230, "V = 230 V", { dy: -12, size: 24, bold: true, c: pal.accent }); P.text(10.4, 207, "Vav = 207 V", { dy: 34, size: 24, bold: true, c: pal.green });
  P.line(2.5, 0, 2.5, 229.8, { c: pal.red, dash: "5 5", w: 3 }); P.dot(2.5, 229.8, { c: pal.red }); P.text(2.5, -40, "2.5 ms (45°)", { anchor: "middle", dy: 30, size: 22, bold: true, c: pal.red });
});

const figEx2 = svg(800, H, pal, p => {
  const P = new Plot(p, [60, 90, 770, 445], [-10, 150, -10, 70], pal); P.axes({ ax: 0, ay: 0, xl: "Re" });
  P.line(100, 0, 130, 51.96, { c: pal.mute, dash: "8 6", w: 3 }); P.line(30, 51.96, 130, 51.96, { c: pal.mute, dash: "8 6", w: 3 });
  P.arrow(0, 0, 100, 0, { c: pal.blue, w: 6 }); P.arrow(0, 0, 30, 51.96, { c: pal.accent, w: 6 }); P.arrow(0, 0, 130, 51.96, { c: pal.green, w: 8 });
  P.text(50, 0, "V1 = 100∠0°", { anchor: "middle", dy: 38, size: 22, bold: true, c: pal.blue }); P.text(32, 60, "V2 = 60∠60°", { size: 22, bold: true, c: pal.accent });
  P.text(130, 60, "V = 140∠21.8°", { anchor: "end", size: 22, bold: true, c: pal.green }); P.text(10, 3, "21.8°", { dx: 40, dy: -14, size: 16, c: pal.red });
});

const quiz = [
  { q: "Mains with 325 V peak has RMS value:", o: "(a) 207 V  (b) 230 V  (c) 325 V  (d) 460 V", a: "(b)" },
  { q: "Form factor of a sine wave is:", o: "(a) 1.0  (b) 1.11  (c) 1.414  (d) 1.57", a: "(b)" },
  { q: "Period T = 25 ms. Frequency is:", o: "(a) 25 Hz  (b) 40 Hz  (c) 50 Hz  (d) 400 Hz", a: "(b)" },
  { q: "v = 141.4 sin(ωt + 45°) V has RMS phasor:", o: "(a) 141.4∠45°  (b) 100∠45°  (c) 100∠−45°  (d) 70.7∠45°", a: "(b)" },
  { q: "Vm = 100 V; half-cycle average value is:", o: "(a) 31.8 V  (b) 50 V  (c) 63.7 V  (d) 70.7 V", a: "(c)" },
];

const slides = [
  { kind: "title", title: "Sinusoidal AC: Values and Phasors", fig: figTitle, sub: ["Basic Electrical and Electronics Engineering", "Unit 1: Circuit Fundamentals", "Topic: Sinusoidal quantities and phasors", "Prof. Mitesh Astik"],
    n: "Welcome everyone. Today we learn the language of AC: peak, average, RMS and phasors. Every later topic in this course, from transformers to induction motors, uses these ideas. Keep your calculators ready because we will solve two numerical examples." },
  { kind: "content", t: "Learning Outcomes", fig: figLO, b: ["Explain how a rotating coil generates a sinusoidal voltage.", "Calculate period, frequency, average and RMS values.", "Find form factor and peak factor of a sine wave.", "Represent and add sinusoids using phasors."], f: ["Linked to CO1", "Analyse DC and AC electrical circuits to determine circuit parameters."],
    n: "These four outcomes map to Course Outcome 1 in the syllabus. The first is physical understanding, the next two are calculations, and the last is a tool for circuit analysis. The exam always has one numerical on RMS, average, or phasors." },
  { kind: "content", t: "Recap: What You Already Know", fig: figRecap, b: ["DC: v and i are constant in time.", "Ohm's law: V = I·R; power P = V·I.", "Faraday's law: e = −N·dφ/dt.", "Trigonometry: sin, cos, radians and degrees."], f: ["e = −N·dφ/dt", "e induced EMF (V), N turns, φ flux (Wb)"],
    n: "Quick recap. In DC everything is constant. In AC the quantity changes with time, and the simplest and most useful shape is the sine wave. We need Faraday's law to see where that sine comes from, and basic trigonometry to handle the angles. Remind students to switch the calculator to radian mode when needed." },
  { kind: "content", t: "Motivation: What Does “230 V” Mean?", fig: figMot, b: ["Wall socket: 230 V, 50 Hz.", "That 230 V is an RMS value, not peak.", "The actual peak voltage is about 325 V.", "AC is easy to step up and down with transformers."], f: ["Vm = √2 · V = 1.414 × 230 ≈ 325 V"],
    n: "Ask: if the socket says 230 volts, why does the wave reach 325 volts? Because 230 is the equivalent heating value of the wave, not its peak. This is exactly why we need RMS. Also mention that AC wins in power systems because transformers change voltage levels cheaply for long-distance transmission." },
  { kind: "content", t: "Generation of Sinusoidal Voltage", fig: figGen, b: ["A coil of N turns rotates in a uniform field.", "Flux linked: φ = Φm cos ωt.", "EMF is zero when coil sides move along the field.", "EMF is maximum when coil sides cut the field.", "Slip rings and brushes carry the voltage out."], f: ["e = Em sin ωt,   Em = N·B·A·ω", "N turns, B flux density (T), A coil area (m²), ω speed (rad/s)"],
    n: "A coil turning in a magnetic field cuts flux, and by Faraday's law an EMF appears. The flux is Φm cos ωt, so e is minus N dφ/dt, which gives N B A ω sin ωt. At 0 degrees the coil sides move along the field lines and EMF is zero. At 90 degrees they cut the field at right angles and EMF is maximum. The slip rings and brushes bring the voltage out to the load." },
  { kind: "content", t: "Basic Terms: Cycle, Period, Frequency", fig: figTerms, b: ["Cycle: one complete set of positive and negative values.", "Period T: time for one cycle (s).", "Frequency f: cycles per second (Hz).", "Angular frequency ω: radians per second.", "Generator: f = P·Ns/120 (P poles, Ns rpm)."], f: ["f = 1/T;   ω = 2πf", "For 50 Hz: T = 20 ms, ω = 314.16 rad/s"],
    n: "Define each term using the same picture. One complete wave is a cycle, and the time it takes is the period. Frequency is the inverse. Because one cycle is 2π radians, ω is 2π times f. For India, 50 Hz means 20 milliseconds per cycle. A 4-pole machine turning at 1500 rpm gives 4 times 1500 over 120, which is 50 Hz." },
  { kind: "content", t: "Equation of a Sinusoid and Phase", fig: figPhase, b: ["General form: v = Vm sin(ωt + φ).", "φ positive: wave leads the reference.", "φ negative: wave lags the reference.", "0° in phase; 90° quadrature; 180° opposition."], f: ["v = Vm sin(ωt + φ),   i = Im sin(ωt − φ)", "Vm peak (V), φ phase angle (rad or °)"],
    n: "The phase angle tells us how far one wave is shifted relative to another. If the wave reaches its peak earlier, we say it leads. If it reaches later, it lags. This idea comes back strongly when we study R, L and C circuits in the next lecture. Check with students: which wave in the plot is leading?" },
  { kind: "content", t: "Average Value", fig: figAvg, b: ["Average of a full sine cycle is zero.", "So it is defined over a half cycle.", "Equals the height of a rectangle of equal area.", "Used for rectified signals and DC meters."], f: ["Vav = (1/T)∫v dt;   half cycle: Vav = (1/π)∫₀^π Vm sin θ dθ", "Vav = 2Vm/π = 0.637·Vm"],
    n: "The average is the area under the curve divided by the length of the base. For a full sine cycle the positive and negative areas cancel, so the average is zero, which is not very useful. Therefore we take the average over a half cycle. The integral of sin from 0 to π is 2, so Vav equals 2 Vm over π, which is 0.637 Vm." },
  { kind: "content", t: "RMS (Effective) Value", fig: figRms, b: ["RMS: root of the mean of the squares.", "Equals the DC value giving the same heating.", "For a sine, v² has mean Vm²/2.", "Meters and ratings use the RMS value."], f: ["V = √[(1/T)∫v² dt];   sine: V = Vm/√2 = 0.707·Vm", "Identity: sin²θ = (1 − cos 2θ)/2"],
    n: "We square the wave, take the mean, and then take the square root. Squaring gives sine squared, which can be rewritten with the double-angle identity, and the cosine part averages to zero. That leaves Vm squared over 2, so the RMS value is Vm over root 2. The key idea is heat: a 230 V RMS supply heats a resistor exactly like 230 V DC." },
  { kind: "content", t: "Form Factor and Peak Factor", fig: figLevels, b: ["Form factor = RMS value / average value.", "Peak factor = peak value / RMS value.", "They describe the shape of a waveform.", "Sine wave: Kf = 1.11, Kp = 1.414."], f: ["Kf = V/Vav = 1.11;   Kp = Vm/V = √2 = 1.414", "Sine: V = 0.707 Vm, Vav = 0.637 Vm (valid for sine only)"],
    n: "These two numbers describe the shape of the waveform. For a sine, 0.707 divided by 0.637 gives 1.11, and the peak factor is simply 1.414. A rectifier-type AC meter is calibrated using 1.11, so it reads wrong for non-sine waves. We will use form factor again when we study rectifiers in Unit 3." },
  { kind: "content", t: "Phasor Representation", fig: figPhasor, b: ["A phasor is a rotating line for a sinusoid.", "Length = RMS value; angle = phase angle.", "Vertical projection gives the instantaneous value.", "Same-frequency waves keep a fixed angle."], f: ["v = Vm sin(ωt + φ)   ⇄   V = V∠φ", "V RMS magnitude (V), φ phase angle (°)"],
    n: "Phasors turn a time-varying wave into a simple arrow. The length of the arrow is the RMS value and the angle is the phase. As the arrow rotates counter-clockwise at ω, its vertical projection traces the sine wave. Since every wave in a circuit has the same ω, we freeze the picture and compare only magnitude and angle." },
  { kind: "content", t: "Working with Phasors", fig: figComplex, b: ["Rectangular form: V = a + jb.", "Polar form: V = ∣V∣∠θ.", "Add and subtract in rectangular form.", "Multiply and divide in polar form.", "Phasors add only if frequencies are equal."], f: ["∣V∣ = √(a² + b²);   θ = tan⁻¹(b/a)", "a = ∣V∣cos θ;   b = ∣V∣sin θ"],
    n: "Convert between the two forms with Pythagoras and the tangent. Addition is easy in rectangular form; multiplication is easy in polar form. A common error is adding magnitudes directly, which is wrong unless the phasors are in phase. Watch the quadrant when you take the inverse tangent." },
  { kind: "ex", t: "Solved Example 1: Sine Wave Values", fig: figEx1, b: ["Given v = 325 sin(314t) V. Find Vm, V, f, T, Vav and v at 2.5 ms.", "1. Vm = 325 V.", "2. V = Vm/√2 = 325/1.414 ≈ 230 V.", "3. f = ω/2π = 314/6.283 ≈ 50 Hz.", "4. T = 1/f = 20 ms.", "5. Vav = 0.637 × 325 ≈ 207 V (half cycle).", "6. ωt = 314 × 0.0025 = 0.785 rad = 45°.", "7. v = 325 sin 45° ≈ 230 V."], f: ["Answer: Vm = 325 V, V ≈ 230 V, f = 50 Hz, T = 20 ms, Vav ≈ 207 V, v(2.5 ms) ≈ 230 V"],
    n: "This is the mains voltage from our motivation slide. Read the peak and ω straight from the equation, then use the formulas one at a time. Ask students to find f before showing the answer. Notice that at 45 degrees the instantaneous value happens to be about 230 V, equal to the RMS value. This is a nice coincidence to point out." },
  { kind: "ex", t: "Solved Example 2: Phasor Addition", fig: figEx2, b: ["Given v1 = 141.4 sin ωt, v2 = 84.9 sin(ωt + 60°) V. Find v1 + v2.", "1. RMS phasors: V1 = 100∠0°, V2 = 60∠60° V.", "2. V2 = 60 cos 60° + j60 sin 60° = 30 + j51.96.", "3. V = V1 + V2 = 130 + j51.96 V.", "4. ∣V∣ = √(130² + 51.96²) = √19600 = 140 V.", "5. θ = tan⁻¹(51.96/130) = 21.8°.", "6. Vm = 140 × √2 = 198 V."], f: ["Answer: v = 198 sin(ωt + 21.8°) V      (V = 140∠21.8° V RMS)"],
    n: "Always convert to RMS first, because our phasors use RMS lengths. Then convert V2 to rectangular form, add the real and imaginary parts, and convert back to polar. Check with the law of cosines: 100 squared plus 60 squared plus 2 times 100 times 60 times cos 60 degrees equals 19600, so the magnitude is 140 volts. Finally, convert back to peak if the question asks for the time-domain expression." },
  { kind: "mistakes", t: "Common Mistakes and Exam Tips", bad: ["Mixing up peak and RMS values.", "Calculator in degree mode for ωt in radians.", "Using 0.637·Vm for a full cycle (it is 0).", "Applying 1.11 and 1.414 to non-sine waves.", "Adding phasor magnitudes directly."], good: ["Check whether the given value is peak or RMS.", "Meters and ratings show RMS values.", "Half-wave rectified sine: Vav = Vm/π, V = Vm/2, Kf = 1.57, Kp = 2.", "Write given, formula, substitution, answer, unit."],
    n: "These are the points where marks are lost every year. Check whether the question gives you a peak value or an RMS value before you start. Ratings on equipment and voltmeter readings are RMS. The half-wave rectified wave is a favourite exam question, so memorise those four numbers." },
  { kind: "summary", t: "Summary", fig: figLevels, b: ["Rotating coil: e = Em sin ωt, Em = N·B·A·ω.", "f = 1/T, ω = 2πf; mains is 50 Hz.", "Vav = 0.637 Vm (half cycle); V = 0.707 Vm.", "Kf = 1.11 and Kp = 1.414 for a sine.", "Phasor V = V∠φ; add in rectangular form."], f: ["Remember four numbers: 0.637, 0.707, 1.11, 1.414"],
    n: "One-minute recap. Say each point and have students call out the numbers: 0.637, 0.707, 1.11, 1.414. If they remember these four, most of the numerical work in this topic is done. Next class: R, L, C and series RL, RC, RLC circuits, where phasors will do the heavy work." },
  { kind: "quiz", t: "Quick Quiz", q: quiz,
    n: "Give about one minute per question and take a show of hands. Question 4 tests the peak-to-RMS conversion in phasors, a common trap with option (a). Question 5 tests half-cycle against full-cycle thinking. Discuss why the wrong options are tempting." },
  { kind: "refs", t: "References", refs: [
      ["Hughes Edward, Electrical Technology", "10th Ed., Pearson Education, 2010 (Unit 1 textbook)"],
      ["Boylestad Robert L. and Nashelsky Louis, Electronic Devices and Circuit Theory", "11th Ed., PHI, 2016 (Units 3–5 textbook)"],
      ["H. Cotton, Electrical Technology", "7th Ed., CBS Publishers, 2005 (reference)"],
      ["David A. Bell, Operational Amplifier and Linear ICs", "3rd Ed., Oxford University Press, 2011 (reference, Unit 5)"]],
    f: ["Next lecture: R, L, C and series RL, RC, RLC circuits; power and power factor"],
    n: "Direct students to the AC fundamentals chapters of Hughes for extra problems. Ask them to solve three problems on RMS and average values and one on phasor addition. Thank the class and preview the next lecture on series circuits and power factor." },
];

build({ theme, pal, title: "BEEE — Unit 1: Sinusoidal AC Fundamentals", footer: "Basic Electrical and Electronics Engineering  |  Prof. Mitesh Astik", file: "../BEEE/BEEE_U1b_Sinusoidal_AC_and_Phasors.pptx", slides })
  .then(() => console.log("beee done")).catch(e => { console.error(e); process.exit(1); });
