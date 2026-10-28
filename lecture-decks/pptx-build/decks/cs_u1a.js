const k = require("../kit");
const { Plot, ptext, arrowPx, rectPx, W, H, palC: pal, themeOf, sv, blk, sumj, resp, arr, BS, REF, mkDeck, place, sym, wire, node, lbl } = k;
const B = BS(pal, "", "Control Systems (22EEG53)");
const deck = mkDeck(pal, themeOf("Control Systems", pal), "Control Systems (22EEG53)  |  Prof. Mitesh Astik",
  "**Course:** Control Systems (22EEG53) | **Unit 1:** Introduction and mathematical modelling of physical systems | **Topic:** Open/closed loop systems, components and transfer functions of mechanical and electrical systems | **Faculty:** Prof. Mitesh Astik | **Duration:** 35 min | **CO1:** Understand modelling of dynamical systems by the transfer-function approach and deduce the mechanical–electrical analogy.");

const fOpenClosed = sv(pal, p => {
  rectPx(p, 15, 12, 880, 280, { fill: "FFFFFF", stroke: "C9D3E3", rx: 18 }); rectPx(p, 15, 305, 880, 300, { fill: "FFFFFF", stroke: "C9D3E3", rx: 18 });
  ptext(p, 35, 52, "Open loop: no feedback", { size: 26, bold: true, c: pal.primary }, pal);
  ptext(p, 35, 345, "Closed loop: output is fed back", { size: 26, bold: true, c: pal.primary }, pal);
  let y = 175; ptext(p, 30, y + 10, "R", { size: 28, bold: true }, pal); arr(p, 70, y, 150, y); blk(p, 150, y - 40, 200, 80, "Controller"); arr(p, 350, y, 440, y); blk(p, 440, y - 40, 200, 80, "Plant"); arr(p, 640, y, 790, y); ptext(p, 805, y + 10, "C", { size: 28, bold: true }, pal);
  ptext(p, 450, 255, "e.g. toaster, washing-machine timer", { anchor: "middle", size: 22, c: pal.mute, italic: true }, pal);
  y = 440; ptext(p, 30, y + 10, "R", { size: 28, bold: true }, pal); arr(p, 70, y, 138, y); sumj(p, 166, y, 28); arr(p, 194, y, 270, y); blk(p, 270, y - 40, 190, 80, "Controller"); arr(p, 460, y, 530, y); blk(p, 530, y - 40, 170, 80, "Plant"); arr(p, 700, y, 810, y); ptext(p, 822, y + 10, "C", { size: 28, bold: true }, pal);
  p.push(`<polyline points="750,${y} 750,540 400,540" fill="none" stroke="#1B2430" stroke-width="4"/><circle cx="750" cy="${y}" r="8" fill="#1B2430"/>`);
  blk(p, 230, 505, 170, 70, "Sensor"); p.push(`<polyline points="230,540 166,540 166,${y + 28}" fill="none" stroke="#1B2430" stroke-width="4"/>`); arr(p, 166, y + 40, 166, y + 29);
  ptext(p, 600, 585, "e.g. AC thermostat, cruise control", { anchor: "middle", size: 22, c: pal.mute, italic: true }, pal);
});

const fParts = sv(pal, p => {
  const y = 250; ptext(p, 40, y - 14, "r", { size: 26, italic: true, bold: true }, pal); arr(p, 100, y, 142, y); sumj(p, 170, y, 28);
  arr(p, 198, y, 255, y); ptext(p, 225, y - 18, "e", { anchor: "middle", size: 24, italic: true }, pal);
  blk(p, 255, y - 45, 150, 90, "Controller\n(amplifier)", { size: 22 }); arr(p, 405, y, 450, y); blk(p, 450, y - 45, 130, 90, "Actuator", { size: 22 }); arr(p, 580, y, 625, y); blk(p, 625, y - 45, 120, 90, "Plant", { size: 22 }); arr(p, 745, y, 860, y); ptext(p, 800, y - 18, "c", { anchor: "middle", size: 26, italic: true, bold: true }, pal);
  p.push(`<polyline points="805,${y} 805,430 400,430" fill="none" stroke="#1B2430" stroke-width="4"/><circle cx="805" cy="${y}" r="8" fill="#1B2430"/>`);
  blk(p, 230, 395, 170, 70, "Sensor", { size: 22 }); p.push(`<polyline points="230,430 170,430 170,${y + 30}" fill="none" stroke="#1B2430" stroke-width="4"/>`); arr(p, 170, y + 45, 170, y + 29);
  ptext(p, 170, 118, "Error detector", { anchor: "middle", size: 22, c: pal.blue, bold: true }, pal);
  ptext(p, 455, 520, "Disturbance acts on the plant; the sensor measures the output", { anchor: "middle", size: 22, c: pal.mute, italic: true }, pal);
  arr(p, 685, 150, 685, y - 46, pal.red, 4); ptext(p, 685, 135, "disturbance", { anchor: "middle", size: 22, c: pal.red }, pal);
});

const fTF = sv(pal, p => {
  ptext(p, 40, 60, "R(s)", { size: 30, bold: true }, pal); arr(p, 120, 55, 250, 55); blk(p, 250, 10, 300, 90, "N(s) / D(s)", { size: 28 }); arr(p, 550, 55, 690, 55); ptext(p, 700, 66, "C(s)", { size: 30, bold: true }, pal);
  const P = new Plot(p, [130, 150, 780, 590], [-4, 1, -2.5, 2.5], pal); P.axes({ ax: 0, ay: 0 });
  P.cross(-1, 1.5); P.cross(-1, -1.5); P.cross(-3, 0); p.push(`<circle cx="${P.X(-2)}" cy="${P.Y(0)}" r="11" fill="none" stroke="#${pal.blue}" stroke-width="5"/>`);
  ptext(p, 860, 345, "σ", { anchor: "end", size: 24, c: pal.mute }, pal); ptext(p, P.X(0) + 12, 170, "jω", { size: 24, c: pal.mute }, pal);
  ptext(p, 140, 205, "× pole: D(s) = 0", { size: 24, c: pal.red, bold: true }, pal); ptext(p, 140, 250, "○ zero: N(s) = 0", { size: 24, c: pal.blue, bold: true }, pal);
});

function spring(p, x1, x2, y, amp = 24, n = 9) { const lead = 40, seg = (x2 - x1 - 2 * lead) / n; let d = `M${x1} ${y} L${x1 + lead} ${y}`; for (let i = 0; i < n; i++) d += ` L${x1 + lead + seg * (i + 0.5)} ${y + (i % 2 ? amp : -amp)}`; d += ` L${x2 - lead} ${y} L${x2} ${y}`; p.push(`<path d="${d}" fill="none" stroke="#1B2A30" stroke-width="5" stroke-linejoin="round"/>`); }
const fMSD = sv(pal, p => {
  p.push(`<rect x="40" y="130" width="30" height="320" fill="#C9D3E3" stroke="#1B2430" stroke-width="3"/><line x1="40" y1="450" x2="880" y2="450" stroke="#1B2430" stroke-width="4"/>`);
  spring(p, 70, 500, 210); ptext(p, 285, 165, "K", { anchor: "middle", size: 30, bold: true, c: pal.blue }, pal);
  p.push(`<line x1="70" y1="370" x2="190" y2="370" stroke="#1B2430" stroke-width="5"/><rect x="190" y="340" width="140" height="60" fill="none" stroke="#1B2430" stroke-width="5"/><line x1="250" y1="350" x2="250" y2="390" stroke="#1B2430" stroke-width="6"/><line x1="250" y1="370" x2="500" y2="370" stroke="#1B2430" stroke-width="5"/>`);
  ptext(p, 285, 322, "B", { anchor: "middle", size: 30, bold: true, c: pal.blue }, pal);
  rectPx(p, 500, 150, 190, 300, { fill: pal.tint, stroke: pal.blue, sw: 5, rx: 6 }); ptext(p, 595, 315, "M", { anchor: "middle", size: 54, bold: true, c: pal.primary }, pal);
  arr(p, 690, 295, 840, 295, pal.accent, 7); ptext(p, 790, 270, "f(t)", { anchor: "middle", size: 30, bold: true, c: pal.accent }, pal);
  arr(p, 500, 500, 600, 500, pal.green, 5); ptext(p, 655, 512, "x(t)", { size: 28, bold: true, c: pal.green }, pal);
  ptext(p, 450, 40, "M x″ + B x′ + K x = f(t)", { anchor: "middle", size: 28, bold: true, c: pal.primary }, pal);
});

const fRot = sv(pal, p => {
  p.push(`<rect x="40" y="170" width="30" height="260" fill="#C9D3E3" stroke="#1B2430" stroke-width="3"/>`);
  spring(p, 70, 250, 300, 22, 6); ptext(p, 160, 255, "K", { anchor: "middle", size: 30, bold: true, c: pal.blue }, pal);
  p.push(`<line x1="250" y1="300" x2="300" y2="300" stroke="#1B2A30" stroke-width="7"/><circle cx="430" cy="300" r="130" fill="${pal.tint ? "#E8EEF9" : "#fff"}" stroke="#${pal.blue}" stroke-width="6"/><circle cx="430" cy="300" r="12" fill="#1B2430"/><line x1="300" y1="300" x2="430" y2="300" stroke="#1B2A30" stroke-width="7"/>`);
  ptext(p, 430, 322, "J", { anchor: "middle", size: 54, bold: true, c: pal.primary }, pal);
  p.push(`<path d="M 600 220 A 190 190 0 0 1 600 380" fill="none" stroke="#${pal.accent}" stroke-width="7"/>`); arr(p, 603, 376, 596, 387, pal.accent, 7); ptext(p, 640, 305, "T(t)", { size: 30, bold: true, c: pal.accent }, pal);
  p.push(`<path d="M 400 428 L 400 480" stroke="#1B2A30" stroke-width="5"/><rect x="360" y="480" width="80" height="55" fill="none" stroke="#1B2A30" stroke-width="5"/><line x1="360" y1="560" x2="440" y2="560" stroke="#1B2A30" stroke-width="4"/>`);
  ptext(p, 470, 520, "B", { size: 30, bold: true, c: pal.blue }, pal); ptext(p, 770, 120, "θ(t)", { anchor: "middle", size: 30, bold: true, c: pal.green }, pal);
  ptext(p, 450, 60, "J θ″ + B θ′ + K θ = T(t)", { anchor: "middle", size: 28, bold: true, c: pal.primary }, pal);
});

const fRLC = sv(pal, p => {
  sym.ac(p, 140, 150, 300, 90); wire(p, [[140, 150], [240, 150]]); sym.res(p, 240, 150, 180); sym.ind(p, 420, 150, 190); wire(p, [[610, 150], [760, 150]]); sym.cap(p, 760, 150, 300, 90); wire(p, [[760, 450], [140, 450]]);
  lbl(p, 330, 118, "R"); lbl(p, 515, 118, "L"); lbl(p, 835, 305, "C"); lbl(p, 70, 305, "v(t)"); arr(p, 280, 215, 400, 215, pal.accent, 5); ptext(p, 340, 255, "i(t)", { anchor: "middle", size: 26, bold: true, c: pal.accent }, pal);
  lbl(p, 690, 310, "vC", { c: pal.green }); ptext(p, 450, 520, "v = R·i + L·di/dt + (1/C)∫i dt", { anchor: "middle", size: 28, bold: true, c: pal.primary }, pal);
});

const fAnal = sv(pal, p => {
  const rows = [["Force f", "Voltage v"], ["Mass M", "Inductance L"], ["Damper B", "Resistance R"], ["Spring K", "1/C (elastance)"], ["Displacement x", "Charge q"], ["Velocity ẋ", "Current i"]];
  ptext(p, 220, 60, "Mechanical", { anchor: "middle", size: 28, bold: true, c: pal.blue }, pal); ptext(p, 690, 60, "Electrical", { anchor: "middle", size: 28, bold: true, c: pal.accent }, pal); ptext(p, 455, 40, "(force–voltage analogy)", { anchor: "middle", size: 20, c: pal.mute }, pal);
  rows.forEach(([a, b], i) => { const y = 100 + i * 82; rectPx(p, 30, y, 380, 66, { fill: "FFFFFF", stroke: "C9D3E3", rx: 12 }); rectPx(p, 500, y, 380, 66, { fill: "FFFFFF", stroke: "C9D3E3", rx: 12 }); ptext(p, 220, y + 44, a, { anchor: "middle", size: 26, bold: true }, pal); ptext(p, 690, y + 44, b, { anchor: "middle", size: 26, bold: true }, pal); ptext(p, 455, y + 46, "↔", { anchor: "middle", size: 36, bold: true, c: pal.mute }, pal); });
});

const fEx1 = sv(pal, p => {
  const P = new Plot(p, [110, 50, 880, 540], [0, 6, 0, 0.16], pal); P.axes({ xl: "t (s)", yl: "x (m)" }); const f = t => 0.125 * resp(0.5, 2)(t);
  P.line(0, 0.125, 6, 0.125, { c: pal.mute, dash: "10 8", w: 2 }); P.ytick(0.125, "0.125"); [2, 4, 6].forEach(t => P.xtick(t, String(t))); P.curve(f, 0, 6, { w: 6 });
  const tp = Math.PI / (2 * Math.sqrt(0.75)); P.dot(tp, f(tp), { c: pal.red }); P.text(tp, f(tp), "peak 0.145 m at 1.81 s", { dx: 16, dy: -12, size: 22, c: pal.red, bold: true });
});
const fPoleEx = sv(pal, p => {
  const u = 110, P = new Plot(p, [90, 40, 530, 590], [-3, 1, -2.5, 2.5], pal); P.axes({ ax: 0, ay: 0 });
  p.push(`<path d="M ${P.X(0)} ${P.Y(0) - 2 * u} A ${2 * u} ${2 * u} 0 0 0 ${P.X(0)} ${P.Y(0) + 2 * u}" fill="none" stroke="#${pal.mute}" stroke-width="3" stroke-dasharray="10 8"/>`);
  P.line(0, 0, -1, 1.732, { c: pal.accent, w: 5 }); P.cross(-1, 1.732); P.cross(-1, -1.732);
  [["ωn = 2 rad/s", 190], ["ζ = 0.5", 240], ["poles −1 ± j1.73", 290]].forEach(([s, y]) => ptext(p, 550, y, s, { size: 22, bold: true, c: pal.primary }, pal));
});

deck("../Control_Systems/CS_U1a_Open_Closed_Loop_and_Transfer_Functions", "Control Systems — Unit 1: Modelling of Physical Systems", [
  B.title("Control Systems and Transfer Functions", "Unit 1: Mathematical Modelling of Physical Systems", "Open/closed loop systems, components, transfer functions of mechanical and electrical systems", "step"),
  B.lo(["Distinguish open-loop and closed-loop systems with examples.", "Name the components of a feedback control system.", "Write transfer functions of mechanical and electrical systems.", "Use the force–voltage analogy between the two."], "CO1", "Model dynamical systems by transfer functions; deduce mechanical–electrical analogy.", "modelling"),
  { kind: "content", t: "Recap: What You Already Know", fig: sv(pal, p => { const P = new Plot(p, [90, 60, 860, 540], [0, 1, 0, 1], pal); [["Laplace transform", "L{f′(t)} = sF(s) − f(0)"], ["Newton's second law", "ΣF = M·a"], ["Kirchhoff's voltage law", "Σv = 0 around a loop"], ["Partial fractions", "factor D(s) into poles"]].forEach(([a, b], i) => { const y = 40 + i * 145; rectPx(p, 30, y, 850, 125, { fill: "FFFFFF", stroke: "C9D3E3", rx: 16 }); ptext(p, 55, y + 52, a, { size: 28, bold: true, c: pal.primary }, pal); ptext(p, 55, y + 98, b, { size: 26, c: pal.blue, bold: true }, pal); }); }),
    b: ["Laplace transform turns differential equations into algebra.", "Newton's law links force, mass and acceleration.", "Kirchhoff's laws give circuit equations.", "Poles are roots of the denominator."], f: ["Zero initial conditions: L{dx/dt} = sX(s),  L{d²x/dt²} = s²X(s)", "X(s) Laplace transform of x(t), s complex frequency (1/s)"], vis: "Four recap cards (Laplace, Newton, Kirchhoff, partial fractions) on the right.",
    n: "Ask students to recall the Laplace transform of a derivative with zero initial conditions. That single rule is used in every model we derive today. Newton's law and Kirchhoff's voltage law are the two sources of equations. Revise partial fractions at home because we need them for time response in the next unit." },
  { kind: "content", t: "Motivation: Why Feedback?", fig: fOpenClosed, b: ["Cruise control keeps speed on a hill.", "Home AC keeps room temperature near set value.", "Robot arm must reach the commanded position.", "Feedback corrects errors caused by disturbances."], f: ["Control aim: make the output follow the reference despite disturbances"], vis: "Open-loop and closed-loop block diagrams stacked, each with an everyday example.",
    n: "A toaster runs for a fixed time regardless of the bread colour, which is open-loop. A thermostat measures the room and switches the compressor, which is closed-loop. Feedback lets the system correct itself when conditions change. This is the central idea of the whole course." },
  { kind: "content", t: "Open Loop and Closed Loop", fig: fOpenClosed, b: ["Open loop: output has no effect on control action.", "Closed loop: output is measured and fed back.", "Open loop: simple, cheap, but sensitive to disturbance.", "Closed loop: accurate, but more complex; can become unstable."], f: ["Closed loop:  e = r − b,   b = H·c", "r reference, c output, b feedback signal, e error"], vis: "Reuse the stacked block diagram, highlighting the feedback path in accent colour.",
    n: "Compare the two diagrams. The only difference is the feedback path and the summing junction. Open-loop systems are accurate only if the plant is well known and there is no disturbance. Closed-loop systems reduce the effect of disturbance and parameter changes, but poorly chosen feedback can cause oscillation, which we study under stability." },
  { kind: "content", t: "Components of a Control System", fig: fParts, b: ["Error detector: compares reference with feedback.", "Controller or amplifier: processes the error signal.", "Actuator: motor or valve that drives the plant.", "Plant: the process being controlled.", "Sensor: measures output, e.g. tachometer or synchro."], f: ["Examples: potentiometer, synchro pair, tachogenerator, DC servo motor"], vis: "Labelled single-row closed-loop diagram with sensor in the feedback path and a disturbance arrow.",
    n: "Walk through the chain from left to right. The error detector subtracts the measured value from the reference. The controller shapes the signal and the actuator supplies power to the plant. The sensor closes the loop. In the lab you will use a synchro pair as an error detector and a DC motor as the actuator." },
  { kind: "content", t: "Transfer Function", fig: fTF, b: ["Ratio of output to input in Laplace domain.", "Initial conditions are taken as zero.", "Valid for linear time-invariant systems.", "Roots of D(s) are poles; roots of N(s) are zeros."], f: ["G(s) = C(s)/R(s) = N(s)/D(s)", "D(s) = 0 is the characteristic equation of the system"], vis: "Block R(s) → N(s)/D(s) → C(s) on top; pole–zero map below with × and ○ symbols.",
    n: "The transfer function is the output over the input after taking Laplace transforms with zero initial conditions. It depends only on the system and not on the input signal. The poles decide how the system behaves in time, so we study their locations carefully. It is defined only for linear time-invariant systems." },
  { kind: "content", t: "Translational Mechanical Systems", fig: fMSD, b: ["Mass M: opposes acceleration, force = M·x″.", "Damper B: opposes velocity, force = B·x′.", "Spring K: opposes displacement, force = K·x.", "Apply Newton's law to the mass.", "Take the Laplace transform and divide."], f: ["M x″ + B x′ + K x = f(t)   →   X(s)/F(s) = 1/(M s² + B s + K)", "M kg, B N·s/m, K N/m, x m, f N"], vis: "Wall–spring–damper–mass sketch with force arrow f(t) and displacement x(t).",
    n: "Draw the free body diagram of the mass. The spring and damper forces act against the motion, and the applied force acts along it. Newton's law gives the second-order equation. After Laplace transform with zero initial conditions we get one over M s squared plus B s plus K. Notice the standard second-order form from the previous lecture." },
  { kind: "content", t: "Rotational Mechanical Systems", fig: fRot, b: ["Inertia J: torque = J·θ″.", "Viscous friction B: torque = B·θ′.", "Torsional spring K: torque = K·θ.", "Same steps: torque balance, Laplace, divide."], f: ["J θ″ + B θ′ + K θ = T(t)   →   Θ(s)/T(s) = 1/(J s² + B s + K)", "J kg·m², B N·m·s/rad, K N·m/rad, θ rad, T N·m"], vis: "Disk on a shaft with torsional spring, friction damper, torque arrow and angle θ.",
    n: "Rotational systems follow the same pattern with torque instead of force and angle instead of displacement. J plays the role of mass, B of viscous friction and K of the torsional spring. Use SI units throughout, for example kg·m² for inertia. A servo motor driving a load is the common example." },
  { kind: "content", t: "Electrical Systems", fig: fRLC, b: ["Resistor: v = R·i.", "Inductor: v = L·di/dt.", "Capacitor: v = (1/C)∫i dt.", "Apply KVL, then Laplace transform.", "Choose the output, e.g. voltage across C."], f: ["VC(s)/V(s) = 1/(L C s² + R C s + 1)", "R Ω, L H, C F, i A, v V"], vis: "Series R–L–C circuit with source v(t), current i(t) and output voltage vC marked across the capacitor.",
    n: "For the series RLC circuit, Kirchhoff's voltage law gives the sum of the three drops equal to the source. The current is C times the derivative of the capacitor voltage, so we can write everything in terms of vC. Taking the Laplace transform gives one over L C s squared plus R C s plus one. This is again a second-order system." },
  { kind: "content", t: "Analogous Systems", fig: fAnal, b: ["Same differential equation, different physical quantities.", "Force–voltage analogy: M↔L, B↔R, K↔1/C.", "Force–current analogy: M↔C, B↔1/R, K↔1/L.", "Lets us study a mechanical system with a circuit."], f: ["M x″ + B x′ + K x = f   ⇔   L q″ + R q′ + (1/C) q = v", "x ↔ q, ẋ ↔ i"], vis: "Two-column table of mechanical quantities and their electrical analogues connected by ↔ arrows.",
    n: "Compare the two differential equations term by term. Mass corresponds to inductance, damper to resistance and spring to the reciprocal of capacitance. This is the force–voltage analogy. The force–current analogy exists too, with a different mapping. The practical value is that a circuit is easy to build and measure." },
  { kind: "ex", t: "Solved Example 1: Mass–Spring–Damper", fig: fEx1, b: ["Given M = 2 kg, B = 4 N·s/m, K = 8 N/m. Find X(s)/F(s), ωn, ζ and final value for a 1 N step.", "1. X/F = 1/(2s² + 4s + 8).", "2. ωn = √(K/M) = √4 = 2 rad/s.", "3. ζ = B/(2√(KM)) = 4/(2√16) = 0.5.", "4. Final x = F/K = 1/8 = 0.125 m.", "5. Mp = e^(−π·0.5/√0.75) = 16.3 %; peak = 0.125 × 1.163 = 0.145 m."], f: ["Answer: ωn = 2 rad/s, ζ = 0.5 (underdamped), x(∞) = 0.125 m"], vis: "Left: numbered steps; right: displacement response to a 1 N step with final value and peak labelled.",
    n: "Write the transfer function first, then compare with the standard form by dividing numerator and denominator by M. The natural frequency is the square root of K over M and the damping ratio is B over twice the square root of K M. The final value theorem or simply F over K gives the steady displacement. Because zeta is 0.5 the response overshoots by about 16 per cent." },
  { kind: "ex", t: "Solved Example 2: Series RLC and Analogy", fig: fPoleEx, b: ["Given R = 2 Ω, L = 1 H, C = 0.25 F. Find VC/V, ωn, ζ and the mechanical analogue.", "1. VC/V = 1/(0.25s² + 0.5s + 1) = 4/(s² + 2s + 4).", "2. ωn = 2 rad/s.", "3. 2ζωn = 2, so ζ = 0.5.", "4. Poles: s = −1 ± j1.73.", "5. Analogue: M = L = 1 kg, B = R = 2 N·s/m, K = 1/C = 4 N/m."], f: ["Answer: ωn = 2 rad/s, ζ = 0.5; analogous M = 1 kg, B = 2, K = 4"], vis: "Left: steps; right: s-plane with the pole pair, ωn arc and values.",
    n: "Multiply out the denominator, L C is 0.25 and R C is 0.5, then divide by 0.25 to reach the standard form. The result has the same ωn and ζ as Example 1, which shows that two different physical systems can behave identically. Using the force–voltage analogy we read off mass, damper and spring values directly from L, R and one over C. Always check units when using the analogy." },
  B.mistakes(["Forgetting zero initial conditions in G(s).", "Using the wrong sign for the feedback summing junction.", "Mixing up the force–voltage and force–current analogies.", "Using grams or cm instead of SI units.", "Treating a nonlinear system as if G(s) exists."], ["Draw the free body diagram first.", "Write the equation, then Laplace transform.", "Compare with 1/(M s² + B s + K) to check.", "State units with every parameter."], "transfer functions"),
  B.summary(["Closed loop feeds the output back to reduce error.", "Components: error detector, controller, actuator, plant, sensor.", "G(s) = C(s)/R(s) with zero initial conditions.", "Mechanical: 1/(M s² + B s + K); same form for J, B, K.", "Series RLC: 1/(L C s² + R C s + 1); M↔L, B↔R, K↔1/C."], ["G(s) = N(s)/D(s): poles from D(s), zeros from N(s)"], fTF, "block diagram reduction and signal flow graphs", "transfer functions"),
  B.quiz([{ q: "A thermostat-controlled room heater is:", o: "(a) open loop  (b) closed loop  (c) nonlinear only  (d) digital only", a: "(b)" }, { q: "X(s)/F(s) for M, B, K system is:", o: "(a) 1/(Ms²+Bs+K)  (b) Ms²+Bs+K  (c) 1/(Ms+B)  (d) K/(Ms²+B)", a: "(a)" }, { q: "In the force–voltage analogy, mass corresponds to:", o: "(a) resistance  (b) capacitance  (c) inductance  (d) charge", a: "(c)" }, { q: "Poles of G(s) are the roots of:", o: "(a) numerator  (b) denominator  (c) input  (d) output", a: "(b)" }, { q: "For M = 2 kg, K = 8 N/m, ωn is:", o: "(a) 1 rad/s  (b) 2 rad/s  (c) 4 rad/s  (d) 16 rad/s", a: "(b)" }], "modelling"),
  B.refs([REF.nagrath, REF.ogata, REF.satya], "block diagram reduction and signal flow graphs (Mason's gain formula)", "modelling"),
]);
