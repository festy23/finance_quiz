/* screens/Dashboard.jsx — dashboard. */
import React, { useState, useMemo } from 'react'
import { I, Logo, Btn, Chip, TopicChip, Pbar, Stat, Ring, Spark, Bars } from '../components/ui.jsx'
import { TVChart, anchorsToCloses, genCandles } from '../components/charts.jsx'
import { C } from '../lib/content.js'
import { QData } from '../lib/quiz.js'
import { rel } from '../lib/format.js'

export function BackdropChart() {
  const candles = useMemo(() => genCandles(anchorsToCloses([[0, 80], [.4, 110], [.6, 96], [1, 130]], 50, 1.4, 3), { seed: 9 }), []);
  return <div style={{ position: "absolute", inset: "auto 0 0 0", height: "55%" }}><TVChart candles={candles} height={360} autosize /></div>;
}

/* ============ DASHBOARD ============ */
export function Dashboard({ ctx }) {
  const { user, stats, attempts, streak } = ctx;
  const overall = Math.round(C.topics.reduce((a, t) => a + stats[t.id].mastery, 0) / C.topics.length);
  const totalAnswered = C.topics.reduce((a, t) => a + stats[t.id].answered, 0);
  const totalCorrect = C.topics.reduce((a, t) => a + stats[t.id].correct, 0);
  const acc = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const hour = new Date().getHours();
  const hello = hour < 6 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
  const lastSeen = attempts[0] ? rel(attempts[0].date) : "ещё не начато";
  return (
    <div className="wrap fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--tx-3)", marginBottom: 4, whiteSpace: "nowrap" }}>{hello}</div>
          <h2 style={{ margin: 0, fontSize: 28, letterSpacing: "-.03em", fontWeight: 600 }}>{user.name}</h2>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="chip" style={{ height: 40, padding: "0 14px", background: "var(--glass-2)", border: "1px solid var(--border)", gap: 8, whiteSpace: "nowrap" }}>
            <I.flame size={15} fill style={{ color: "var(--ac-hi)" }} /><span style={{ fontSize: 13, color: "var(--tx)" }}>{streak} дн. подряд</span>
          </div>
          <Btn variant="pri" icon={<I.play size={15} fill />} onClick={() => ctx.nav("modes")}>Тренировка</Btn>
        </div>
      </div>

      {/* ===== bento ===== */}
      <div className="bento" style={{ marginBottom: 16 }}>
        {/* hero */}
        <div className="tile" style={{ gridColumn: "span 2", gridRow: ctx.isMobile ? "auto" : "span 2", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20, minHeight: ctx.isMobile ? 0 : 280, overflow: "hidden" }}>
          <div className="glow" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--tx-3)", fontWeight: 600 }}>Освоение курса</div>
              <div style={{ fontSize: 13, color: "var(--tx-3)", marginTop: 6 }}>{C.questions.length} вопросов · 4 блока · {lastSeen}</div>
            </div>
            <span className="chip" style={{ background: "var(--ac-dim)", color: "var(--ac-hi)", border: "1px solid var(--ac-line)" }}>{overall}% готово</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 26, position: "relative" }}>
            <Ring pct={overall} size={130} sw={9} color="var(--ac)" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 11, minWidth: 0 }}>
              {C.topics.map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--tx-3)", width: 22, flex: "0 0 22px" }}>{t.short}</span>
                  <div style={{ flex: 1 }}><Pbar val={stats[t.id].mastery} color={t.color} h={5} /></div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--tx-2)", width: 34, textAlign: "right", flex: "0 0 34px" }}>{stats[t.id].mastery}%</span>
                </div>
              ))}
            </div>
          </div>
          <Btn variant="sec" block icon={<I.arrowR size={15} />} onClick={() => ctx.nav("modes")} style={{ position: "relative" }}>Продолжить тренировку</Btn>
        </div>

        {/* stat tiles */}
        <StatTile val={acc + "%"} label="Точность" spark={accTrend(attempts)} accent="var(--ac)" />
        <StatTile val={totalAnswered} label="Решено вопросов" spark={volTrend(attempts)} accent="var(--ac)" />
        <StatTile val={attempts.length} label="Сессий пройдено" />
        <StatTile val={ctx.bestStreak()} label="Лучшая серия, дн." />
      </div>

      {/* modes */}
      <SectionTitle>Режимы тренировки</SectionTitle>
      <div className="grid-tiles" style={{ gridTemplateColumns: ctx.isMobile ? "1fr" : "repeat(3,1fr)", marginBottom: 28 }}>
        {Object.values(C.modes).map((m) => (
          <button key={m.id} className="tile" onClick={() => ctx.startQuiz(m.id, null)} style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14, cursor: "pointer" }}>
            <div className="glow" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--ac-dim)", display: "grid", placeItems: "center", color: "var(--ac-hi)", boxShadow: "inset 0 0 0 1px var(--ac-line)" }}>{I[m.icon]({ size: 20 })}</div>
              <I.arrowR size={16} style={{ color: "var(--tx-3)" }} />
            </div>
            <div style={{ position: "relative" }}><div style={{ fontWeight: 600, fontSize: 15.5 }}>{m.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--tx-3)", marginTop: 5, lineHeight: 1.5 }}>{m.desc}</div></div>
          </button>
        ))}
      </div>

      {/* topics */}
      <SectionTitle action={<button className="btn btn-ghost" style={{ height: 30, fontSize: 12.5 }} onClick={() => ctx.nav("learn")}>Изучение →</button>}>Блоки курса</SectionTitle>
      <div className="grid-tiles" style={{ gridTemplateColumns: ctx.isMobile ? "1fr" : "repeat(2,1fr)" }}>
        {C.topics.map((t) => {
          const s = stats[t.id];
          return (
            <div key={t.id} className="tile" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                  <span className="badge-dot" style={{ background: t.color, width: 8, height: 8, flex: "0 0 8px", boxShadow: `0 0 8px ${t.color}` }} />
                  <span style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.3 }}>{t.name}</span>
                </div>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--tx-3)", flex: "0 0 auto", marginLeft: 8 }}>{s.answered}/{QData.byTopic(t.id).length}</span>
              </div>
              <Pbar val={s.mastery} color={t.color} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--tx-3)", lineHeight: 1.3 }}>{s.mastery}% освоено · точность {s.answered ? Math.round(s.correct / s.answered * 100) : 0}%</span>
                <div style={{ display: "flex", gap: 7, flex: "0 0 auto" }}>
                  <button className="btn btn-ghost" style={{ height: 32, fontSize: 12.5 }} onClick={() => ctx.openLearn(t.id)}>Учить</button>
                  <button className="btn btn-sec" style={{ height: 32, fontSize: 12.5 }} onClick={() => ctx.startQuiz("full", t.id)}>Квиз</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function StatTile({ val, label, spark, accent }) {
  return (
    <div className="tile" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10, minHeight: 100 }}>
      <Stat val={val} label={label} color="var(--tx)" />
      {spark && <div style={{ marginTop: 4 }}><Spark data={spark} w={170} h={28} color={accent || "var(--ac)"} /></div>}
    </div>
  );
}
export function SectionTitle({ children, action }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 14px" }}>
    <h3 style={{ margin: 0, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--tx-3)", fontWeight: 600 }}>{children}</h3>{action}</div>;
}
export function accTrend(att) { const a = att.slice(0, 8).reverse().map((x) => Math.round(x.score / x.total * 100)); return a.length > 1 ? a : [60, 70, 65, 80]; }
export function volTrend(att) { const a = att.slice(0, 8).reverse().map((x) => x.total); return a.length > 1 ? a : [4, 6, 5, 8]; }
