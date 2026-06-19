/* screens/LearnStats.jsx — mode setup, learn (viz cards), progress, history. */
import React, { useState, useMemo } from 'react'
import { I, Btn, Chip, TopicChip, Pbar, Stat, Ring, Spark, Bars } from '../components/ui.jsx'
import { VIZ } from '../components/viz/index.js'
import { RichText } from '../components/Tex.jsx'
import { Figure } from '../components/Figure.jsx'
import { C } from '../lib/content.js'
import { QData } from '../lib/quiz.js'
import { rel } from '../lib/format.js'
import { SectionTitle } from './Dashboard.jsx'
import { Difficulty } from './Quiz.jsx'

/* ============ MODE SETUP ============ */
export function ModesScreen({ ctx }) {
  const [mode, setMode] = useState("full");
  const [topic, setTopic] = useState(null);
  const [reveal, setReveal] = useState("instant");   // instant = показывать ответ сразу, strict = без показа
  const m = C.modes[mode];
  const pool = topic ? QData.byTopic(topic) : C.questions;
  const count = m.count ? Math.min(m.count, pool.length) : pool.length;
  const wrongCount = ctx.wrongIdList().length;
  return (
    <div className="wrap fade-in" style={{ maxWidth: 860 }}>
      <h2 style={{ fontSize: 24, letterSpacing: "-.02em", margin: "0 0 4px" }}>Новая тренировка</h2>
      <p style={{ color: "var(--tx-3)", marginTop: 0, marginBottom: 26, fontSize: 14 }}>Выберите режим и охват материала</p>

      <SectionTitle>Режим</SectionTitle>
      <div className="grid-tiles" style={{ gridTemplateColumns: ctx.isMobile ? "1fr" : "repeat(3,1fr)", marginBottom: 26 }}>
        {Object.values(C.modes).map((x) => {
          const on = mode === x.id, disabled = x.id === "repeat" && wrongCount === 0;
          return (
            <button key={x.id} className="tile" disabled={disabled} onClick={() => setMode(x.id)} style={{
              textAlign: "left", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .45 : 1,
              borderColor: on ? "var(--ac)" : "var(--border)", background: on ? "var(--ac-dim)" : "var(--panel)",
              display: "flex", flexDirection: "column", gap: 11,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: on ? "var(--ac)" : "var(--panel-3)", display: "grid", placeItems: "center", color: on ? "#fff" : "var(--ac)" }}>{I[x.icon]({ size: 20 })}</div>
              <div><div style={{ fontWeight: 600, fontSize: 15 }}>{x.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--tx-3)", marginTop: 4, lineHeight: 1.45 }}>{x.desc}</div></div>
              {x.id === "repeat" && <span className="chip" style={{ background: "var(--panel-2)", color: "var(--tx-2)" }}>{wrongCount} на повтор</span>}
            </button>
          );
        })}
      </div>

      {mode !== "repeat" && <>
        <SectionTitle>Охват</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 28 }}>
          <ScopeChip on={topic === null} onClick={() => setTopic(null)} label="Все блоки" dot="var(--ac)" />
          {C.topics.map((t) => <ScopeChip key={t.id} on={topic === t.id} onClick={() => setTopic(t.id)} label={t.name} dot={t.color} />)}
        </div>
      </>}

      <SectionTitle>Показ ответов</SectionTitle>
      <div className="seg" style={{ marginBottom: 8, maxWidth: 420, width: "100%" }}>
        <button className={reveal === "instant" ? "on" : ""} style={{ flex: 1 }} onClick={() => setReveal("instant")}>Сразу показывать</button>
        <button className={reveal === "strict" ? "on" : ""} style={{ flex: 1 }} onClick={() => setReveal("strict")}>Строгий режим</button>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--tx-3)", marginTop: 0, marginBottom: 28, lineHeight: 1.5 }}>
        {reveal === "instant"
          ? "После каждого ответа сразу видно, верно или нет, с разбором и графиком."
          : "Ответы и разбор не показываются по ходу — проверка только в конце, как на экзамене."}
      </p>

      <div className="card card-pad" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 26 }}>
          <Stat val={mode === "repeat" ? Math.min(m.count, wrongCount) : count} label="вопросов" />
          <Stat val={reveal === "instant" ? "сразу" : "строгий"} label="проверка" color="var(--tx-2)" />
          <Stat val={topic && mode !== "repeat" ? QData.topic(topic).short : "все"} label="блок" color="var(--tx-2)" />
        </div>
        <Btn variant="pri" lg icon={<I.play size={16} fill />} onClick={() => ctx.startQuiz(mode, topic, reveal)}>Начать</Btn>
      </div>
    </div>
  );
}
function ScopeChip({ on, onClick, label, dot }) {
  return <button onClick={onClick} className="chip" style={{
    height: 36, padding: "0 14px", gap: 8, cursor: "pointer",
    background: on ? "var(--panel-3)" : "var(--panel)", border: `1px solid ${on ? "var(--border-strong)" : "var(--border)"}`,
    color: on ? "var(--tx)" : "var(--tx-2)", fontSize: 13,
  }}><span className="badge-dot" style={{ background: dot }} />{label}</button>;
}

/* ============ LEARN — interactive concept cards ============ */
export function LearnScreen({ ctx }) {
  const [topic, setTopic] = useState(ctx.learnTopic || null);
  const cards = C.questions.filter((q) => (!topic || q.topic === topic));
  return (
    <div className="wrap fade-in" style={{ maxWidth: 760 }}>
      <h2 style={{ fontSize: 24, letterSpacing: "-.02em", margin: "0 0 4px" }}>Изучение</h2>
      <p style={{ color: "var(--tx-3)", marginTop: 0, marginBottom: 22, fontSize: 14 }}>Все билеты с готовым разбором — и интерактивными графиками там, где концепцию можно показать наглядно</p>
      <div className="seg" style={{ marginBottom: 24 }}>
        <button className={!topic ? "on" : ""} onClick={() => setTopic(null)}>Все</button>
        {C.topics.map((t) => <button key={t.id} className={topic === t.id ? "on" : ""} onClick={() => setTopic(t.id)}>{t.short}</button>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {cards.map((q) => {
          const V = VIZ[q.viz];
          return (
            <div key={q.id} className="card card-pad fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <TopicChip topic={q.topic} small /><Difficulty d={q.difficulty} />
              </div>
              <h3 style={{ fontSize: 17, margin: "0 0 14px", letterSpacing: "-.01em", lineHeight: 1.35, textWrap: "pretty" }}><RichText text={q.q} /></h3>
              {V && <div style={{ marginBottom: 14 }}><V /></div>}
              {q.figure && <div style={{ marginBottom: 14 }}><Figure name={q.figure} caption={q.figureCaption} /></div>}
              <div className="explain"><RichText text={q.explain} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ PROGRESS ============ */
export function ProgressScreen({ ctx }) {
  const { stats, attempts, streak } = ctx;
  const overall = Math.round(C.topics.reduce((a, t) => a + stats[t.id].mastery, 0) / C.topics.length);
  const totA = C.topics.reduce((a, t) => a + stats[t.id].answered, 0);
  const totC = C.topics.reduce((a, t) => a + stats[t.id].correct, 0);
  const acc = totA ? Math.round(totC / totA * 100) : 0;
  const weak = [...C.topics].sort((a, b) => stats[a.id].mastery - stats[b.id].mastery)[0];
  const heat = ctx.activity();
  const ach = ctx.achievements();
  return (
    <div className="wrap fade-in" style={{ maxWidth: 980 }}>
      <h2 style={{ fontSize: 24, letterSpacing: "-.02em", margin: "0 0 22px" }}>Прогресс</h2>

      <div className="grid-tiles" style={{ gridTemplateColumns: ctx.isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", marginBottom: 16 }}>
        <div className="tile" style={{ display: "flex", alignItems: "center", gap: 16 }}><Ring pct={overall} size={66} sw={6} /><div><Stat val={overall + "%"} label="Освоение" /></div></div>
        <div className="tile"><Stat val={acc + "%"} label="Средняя точность" color="var(--ok)" /></div>
        <div className="tile"><Stat val={totA} label="Всего ответов" color="var(--ac)" /></div>
        <div className="tile"><Stat val={streak} label="Серия дней" color="var(--warn)" sub={"рекорд " + ctx.bestStreak()} /></div>
      </div>

      <div className="grid-tiles" style={{ gridTemplateColumns: ctx.isMobile ? "1fr" : "1.2fr 1fr", marginBottom: 16 }}>
        <div className="card card-pad">
          <SectionTitle>Освоение по блокам</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {C.topics.map((t) => {
              const s = stats[t.id];
              return <div key={t.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: "var(--tx-2)" }}><span className="badge-dot" style={{ background: t.color, marginRight: 8 }} />{t.name}</span>
                  <span className="mono" style={{ color: "var(--tx-3)" }}>{s.mastery}%</span>
                </div>
                <Pbar val={s.mastery} color={t.color} />
              </div>;
            })}
          </div>
        </div>
        <div className="card card-pad">
          <SectionTitle>Точность по сессиям</SectionTitle>
          {attempts.length ? <Bars data={attempts.slice(0, 10).reverse().map((a) => ({ v: Math.round(a.score / a.total * 100), c: "var(--ac)" }))} h={150} labels={attempts.slice(0, 10).reverse().map((_, i) => "#" + (i + 1))} colorFn={(v) => v >= 80 ? "var(--ok)" : v >= 60 ? "var(--warn)" : "var(--down)"} />
            : <Empty small text="Пройдите первый квиз" />}
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <SectionTitle>Активность за 12 недель</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 4 }}>
          {heat.map((wk, i) => <div key={i} style={{ display: "grid", gridTemplateRows: "repeat(7,1fr)", gap: 4 }}>
            {wk.map((d, j) => <div key={j} title={d + " ответов"} style={{ aspectRatio: "1", borderRadius: 3, background: d === 0 ? "var(--panel-3)" : `rgba(41,98,255,${.25 + Math.min(d, 4) * .19})` }} />)}
          </div>)}
        </div>
      </div>

      <SectionTitle>Достижения</SectionTitle>
      <div className="grid-tiles" style={{ gridTemplateColumns: ctx.isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)" }}>
        {ach.map((a) => (
          <div key={a.id} className="tile" style={{ display: "flex", alignItems: "center", gap: 12, opacity: a.got ? 1 : .4 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: a.got ? "var(--ac-dim)" : "rgba(255,255,255,.05)", color: a.got ? "var(--ac-hi)" : "var(--tx-3)", boxShadow: a.got ? "inset 0 0 0 1px var(--ac-line)" : "none" }}>{I[a.icon]({ size: 20, fill: a.got })}</div>
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div><div style={{ fontSize: 11, color: "var(--tx-3)" }}>{a.desc}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ HISTORY ============ */
export function HistoryScreen({ ctx }) {
  const [filter, setFilter] = useState("all");
  const list = ctx.attempts.filter((a) => filter === "all" || a.mode === filter);
  return (
    <div className="wrap fade-in" style={{ maxWidth: 820 }}>
      <h2 style={{ fontSize: 24, letterSpacing: "-.02em", margin: "0 0 18px" }}>История</h2>
      <div className="seg" style={{ marginBottom: 22 }}>
        <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Все</button>
        {Object.values(C.modes).map((m) => <button key={m.id} className={filter === m.id ? "on" : ""} onClick={() => setFilter(m.id)}>{m.name}</button>)}
      </div>
      {list.length === 0 ? <Empty text="Здесь появятся ваши пройденные сессии" />
        : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((a) => {
            const pct = Math.round(a.score / a.total * 100);
            const c = pct >= 85 ? "var(--ok)" : pct >= 60 ? "var(--warn)" : "var(--down)";
            return (
              <div key={a.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px" }}>
                <Ring pct={pct} size={48} sw={5} color={c} label={pct + "%"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14.5 }}>{C.modes[a.mode].name}</span>
                    {a.topic && <TopicChip topic={a.topic} small />}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--tx-3)", marginTop: 3 }}>{a.score}/{a.total} верно · {new Date(a.date).toLocaleDateString("ru", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div style={{ width: 110, opacity: .9 }}><Spark data={a.spark || [pct]} w={110} h={32} color={c} /></div>
                <button className="btn btn-ghost" style={{ height: 32, fontSize: 12.5 }} onClick={() => ctx.reviewAttempt(a)}>Разбор</button>
              </div>
            );
          })}
        </div>}
    </div>
  );
}
export function Empty({ text, small }) {
  return <div style={{ textAlign: "center", padding: small ? "30px 0" : "60px 20px", color: "var(--tx-3)" }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--panel-2)", border: "1px solid var(--border)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><I.history size={24} /></div>
    <div style={{ fontSize: 13.5 }}>{text}</div>
  </div>;
}
