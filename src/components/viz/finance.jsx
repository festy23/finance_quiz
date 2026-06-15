/* viz/finance.jsx — interactive concept visualizations for finance/fundamental blocks. */
import React, { useState, useMemo } from 'react'
import { I } from '../ui.jsx'
import { pct1, money } from '../../lib/format.js'

/* ---------- shared viz UI ---------- */
export function VSlider({ label, value, min, max, step = 1, onChange, fmt, accent = "var(--ac)" }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12.5, color: "var(--tx-2)", fontWeight: 500 }}>{label}</span>
        <span className="mono" style={{ fontSize: 13.5, color: accent, fontWeight: 600 }}>{fmt ? fmt(value) : value}</span>
      </div>
      <input className="rng" type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ background: `linear-gradient(90deg, ${accent} ${pct}%, var(--panel-3) ${pct}%)` }} />
    </div>
  );
}
function VStat({ label, value, color = "var(--tx)", sub, small }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="mono" style={{ fontSize: small ? 15 : 19, fontWeight: 600, color, letterSpacing: "-.02em", lineHeight: 1.05, overflowWrap: "anywhere" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--tx-3)", marginTop: 5 }}>{label}{sub && <span> · {sub}</span>}</div>
    </div>
  );
}
function VizFrame({ title, badge, children, controls }) {
  return (
    <div className="viz fade-in">
      <div className="viz-head">
        <span className="viz-title"><I.spark size={14} />{title}</span>
        {badge}
      </div>
      <div className="viz-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
      {controls && <div style={{ borderTop: "1px solid var(--border)", padding: "14px", display: "flex", flexDirection: "column", gap: 14 }}>{controls}</div>}
    </div>
  );
}

/* small horizontal stacked-bar */
function StackBar({ segs, h = 40, total }) {
  const sum = total || segs.reduce((a, s) => a + s.v, 0);
  return (
    <div style={{ display: "flex", height: h, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
      {segs.map((s, i) => (
        <div key={i} title={s.label} style={{
          width: `${(s.v / sum) * 100}%`, background: s.c, display: "grid", placeItems: "center",
          transition: "width .5s cubic-bezier(.4,0,.2,1)", borderRight: i < segs.length - 1 ? "1px solid rgba(0,0,0,.3)" : "none",
        }}>
          {(s.v / sum) > 0.12 && <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: s.tc || "#0a0a0a" }}>{s.label}</span>}
        </div>
      ))}
    </div>
  );
}

/* ============ 1. LIQUIDITY SPECTRUM ============ */
function Liquidity() {
  const assets = [
    { n: "Наличные / счёт", liq: 100, days: "мгновенно", disc: 0 },
    { n: "Гособлигации", liq: 88, days: "1 день", disc: 0.5 },
    { n: "Голубые фишки", liq: 80, days: "1–2 дня", disc: 1 },
    { n: "Корп. облигации", liq: 60, days: "дни", disc: 2 },
    { n: "Акции 2-го эшелона", liq: 45, days: "недели", disc: 6 },
    { n: "Недвижимость", liq: 18, days: "месяцы", disc: 12 },
    { n: "Доля в бизнесе", liq: 8, days: "от полугода", disc: 25 },
  ];
  const [sel, setSel] = useState(0);
  const a = assets[sel];
  return (
    <VizFrame title="Спектр ликвидности активов" badge={<span className="chip" style={{ background: "var(--ok-dim)", color: "var(--ok)" }}>{a.days}</span>}>
      <div style={{ position: "relative", padding: "26px 4px 8px" }}>
        <div style={{ height: 6, borderRadius: 6, background: "linear-gradient(90deg,var(--down),var(--warn),var(--ok))" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--tx-3)", marginTop: 6 }}>
          <span>низкая ликвидность</span><span>высокая</span>
        </div>
        {assets.map((x, i) => (
          <button key={i} onClick={() => setSel(i)} title={x.n} style={{
            position: "absolute", top: 19, left: `calc(${x.liq}% - 8px)`,
            width: i === sel ? 18 : 13, height: i === sel ? 18 : 13, borderRadius: "50%",
            background: i === sel ? "var(--ac)" : "var(--panel)", border: `2px solid ${i === sel ? "#fff" : "var(--border-strong)"}`,
            transition: ".15s", cursor: "pointer", boxShadow: i === sel ? "0 2px 10px rgba(41,98,255,.6)" : "none",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {assets.map((x, i) => (
          <button key={i} onClick={() => setSel(i)} className="chip" style={{
            cursor: "pointer", height: 28, background: i === sel ? "var(--ac-dim)" : "var(--panel-2)",
            color: i === sel ? "var(--ac-hi)" : "var(--tx-2)", border: `1px solid ${i === sel ? "var(--ac-line)" : "var(--border)"}`,
          }}>{x.n}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, background: "var(--panel-2)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)" }}>
        <VStat label="Срок продажи" value={a.days} color="var(--tx)" small />
        <VStat label="Потеря стоимости" value={a.disc === 0 ? "0%" : "≈" + a.disc + "%"} color={a.disc > 8 ? "var(--down)" : a.disc > 0 ? "var(--warn)" : "var(--ok)"} small />
        <VStat label="Ликвидность" value={a.liq + "/100"} color="var(--ac)" small />
      </div>
    </VizFrame>
  );
}

/* ============ 2. FISHER REAL RETURN ============ */
function Fisher() {
  const [nom, setNom] = useState(12);
  const [inf, setInf] = useState(9);
  const real = ((1 + nom / 100) / (1 + inf / 100) - 1) * 100;
  const approx = nom - inf;
  return (
    <VizFrame title="Реальная доходность · формула Фишера"
      controls={<>
        <VSlider label="Номинальная ставка" value={nom} min={0} max={30} step={0.5} onChange={setNom} fmt={(v) => v + "%"} accent="var(--ac)" />
        <VSlider label="Инфляция" value={inf} min={0} max={25} step={0.5} onChange={setInf} fmt={(v) => v + "%"} accent="var(--warn)" />
      </>}>
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ fontSize: 12, color: "var(--tx-3)", marginBottom: 6 }}>Реальная доходность</div>
        <div className="mono" style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-.03em", color: real >= 0 ? "var(--ok)" : "var(--down)" }}>{pct1(real)}</div>
        <div style={{ fontSize: 12, color: "var(--tx-3)", marginTop: 8, fontFamily: "var(--fm)" }}>(1+{(nom / 100).toFixed(2)}) ÷ (1+{(inf / 100).toFixed(2)}) − 1</div>
      </div>
      <StackBar h={34} total={Math.max(nom, inf, 1)} segs={[
        { v: Math.min(nom, inf), c: "var(--warn)", label: "съедено инфляцией", tc: "#0a0a0a" },
        { v: Math.max(real / 100 * (1 + inf / 100) * 100, 0.0001) >= 0 && real >= 0 ? nom - inf : 0, c: "var(--ok)", label: "реальный рост", tc: "#0a0a0a" },
      ]} />
      <div style={{ display: "flex", gap: 14, background: "var(--panel-2)", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--border)" }}>
        <VStat label="Точно (Фишер)" value={pct1(real)} color={real >= 0 ? "var(--ok)" : "var(--down)"} />
        <VStat label="Грубо (n − i)" value={pct1(approx)} color="var(--tx-2)" />
        <VStat label="Погрешность" value={pct1(approx - real)} color="var(--tx-3)" />
      </div>
    </VizFrame>
  );
}

/* ============ 3. BALANCE EQUATION ============ */
function Balance() {
  const [assets, setA] = useState(140);
  const [liab, setL] = useState(85);
  const equity = assets - liab;
  return (
    <VizFrame title="Балансовое уравнение"
      controls={<>
        <VSlider label="Активы" value={assets} min={20} max={200} step={5} onChange={(v) => setA(v)} fmt={money} accent="var(--ac)" />
        <VSlider label="Обязательства" value={liab} min={0} max={assets} step={5} onChange={setL} fmt={money} accent="var(--down)" />
      </>}>
      <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--tx-3)", marginBottom: 6, textAlign: "center" }}>АКТИВЫ</div>
          <div style={{ height: 150, borderRadius: 10, border: "1px solid var(--ac-line)", background: "var(--ac-dim)", display: "grid", placeItems: "center" }}>
            <span className="mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--ac-hi)" }}>{money(assets)}</span>
          </div>
        </div>
        <div style={{ display: "grid", placeItems: "center", fontSize: 26, color: "var(--tx-3)", fontWeight: 300 }}>=</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 11, color: "var(--tx-3)", marginBottom: 6, textAlign: "center" }}>ПАССИВЫ</div>
          <div style={{ display: "flex", flexDirection: "column", height: 150, gap: 4 }}>
            <div style={{ flex: liab || 0.01, borderRadius: "10px 10px 4px 4px", border: "1px solid var(--bad)", background: "var(--bad-dim)", display: "grid", placeItems: "center", minHeight: 24 }}>
              <span className="mono" style={{ fontSize: 13, color: "var(--down)" }}>Долг {money(liab)}</span>
            </div>
            <div style={{ flex: Math.max(equity, 0.01), borderRadius: "4px 4px 10px 10px", border: "1px solid var(--ok)", background: "var(--ok-dim)", display: "grid", placeItems: "center", minHeight: 24 }}>
              <span className="mono" style={{ fontSize: 13, color: "var(--ok)" }}>Капитал {money(equity)}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", fontFamily: "var(--fm)", fontSize: 13, color: "var(--tx-2)" }}>
        Капитал = Активы − Обязательства = <b style={{ color: "var(--ok)" }}>{money(equity)}</b>
      </div>
    </VizFrame>
  );
}

/* ============ 4. CASH FLOW STATEMENT ============ */
function CashFlow() {
  const [op, setOp] = useState(120);
  const [inv, setInv] = useState(-70);
  const [fin, setFin] = useState(-20);
  const start = 50;
  const net = op + inv + fin;
  const end = start + net;
  const cum = [start, start + op, start + op + inv, end];
  const bars = [
    { l: "Начало", from: 0, to: start, v: start, c: "var(--tx-3)", total: true },
    { l: "Операц.", from: cum[0], to: cum[1], v: op, c: "var(--ok)" },
    { l: "Инвест.", from: cum[1], to: cum[2], v: inv, c: "var(--ac)" },
    { l: "Финанс.", from: cum[2], to: cum[3], v: fin, c: "var(--purple)" },
    { l: "Конец", from: 0, to: end, v: end, c: end >= start ? "var(--ok)" : "var(--down)", total: true },
  ];
  // домен учитывает 0, итоги и ВСЕ промежуточные суммы → бары всегда внутри
  const domVals = [0, start, end, ...cum];
  let domLo = Math.min(...domVals), domHi = Math.max(...domVals);
  const span = (domHi - domLo) || 100; domHi += span * 0.14; domLo -= span * 0.06;
  const SW = 320, SH = 150, padT = 16, padB = 22, padX = 6;
  const yFor = (v) => padT + ((domHi - v) / (domHi - domLo)) * (SH - padT - padB);
  const colW = (SW - padX * 2) / bars.length;
  return (
    <VizFrame title="Отчёт о движении денег (ОДДС)"
      controls={<>
        <VSlider label="Операционная деятельность" value={op} min={-100} max={200} step={10} onChange={setOp} fmt={money} accent="var(--ok)" />
        <VSlider label="Инвестиционная деятельность" value={inv} min={-200} max={100} step={10} onChange={setInv} fmt={money} accent="var(--ac)" />
        <VSlider label="Финансовая деятельность" value={fin} min={-150} max={150} step={10} onChange={setFin} fmt={money} accent="var(--purple)" />
      </>}>
      <svg viewBox={`0 0 ${SW} ${SH}`} width="100%" style={{ display: "block" }}>
        <line x1={padX} y1={yFor(0)} x2={SW - padX} y2={yFor(0)} stroke="var(--border-strong)" strokeWidth="1" />
        {bars.map((b, i) => {
          const x = padX + i * colW + colW * 0.2, w = colW * 0.6;
          const yT = Math.min(yFor(b.from), yFor(b.to));
          const h = Math.max(Math.abs(yFor(b.from) - yFor(b.to)), 3);
          return (
            <g key={i}>
              <rect x={x} y={yT} width={w} height={h} rx="3" fill={b.c} opacity={b.total ? 1 : 0.9} />
              <text x={x + w / 2} y={yT - 5} fontSize="10" fontWeight="600" fill={b.c} textAnchor="middle" fontFamily="var(--fm)">{b.total ? "" : b.v < 0 ? "−" : "+"}{money(Math.abs(b.v))}</text>
              <text x={x + w / 2} y={SH - 7} fontSize="9.5" fill="var(--tx-3)" textAnchor="middle">{b.l}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--tx-2)" }}>
        Чистый поток <b className="mono" style={{ color: net >= 0 ? "var(--ok)" : "var(--down)" }}>{net >= 0 ? "+" : "−"}{money(Math.abs(net))}</b> · смысл: прибыль есть, а денег может не быть
      </div>
    </VizFrame>
  );
}

/* ============ 5. DCF VALUATION ============ */
function DCF() {
  const [wacc, setWacc] = useState(10);
  const [g, setG] = useState(3);
  const [debt, setDebt] = useState(60);
  const fcf0 = 100, years = 5, gExpl = 6;
  const w = wacc / 100, gt = Math.min(g, wacc - 1) / 100;
  const flows = [];
  for (let i = 1; i <= years; i++) flows.push(fcf0 * Math.pow(1 + gExpl / 100, i));
  const pvs = flows.map((f, i) => f / Math.pow(1 + w, i + 1));
  const tv = (flows[years - 1] * (1 + gt)) / (w - gt);
  const pvTv = tv / Math.pow(1 + w, years);
  const ev = pvs.reduce((a, b) => a + b, 0) + pvTv;
  const equity = ev - debt;
  const mx = Math.max(...pvs, pvTv) * 1.1;
  return (
    <VizFrame title="DCF — дисконтированные денежные потоки" badge={<span className="chip" style={{ background: "var(--ac-dim)", color: "var(--ac-hi)" }}>WACC {wacc}%</span>}
      controls={<>
        <VSlider label="Ставка дисконтирования (WACC)" value={wacc} min={5} max={18} step={0.5} onChange={setWacc} fmt={(v) => v + "%"} accent="var(--ac)" />
        <VSlider label="Темп роста в терминальном периоде g" value={g} min={0} max={8} step={0.5} onChange={setG} fmt={(v) => v + "%"} accent="var(--warn)" />
        <VSlider label="Чистый долг" value={debt} min={0} max={300} step={10} onChange={setDebt} fmt={money} accent="var(--down)" />
      </>}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 130 }}>
        {pvs.map((p, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--tx-3)" }}>{money(p)}</span>
            <div style={{ width: "75%", height: `${(p / mx) * 100}%`, background: "var(--ac)", borderRadius: "4px 4px 0 0", transition: ".4s" }} />
            <span style={{ fontSize: 9.5, color: "var(--tx-3)" }}>Y{i + 1}</span>
          </div>
        ))}
        <div style={{ flex: 1.4, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--warn)" }}>{money(pvTv)}</span>
          <div style={{ width: "80%", height: `${(pvTv / mx) * 100}%`, background: "var(--warn)", borderRadius: "4px 4px 0 0", transition: ".4s" }} />
          <span style={{ fontSize: 9.5, color: "var(--warn)" }}>TV</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, background: "var(--panel-2)", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--border)" }}>
        <VStat label="Enterprise Value" value={money(ev)} color="var(--ac-hi)" />
        <VStat label="− Чистый долг" value={money(debt)} color="var(--down)" />
        <VStat label="= Equity value" value={money(equity)} color="var(--ok)" />
      </div>
      <div style={{ fontSize: 11.5, color: "var(--tx-3)", textAlign: "center" }}>Модель крайне чувствительна к WACC и g: при g→WACC терминальная стоимость улетает в бесконечность</div>
    </VizFrame>
  );
}

/* ============ 6. EV vs EQUITY MULTIPLES ============ */
function Multiples() {
  const [cap, setCap] = useState(800);
  const [debt, setDebt] = useState(300);
  const [cash, setCash] = useState(120);
  const ebitda = 150, earnings = 80;
  const ev = cap + debt - cash;
  return (
    <VizFrame title="Мост от капитализации к Enterprise Value"
      controls={<>
        <VSlider label="Рыночная капитализация" value={cap} min={200} max={2000} step={50} onChange={setCap} fmt={money} accent="var(--ac)" />
        <VSlider label="Долг" value={debt} min={0} max={1000} step={50} onChange={setDebt} fmt={money} accent="var(--down)" />
        <VSlider label="Денежные средства" value={cash} min={0} max={600} step={20} onChange={setCash} fmt={money} accent="var(--ok)" />
      </>}>
      <StackBar h={42} total={cap + debt} segs={[
        { v: cap, c: "var(--ac)", label: "Cap " + money(cap), tc: "#fff" },
        { v: debt, c: "var(--down)", label: "+Долг", tc: "#fff" },
      ]} />
      <div style={{ textAlign: "center", fontSize: 12, color: "var(--tx-3)" }}>− денежные средства {money(cash)} ↓</div>
      <div style={{ height: 42, borderRadius: 8, border: "1px solid var(--ac-line)", background: "var(--ac-dim)", display: "grid", placeItems: "center" }}>
        <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: "var(--ac-hi)" }}>EV = {money(ev)}</span>
      </div>
      <div style={{ display: "flex", gap: 12, background: "var(--panel-2)", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--border)" }}>
        <VStat label="EV/EBITDA" sub="учитывает долг" value={(ev / ebitda).toFixed(1) + "×"} color="var(--ac-hi)" />
        <VStat label="P/E" sub="без долга" value={(cap / earnings).toFixed(1) + "×"} color="var(--purple)" />
      </div>
    </VizFrame>
  );
}

/* ============ 7. YIELD CURVE ============ */
function YieldCurve() {
  const [short, setShort] = useState(3);
  const [long, setLong] = useState(4.2);
  const mats = [{ l: "3м", x: 0 }, { l: "2г", x: .28 }, { l: "5л", x: .5 }, { l: "10л", x: .75 }, { l: "30л", x: 1 }];
  const W = 300, H = 130, pad = 6;
  const minR = Math.min(short, long) - 1, maxR = Math.max(short, long) + 1;
  const y = (r) => H - pad - ((r - minR) / (maxR - minR || 1)) * (H - pad * 2);
  const pts = mats.map((m) => {
    const curve = short + (long - short) * Math.pow(m.x, 0.65);
    return [pad + m.x * (W - pad * 2), y(curve)];
  });
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const inverted = short > long + 0.05;
  return (
    <VizFrame title="Кривая доходности гособлигаций"
      badge={<span className="chip" style={{ background: inverted ? "var(--bad-dim)" : "var(--ok-dim)", color: inverted ? "var(--down)" : "var(--ok)" }}>{inverted ? "ИНВЕРСИЯ" : "норма"}</span>}
      controls={<>
        <VSlider label="Короткие ставки (3 мес.)" value={short} min={0} max={8} step={0.1} onChange={setShort} fmt={(v) => v.toFixed(1) + "%"} accent="var(--warn)" />
        <VSlider label="Длинные ставки (30 лет)" value={long} min={0} max={8} step={0.1} onChange={setLong} fmt={(v) => v.toFixed(1) + "%"} accent="var(--ac)" />
      </>}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <path d={`${d} L${pts[pts.length - 1][0]} ${H - pad} L${pts[0][0]} ${H - pad} Z`} fill={inverted ? "rgba(239,83,80,.12)" : "rgba(41,98,255,.12)"} />
        <path d={d} fill="none" stroke={inverted ? "var(--down)" : "var(--ac)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={inverted ? "var(--down)" : "var(--ac)"} stroke="var(--bg-1)" strokeWidth="2" />)}
        {mats.map((m, i) => <text key={i} x={pts[i][0]} y={H - 0} fontSize="9" fill="#6b6b73" textAnchor="middle" fontFamily="var(--fm)">{m.l}</text>)}
      </svg>
      <div style={{ fontSize: 12.5, color: "var(--tx-2)", textAlign: "center" }}>
        {inverted ? "Короткие ставки выше длинных — рынок ждёт замедления и снижения ставок. Частый предвестник рецессии." : "Длинные облигации доходнее коротких — нормальная форма, рынок не ждёт спада."}
      </div>
    </VizFrame>
  );
}

/* ============ 8. VALUE vs GROWTH under rates ============ */
function ValueGrowth() {
  const [rate, setRate] = useState(8);
  const r = rate / 100;
  const growth = [5, 9, 14, 22, 38];   // back-loaded
  const value = [26, 24, 20, 14, 10];  // front-loaded
  const pv = (arr) => arr.reduce((a, f, i) => a + f / Math.pow(1 + r, i + 1), 0);
  const pvG = pv(growth), pvV = pv(value);
  const pvG0 = growth.reduce((a, f, i) => a + f / Math.pow(1.03, i + 1), 0);
  const pvV0 = value.reduce((a, f, i) => a + f / Math.pow(1.03, i + 1), 0);
  const dropG = ((pvG - pvG0) / pvG0) * 100, dropV = ((pvV - pvV0) / pvV0) * 100;
  // общий максимум PV по обоим рядам — чтобы столбцы не вылезали при низкой ставке
  const maxPv = Math.max(...growth.map((f, i) => f / Math.pow(1 + r, i + 1)), ...value.map((f, i) => f / Math.pow(1 + r, i + 1)), 1);
  return (
    <VizFrame title="Акции роста vs стоимости при росте ставок"
      controls={<VSlider label="Ставка дисконтирования" value={rate} min={3} max={16} step={0.5} onChange={setRate} fmt={(v) => v + "%"} accent="var(--ac)" />}>
      <div style={{ display: "flex", gap: 16 }}>
        {[{ n: "Рост", arr: growth, pv: pvG, drop: dropG, c: "var(--purple)" }, { n: "Стоимость", arr: value, pv: pvV, drop: dropV, c: "var(--ok)" }].map((s) => (
          <div key={s.n} style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "var(--tx-2)", marginBottom: 8, fontWeight: 600 }}>Акция «{s.n}»</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 70 }}>
              {s.arr.map((f, i) => {
                const pvi = f / Math.pow(1 + r, i + 1);
                return <div key={i} title={`Год ${i + 1}: PV ${pvi.toFixed(0)}`} style={{ flex: 1, height: `${Math.min((pvi / maxPv) * 100, 100)}%`, minHeight: 3, background: s.c, opacity: .4 + i * .12, borderRadius: "3px 3px 0 0", transition: ".4s" }} />;
              })}
            </div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: s.c, marginTop: 10 }}>{s.pv.toFixed(0)}</div>
            <div style={{ fontSize: 10.5, color: s.drop < -1 ? "var(--down)" : "var(--tx-3)" }}>{s.drop.toFixed(0)}% к базе</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--tx-2)", textAlign: "center" }}>У акций роста ценность дальше в будущем — при росте ставок она дисконтируется сильнее</div>
    </VizFrame>
  );
}

export const VIZ_FINANCE = {
  liquidity: Liquidity,
  fisher: Fisher,
  balance: Balance,
  cashflow: CashFlow,
  dcf: DCF,
  multiples: Multiples,
  yieldcurve: YieldCurve,
  valuegrowth: ValueGrowth,
}
