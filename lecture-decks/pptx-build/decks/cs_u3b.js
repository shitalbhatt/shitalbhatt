const k = require("../kit");
const { Plot, ptext, arrowPx, rectPx, palC: pal, themeOf, sv, blk, arr, BS, REF, mkDeck, bodeData, logspace, pmul } = k;
const B = BS(pal, "", "Control Systems (22EEG53)");
const deck = mkDeck(pal, themeOf("Control Systems", pal), "Control Systems (22EEG53)  |  Prof. Mitesh Astik",
  "**Course:** Control Systems (22EEG53) | **Unit 3:** Frequency domain analysis | **Topic:** Bode plot, gain margin and phase margin | **Faculty:** Prof. Mitesh Astik | **Duration:** 35 min | **CO3**");
const card = (p, x, y, w, h, c = "C9D3E3") => rectPx(p, x, y, w, h, { fill: "FFFFFF", stroke: c, sw: 3, rx: 14 });

// Two-panel Bode figure (magnitude on top, phase below); returns the two Plot objects for annotation
function bode(p, num, den, lw, hw, mwin, pwin, o = {}) {
  const ws = logspace(lw, hw, 260), d = bodeData(num, den, ws), lg = ws.map(Math.log10);
  const A = new Plot(p, [110, 40, 880, 300], [lw, hw, mwin[0], mwin[1]], pal), Bp = new Plot(p, [110, 345, 880, 570], [lw, hw, pwin[0], pwin[1]], pal);
  for (let e = Math.ceil(lw); e <= hw; e++) { A.line(e, mwin[0], e, mwin[1], { c: "E1E6EF", w: 2 }); Bp.line(e, pwin[0], e, pwin[1], { c: "E1E6EF", w: 2 }); }
  A.axes({ ay: Math.max(mwin[0], 0) === 0 && mwin[0] < 0 ? 0 : mwin[0], yl: "|G| dB" }); Bp.axes({ ay: pwin[0], yl: "∠G (°)" }); ptext(p, 880, 612, "ω (rad/s)", { anchor: "end", size: 22, c: pal.mute }, pal);
  A.line(lw, 0, hw, 0, { c: pal.mute, dash: "10 8", w: 2 }); Bp.line(lw, -180, hw, -180, { c: pal.mute, dash: "10 8", w: 2 });
  for (let e = Math.ceil(lw); e <= hw; e++) Bp.xtick(e, String(Math.pow(10, e)));
  (o.mt || []).forEach(v => A.ytick(v, String(v))); (o.pt || []).forEach(v => Bp.ytick(v, String(v)));
  let i = 0; A.curve(x => { const j = Math.max(0, Math.min(ws.length - 1, Math.round((x - lw) / (hw - lw) * (ws.length - 1)))); return d.mag[j]; }, lw, hw, { w: 6, n: 259 });
  Bp.curve(x => { const j = Math.max(0, Math.min(ws.length - 1, Math.round((x - lw) / (hw - lw) * (ws.length - 1)))); return d.ph[j]; }, lw, hw, { w: 6, c: pal.accent, n: 259 });
  return { A, Bp, d, ws };
}
const fBasics = sv(pal, p => {
  const P = new Plot(p, [90, 60, 880, 500], [-1, 2, -50, 50], pal); P.axes({ ay: 0, xl: "ω (log scale)", yl: "dB" });
  [-1, 0, 1, 2].forEach(e => { P.line(e, -50, e, 50, { c: "E1E6EF", w: 2 }); P.xtick(e, String(Math.pow(10, e)), { ay: -50 }); });
  P.line(-1, 40, 2, -20, { c: pal.blue, w: 6 }); P.text(0.0, 28, "slope −20 dB/decade", { size: 26, bold: true, c: pal.blue }); P.text(0.0, 14, "≡ −6 dB/octave", { size: 24, c: pal.mute, bold: true });
  P.arrow(0, -30, 1, -30, { c: pal.accent, both: true, w: 4 }); P.text(0.5, -30, "1 decade (×10)", { anchor: "middle", dy: -16, size: 24, bold: true, c: pal.accent });
  ptext(p, 455, 580, "log scale: equal distance = equal ratio", { anchor: "middle", size: 24, c: pal.mute }, pal);
});
const fFactors = sv(pal, p => {
  const hdr = ["Factor", "Magnitude slope", "Phase"], rows = [["K", "flat, 20 log K", "0°"], ["1 / s", "−20 dB/dec", "−90°"], ["s", "+20 dB/dec", "+90°"], ["1/(1 + sT)", "0 → −20 after 1/T", "0° → −90°"], ["1 + sT", "0 → +20 after 1/T", "0° → +90°"]];
  const xs = [20, 230, 560], ws = [200, 320, 320]; hdr.forEach((h, i) => { rectPx(p, xs[i], 20, ws[i], 60, { fill: pal.tint, stroke: pal.blue, rx: 10 }); ptext(p, xs[i] + ws[i] / 2, 62, h, { anchor: "middle", size: 24, bold: true, c: pal.primary }, pal); });
  rows.forEach((r, j) => r.forEach((c, i) => { const y = 95 + j * 100; rectPx(p, xs[i], y, ws[i], 86, { fill: "FFFFFF", stroke: "C9D3E3", rx: 10 }); ptext(p, xs[i] + ws[i] / 2, y + 56, c, { anchor: "middle", size: 25, bold: true, c: i === 0 ? pal.blue : pal.ink }, pal); }));
});
const fRules = sv(pal, p => { ["1  Write G(jω) in time-constant form", "2  List corner frequencies 1/T in order", "3  Start: 20 log K, slope −20·N dB/dec", "4  Change slope ±20 at each corner", "5  Add phases of all factors"].forEach((s, i) => { const y = 25 + i * 115; rectPx(p, 50, y, 810, 92, { fill: i % 2 ? "FFFFFF" : pal.tint, stroke: pal.blue, sw: 3, rx: 16 }); ptext(p, 85, y + 58, s, { size: 27, bold: true, c: pal.primary }, pal); if (i < 4) arr(p, 455, y + 92, 455, y + 114, pal.mute, 4); }); });
const fCorner = sv(pal, p => {
  const P = new Plot(p, [90, 50, 880, 540], [-1.5, 1.5, -30, 8], pal); P.axes({ ay: 0, xl: "ω T (log)", yl: "dB" }); [-1, 0, 1].forEach(e => { P.line(e, -30, e, 8, { c: "E1E6EF", w: 2 }); P.xtick(e, String(Math.pow(10, e)), { ay: -30 }); });
  P.curve(x => -10 * Math.log10(1 + Math.pow(10, 2 * x)), -1.5, 1.5, { w: 6 }); P.line(-1.5, 0, 0, 0, { c: pal.accent, dash: "10 8", w: 4 }); P.line(0, 0, 1.5, -30, { c: pal.accent, dash: "10 8", w: 4 });
  P.dot(0, -3.01, { c: pal.red }); P.text(0.05, -3, "−3 dB at corner", { dx: 14, dy: -12, size: 24, bold: true, c: pal.red }); P.text(-1.4, 5, "asymptote (dashed)", { size: 22, bold: true, c: pal.accent }); P.text(0.4, -22, "exact (solid)", { size: 22, bold: true, c: pal.blue });
});
const num2 = [2], den2 = pmul(pmul([1, 0], [1, 1]), [1, 2]);
const fCross = sv(pal, p => {
  const { A, Bp, d } = bode(p, num2, den2, -1, 1, [-60, 40], [-270, 0], { mt: [-40, -20, 0, 20, 40], pt: [-90, -180, -270] });
  const lg = Math.log10(0.749), lp = Math.log10(Math.SQRT2);
  A.line(lg, -60, lg, 0, { c: pal.green, dash: "5 6", w: 3 }); A.dot(lg, 0, { c: pal.green }); A.text(lg, -48, "ωgc", { dx: 10, size: 26, bold: true, c: pal.green });
  Bp.line(lp, -270, lp, -180, { c: pal.red, dash: "5 6", w: 3 }); Bp.dot(lp, -180, { c: pal.red }); Bp.text(lp, -250, "ωpc", { dx: 10, size: 26, bold: true, c: pal.red });
  A.text(0.2, 30, "G(s) = 2/[s(s+1)(s+2)]", { size: 22, bold: true, c: pal.primary });
});
const fMargin = sv(pal, p => {
  const { A, Bp } = bode(p, num2, den2, -1, 1, [-60, 40], [-270, 0], { mt: [-40, -20, 0, 20, 40], pt: [-90, -180, -270] });
  const lg = Math.log10(0.749), lp = Math.log10(Math.SQRT2), pm = -147.4;
  A.arrow(lp, 0, lp, -9.54, { c: pal.red, both: true, w: 5 }); A.dot(lp, -9.54, { c: pal.red }); A.text(lp, -26, "GM = 9.54 dB", { dx: 14, size: 24, bold: true, c: pal.red });
  Bp.arrow(lg, -180, lg, pm, { c: pal.green, both: true, w: 5 }); Bp.dot(lg, pm, { c: pal.green }); Bp.text(lg, -228, "PM = 32.6°", { dx: -14, anchor: "end", size: 24, bold: true, c: pal.green });
});
const fPMz = sv(pal, p => {
  const pm = z => Math.atan(2 * z / Math.sqrt(Math.sqrt(1 + 4 * z ** 4) - 2 * z * z)) * 180 / Math.PI;
  const P = new Plot(p, [90, 50, 880, 540], [0, 1, 0, 90], pal); P.axes({ xl: "ζ", yl: "PM (°)" }); [0.2, 0.4, 0.6, 0.8, 1].forEach(t => P.xtick(t, String(t))); [30, 60, 90].forEach(y => P.ytick(y, String(y)));
  P.curve(pm, 0.01, 1, { w: 6 }); P.line(0, 0, 0.9, 90, { c: pal.accent, dash: "10 8", w: 4 }); P.text(0.62, 40, "PM ≈ 100ζ", { size: 26, bold: true, c: pal.accent }); P.text(0.08, 80, "exact (solid)", { size: 22, c: pal.blue, bold: true });
  P.dot(0.6, pm(0.6), { c: pal.red }); P.text(0.6, pm(0.6), "ζ = 0.6 → 59°", { dx: 14, dy: 38, size: 22, bold: true, c: pal.red });
});
const fEx1 = sv(pal, p => {
  const { A, Bp } = bode(p, [10], pmul([1, 0], [0.1, 1]), -1, 2, [-40, 40], [-180, 0], { mt: [-20, 0, 20, 40], pt: [-90, -180] });
  const g = Math.log10(7.86); A.line(g, -40, g, 0, { c: pal.green, dash: "5 6", w: 3 }); A.dot(g, 0, { c: pal.green }); A.text(g, -28, "ωgc = 7.86", { dx: 10, size: 22, bold: true, c: pal.green }); Bp.arrow(g, -180, g, -128.2, { c: pal.green, both: true, w: 4 }); Bp.text(g, -60, "PM = 51.8°", { dx: -12, anchor: "end", size: 22, bold: true, c: pal.green });
});
const fEx2 = sv(pal, p => {
  [["K = 2", "ωpc = √2,  |G| = K/6 = 0.333", pal.primary], ["GM = 6/K = 3", "= 9.54 dB", pal.blue], ["ωgc = 0.749 rad/s", "∠G = −147.4°", pal.accent], ["PM = 32.6°", "stable (both margins positive)", pal.green]].forEach(([a, b, c], i) => { const y = 20 + i * 148; card(p, 20, y, 870, 128, c); ptext(p, 455, y + 55, a, { anchor: "middle", size: 31, bold: true, c }, pal); ptext(p, 455, y + 100, b, { anchor: "middle", size: 26, c: pal.ink }, pal); if (i < 3) arr(p, 455, y + 128, 455, y + 147, pal.mute, 4); });
});

deck("../Control_Systems/CS_U3b_Bode_Plot_GM_and_PM", "Control Systems — Unit 3: Bode Plot, Gain Margin and Phase Margin", [
  B.title("Bode Plot, Gain and Phase Margin", "Unit 3: Frequency Domain Analysis", "Bode plot construction; gain margin and phase margin", "bode"),
  B.lo(["Draw the asymptotic Bode plot of G(jω).", "Locate gain and phase crossover frequencies.", "Find gain margin and phase margin.", "Judge relative stability and estimate ζ."], "CO3", "Analyse performance indices of a system in the frequency domain.", "Bode plots"),
  { kind: "content", t: "Recap: What You Already Know", fig: fBasics, b: ["Frequency response G(jω): magnitude and phase.", "Decibel: dB = 20 log₁₀|G|.", "Log scale: equal distance = equal ratio.", "Factor G(s) into simple terms."], f: ["|G1·G2| in dB = |G1| dB + |G2| dB;   ∠(G1·G2) = ∠G1 + ∠G2", "decade = ×10 in ω; octave = ×2"], vis: "Semilog axes with a −20 dB/decade line and one decade marked.",
    n: "Recall that the magnitude in decibels is 20 log ten of the gain. Because logarithms turn products into sums, the Bode plot of a product of factors is the sum of the plots of the individual factors. A decade is a tenfold change in frequency. Minus 20 dB per decade is the same as about minus 6 dB per octave." },
  { kind: "content", t: "Motivation: How Close to Instability?", fig: fMargin, b: ["Too much gain makes a loop oscillate.", "Margins say how much gain or phase is spare.", "Margins are read directly from a Bode plot.", "No need to compute closed-loop poles."], f: ["Gain margin and phase margin = safety factors of a feedback design"], vis: "Bode magnitude and phase plot with GM and PM bars marked (preview).",
    n: "A servo that is stable on the bench may become unstable when the amplifier gain drifts or a time delay appears. The gain margin tells how much the gain can increase and the phase margin tells how much extra phase lag is tolerable. Both can be read from the Bode plot of the open-loop transfer function. A good design has comfortable margins." },
  { kind: "content", t: "Bode Plot of Standard Factors", fig: fFactors, b: ["Constant K: flat at 20 log K dB.", "Integrator 1/s: −20 dB/dec, −90°.", "First-order lag: slope changes by −20 at 1/T.", "Phase moves −45° at the corner frequency.", "Zero factor (1 + sT) mirrors the lag."], f: ["Corner frequency ωc = 1/T;   |1/(1 + jωT)| = −3 dB at ωc"], vis: "Five-row table of factors with magnitude slope and phase.",
    n: "Every transfer function can be broken into constants, integrators, first-order lags or leads and quadratic factors. Each factor has a simple asymptotic plot: straight lines with slope changes at the corner frequencies. The phase of a first-order factor changes by 90 degrees, with 45 degrees at the corner. Learn this table, because every Bode problem is built from it." },
  { kind: "content", t: "Asymptotic and Exact Plot", fig: fCorner, b: ["Asymptotes: two straight lines meeting at ωc.", "Exact curve lies below by 3 dB at the corner.", "Error is 1 dB at ωc/2 and 2ωc.", "Asymptotic plot is enough for design sketches."], f: ["Exact: −10 log₁₀(1 + ω²T²);   asymptote: 0 dB then −20 dB/dec", "Maximum error 3 dB at ω = 1/T"], vis: "Magnitude of a first-order lag: dashed asymptotes and solid exact curve with the −3 dB point marked.",
    n: "The asymptotic plot is quick to draw and accurate away from the corner. At the corner the real curve is 3 dB below the intersection of the asymptotes. One octave away the error is about 1 dB. For design work the sketch is usually adequate, and the exact values can be computed when needed." },
  { kind: "content", t: "Steps to Draw a Bode Plot", fig: fRules, b: ["Convert G(s) to the time-constant form.", "Mark corner frequencies on the log axis.", "Start with the low-frequency asymptote.", "Change the slope at every corner.", "Add the phase of all factors."], f: ["Low-frequency asymptote: slope = −20N dB/dec, passes 20 log K at ω = 1 (N integrators)"], vis: "Five-step flow chart for Bode plot construction.",
    n: "Follow the steps in order. First write every factor as one plus j omega T so that the gain K is clean. Then mark the corner frequencies in increasing order and start from the low-frequency line, whose slope is determined by the number of integrators. At each corner the slope changes by 20 dB per decade, down for a pole and up for a zero. Finally sum the phase contributions." },
  { kind: "content", t: "Gain and Phase Crossover Frequencies", fig: fCross, b: ["Gain crossover ωgc: |G(jω)| = 1 (0 dB).", "Phase crossover ωpc: ∠G(jω) = −180°.", "Both are read from the open-loop Bode plot.", "Stable closed loop: ωgc < ωpc."], f: ["|G(jωgc)| = 1;   ∠G(jωpc) = −180°", "Example G(s) = 2/[s(s + 1)(s + 2)]: ωgc = 0.749, ωpc = 1.414 rad/s"], vis: "Bode magnitude and phase of the example with ωgc and ωpc marked by dashed vertical lines.",
    n: "The gain crossover frequency is where the magnitude curve crosses the zero dB line. The phase crossover is where the phase curve crosses minus 180 degrees. For a minimum-phase open-loop system the loop is stable if the gain crossover occurs before the phase crossover. On our example ωgc is 0.75 and ωpc is 1.41 rad/s, so the system is stable." },
  { kind: "content", t: "Gain Margin and Phase Margin", fig: fMargin, b: ["GM: extra gain allowed at ωpc before instability.", "PM: extra phase lag allowed at ωgc.", "GM > 0 dB and PM > 0° mean a stable loop.", "Typical design: GM ≥ 6 dB, PM 30°–60°."], f: ["GM = 1/|G(jωpc)|  (or −20 log|G(jωpc)| dB);   PM = 180° + ∠G(jωgc)", "GM dimensionless or dB, PM in degrees"], vis: "Same Bode plot with GM drawn as a bar at ωpc and PM as an arrow at ωgc.",
    n: "The gain margin is the factor by which the gain can be raised until the magnitude at the phase crossover reaches one. The phase margin is the additional lag at the gain crossover that would bring the phase to minus 180 degrees. In our example the magnitude at ωpc is one third, so GM is 3 or 9.54 dB. The phase at ωgc is minus 147.4 degrees, so PM is 32.6 degrees." },
  { kind: "content", t: "Phase Margin and Damping Ratio", fig: fPMz, b: ["Phase margin relates to damping of the closed loop.", "Larger PM means smaller overshoot.", "Rule of thumb: ζ ≈ PM/100 (PM below about 60°).", "PM = 60° corresponds to ζ ≈ 0.6."], f: ["PM = tan⁻¹ { 2ζ / √(√(1 + 4ζ⁴) − 2ζ²) } ≈ 100ζ", "For a second-order system with G = ωn²/[s(s + 2ζωn)]"], vis: "Plot of exact phase margin against ζ with the straight-line approximation.",
    n: "For the standard second-order loop the phase margin is a unique function of ζ. The straight line PM equals 100 ζ is a handy approximation up to about 60 degrees. So a design with 45 degrees of phase margin has a damping ratio near 0.45 and roughly 20 per cent overshoot. This links the frequency-domain margins to time-domain behaviour." },
  { kind: "ex", t: "Solved Example 1: Bode of 10/[s(1+0.1s)]", fig: fEx1, b: ["Draw asymptotic Bode plot; find ωgc, GM and PM for G = 10/[s(1 + 0.1s)].", "1. One integrator: slope −20 dB/dec; 20 log 10 = 20 dB at ω = 1.", "2. Corner at 1/0.1 = 10 rad/s: slope becomes −40 dB/dec.", "3. ωgc: 100 = ω²(1 + 0.01ω²) → ωgc = 7.86 rad/s.", "4. ∠G = −90° − tan⁻¹(0.1ω) = −128.2° at ωgc → PM = 51.8°.", "5. Phase never reaches −180°: GM = ∞."], f: ["Answer: ωgc = 7.86 rad/s, PM = 51.8°, GM = ∞ (always stable)"], vis: "Left: steps; right: Bode plot of the system with ωgc and PM marked.",
    n: "Start with the low-frequency asymptote: one integrator gives minus 20 dB per decade, and the line passes through 20 dB at ω equal to one. At the corner frequency of 10 rad/s the slope steepens to minus 40. Solve exactly for the gain crossover or read it from the plot. The phase at that frequency is minus 128 degrees, giving a comfortable phase margin of about 52 degrees." },
  { kind: "ex", t: "Solved Example 2: GM and PM", fig: fEx2, b: ["Open loop G = K/[s(s + 1)(s + 2)] with K = 2. Find ωpc, GM, ωgc, PM, and the K giving marginal stability.", "1. Phase = −90° − tan⁻¹ω − tan⁻¹(ω/2) = −180° → ωpc = √2 = 1.414.", "2. |G(jωpc)| = K/(√2·√3·√6) = K/6 = 0.333.", "3. GM = 6/K = 3 = 9.54 dB.", "4. |G| = 1 at ωgc = 0.749; ∠G = −90 − 36.9 − 20.6 = −147.4°.", "5. PM = 180 − 147.4 = 32.6°.", "6. Marginal stability when GM = 1: K = 6."], f: ["Answer: GM = 9.54 dB, PM = 32.6°, stable; marginal at K = 6"], vis: "Left: steps; right: chain of four cards from K to GM, ωgc, PM.",
    n: "First find the phase crossover by solving for the frequency at which the phase is minus 180 degrees, which gives root two. Evaluate the magnitude there and invert it to get the gain margin. Then find the gain crossover numerically and compute the phase margin. The gain at which GM becomes one is the critical gain K equal to 6; this agrees with Routh's test, which we study in the next unit." },
  B.mistakes(["Forgetting the sign: PM = 180° + ∠G, not 180° − ∠G.", "Reading margins from the closed-loop plot.", "Using natural log instead of log₁₀ in dB.", "Putting the corner at T instead of 1/T.", "Concluding stability from GM alone."], ["Write G(jω) in time-constant form.", "Check both ωgc < ωpc and PM > 0.", "Sketch asymptotes first, then correct.", "State GM in dB or ratio clearly."], "Bode plots"),
  B.summary(["Bode: magnitude (dB) and phase against log ω.", "Each pole/zero changes slope by ∓20 dB/decade.", "ωgc: |G| = 1;  ωpc: ∠G = −180°.", "GM = 1/|G(jωpc)|;  PM = 180° + ∠G(jωgc).", "PM ≈ 100ζ gives a quick estimate of damping."], ["Stable loop: GM > 0 dB and PM > 0° (minimum-phase)"], fMargin, "Unit 4: stability and the Routh–Hurwitz criterion", "Bode plots"),
  B.quiz([{ q: "A simple integrator 1/s has Bode slope:", o: "(a) +20  (b) −20  (c) −40  (d) 0 dB/dec", a: "(b)" }, { q: "The phase margin is measured at:", o: "(a) ωpc  (b) ωgc  (c) ω = 0  (d) ωn", a: "(b)" }, { q: "Gain margin is 1/|G| at the:", o: "(a) gain crossover  (b) phase crossover  (c) corner  (d) peak", a: "(b)" }, { q: "|G(jωpc)| = 0.25 gives a GM of:", o: "(a) 2  (b) 4  (c) 0.25  (d) 12 dB only", a: "(b)" }, { q: "PM of 45° suggests ζ about:", o: "(a) 0.1  (b) 0.45  (c) 0.9  (d) 1.45", a: "(b)" }], "Bode plots"),
  B.refs([REF.kuo, REF.satya, REF.ogata], "Unit 4: stability and the Routh–Hurwitz criterion", "Bode plots"),
]);
