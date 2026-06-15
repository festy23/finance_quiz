/* screens/Extra.jsx — Glossary + Trade-test runner. */
import React, { useState, useMemo } from 'react'
import { I, Btn, Chip, TopicChip, Pbar, Stat, Ring } from '../components/ui.jsx'
import { TVChart, anchorsToCloses, genCandles, volFromCandles } from '../components/charts.jsx'
import { SubPanel } from '../components/viz/chart.jsx'
import { C } from '../lib/content.js'
import { QData, withShuffledOptions } from '../lib/quiz.js'
import { Empty } from './LearnStats.jsx'

/* ============ GLOSSARY ============ */
export function GlossaryScreen({ ctx }) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState(null);
  const term = q.trim().toLowerCase();
  const list = C.glossary
    .filter((g) => (!topic || g.topic === topic) && (!term || g.t.toLowerCase().includes(term) || g.d.toLowerCase().includes(term)))
    .sort((a, b) => a.t.localeCompare(b.t, "ru"));
  return (
    <div className="wrap fade-in" style={{ maxWidth: 880 }}>
      <h2 style={{ fontSize: 24, letterSpacing: "-.03em", margin: "0 0 4px" }}>Словарь терминов</h2>
      <p style={{ color: "var(--tx-3)", marginTop: 0, marginBottom: 22, fontSize: 14 }}>{C.glossary.length} понятий из курса — поиск и фильтр по блокам</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 0 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--tx-3)", pointerEvents: "none" }}><I.filter size={15} /></span>
          <input className="input" style={{ paddingLeft: 38 }} placeholder="Поиск термина…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="seg">
          <button className={!topic ? "on" : ""} onClick={() => setTopic(null)}>Все</button>
          {C.topics.map((t) => <button key={t.id} className={topic === t.id ? "on" : ""} onClick={() => setTopic(t.id)}>{t.short}</button>)}
        </div>
      </div>

      {list.length === 0
        ? <Empty text="Ничего не найдено" />
        : <div className="grid-tiles" style={{ gridTemplateColumns: ctx.isMobile ? "1fr" : "1fr 1fr" }}>
            {list.map((g) => (
              <div key={g.t} className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 15.5, letterSpacing: "-.01em", flex: 1, minWidth: 0, lineHeight: 1.3 }}>{g.t}</span>
                  <span style={{ flex: "0 0 auto", marginTop: 1 }}><TopicChip topic={g.topic} small /></span>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "var(--tx-2)" }}>{g.d}</p>
              </div>
            ))}
          </div>}
    </div>
  );
}

/* ============ TRADE-TEST ============ */
export function buildTT(item, reveal) {
  const spec = item.chart;
  const { seriesType = "candle", anchors, n = 60, vol = 1, seed = 7 } = spec;
  const closes = anchorsToCloses(anchors, n, vol, seed);
  const candles = genCandles(closes, { seed: seed + 1 });
  const at = (f) => candles[Math.max(0, Math.min(n - 1, Math.round(f * (n - 1))))].time;
  const lines = reveal && spec.lines ? spec.lines.map((l) => ({ data: [{ time: at(l.from[0]), value: l.from[1] }, { time: at(l.to[0]), value: l.to[1] }], color: l.color, dashed: l.dashed, width: 1.4 })) : [];
  const markers = reveal && spec.markers ? spec.markers.map((m) => ({ time: at(m.frac), position: m.position, color: m.color, shape: m.shape, text: m.text })) : [];
  const priceLines = reveal && spec.priceLines ? spec.priceLines : [];
  return { candles, seriesType, lines, markers, priceLines, volume: !!spec.volume, indicator: spec.indicator };
}

export function TTChart({ spec, reveal, mobile }) {
  const built = useMemo(() => buildTT(spec, reveal), [spec.id, reveal]);
  return (
    <div className="viz" style={{ background: "var(--bg-1)" }}>
      <div className="viz-head"><span className="viz-title"><I.chart size={14} />Синтетический график · TradingView</span>
        <span className="chip" style={{ background: "var(--glass-2)", color: "var(--tx-3)" }}>{spec.tag}</span></div>
      <div style={{ padding: 10 }}>
        <TVChart candles={built.candles} seriesType={built.seriesType} height={mobile ? 220 : 300}
          volume={built.volume} lines={built.lines} markers={built.markers} priceLines={built.priceLines} />
        {built.indicator && <div style={{ marginTop: 10 }}><SubPanel candles={built.candles} kind={built.indicator} reveal={reveal} /></div>}
      </div>
    </div>
  );
}

export function TradeTestScreen({ ctx }) {
  const [phase, setPhase] = useState("intro");   // intro | run | result
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const mobile = ctx.isMobile;

  const start = () => { setItems(QData.shuffle(C.tradetest).map(withShuffledOptions)); setIdx(0); setSel(null); setScore(0); setDone(false); setPhase("run"); };
  const it = items[idx];
  const reveal = sel !== null;
  const correct = it && it.correct[0];

  const choose = (i) => { if (reveal) return; setSel(i); if (i === correct) setScore((s) => s + 1); };
  const next = () => {
    if (idx === items.length - 1) { ctx.recordTradeResult(score); setPhase("result"); }
    else { setIdx((i) => i + 1); setSel(null); }
  };

  if (phase === "intro") {
    return (
      <div className="wrap fade-in" style={{ maxWidth: 720 }}>
        <h2 style={{ fontSize: 24, letterSpacing: "-.03em", margin: "0 0 4px" }}>Трейд-тест</h2>
        <p style={{ color: "var(--tx-3)", marginTop: 0, marginBottom: 24, fontSize: 14 }}>Распознавание графиков и паттернов на «живых» данных</p>
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[["Паттерны", "голова-плечи, вершины, треугольники"], ["Тренды", "восходящий, нисходящий, флэт"], ["Типы графиков", "свечи, линия, бары, area"], ["Индикаторы", "RSI, MACD"]].map(([h, s]) => (
              <div key={h} style={{ flex: "1 1 160px", padding: "14px 16px", borderRadius: "var(--r-sm)", background: "var(--glass)", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{h}</div>
                <div style={{ fontSize: 12, color: "var(--tx-3)", marginTop: 3, lineHeight: 1.4 }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div style={{ display: "flex", gap: 26 }}>
              <Stat val={C.tradetest.length} label="вопросов" />
              <Stat val={ctx.ttBest != null ? ctx.ttBest + "/" + C.tradetest.length : "—"} label="лучший результат" color="var(--ac-hi)" />
            </div>
            <Btn variant="pri" lg icon={<I.play size={16} fill />} onClick={start}>Начать тест</Btn>
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--tx-3)", marginTop: 16, lineHeight: 1.6 }}>
          Графики генерируются синтетически на движке TradingView Lightweight Charts. Вы смотрите на «чистый» график, выбираете ответ — затем появляется разметка и пояснение.
        </p>
      </div>
    );
  }

  if (phase === "result") {
    const pct = Math.round((score / items.length) * 100);
    const grade = pct >= 85 ? { t: "Глаз-алмаз", c: "var(--ok)" } : pct >= 60 ? { t: "Неплохо", c: "var(--warn)" } : { t: "Нужна практика", c: "var(--down)" };
    return (
      <div className="wrap fade-in" style={{ maxWidth: 620 }}>
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center", padding: 36 }}>
          <Ring pct={pct} size={130} sw={10} color={grade.c} />
          <div>
            <div style={{ fontSize: 13, color: "var(--tx-3)" }}>Трейд-тест завершён</div>
            <h2 style={{ margin: "6px 0 6px", fontSize: 26, color: grade.c, letterSpacing: "-.02em" }}>{grade.t}</h2>
            <div style={{ fontSize: 14, color: "var(--tx-2)" }}>Верно <b className="mono" style={{ color: "var(--tx)" }}>{score}</b> из <b className="mono" style={{ color: "var(--tx)" }}>{items.length}</b></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="sec" icon={<I.repeat size={15} />} onClick={start}>Ещё раз</Btn>
            <Btn variant="pri" icon={<I.arrowR size={15} />} onClick={() => ctx.nav("dashboard")}>На главную</Btn>
          </div>
        </div>
      </div>
    );
  }

  /* run */
  const progress = ((idx + (reveal ? 1 : 0)) / items.length) * 100;
  return (
    <div className="wrap fade-in" style={{ maxWidth: 820 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 6, background: "rgba(10,11,14,.82)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 14, padding: "6px 0 12px", marginBottom: 10 }}>
        <button className="btn btn-ghost" style={{ height: 32, width: 32, padding: 0 }} onClick={() => ctx.nav("dashboard")}><I.x size={17} /></button>
        <div style={{ flex: 1 }}><Pbar val={progress} color="var(--ac)" h={5} /></div>
        <span className="mono" style={{ fontSize: 12.5, color: "var(--tx-2)" }}>{idx + 1}<span style={{ color: "var(--tx-3)" }}>/{items.length}</span></span>
        <span className="chip" style={{ background: "var(--glass-2)", color: "var(--tx-2)", border: "1px solid var(--border)" }}>{it.tag}</span>
      </div>
      <div key={it.id}>
          <h2 style={{ fontSize: mobile ? 18 : 20, lineHeight: 1.35, letterSpacing: "-.01em", margin: "0 0 18px", textWrap: "pretty" }}>{it.q}</h2>
          <TTChart spec={it} reveal={reveal} mobile={mobile} />
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10, marginTop: 18 }}>
            {(it._order || it.options.map((_, k) => k)).map((oi, pos) => {
              const opt = it.options[oi];
              let cls = "opt";
              if (reveal) { if (oi === correct) cls += " correct"; else if (oi === sel) cls += " wrong"; else cls += " dim"; }
              return (
                <button key={oi} className={cls} onClick={() => choose(oi)}>
                  <span className="opt-key">{reveal && oi === correct ? <I.check size={14} /> : reveal && oi === sel ? <I.x size={14} /> : String.fromCharCode(65 + pos)}</span>
                  <span className="opt-txt">{opt}</span>
                </button>
              );
            })}
          </div>
          {reveal && (
            <div className="fade-in" style={{ marginTop: 16 }}>
              <div className={"explain " + (sel === correct ? "ok" : "bad")}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, fontWeight: 600, color: sel === correct ? "var(--ok)" : "var(--bad)" }}>
                  {sel === correct ? <><I.check size={16} />Верно</> : <><I.x size={16} />Неверно</>}
                </div>
                {it.explain}
              </div>
            </div>
          )}
          <div style={{ marginTop: 18 }}>
            {reveal
              ? <Btn variant="pri" lg block onClick={next} icon={idx < items.length - 1 && <I.arrowR size={16} />}>{idx === items.length - 1 ? "Завершить тест" : "Дальше"}</Btn>
              : <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--tx-3)", padding: "10px" }}>Выберите ответ, чтобы увидеть разбор</div>}
          </div>
        </div>
    </div>
  );
}
