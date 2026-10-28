const k = require("../kit");
const { Plot, ptext, arrowPx, rectPx, palC: pal, themeOf, sv, blk, resp, arr, BS, REF, mkDeck } = k;
const B = BS(pal, "", "Control Systems (22EEG53)");
const deck = mkDeck(pal, themeOf("Control Systems", pal), "Control Systems (22EEG53)  |  Prof. Mitesh Astik",
  "**Course:** Control Systems (22EEG53) | **Unit 2:** Time domain analysis | **Topic:** Standard test signals; response of zero- and first-order systems | **Faculty:** Prof. Mitesh Astik | **Duration:** 35 min | **CO2**");
const card = (p, x, y, w, h) => rectPx(p, x, y, w, h, { fill: "FFFFFF", stroke: "C9D3E3", rx: 14 });
const mini = (p, x, y, w, h, win, fn, title, o = {}) => { card(p, x, y, w, h); ptext(p, x + w / 2, y + 36, title, { anchor: "middle", size: 22, bold: true, c: pal.primary }, pal); const P = new Plot(p, [x + 30, y + 55, x + w - 20, y + h - 30], win, pal); P.axes({ ay: o.ay ?? win[2] }); if (fn) P.curve(fn, win[0], win[1], { w: 6, c: o.c || pal.blue }); return P; };

const fSignals = sv(pal, p => {
  const P1 = mini(p, 15, 15, 285, 280, [-0.5, 3, -0.2, 1.4], null, "Step  A·u(t)"); P1.line(-0.5, 0, 0, 0, { c: pal.blue, w: 6 }); P1.line(0, 0, 0, 1, { c: pal.blue, w: 6 }); P1.line(0, 1, 3, 1, { c: pal.blue, w: 6 });
  mini(p, 312, 15, 285, 280, [0, 3, 0, 3.2], t => t, "Ramp  A·t");
  mini(p, 609, 15, 285, 280, [0, 3, 0, 4.7], t => t * t / 2, "Parabola  A·t²/2");
  const P4 = mini(p, 163, 310, 285, 280, [-1, 3, -0.2, 1.4], null, "Impulse  δ(t)"); arr(p, P4.X(0), P4.Y(0), P4.X(0), P4.Y(1.2), pal.blue, 6);
  mini(p, 460, 310, 285, 280, [0, 6.3, -1.3, 1.3], t => Math.sin(t), "Sinusoid  A sin ωt", { ay: 0 });
});
const fTrans = sv(pal, p => {
  const P = new Plot(p, [90, 50, 880, 540], [0, 8, 0, 1.6], pal); P.axes({ xl: "t (s)", yl: "c(t)" }); P.line(0, 1, 8, 1, { c: pal.mute, dash: "10 8", w: 2 });
  P.poly([[0, 0], [3.3, 0], [3.3, 1.6], [0, 1.6]], { fill: pal.accentLight, op: 0.22 }); P.poly([[3.3, 0], [8, 0], [8, 1.6], [3.3, 1.6]], { fill: "BFE3CF", op: 0.35 });
  P.curve(resp(0.3, 2), 0, 8, { w: 6 }); P.text(1.6, 1.52, "transient", { anchor: "middle", size: 28, bold: true, c: pal.accent }); P.text(5.7, 1.52, "steady state", { anchor: "middle", size: 28, bold: true, c: pal.green });
  P.text(5.7, 0.8, "css = lim c(t)", { anchor: "middle", size: 24, c: pal.primary, bold: true });
});
const fZero = sv(pal, p => {
  ptext(p, 40, 85, "R(s)", { size: 28, bold: true }, pal); arr(p, 120, 80, 280, 80); blk(p, 280, 40, 160, 80, "K"); arr(p, 440, 80, 590, 80); ptext(p, 605, 90, "C(s) = K·R(s)", { size: 28, bold: true }, pal);
  const P = new Plot(p, [90, 190, 860, 570], [0, 4, 0, 2.6], pal); P.axes({ xl: "t (s)" }); const u = t => (t < 1 ? 0 : 1);
  P.line(0, 0, 1, 0, { c: pal.mute, w: 4, dash: "8 6" }); P.line(1, 0, 1, 1, { c: pal.mute, w: 4, dash: "8 6" }); P.line(1, 1, 4, 1, { c: pal.mute, w: 4, dash: "8 6" });
  P.line(0, 0, 1, 0, { c: pal.blue, w: 6 }); P.line(1, 0, 1, 2, { c: pal.blue, w: 6 }); P.line(1, 2, 4, 2, { c: pal.blue, w: 6 });
  P.text(2.5, 1.0, "input r(t)", { dy: 34, size: 24, c: pal.mute, bold: true }); P.text(2.5, 2.0, "output c(t) = K·r(t),  K = 2", { dy: -14, size: 24, c: pal.blue, bold: true });
});
const fPole = sv(pal, p => {
  const A = new Plot(p, [40, 90, 400, 540], [-5, 1, -1.5, 1.5], pal); A.axes({ ax: 0, ay: 0 }); A.cross(-2, 0); A.arrow(0, 0.35, -2, 0.35, { c: pal.accent, w: 4 }); A.text(-1, 0.35, "1/τ", { anchor: "middle", dy: -14, size: 26, bold: true, c: pal.accent });
  ptext(p, 220, 60, "Pole at s = −1/τ", { anchor: "middle", size: 24, bold: true, c: pal.primary }, pal);
  const B2 = new Plot(p, [470, 90, 880, 540], [0, 6, 0, 1.2], pal); B2.axes({ xl: "t" }); B2.line(0, 1, 6, 1, { c: pal.mute, dash: "8 6", w: 2 });
  [[0.5, pal.green], [1, pal.blue], [2, pal.red]].forEach(([t, c]) => B2.curve(x => 1 - Math.exp(-x / t), 0, 6, { c, w: 5 }));
  ptext(p, 675, 60, "Larger τ → slower", { anchor: "middle", size: 24, bold: true, c: pal.primary }, pal);
  [["τ = 0.5", pal.green], ["τ = 1", pal.blue], ["τ = 2", pal.red]].forEach(([s, c], i) => { p.push(`<rect x="720" y="${390 + i * 40}" width="24" height="8" fill="#${c}"/>`); ptext(p, 752, 400 + i * 40, s, { size: 20 }, pal); });
});
const fStep = sv(pal, p => {
  const P = new Plot(p, [90, 50, 880, 540], [0, 5, 0, 1.2], pal); P.axes({ xl: "t / τ", yl: "c(t)" }); P.line(0, 1, 5, 1, { c: pal.mute, dash: "10 8", w: 2 }); P.ytick(1, "1"); [1, 2, 3, 4, 5].forEach(t => P.xtick(t, String(t)));
  P.line(0, 0, 1, 1, { c: pal.accent, dash: "8 6", w: 3 }); P.curve(t => 1 - Math.exp(-t), 0, 5, { w: 6 });
  [[1, "63.2 %"], [2, "86.5 %"], [3, "95 %"], [4, "98.2 %"]].forEach(([t, s]) => { const y = 1 - Math.exp(-t); P.dot(t, y, { c: pal.red, r: 7 }); P.line(t, 0, t, y, { c: pal.red, dash: "4 6", w: 2 }); P.text(t, y, s, { dx: 6, dy: 40, anchor: "middle", size: 22, bold: true, c: pal.red }); });
  P.text(1.12, 1.1, "tangent at t = 0", { size: 20, c: pal.accent, bold: true });
});
const fRamp = sv(pal, p => {
  const tau = 1, P = new Plot(p, [90, 50, 880, 540], [0, 6, 0, 6.4], pal); P.axes({ xl: "t (s)", yl: "r, c" });
  P.line(0, 0, 6, 6, { c: pal.mute, dash: "10 8", w: 3 }); P.curve(t => t - tau + tau * Math.exp(-t / tau), 0, 6, { w: 6 }); P.arrow(4.6, 3.8, 4.6, 4.6, { c: pal.red, both: true, w: 4 }); P.text(4.6, 4.2, "ess = τ", { anchor: "end", dx: -14, size: 26, bold: true, c: pal.red });
  P.text(1.0, 5, "input r(t) = t", { size: 24, c: pal.mute, bold: true }); P.text(3.3, 1.2, "output c(t)", { size: 24, c: pal.blue, bold: true });
});
const fRel = sv(pal, p => {
  [["Impulse response", t => Math.exp(-t), 1.2], ["Step response", t => 1 - Math.exp(-t), 1.2], ["Ramp response", t => t - 1 + Math.exp(-t), 5]].forEach(([s, f, ym], i) => { const y = 12 + i * 200; card(p, 20, y, 870, 190); ptext(p, 45, y + 42, s, { size: 26, bold: true, c: pal.primary }, pal); const P = new Plot(p, [330, y + 20, 860, y + 160], [0, 5, 0, ym], pal); P.axes(); P.curve(f, 0, 5, { w: 6 }); });
  ptext(p, 150, 205, "∫ dt", { anchor: "middle", size: 26, bold: true, c: pal.accent }, pal); ptext(p, 150, 405, "∫ dt", { anchor: "middle", size: 26, bold: true, c: pal.accent }, pal);
});
const fEx1 = sv(pal, p => {
  const P = new Plot(p, [100, 50, 880, 540], [0, 1.5, 0, 2.4], pal); P.axes({ xl: "t (s)", yl: "c(t)" }); const f = t => 2 * (1 - Math.exp(-4 * t));
  P.line(0, 2, 1.5, 2, { c: pal.mute, dash: "10 8", w: 2 }); P.ytick(2, "2"); [0.5, 1, 1.5].forEach(t => P.xtick(t, String(t))); P.curve(f, 0, 1.5, { w: 6 });
  P.dot(0.25, f(0.25), { c: pal.red }); P.line(0.25, 0, 0.25, f(0.25), { c: pal.red, dash: "4 6", w: 2 }); P.text(0.25, f(0.25), "1.264 at τ = 0.25 s", { dx: 14, dy: 40, size: 22, bold: true, c: pal.red });
  P.dot(1, f(1), { c: pal.green }); P.text(1, f(1), "ts ≈ 1 s (2 %)", { dx: -10, dy: 52, anchor: "middle", size: 22, bold: true, c: pal.green });
});
const fEx2 = sv(pal, p => {
  const P = new Plot(p, [100, 50, 880, 540], [0, 60, 0, 120], pal); P.axes({ xl: "t (s)", yl: "T (°C)" }); const f = t => 100 * (1 - Math.exp(-t / 12));
  P.line(0, 100, 60, 100, { c: pal.mute, dash: "10 8", w: 2 }); P.ytick(100, "100"); [12, 24, 36, 48, 60].forEach(t => P.xtick(t, String(t))); P.curve(f, 0, 60, { w: 6 });
  [[12, "63.2 °C", pal.red], [20, "81.1 °C", pal.accent], [48, "98 °C", pal.green]].forEach(([t, s, c]) => { P.dot(t, f(t), { c }); P.line(t, 0, t, f(t), { c, dash: "4 6", w: 2 }); P.text(t, f(t), s, { dx: 14, dy: 40, size: 22, bold: true, c }); });
});

deck("../Control_Systems/CS_U2a_Test_Signals_and_First_Order_Response", "Control Systems — Unit 2: Test Signals and First-Order Response", [
  B.title("Test Signals and First-Order Response", "Unit 2: Time Domain Analysis of Control Systems", "Standard test signals; response of zero-order and first-order systems", "step"),
  B.lo(["Name the standard test signals and their Laplace transforms.", "Separate transient and steady-state response.", "Find the response of zero- and first-order systems.", "Use the time constant τ to get specifications."], "CO2", "Analyse response of systems to standard test signals.", "first-order response"),
  { kind: "content", t: "Recap: What You Already Know", fig: fRel, b: ["Laplace transform of unit step is 1/s.", "Inverse transform by partial fractions.", "Poles decide the form of the response.", "Transfer function G(s) = C(s)/R(s)."], f: ["C(s) = G(s)·R(s);   c(t) = L⁻¹{C(s)}", "L{e^(−at)} = 1/(s + a)"], vis: "Right: impulse, step and ramp response curves of a first-order system in three cards (preview).",
    n: "Recall how to invert a Laplace transform using partial fractions. A pole at minus a gives an exponential e to the minus a t in time. The unit step has transform 1 over s. We will apply these three facts to first-order systems today." },
  { kind: "content", t: "Motivation: Why Standard Test Signals?", fig: fSignals, b: ["Real inputs are random and unknown.", "Test signals give a fair comparison of systems.", "Step tests sudden changes; ramp tests tracking.", "Response to one signal predicts the others."], f: ["Compare systems with the same input: step, ramp, parabola, impulse, sinusoid"], vis: "Five cards plotting the standard test signals.",
    n: "A designer does not know the exact signal the system will see, so we choose simple signals as benchmarks. A step represents a sudden command change, a ramp represents a moving target such as a tracking antenna. If a system behaves well for these, we trust it in real use. Keep this picture in mind for the whole unit." },
  { kind: "content", t: "Standard Test Signals", fig: fSignals, b: ["Step: sudden change of constant size.", "Ramp: constant velocity input.", "Parabola: constant acceleration input.", "Impulse: very short, unit-area pulse.", "Sinusoid: used for frequency response."], f: ["r = A u(t) → A/s;  A t → A/s²;  A t²/2 → A/s³;  δ(t) → 1", "A amplitude; unit signals use A = 1"], vis: "The five signal plots (step, ramp, parabola, impulse, sinusoid) with formulas in the strip.",
    n: "Each signal is the integral of the previous one: impulse to step to ramp to parabola. This is why the Laplace transforms are one, one over s, one over s squared and one over s cubed. The sinusoid is the test signal for frequency-domain analysis in Unit 3. In time domain we mostly use the step." },
  { kind: "content", t: "Transient and Steady-State Response", fig: fTrans, b: ["Total response = transient + steady state.", "Transient dies out with time.", "Steady state is the final behaviour.", "Specifications describe both parts."], f: ["c(t) = ctr(t) + css(t),   ctr → 0 as t → ∞", "css = lim c(t) as t → ∞ (stable systems)"], vis: "Step response of an underdamped system with the early part shaded as transient and the later part as steady state.",
    n: "After applying a step, the output first shows a transient and finally settles to a constant value. For a stable system the transient term vanishes. Transient specifications are rise time, peak overshoot and settling time. The steady-state specification is the final error, which we study later in this unit." },
  { kind: "content", t: "Zero-Order System", fig: fZero, b: ["Transfer function is a pure gain K.", "Output follows input instantly, scaled by K.", "No energy storage, no dynamics.", "Example: potentiometer, ideal amplifier."], f: ["G(s) = K   →   c(t) = K·r(t)", "K gain (output unit per input unit)"], vis: "Block K with input step and output step scaled by K = 2.",
    n: "A zero-order system has no poles, so there is no transient at all. The output copies the input multiplied by the gain. Real devices approximate this when their dynamics are much faster than the signal. A potentiometer used as a position sensor is the classic example." },
  { kind: "content", t: "First-Order System", fig: fPole, b: ["Contains one energy-storage element.", "Standard form has a time constant τ.", "Single pole on the negative real axis.", "Examples: RC circuit, thermometer, tank filling."], f: ["G(s) = K/(τ s + 1);   pole at s = −1/τ", "τ time constant (s), K DC gain"], vis: "Left: s-plane with a single pole at −1/τ. Right: step responses for three values of τ.",
    n: "A first-order system has one pole at minus one over tau. The farther the pole is from the origin, the faster the response. The time constant tau has a physical meaning: it is R C for an RC circuit and thermal capacity times resistance for a thermometer. Larger tau means a slower system." },
  { kind: "content", t: "Unit Step Response of First Order", fig: fStep, b: ["C(s) = K/[s(τs + 1)]; take K = 1.", "Output rises exponentially to the final value.", "At t = τ it reaches 63.2 % of final value.", "Initial slope is 1/τ.", "Settling: 4τ for 2 %, 3τ for 5 %."], f: ["c(t) = 1 − e^(−t/τ);   ts(2 %) = 4τ,  ts(5 %) = 3τ,  tr(10–90 %) = 2.2τ", "td = 0.69 τ (time to reach 50 %)"], vis: "Step response against t/τ with points at 1, 2, 3, 4 time constants and the tangent at the origin.",
    n: "Partial fractions give c of t equals one minus e to the minus t over tau. After one time constant the output is 63.2 per cent of the final value, after four it is 98 per cent. The tangent at the origin hits the final value at t equal to tau. A first-order system has no overshoot, so its specifications are only rise, delay and settling time." },
  { kind: "content", t: "Unit Ramp Response of First Order", fig: fRamp, b: ["Input r(t) = t, so R(s) = 1/s².", "Output follows the ramp with a lag.", "Steady-state error equals τ.", "Smaller τ gives smaller tracking error."], f: ["c(t) = t − τ + τ e^(−t/τ);   ess = τ", "ess steady-state error (same unit as the input)"], vis: "Ramp input and output curves; vertical double arrow marking the constant error τ.",
    n: "For the ramp the output eventually runs parallel to the input, shifted by the time constant. The gap is the steady-state error and is equal to tau. So a faster system follows a ramp more accurately. This idea leads to the velocity error constant, which we meet in the third lecture of this unit." },
  { kind: "content", t: "Impulse Response and Relationships", fig: fRel, b: ["Impulse: R(s) = 1, so C(s) = 1/(τs + 1).", "Output decays exponentially from 1/τ.", "Step response is the integral of impulse response.", "Ramp response is the integral of step response."], f: ["c(t) = (1/τ) e^(−t/τ) (impulse);   d/dt(ramp response) = step response", "For an LTI system: derivative of input gives derivative of output"], vis: "Three stacked cards: impulse, step and ramp responses with ∫dt arrows between them.",
    n: "The impulse response is the derivative of the step response and the step response is the derivative of the ramp response. This follows from linearity and is very useful: if you know one response you can obtain the others. The impulse response is also the inverse transform of G of s itself." },
  { kind: "ex", t: "Solved Example 1: First-Order Step", fig: fEx1, b: ["Given C/R = 4/(0.5s + 2). Find K, τ, c(t) for a unit step, tr and ts.", "1. Standard form: 4/(0.5s + 2) = 2/(0.25s + 1).", "2. K = 2, τ = 0.25 s.", "3. c(t) = 2(1 − e^(−4t)).", "4. At t = τ: c = 2 × 0.632 = 1.264.", "5. tr = 2.2τ = 0.55 s.", "6. ts(2 %) = 4τ = 1.0 s;  ts(5 %) = 0.75 s."], f: ["Answer: K = 2, τ = 0.25 s, ts = 1.0 s (2 %), c(∞) = 2"], vis: "Left: steps; right: step response with 63.2 % point and settling time marked.",
    n: "Divide numerator and denominator by two to reach the standard form with unit coefficient of s in the denominator constant term. Read K and tau directly. The final value is K, so the output ends at 2 for a unit step. The settling time for 2 per cent is four time constants, which is one second." },
  { kind: "ex", t: "Solved Example 2: Thermometer Test", fig: fEx2, b: ["A thermometer is dipped in 100 °C water. It reads 63.2 °C after 12 s. Find τ, G(s), reading at 20 s, and ts.", "1. 63.2 % of final value occurs at t = τ, so τ = 12 s.", "2. K = 1 (reads 100 °C finally): G(s) = 1/(12s + 1).", "3. T(20) = 100(1 − e^(−20/12)) = 100(1 − 0.189) = 81.1 °C.", "4. ts(2 %) = 4τ = 48 s."], f: ["Answer: τ = 12 s, G(s) = 1/(12s + 1), T(20 s) = 81.1 °C, ts = 48 s"], vis: "Left: steps; right: temperature response with the 12 s, 20 s and 48 s points marked.",
    n: "This is a practical identification problem. The time at which the response reaches 63.2 per cent of its final value is the time constant, so we read tau straight from the data. The gain is one because the reading ends at the true temperature. Then every other quantity follows from the first-order formulas." },
  B.mistakes(["Using 63.2 % of the input instead of the final output.", "Taking ts = 4τ for a 5 % band.", "Forgetting the DC gain K in c(∞).", "Mixing τ with the pole value 1/τ.", "Expecting overshoot in a first-order system."], ["Convert to the form K/(τs + 1) first.", "Read K and τ, then use the formulas.", "Check units of τ (seconds).", "Remember ess(ramp) = τ for unity-gain first order."], "first-order systems"),
  B.summary(["Test signals: step, ramp, parabola, impulse, sinusoid.", "Response = transient + steady state.", "Zero order: c(t) = K·r(t).", "First order: c(t) = 1 − e^(−t/τ); ts = 4τ (2 %).", "Ramp error = τ; impulse is derivative of step response."], ["G(s) = K/(τs + 1);   c(t) = K(1 − e^(−t/τ))"], fStep, "second-order systems and time-domain specifications", "first-order systems"),
  B.quiz([{ q: "Laplace transform of the unit ramp is:", o: "(a) 1  (b) 1/s  (c) 1/s²  (d) 1/s³", a: "(c)" }, { q: "At t = τ a first-order step response reaches:", o: "(a) 50 %  (b) 63.2 %  (c) 86.5 %  (d) 98 %", a: "(b)" }, { q: "ts (2 %) of a first-order system with τ = 3 s is:", o: "(a) 3 s  (b) 9 s  (c) 12 s  (d) 6 s", a: "(c)" }, { q: "Steady-state error of 1/(τs+1) for a unit ramp is:", o: "(a) 0  (b) τ  (c) 1/τ  (d) ∞", a: "(b)" }, { q: "A zero-order system has:", o: "(a) one pole  (b) two poles  (c) no poles  (d) a pole at origin", a: "(c)" }], "first-order systems"),
  B.refs([REF.nagrath, REF.ogata, REF.satya], "second-order response (done) and then static error constants", "first-order systems"),
]);
