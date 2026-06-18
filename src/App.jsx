/* App.jsx — store, router, app shell (desktop sidebar / mobile tabbar), tweaks. */
import React, { useState as uS, useEffect as uE, useMemo } from 'react'
import { api } from './lib/api.js'
import { C } from './lib/content.js'
import { QData, computeStats, computeStreak, dayKey, isCorrect, withShuffledOptions } from './lib/quiz.js'
import { buildMetrics, buildAchievements } from './lib/achievements.js'
import { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle } from './components/tweaks.jsx'
import { I, Logo, Btn } from './components/ui.jsx'
import Auth from './screens/Auth.jsx'
import { Dashboard } from './screens/Dashboard.jsx'
import { ModesScreen, LearnScreen, ProgressScreen, HistoryScreen } from './screens/LearnStats.jsx'
import { GlossaryScreen, TradeTestScreen } from './screens/Extra.jsx'
import { QuizScreen, ResultScreen } from './screens/Quiz.jsx'
import { ProfileScreen } from './screens/Profile.jsx'

/* ---------- accent palette derived from any hex (works with white button text) ---------- */
function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function paletteFor(hex) {
  const [r, g, b] = hexToRgb(hex);
  const hi = `rgb(${Math.min(255, r + 32)},${Math.min(255, g + 32)},${Math.min(255, b + 32)})`;
  return { hi, dim: `rgba(${r},${g},${b},.16)`, line: `rgba(${r},${g},${b},.45)` };
}
const FONTS = {
  plex: "'IBM Plex Sans',system-ui,sans-serif",
  system: "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
  mono: "'IBM Plex Mono',ui-monospace,monospace",
};

/* ---------- app ---------- */
const EMPTY = { user: null, attempts: [], qstats: {}, wrong: [], days: {}, bestStreak: 0, ttBest: null };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#3b76ff",
  "font": "plex",
  "density": "regular",
  "vizInQuiz": true
}/*EDITMODE-END*/;

export default function App({ quizId, initialUser, initialStore, onExitQuiz }) {
  // Акцент по умолчанию берём из манифеста квиза (C.accent); пользователь может переопределить в tweaks.
  const tweakDefaults = useMemo(() => ({ ...TWEAK_DEFAULTS, accent: C.accent || TWEAK_DEFAULTS.accent }), []);
  const [t, setTweak] = useTweaks(tweakDefaults);
  const [store, setStore] = uS(initialStore || EMPTY);
  const [screen, setScreen] = uS(initialUser ? "dashboard" : "auth");
  const [quiz, setQuiz] = uS(null);
  const [lastResult, setLastResult] = uS(null);
  const [learnTopic, setLearnTopic] = uS(null);
  const [moreOpen, setMoreOpen] = uS(false);
  const [winW, setWinW] = uS(window.innerWidth);
  uE(() => { const f = () => setWinW(window.innerWidth); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);

  const persist = (mut) => setStore((s) => ({ ...s, ...mut(s) }));
  const stats = useMemo(() => computeStats(store.qstats), [store.qstats]);
  const streak = useMemo(() => computeStreak(store.days), [store.days]);

  /* navigation + actions */
  const nav = (sc) => { setScreen(sc); setMoreOpen(false); document.querySelector(".content,.main")?.scrollTo?.(0, 0); };
  const ctx = {
    user: store.user, attempts: store.attempts, stats, streak, quiz, lastResult, learnTopic,
    isMobile: winW < 760,
    nav,
    login: async () => {
      // сессия уже выставлена /api/auth/poll — остаётся подтянуть прогресс
      const progress = await api.progress(quizId)
      setStore(progress)
      setScreen("dashboard")
    },
    logout: async () => {
      await api.logout()
      setStore(EMPTY)
      setScreen("auth")
    },
    setAvatar: (url) => setStore((s) => ({ ...s, user: { ...s.user, photo_url: url } })),
    wrongIdList: () => store.wrong.map((id) => QData.question(id)).filter(Boolean),
    bestStreak: () => Math.max(store.bestStreak, streak),
    ttBest: store.ttBest,
    recordTradeResult: (sc) => {
      const days = { ...store.days }; const k = dayKey(Date.now()); days[k] = (days[k] || 0) + C.tradetest.length;
      persist((s) => ({ days, ttBest: Math.max(s.ttBest || 0, sc), bestStreak: Math.max(s.bestStreak, computeStreak(days)) }));
      api.saveTradeResult(quizId, sc).catch(() => {})
    },
    openLearn: (tid) => { setLearnTopic(tid); nav("learn"); },
    confirmExit: () => nav("dashboard"),
    startQuiz: (mode, topic, reveal = "instant") => {
      let qs;
      if (mode === "repeat") { qs = ctx.wrongIdList(); if (!qs.length) qs = C.questions; qs = QData.shuffle(qs).slice(0, C.modes.repeat.count); }
      else { const pool = topic ? QData.byTopic(topic) : C.questions; const m = C.modes[mode]; qs = QData.shuffle(pool); if (m.count) qs = qs.slice(0, m.count); }
      qs = qs.map(withShuffledOptions);
      setQuiz({ mode, topic, questions: qs, reveal }); nav("quiz");
    },
    startRepeatFrom: (ids, reveal = "instant") => { const qs = QData.shuffle(ids.map((i) => QData.question(i)).filter(Boolean)).map(withShuffledOptions); setQuiz({ mode: "repeat", topic: null, questions: qs, reveal }); nav("quiz"); },
    finishQuiz: (qz, answers) => {
      let score = 0; const perTopic = {}; const wrongQ = []; const qstats = { ...store.qstats }; const wrong = new Set(store.wrong);
      qz.questions.forEach((q) => {
        const ok = isCorrect(q, answers[q.id]);
        if (ok) score++; else wrongQ.push(q);
        perTopic[q.topic] = perTopic[q.topic] || { correct: 0, total: 0 };
        perTopic[q.topic].total++; if (ok) perTopic[q.topic].correct++;
        const st = qstats[q.id] || { seen: 0, correct: 0 }; st.seen++; if (ok) { st.correct++; wrong.delete(q.id); } else wrong.add(q.id); qstats[q.id] = st;
      });
      const attempt = { id: "a" + Date.now(), mode: qz.mode, topic: qz.topic, score, total: qz.questions.length, date: Date.now(),
        qids: qz.questions.map((q) => q.id), answers, spark: qz.questions.map((q) => isCorrect(q, answers[q.id]) ? 100 : 20) };
      const days = { ...store.days }; const k = dayKey(Date.now()); days[k] = (days[k] || 0) + qz.questions.length;
      persist((s) => ({ attempts: [attempt, ...s.attempts].slice(0, 60), qstats, wrong: [...wrong], days, bestStreak: Math.max(s.bestStreak, computeStreak(days)) }));
      api.saveAttempt(quizId, { mode: qz.mode, topic: qz.topic, qids: attempt.qids, answers, date: attempt.date }).catch(() => {})
      setLastResult({ quiz: qz, answers, score, total: qz.questions.length, perTopic, wrong: wrongQ }); nav("result");
    },
    reviewAttempt: (a) => {
      const questions = a.qids.map((id) => QData.question(id)).filter(Boolean);
      const qz = { mode: a.mode, topic: a.topic, questions };
      const perTopic = {}; const wrongQ = [];
      questions.forEach((q) => { const ok = isCorrect(q, a.answers[q.id]); perTopic[q.topic] = perTopic[q.topic] || { correct: 0, total: 0 }; perTopic[q.topic].total++; if (ok) perTopic[q.topic].correct++; else wrongQ.push(q); });
      setLastResult({ quiz: qz, answers: a.answers, score: a.score, total: a.total, perTopic, wrong: wrongQ }); nav("result");
    },
    activity: () => {
      const weeks = []; const end = new Date(); end.setHours(0, 0, 0, 0);
      const start = new Date(end); start.setDate(start.getDate() - 83);
      for (let w = 0; w < 12; w++) { const col = []; for (let d = 0; d < 7; d++) { const day = new Date(start); day.setDate(start.getDate() + w * 7 + d); col.push(store.days[dayKey(day)] || 0); } weeks.push(col); }
      return weeks;
    },
    achievements: () => {
      const metrics = buildMetrics({ stats, topics: C.topics, attempts: store.attempts, bestStreak: ctx.bestStreak() });
      return buildAchievements(C.achievements, metrics);
    },
  };

  /* tweak-driven theme vars */
  const ac = paletteFor(t.accent);
  const themeVars = {
    "--ac": t.accent, "--ac-hi": ac.hi, "--ac-dim": ac.dim, "--ac-line": ac.line,
    "--fs": FONTS[t.font] || FONTS.plex,
    fontSize: t.density === "compact" ? 14 : 15,
    height: "100%",
  };

  const isMobile = winW < 760;

  const NAVMAP = {
    dashboard: { label: "Главная", icon: "home" },
    modes: { label: "Тренировка", icon: "play" },
    tradetest: { label: "Трейд-тест", icon: "trend" },
    learn: { label: "Изучение", icon: "brain" },
    glossary: { label: "Словарь", icon: "book" },
    progress: { label: "Прогресс", icon: "chart" },
    history: { label: "История", icon: "history" },
  };
  const feat = C.features || {};
  const GROUPS = [
    { items: ["dashboard"] },
    { label: "Практика", items: ["modes", ...(feat.tradetest ? ["tradetest"] : [])] },
    { label: "Материалы", items: ["learn", ...(feat.glossary ? ["glossary"] : [])] },
    { label: "Статистика", items: ["progress", "history"] },
  ];
  const MOBILE_PRIMARY = ["dashboard", "modes", ...(feat.tradetest ? ["tradetest"] : []), "learn"].slice(0, 4);
  const MOBILE_MORE = [...(feat.glossary ? ["glossary"] : []), "progress", "history"];
  const titleOf = { ...Object.fromEntries(Object.entries(NAVMAP).map(([k, v]) => [k, v.label])), result: "Результат", quiz: "Квиз", profile: "Профиль" };

  const renderScreen = () => {
    switch (screen) {
      case "auth": return <Auth onLogin={ctx.login} />;
      case "dashboard": return <Dashboard ctx={ctx} />;
      case "modes": return <ModesScreen ctx={ctx} />;
      case "tradetest": return <TradeTestScreen ctx={ctx} />;
      case "learn": return <LearnScreen ctx={{ ...ctx, learnTopic }} />;
      case "glossary": return <GlossaryScreen ctx={ctx} />;
      case "progress": return <ProgressScreen ctx={ctx} />;
      case "history": return <HistoryScreen ctx={ctx} />;
      case "profile": return <ProfileScreen ctx={ctx} />;
      case "result": return <ResultScreen ctx={ctx} />;
      case "quiz": return <QuizScreen ctx={{ ...ctx, vizInQuiz: t.vizInQuiz }} />;
      default: return <Dashboard ctx={ctx} />;
    }
  };

  /* ----- AUTH full-screen (no shell) ----- */
  if (screen === "auth") {
    return <div style={{ ...themeVars }}><Auth onLogin={ctx.login} />{tweakPanel(t, setTweak)}</div>;
  }

  const shell = (
    <div className={"app" + (isMobile ? " mobile" : "")} style={themeVars}>
      {!isMobile && (
        <aside className="sidebar">
          <div className="brand" onClick={onExitQuiz} style={{ cursor: "pointer" }} title="Все квизы">
            <Logo /><div><div className="brand-name">{C.brand?.name}</div><div className="brand-sub">{C.brand?.sub}</div></div>
          </div>
          {GROUPS.map((g, gi) => (
            <React.Fragment key={gi}>
              {g.label && <div className="nav-sec">{g.label}</div>}
              {g.items.map((id) => { const n = NAVMAP[id]; return <button key={id} className={"nav-item" + (screen === id ? " on" : "")} onClick={() => nav(id)}>{I[n.icon]({ size: 18 })}{n.label}</button>; })}
            </React.Fragment>
          ))}
          <div className="sidebar-foot">
            <div className="user-chip" onClick={() => nav("profile")} title="Профиль" style={{ cursor: "pointer" }}>
              <div className="avatar" style={{ overflow: "hidden" }}>{store.user?.photo_url ? <img src={store.user.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (store.user?.name || "U").slice(0, 1).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{store.user?.name}</div>
                <div style={{ fontSize: 11, color: "var(--tx-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Профиль</div></div>
              <I.chevR size={16} style={{ color: "var(--tx-3)" }} />
            </div>
          </div>
        </aside>
      )}
      <main className="main">
        {isMobile && screen !== "quiz" && (
          <div className="mobile-top">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}><Logo size={26} /><span style={{ fontWeight: 600, fontSize: 15 }}>{titleOf[screen]}</span></div>
            <div className="avatar" style={{ width: 30, height: 30, flex: "0 0 30px", fontSize: 12, overflow: "hidden", cursor: "pointer" }} onClick={() => nav("profile")}>{store.user?.photo_url ? <img src={store.user.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (store.user?.name || "U").slice(0, 1).toUpperCase()}</div>
          </div>
        )}
        {!isMobile && screen !== "quiz" && (
          <div className="topbar"><h1>{titleOf[screen]}</h1><div style={{ flex: 1 }} />
            {screen !== "modes" && <Btn variant="pri" icon={<I.play size={14} fill />} onClick={() => nav("modes")}>Тренировка</Btn>}</div>
        )}
        {screen === "quiz" ? renderScreen() : <div className="content">{renderScreen()}</div>}
        {isMobile && screen !== "quiz" && (
          <nav className="tabbar">
            {MOBILE_PRIMARY.map((id) => { const n = NAVMAP[id]; return <button key={id} className={"tab" + (screen === id ? " on" : "")} onClick={() => nav(id)}>{I[n.icon]({ size: 21 })}{n.label}</button>; })}
            <button className={"tab" + (MOBILE_MORE.includes(screen) || moreOpen ? " on" : "")} onClick={() => setMoreOpen(true)}>{I.grid({ size: 21 })}Ещё</button>
          </nav>
        )}
      </main>
    </div>
  );

  return (
    <>
      {shell}
      {moreOpen && (
        <div onClick={() => setMoreOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(0,0,0,.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "#13151b", borderTop: "1px solid var(--border)", borderRadius: "18px 18px 0 0", padding: "10px 12px calc(18px + env(safe-area-inset-bottom))", boxShadow: "0 -20px 60px rgba(0,0,0,.6)" }}>
            <div style={{ width: 38, height: 4, borderRadius: 4, background: "var(--border-strong)", margin: "6px auto 12px" }} />
            {MOBILE_MORE.map((id) => { const n = NAVMAP[id]; return (
              <button key={id} onClick={() => nav(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "13px 12px", borderRadius: "var(--r-sm)", color: screen === id ? "var(--ac-hi)" : "var(--tx)", fontSize: 15, fontWeight: 500, textAlign: "left" }}>{I[n.icon]({ size: 19 })}{n.label}</button>
            ); })}
            <button onClick={onExitQuiz} style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "13px 12px", borderRadius: "var(--r-sm)", color: "var(--tx-2)", fontSize: 15, fontWeight: 500, textAlign: "left" }}>{I.grid({ size: 19 })}Все квизы</button>
            <div className="divider" style={{ margin: "8px 0" }} />
            <button onClick={ctx.logout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "13px 12px", borderRadius: "var(--r-sm)", color: "var(--tx-2)", fontSize: 15, fontWeight: 500, textAlign: "left" }}>{I.logout({ size: 19 })}Выйти</button>
          </div>
        </div>
      )}
      {tweakPanel(t, setTweak)}
    </>
  );
}

function tweakPanel(t, setTweak) {
  return (
    <TweaksPanel>
      <TweakSection label="Акцент" />
      <TweakColor label="Цвет" value={t.accent} options={["#3b76ff", "#2563eb", "#0ea5e9"]} onChange={(v) => setTweak("accent", v)} />
      <TweakSection label="Типографика" />
      <TweakRadio label="Шрифт" value={t.font} options={["plex", "system", "mono"]} onChange={(v) => setTweak("font", v)} />
      <TweakRadio label="Плотность" value={t.density} options={["regular", "compact"]} onChange={(v) => setTweak("density", v)} />
      <TweakSection label="Квиз" />
      <TweakToggle label="Визуализация в разборе" value={t.vizInQuiz} onChange={(v) => setTweak("vizInQuiz", v)} />
    </TweaksPanel>
  );
}
