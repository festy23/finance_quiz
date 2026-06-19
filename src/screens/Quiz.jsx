/* screens/Quiz.jsx — quiz runner (full / quick / repeat) + results. */
import React, { useState, useEffect } from 'react'
import { I, Btn, TopicChip, Pbar, Ring } from '../components/ui.jsx'
import { VIZ } from '../components/viz/index.js'
import { RichText } from '../components/Tex.jsx'
import { Figure } from '../components/Figure.jsx'
import { C } from '../lib/content.js'
import { QData, isCorrect } from '../lib/quiz.js'
import { SectionTitle } from './Dashboard.jsx'

/* ============ QUIZ RUNNER ============ */
export function QuizScreen({ ctx }) {
  const { quiz } = ctx;                 // {mode, questions, topic, reveal}
  // Режим показа выбирается пользователем (reveal); fallback — настройка режима.
  const instant = quiz.reveal ? quiz.reveal === "instant" : C.modes[quiz.mode].feedback === "instant";
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});   // qid -> [idx]
  const [checked, setChecked] = useState({});    // qid -> true (instant reveal)
  const [sel, setSel] = useState([]);            // current selection (multi staging)
  const q = quiz.questions[idx];
  const last = idx === quiz.questions.length - 1;
  const answered = answers[q.id] !== undefined;
  const showReveal = instant && checked[q.id];
  const VizComp = q.viz && VIZ[q.viz];

  useEffect(() => { setSel(answers[q.id] || []); }, [idx]);

  const choose = (i) => {
    if (showReveal) return;
    if (q.multi) {
      const ns = sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i];
      setSel(ns);
      // В экзамене (feedback="end") проверки по кнопке нет — сам набор вариантов и есть ответ,
      // поэтому сразу пишем его в answers, иначе «Далее» остаётся заблокированной.
      if (!instant) { setAnswers((a) => ({ ...a, [q.id]: ns })); }
    }
    else {
      setSel([i]);
      if (instant) { commit([i]); }
      else { setAnswers((a) => ({ ...a, [q.id]: [i] })); }
    }
  };
  const commit = (s) => { setAnswers((a) => ({ ...a, [q.id]: s })); setChecked((c) => ({ ...c, [q.id]: true })); };
  const next = () => { if (last) finish(); else setIdx((i) => i + 1); };
  const finish = () => ctx.finishQuiz(quiz, answers);

  const progress = ((idx + (answered ? 1 : 0)) / quiz.questions.length) * 100;
  const t = QData.topic(q.topic);

  return (
    <div className="content" style={{ overflowY: "auto", paddingBottom: 0 }}>
      {/* progress header */}
      <div style={{ position: "sticky", top: 0, zIndex: 6, background: "rgba(10,10,10,.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "13px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <button className="btn btn-ghost" style={{ height: 32, width: 32, padding: 0 }} onClick={() => ctx.confirmExit()}><I.x size={17} /></button>
          <div style={{ flex: 1 }}><Pbar val={progress} color={t.color} h={5} /></div>
          <span className="mono" style={{ fontSize: 12.5, color: "var(--tx-2)" }}>{idx + 1}<span style={{ color: "var(--tx-3)" }}>/{quiz.questions.length}</span></span>
          <span className="chip" style={{ background: "var(--panel-2)", color: "var(--tx-2)", border: "1px solid var(--border)" }}>{C.modes[quiz.mode].name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "26px 20px calc(130px + env(safe-area-inset-bottom))" }}>
        <div className="fade-in" key={q.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <TopicChip topic={q.topic} small />
            <Difficulty d={q.difficulty} />
            {q.multi && <span className="chip" style={{ background: "var(--ac-dim)", color: "var(--ac-hi)" }}>несколько ответов</span>}
          </div>
          <h2 style={{ fontSize: 21, lineHeight: 1.35, letterSpacing: "-.01em", margin: "0 0 22px", textWrap: "pretty" }}><RichText text={q.q} /></h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(q._order || q.options.map((_, k) => k)).map((oi, pos) => {
              const opt = q.options[oi];
              const chosen = sel.includes(oi);
              const correct = q.correct.includes(oi);
              let cls = "opt";
              if (showReveal || (!instant && answered && ctx.endReview)) {
                if (correct) cls += " correct"; else if (chosen) cls += " wrong"; else cls += " dim";
              } else if (chosen) cls += " sel";
              return (
                <button key={oi} className={cls} onClick={() => choose(oi)}>
                  <span className="opt-key">{showReveal && correct ? <I.check size={14} /> : showReveal && chosen && !correct ? <I.x size={14} /> : String.fromCharCode(65 + pos)}</span>
                  <span className="opt-txt"><RichText text={opt} /></span>
                </button>
              );
            })}
          </div>

          {/* multi confirm (instant) */}
          {q.multi && instant && !showReveal &&
            <Btn variant="pri" block lg disabled={!sel.length} style={{ marginTop: 16 }} onClick={() => commit(sel)}>Проверить ответ</Btn>}

          {/* reveal: explanation + viz */}
          {showReveal && (
            <div className="fade-in" style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div className={"explain " + (isCorrect(q, answers[q.id]) ? "ok" : "bad")}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, fontWeight: 600, color: isCorrect(q, answers[q.id]) ? "var(--ok)" : "var(--bad)" }}>
                  {isCorrect(q, answers[q.id]) ? <><I.check size={16} />Верно</> : <><I.x size={16} />Неверно</>}
                </div>
                <RichText text={q.explain} />
              </div>
              {VizComp && <VizComp />}
              {q.figure && <Figure name={q.figure} caption={q.figureCaption} />}
            </div>
          )}
        </div>
      </div>

      {/* footer nav */}
      <div style={{ position: "sticky", bottom: 0, background: "rgba(10,10,10,.9)", backdropFilter: "blur(12px)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "13px 20px calc(13px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: 12 }}>
          {!instant && <Btn variant="sec" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)} icon={<I.arrowL size={16} />}>Назад</Btn>}
          <div style={{ flex: 1 }} />
          {instant
            ? (showReveal
              ? <Btn variant="pri" lg onClick={next} icon={!last && <I.arrowR size={16} />}>{last ? "Завершить" : "Дальше"}</Btn>
              : <span style={{ fontSize: 12.5, color: "var(--tx-3)" }}>{q.multi ? "Выберите варианты" : "Выберите ответ"}</span>)
            : <Btn variant="pri" lg disabled={!answered && !last} onClick={next} icon={!last && <I.arrowR size={16} />}>{last ? "Завершить" : "Далее"}</Btn>}
        </div>
      </div>
    </div>
  );
}
export function Difficulty({ d }) {
  const lbl = ["", "база", "средне", "сложно"][d];
  const c = ["", "var(--ok)", "var(--warn)", "var(--down)"][d];
  return <span className="chip" style={{ background: "var(--panel-2)", color: c, border: "1px solid var(--border)", gap: 5 }}>
    <span style={{ display: "flex", gap: 2 }}>{[1, 2, 3].map((i) => <span key={i} style={{ width: 4, height: 10, borderRadius: 1, background: i <= d ? c : "var(--panel-3)" }} />)}</span>{lbl}</span>;
}

/* ============ RESULT ============ */
export function ResultScreen({ ctx }) {
  const r = ctx.lastResult;   // {quiz, answers, score, total, perTopic, wrong:[q]}
  const [review, setReview] = useState(false);
  const pct = Math.round((r.score / r.total) * 100);
  const grade = pct >= 85 ? { t: "Отлично", c: "var(--ok)" } : pct >= 60 ? { t: "Неплохо", c: "var(--warn)" } : { t: "Нужно повторить", c: "var(--down)" };
  return (
    <div className="wrap fade-in" style={{ maxWidth: 820 }}>
      <div className="card card-pad" style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", marginBottom: 22, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(400px 200px at 12% 0%, ${grade.c}22, transparent 70%)` }} />
        <Ring pct={pct} size={120} sw={10} color={grade.c} />
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, color: "var(--tx-3)" }}>{C.modes[r.quiz.mode].name} завершён</div>
          <h2 style={{ margin: "4px 0 8px", fontSize: 26, color: grade.c, letterSpacing: "-.02em" }}>{grade.t}</h2>
          <div style={{ fontSize: 14, color: "var(--tx-2)" }}>Правильно <b className="mono" style={{ color: "var(--tx)" }}>{r.score}</b> из <b className="mono" style={{ color: "var(--tx)" }}>{r.total}</b></div>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 10 }}>
          {r.wrong.length > 0 && <Btn variant="sec" icon={<I.repeat size={15} />} onClick={() => ctx.startRepeatFrom(r.wrong.map((q) => q.id))}>Повторить ошибки</Btn>}
          <Btn variant="pri" icon={<I.arrowR size={15} />} onClick={() => ctx.nav("dashboard")}>На главную</Btn>
        </div>
      </div>

      {/* per-topic */}
      <SectionTitle>Разбивка по блокам</SectionTitle>
      <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
        {Object.entries(r.perTopic).map(([tid, v]) => {
          const t = QData.topic(tid);
          return (
            <div key={tid} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span className="badge-dot" style={{ background: t.color }} />
              <span style={{ width: 170, fontSize: 13.5, color: "var(--tx-2)" }}>{t.name}</span>
              <div style={{ flex: 1 }}><Pbar val={(v.correct / v.total) * 100} color={t.color} /></div>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--tx-3)", width: 44, textAlign: "right" }}>{v.correct}/{v.total}</span>
            </div>
          );
        })}
      </div>

      <SectionTitle action={<button className="btn btn-ghost" style={{ height: 28, fontSize: 12.5 }} onClick={() => setReview((s) => !s)}>{review ? "Свернуть" : "Развернуть все"}</button>}>Разбор ответов</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {r.quiz.questions.map((q) => <ReviewItem key={q.id} q={q} ans={r.answers[q.id]} open={review} />)}
      </div>
    </div>
  );
}
function ReviewItem({ q, ans, open }) {
  const [ex, setEx] = useState(false);
  const show = open || ex;
  const ok = isCorrect(q, ans);
  const VizComp = q.viz && VIZ[q.viz];
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button onClick={() => setEx((s) => !s)} style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, padding: 16, textAlign: "left" }}>
        <span style={{ flex: "0 0 24px", height: 24, borderRadius: 7, display: "grid", placeItems: "center", background: ok ? "var(--ok-dim)" : "var(--bad-dim)", color: ok ? "var(--ok)" : "var(--bad)" }}>{ok ? <I.check size={14} /> : <I.x size={14} />}</span>
        <span style={{ flex: 1, fontSize: 14.5, lineHeight: 1.4 }}><RichText text={q.q} /></span>
        <I.chevR size={16} style={{ color: "var(--tx-3)", transform: show ? "rotate(90deg)" : "none", transition: ".2s", flex: "0 0 16px", marginTop: 3 }} />
      </button>
      {show && (
        <div className="fade-in" style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {(q._order || q.options.map((_, k) => k)).map((oi, pos) => {
              const opt = q.options[oi];
              const correct = q.correct.includes(oi), chosen = (ans || []).includes(oi);
              let cls = "opt"; if (correct) cls += " correct"; else if (chosen) cls += " wrong"; else cls += " dim";
              return <div key={oi} className={cls} style={{ cursor: "default", padding: "10px 13px" }}><span className="opt-key">{String.fromCharCode(65 + pos)}</span><span className="opt-txt" style={{ fontSize: 13.5 }}><RichText text={opt} /></span></div>;
            })}
          </div>
          <div className="explain"><RichText text={q.explain} /></div>
          {VizComp && <VizComp />}
          {q.figure && <Figure name={q.figure} caption={q.figureCaption} />}
        </div>
      )}
    </div>
  );
}
