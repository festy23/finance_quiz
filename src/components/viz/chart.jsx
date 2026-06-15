/* viz/chart.jsx — trading-chart visualizations. Uses TVChart (Lightweight Charts)
   plus custom SVG indicator panels. */
import React, { useState, useMemo } from 'react'
import { TVChart, anchorsToCloses, genCandles, volFromCandles } from '../charts.jsx'
import { VSlider } from './finance.jsx'

/* ---------- indicator math ---------- */
function smaSeries(c, p) {
  const out = Array(c.length).fill(null);
  for (let i = p - 1; i < c.length; i++) { let s = 0; for (let j = i - p + 1; j <= i; j++) s += c[j]; out[i] = s / p; }
  return out;
}
function emaSeries(c, p) {
  const out = Array(c.length).fill(null); const k = 2 / (p + 1);
  let prev; for (let i = 0; i < c.length; i++) {
    if (i < p - 1) continue;
    if (i === p - 1) { let s = 0; for (let j = 0; j < p; j++) s += c[j]; prev = s / p; out[i] = prev; }
    else { prev = c[i] * k + prev * (1 - k); out[i] = prev; }
  } return out;
}
function rsiSeries(c, p = 14) {
  const out = Array(c.length).fill(null); let g = 0, l = 0;
  for (let i = 1; i <= p; i++) { const d = c[i] - c[i - 1]; if (d >= 0) g += d; else l -= d; }
  let ag = g / p, al = l / p; out[p] = 100 - 100 / (1 + ag / (al || 1e-9));
  for (let i = p + 1; i < c.length; i++) {
    const d = c[i] - c[i - 1]; ag = (ag * (p - 1) + Math.max(d, 0)) / p; al = (al * (p - 1) + Math.max(-d, 0)) / p;
    out[i] = 100 - 100 / (1 + ag / (al || 1e-9));
  } return out;
}
function macdSeries(c) {
  const e12 = emaSeries(c, 12), e26 = emaSeries(c, 26);
  const macd = c.map((_, i) => (e12[i] != null && e26[i] != null) ? e12[i] - e26[i] : null);
  const valid = macd.filter((v) => v != null);
  const sig9 = emaSeries(valid, 9);
  const signal = Array(c.length).fill(null);
  let k = 0; for (let i = 0; i < c.length; i++) { if (macd[i] != null) { signal[i] = sig9[k] ?? null; k++; } }
  const hist = c.map((_, i) => (macd[i] != null && signal[i] != null) ? macd[i] - signal[i] : null);
  return { macd, signal, hist };
}
function lineData(candles, ser) { return candles.map((c, i) => ser[i] != null ? { time: c.time, value: +ser[i].toFixed(2) } : null).filter(Boolean); }

/* custom SVG sub-panel rendered below the price chart (index-based) */
export function SubPanel({ candles, kind, h = 96, reveal = true }) {
  const closes = candles.map((c) => c.close);
  const W = 600, pad = 4;
  const n = closes.length;
  const x = (i) => pad + (i / (n - 1)) * (W - pad * 2);
  if (kind === "rsi") {
    const r = rsiSeries(closes, 14);
    const y = (v) => pad + (1 - v / 100) * (h - pad * 2);
    const pts = r.map((v, i) => v != null ? `${x(i).toFixed(1)} ${y(v).toFixed(1)}` : null).filter(Boolean);
    const last = r[r.length - 1];
    return (
      <div className="viz" style={{ background: "var(--bg-1)" }}>
        <div className="viz-head" style={{ padding: "8px 12px" }}><span className="viz-title" style={{ fontSize: 11.5 }}>{reveal ? "RSI (14)" : "Индикатор"}</span>
          <span className="mono" style={{ fontSize: 12, color: last > 70 ? "var(--down)" : last < 30 ? "var(--ok)" : "var(--tx-2)" }}>{last?.toFixed(1)}</span></div>
        <svg viewBox={`0 0 ${W} ${h}`} width="100%" style={{ display: "block" }} preserveAspectRatio="none">
          <rect x="0" y={y(100)} width={W} height={y(70) - y(100)} fill="rgba(239,83,80,.08)" />
          <rect x="0" y={y(30)} width={W} height={y(0) - y(30)} fill="rgba(38,166,154,.08)" />
          <line x1="0" y1={y(70)} x2={W} y2={y(70)} stroke="rgba(239,83,80,.4)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1={y(30)} x2={W} y2={y(30)} stroke="rgba(38,166,154,.4)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1={y(50)} x2={W} y2={y(50)} stroke="rgba(255,255,255,.06)" strokeWidth="1" />
          <polyline points={pts.join(" ")} fill="none" stroke="var(--warn)" strokeWidth="1.6" />
        </svg>
      </div>
    );
  }
  // macd
  const { macd, signal, hist } = macdSeries(closes);
  const all = [...macd, ...signal, ...hist].filter((v) => v != null);
  const mx = Math.max(...all.map(Math.abs), 0.01);
  const y = (v) => h / 2 - (v / mx) * (h / 2 - pad);
  const bw = (W - pad * 2) / n * 0.7;
  const mpts = macd.map((v, i) => v != null ? `${x(i).toFixed(1)} ${y(v).toFixed(1)}` : null).filter(Boolean);
  const spts = signal.map((v, i) => v != null ? `${x(i).toFixed(1)} ${y(v).toFixed(1)}` : null).filter(Boolean);
  return (
    <div className="viz" style={{ background: "var(--bg-1)" }}>
      <div className="viz-head" style={{ padding: "8px 12px" }}><span className="viz-title" style={{ fontSize: 11.5 }}>{reveal ? "MACD (12, 26, 9)" : "Индикатор"}</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>{reveal ? "EMA12 − EMA26" : ""}</span></div>
      <svg viewBox={`0 0 ${W} ${h}`} width="100%" style={{ display: "block" }} preserveAspectRatio="none">
        <line x1="0" y1={h / 2} x2={W} y2={h / 2} stroke="rgba(255,255,255,.1)" strokeWidth="1" />
        {hist.map((v, i) => v != null ? <rect key={i} x={x(i) - bw / 2} y={Math.min(y(v), h / 2)} width={bw} height={Math.abs(y(v) - h / 2)} fill={v >= 0 ? "rgba(38,166,154,.55)" : "rgba(239,83,80,.55)"} /> : null)}
        <polyline points={mpts.join(" ")} fill="none" stroke="var(--ac)" strokeWidth="1.6" />
        <polyline points={spts.join(" ")} fill="none" stroke="var(--warn)" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

/* ============ 1. CANDLE ANATOMY ============ */
function CandleAnatomy() {
  const [o, setO] = useState(45);
  const [c, setC] = useState(62);
  const [hi, setHi] = useState(72);
  const [lo, setLo] = useState(38);
  const H = Math.max(hi, o, c), L = Math.min(lo, o, c);
  const up = c >= o;
  const W = 200, top = 12, bot = 188, sp = bot - top;
  const py = (v) => bot - ((v - L) / ((H - L) || 1)) * sp;
  const col = up ? "var(--up)" : "var(--down)";
  const bodyT = py(Math.max(o, c)), bodyB = py(Math.min(o, c));

  return (
    <div className="viz fade-in">
      <div className="viz-head">
        <span className="viz-title">Анатомия японской свечи</span>
        <span className="chip" style={{ background: up ? "var(--ok-dim)" : "var(--bad-dim)", color: up ? "var(--up)" : "var(--down)" }}>{up ? "бычья" : "медвежья"}</span>
      </div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
          <svg viewBox={`0 0 ${W} 200`} width="190" height="200">
            <line x1={W / 2} y1={py(H)} x2={W / 2} y2={bodyT} stroke={col} strokeWidth="2" />
            <line x1={W / 2} y1={bodyB} x2={W / 2} y2={py(L)} stroke={col} strokeWidth="2" />
            <rect x={W / 2 - 26} y={bodyT} width="52" height={Math.max(bodyB - bodyT, 2)} rx="2" fill={up ? col : "transparent"} stroke={col} strokeWidth="2" />
            {[["High", H, py(H)], ["Low", L, py(L)]].map(([t, v, yy]) => (
              <g key={t}><line x1={W / 2 + 28} y1={yy} x2={W / 2 + 52} y2={yy} stroke="#6b6b73" strokeWidth="1" strokeDasharray="3 2" />
                <text x={W / 2 + 56} y={yy + 3} fontSize="10" fill="#a1a1aa" fontFamily="var(--fm)">{t} {v}</text></g>
            ))}
            {[["Open", o, py(o)], ["Close", c, py(c)]].map(([t, v, yy]) => (
              <g key={t}><line x1={W / 2 - 28} y1={yy} x2={W / 2 - 52} y2={yy} stroke="#6b6b73" strokeWidth="1" strokeDasharray="3 2" />
                <text x={W / 2 - 56} y={yy + 3} fontSize="10" fill="#a1a1aa" fontFamily="var(--fm)" textAnchor="end">{t} {v}</text></g>
            ))}
          </svg>
        </div>
        <div style={{ fontSize: 12, color: "var(--tx-2)", textAlign: "center" }}>Тело = |Open − Close| = <b className="mono">{Math.abs(c - o)}</b> · тени показывают экстремумы периода</div>
      </div>
      <div style={{ borderTop: "1px solid var(--border)", padding: "14px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <VSlider label="Open" value={o} min={30} max={75} onChange={setO} accent="var(--tx-2)" />
          <VSlider label="Close" value={c} min={30} max={75} onChange={setC} accent={col} />
          <VSlider label="High" value={hi} min={Math.max(o, c)} max={85} onChange={setHi} accent="var(--up)" />
          <VSlider label="Low" value={lo} min={20} max={Math.min(o, c)} onChange={setLo} accent="var(--down)" />
        </div>
      </div>
    </div>
  );
}

/* ============ 2. SUPPORT / RESISTANCE ============ */
function SR() {
  const [broke, setBroke] = useState(false);
  const sup = 100;
  const anchors = broke
    ? [[0, 118], [.2, 102], [.35, 116], [.5, 101], [.62, 112], [.72, 99], [.85, 90], [1, 94]]
    : [[0, 118], [.18, 101], [.34, 116], [.5, 100.5], [.66, 117], [.82, 101], [1, 114]];
  const closes = anchorsToCloses(anchors, 60, 1.6, 9);
  const candles = genCandles(closes, { seed: 14 });
  const breakIdx = Math.floor(60 * .78);
  return (
    <div className="viz fade-in">
      <div className="viz-head">
        <span className="viz-title">Поддержка → сопротивление</span>
        <div className="seg"><button className={!broke ? "on" : ""} onClick={() => setBroke(false)}>отскоки</button><button className={broke ? "on" : ""} onClick={() => setBroke(true)}>пробой</button></div>
      </div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={230} volume
          priceLines={[{ price: sup, color: broke ? "#ef5350" : "#26a69a", dashed: false, title: broke ? "сопротивление" : "поддержка" }]}
          markers={broke ? [{ time: candles[breakIdx].time, position: "aboveBar", color: "#ef5350", shape: "arrowDown", text: "пробой" }] : []} />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>
          {broke ? "После уверенного пробоя вниз бывшая поддержка работает как сопротивление — продавцы стремятся выйти в безубыток." : "Цена трижды отскакивает от уровня — чем больше касаний и объём, тем значимее уровень."}
        </div>
      </div>
    </div>
  );
}

/* ============ 3. HEAD & SHOULDERS ============ */
function HS() {
  const [show, setShow] = useState(true);
  const anchors = [[0, 90], [.12, 108], [.2, 98], [.32, 122], [.42, 99], [.55, 110], [.66, 98], [.78, 88], [1, 78]];
  const closes = anchorsToCloses(anchors, 64, 1.1, 5);
  const candles = genCandles(closes, { seed: 21 });
  const neck = 98;
  const breakIdx = Math.floor(64 * .70);
  return (
    <div className="viz fade-in">
      <div className="viz-head">
        <span className="viz-title">Разворот «голова и плечи»</span>
        <button className="btn btn-sec" style={{ height: 28, padding: "0 12px", fontSize: 12 }} onClick={() => setShow((s) => !s)}>{show ? "скрыть разметку" : "показать разметку"}</button>
      </div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={250}
          priceLines={show ? [{ price: neck, color: "#787b86", dashed: true, title: "линия шеи" }, { price: neck - 24, color: "#ef5350", dashed: true, title: "цель" }] : []}
          markers={show ? [
            { time: candles[8].time, position: "aboveBar", color: "#a1a1aa", shape: "circle", text: "ЛП" },
            { time: candles[20].time, position: "aboveBar", color: "#2962ff", shape: "circle", text: "голова" },
            { time: candles[36].time, position: "aboveBar", color: "#a1a1aa", shape: "circle", text: "ПП" },
            { time: candles[breakIdx].time, position: "belowBar", color: "#ef5350", shape: "arrowDown", text: "пробой шеи" },
          ] : []} />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>Сигнал — только после пробоя линии шеи вниз с ростом объёма. Цель = высота от головы до шеи, отложенная вниз от пробоя.</div>
      </div>
    </div>
  );
}

/* ============ 4. TRIANGLE ============ */
function Triangle() {
  const [dir, setDir] = useState("up");
  const base = [[0, 80], [.14, 118], [.28, 92], [.4, 112], [.52, 98], [.62, 108], [.72, 103]];
  const tail = dir === "up" ? [[.8, 116], [1, 134]] : [[.8, 92], [1, 74]];
  const closes = anchorsToCloses([...base, ...tail], 60, 1.0, 8);
  const candles = genCandles(closes, { seed: 33 });
  // converging trendlines
  const n = candles.length;
  const t0 = candles[0].time, tEnd = candles[Math.floor(n * .72)].time;
  const upper = [{ time: t0, value: 120 }, { time: tEnd, value: 106 }];
  const lower = [{ time: t0, value: 78 }, { time: tEnd, value: 100 }];
  return (
    <div className="viz fade-in">
      <div className="viz-head">
        <span className="viz-title">Треугольник — консолидация и пробой</span>
        <div className="seg"><button className={dir === "up" ? "on" : ""} onClick={() => setDir("up")}>пробой ↑</button><button className={dir === "down" ? "on" : ""} onClick={() => setDir("down")}>пробой ↓</button></div>
      </div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={240} volume
          lines={[{ data: upper, color: "#787b86", width: 1.4, dashed: true }, { data: lower, color: "#787b86", width: 1.4, dashed: true }]}
          markers={[{ time: candles[Math.floor(n * .76)].time, position: dir === "up" ? "belowBar" : "aboveBar", color: dir === "up" ? "#26a69a" : "#ef5350", shape: dir === "up" ? "arrowUp" : "arrowDown", text: "пробой" }]} />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>Колебания сужаются, объём внутри падает. Направление подтверждает <b>пробой границы</b>, а не вид фигуры. Цель = высота основания.</div>
      </div>
    </div>
  );
}

/* ============ 5. MOVING AVERAGES — golden / death cross ============ */
function MA() {
  const [pf, setPf] = useState(10);
  const [ps, setPs] = useState(30);
  const anchors = [[0, 80], [.25, 70], [.45, 92], [.6, 86], [.78, 120], [1, 138]];
  const closes = anchorsToCloses(anchors, 90, 1.4, 12);
  const candles = genCandles(closes, { seed: 41 });
  const fast = smaSeries(closes, pf), slow = smaSeries(closes, ps);
  const markers = [];
  for (let i = 1; i < closes.length; i++) {
    if (fast[i] == null || slow[i] == null || fast[i - 1] == null || slow[i - 1] == null) continue;
    if (fast[i - 1] <= slow[i - 1] && fast[i] > slow[i]) markers.push({ time: candles[i].time, position: "belowBar", color: "#26a69a", shape: "arrowUp", text: "golden" });
    if (fast[i - 1] >= slow[i - 1] && fast[i] < slow[i]) markers.push({ time: candles[i].time, position: "aboveBar", color: "#ef5350", shape: "arrowDown", text: "death" });
  }

  return (
    <div className="viz fade-in">
      <div className="viz-head"><span className="viz-title">Скользящие средние · золотой / мёртвый крест</span></div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={250}
          lines={[{ data: lineData(candles, fast), color: "#2962ff", width: 2 }, { data: lineData(candles, slow), color: "#f59e0b", width: 2 }]}
          markers={markers} />
        <div style={{ display: "flex", gap: 18, justifyContent: "center", fontSize: 12 }}>
          <span style={{ color: "var(--ac)" }}>● SMA {pf}</span><span style={{ color: "var(--warn)" }}>● SMA {ps}</span>
          <span style={{ color: "var(--tx-3)" }}>короткая выше длинной снизу вверх → покупка</span>
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--border)", padding: "14px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <VSlider label="Короткая SMA" value={pf} min={5} max={25} onChange={(v) => setPf(Math.min(v, ps - 1))} accent="var(--ac)" />
          <VSlider label="Длинная SMA" value={ps} min={20} max={60} onChange={(v) => setPs(Math.max(v, pf + 1))} accent="var(--warn)" />
        </div>
      </div>
    </div>
  );
}

/* ============ 6. MACD ============ */
function MACDViz() {
  const anchors = [[0, 90], [.2, 110], [.35, 96], [.5, 124], [.66, 104], [.82, 130], [1, 112]];
  const closes = anchorsToCloses(anchors, 80, 1.3, 17);
  const candles = genCandles(closes, { seed: 51 });
  return (
    <div className="viz fade-in">
      <div className="viz-head"><span className="viz-title">MACD — схождение/расхождение средних</span></div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={190} />
        <SubPanel candles={candles} kind="macd" />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>MACD = EMA(12) − EMA(26); сигнальная = EMA(9). Сигналы: пересечение линий, переход нуля, дивергенция. Минус — запаздывание в боковике.</div>
      </div>
    </div>
  );
}

/* ============ 7. RSI ============ */
function RSIViz() {
  const anchors = [[0, 80], [.2, 128], [.34, 112], [.5, 70], [.66, 96], [.82, 132], [1, 120]];
  const closes = anchorsToCloses(anchors, 80, 1.2, 27);
  const candles = genCandles(closes, { seed: 61 });
  return (
    <div className="viz fade-in">
      <div className="viz-head"><span className="viz-title">RSI — индекс относительной силы</span></div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={180} />
        <SubPanel candles={candles} kind="rsi" />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>RSI &gt; 70 — перекупленность, &lt; 30 — перепроданность. В сильном тренде задерживается в крайних зонах — не сигнал к немедленной сделке.</div>
      </div>
    </div>
  );
}

/* ============ 8. DOUBLE TOP ============ */
function DoubleTop() {
  const anchors = [[0, 80], [.18, 116], [.32, 100], [.5, 116], [.68, 101], [.82, 91], [1, 82]];
  const candles = genCandles(anchorsToCloses(anchors, 60, 1.2, 18), { seed: 24 });
  const bi = Math.floor(60 * .8);
  return (
    <div className="viz fade-in">
      <div className="viz-head"><span className="viz-title">Двойная вершина</span></div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={240} volume
          priceLines={[{ price: 100, color: "#787b86", dashed: true, title: "линия шеи" }]}
          markers={[
            { time: candles[11].time, position: "aboveBar", color: "#2962ff", shape: "circle", text: "вершина 1" },
            { time: candles[30].time, position: "aboveBar", color: "#2962ff", shape: "circle", text: "вершина 2" },
            { time: candles[bi].time, position: "belowBar", color: "#ef5350", shape: "arrowDown", text: "пробой" },
          ]} />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>Две вершины на одном уровне — ещё не сигнал. Сигнал появляется после <b>пробоя минимума между вершинами</b>. Цель = высота фигуры от точки пробоя.</div>
      </div>
    </div>
  );
}

/* ============ 9. TRIPLE TOP ============ */
function TripleTop() {
  const anchors = [[0, 82], [.13, 114], [.23, 100], [.4, 114], [.5, 100], [.66, 114], [.78, 99], [.9, 90], [1, 84]];
  const candles = genCandles(anchorsToCloses(anchors, 66, 1.1, 19), { seed: 27 });
  const bi = Math.floor(66 * .83);
  return (
    <div className="viz fade-in">
      <div className="viz-head"><span className="viz-title">Тройная вершина</span></div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={240} volume
          priceLines={[{ price: 100, color: "#787b86", dashed: true, title: "поддержка" }]}
          markers={[
            { time: candles[9].time, position: "aboveBar", color: "#2962ff", shape: "circle", text: "1" },
            { time: candles[26].time, position: "aboveBar", color: "#2962ff", shape: "circle", text: "2" },
            { time: candles[43].time, position: "aboveBar", color: "#2962ff", shape: "circle", text: "3" },
            { time: candles[bi].time, position: "belowBar", color: "#ef5350", shape: "arrowDown", text: "пробой" },
          ]} />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>Три пика на одном уровне: покупатели трижды не прошли сопротивление. Сигнал — <b>пробой поддержки</b> под промежуточными спадами. Надёжнее двойной, но формируется дольше.</div>
      </div>
    </div>
  );
}

/* ============ 10. RECTANGLE ============ */
function Rectangle() {
  const anchors = [[0, 90], [.12, 112], [.24, 92], [.38, 112], [.5, 92], [.64, 112], [.76, 92], [.88, 112], [1, 130]];
  const candles = genCandles(anchorsToCloses(anchors, 64, 0.9, 31), { seed: 36 });
  const bi = Math.floor(64 * .9);
  return (
    <div className="viz fade-in">
      <div className="viz-head"><span className="viz-title">Прямоугольник (боковой диапазон)</span></div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={240} volume
          priceLines={[{ price: 113, color: "#ef5350", dashed: true, title: "сопротивление" }, { price: 91, color: "#26a69a", dashed: true, title: "поддержка" }]}
          markers={[{ time: candles[bi].time, position: "belowBar", color: "#26a69a", shape: "arrowUp", text: "пробой" }]} />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>Цена ходит между поддержкой и сопротивлением (флэт). Сигнал — <b>пробой границы</b>; цель = высота прямоугольника от точки пробоя.</div>
      </div>
    </div>
  );
}

/* ============ 11. FLAG ============ */
function Flag() {
  const anchors = [[0, 70], [.28, 126], [.4, 116], [.5, 121], [.6, 112], [.72, 117], [.8, 110], [.9, 132], [1, 146]];
  const candles = genCandles(anchorsToCloses(anchors, 64, 0.8, 44), { seed: 47 });
  const n = candles.length;
  const fa = candles[Math.floor(n * .3)].time, fb = candles[Math.floor(n * .8)].time;
  return (
    <div className="viz fade-in">
      <div className="viz-head"><span className="viz-title">Флаг — пауза в тренде</span></div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={240} volume
          lines={[{ data: [{ time: fa, value: 124 }, { time: fb, value: 113 }], color: "#787b86", width: 1.4, dashed: true }, { data: [{ time: fa, value: 114 }, { time: fb, value: 105 }], color: "#787b86", width: 1.4, dashed: true }]}
          markers={[
            { time: candles[Math.floor(n * .14)].time, position: "belowBar", color: "#26a69a", shape: "arrowUp", text: "древко" },
            { time: candles[Math.floor(n * .86)].time, position: "belowBar", color: "#26a69a", shape: "arrowUp", text: "пробой" },
          ]} />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>Сильный импульс (древко) → короткая наклонная пауза против движения → продолжение тренда. Цель оценивают по <b>длине древка</b>.</div>
      </div>
    </div>
  );
}

/* ============ 12. WEDGE ============ */
function Wedge() {
  const anchors = [[0, 80], [.14, 102], [.26, 92], [.4, 110], [.52, 101], [.64, 116], [.74, 109], [.84, 101], [1, 84]];
  const candles = genCandles(anchorsToCloses(anchors, 62, 0.9, 52), { seed: 53 });
  const n = candles.length;
  const a = candles[0].time, b = candles[Math.floor(n * .8)].time;
  return (
    <div className="viz fade-in">
      <div className="viz-head"><span className="viz-title">Восходящий клин (медвежий)</span></div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={240} volume
          lines={[{ data: [{ time: a, value: 104 }, { time: b, value: 120 }], color: "#787b86", width: 1.4, dashed: true }, { data: [{ time: a, value: 86 }, { time: b, value: 110 }], color: "#787b86", width: 1.4, dashed: true }]}
          markers={[{ time: candles[Math.floor(n * .86)].time, position: "aboveBar", color: "#ef5350", shape: "arrowDown", text: "пробой ↓" }]} />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>Обе линии направлены вверх, но рост слабеет. Восходящий клин — чаще <b>медвежий</b>: пробой обычно вниз, против наклона. Важен контекст тренда и объёма.</div>
      </div>
    </div>
  );
}

/* ============ 13. SAUCER ============ */
function Saucer() {
  const anchors = [[0, 120], [.16, 104], [.32, 94], [.46, 89], [.56, 88], [.7, 93], [.84, 104], [1, 120]];
  const candles = genCandles(anchorsToCloses(anchors, 70, 0.6, 63), { seed: 59 });
  return (
    <div className="viz fade-in">
      <div className="viz-head"><span className="viz-title">Блюдце (закруглённое основание)</span></div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={240} volume />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>Плавный разворот: цена медленно перестаёт падать, волатильность и объём минимальны в середине и растут на выходе. Резкого сигнала, как пробой шеи, нет — постепенное накопление.</div>
      </div>
    </div>
  );
}

/* ============ 14. SPIKE ============ */
function Spike() {
  const anchors = [[0, 120], [.32, 116], [.44, 84], [.5, 78], [.58, 114], [.78, 120], [1, 124]];
  const candles = genCandles(anchorsToCloses(anchors, 60, 1.0, 71), { seed: 67 });
  const lo = Math.floor(60 * .5);
  return (
    <div className="viz fade-in">
      <div className="viz-head"><span className="viz-title">Шип (V-образный разворот)</span></div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TVChart candles={candles} height={240} volume
          markers={[{ time: candles[lo].time, position: "belowBar", color: "#26a69a", shape: "arrowUp", text: "разворот" }]} />
        <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>Резкий V-образный разворот без зоны консолидации — часто на панике, эйфории или капитуляции. Формируется быстро, поэтому заранее распознаётся плохо.</div>
      </div>
    </div>
  );
}

export const VIZ_CHART = {
  candle: CandleAnatomy,
  supportresistance: SR,
  headshoulders: HS,
  triangle: Triangle,
  movingavg: MA,
  macd: MACDViz,
  rsi: RSIViz,
  doubletop: DoubleTop,
  tripletop: TripleTop,
  rectangle: Rectangle,
  flag: Flag,
  wedge: Wedge,
  saucer: Saucer,
  spike: Spike,
}
