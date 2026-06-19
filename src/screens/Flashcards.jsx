/* screens/Flashcards.jsx — режим зубрёжки: flip-карточка + самооценка (localStorage). */
import React, { useState, useMemo } from 'react'
import { I, Btn, Pbar, TopicChip } from '../components/ui.jsx'
import { RichText } from '../components/Tex.jsx'
import { Figure } from '../components/Figure.jsx'
import { C } from '../lib/content.js'
import { QData } from '../lib/quiz.js'
import { nextOrder, mergeRatings, dueCount, loadRatings, saveRatings } from '../lib/srs.js'
import { Empty } from './LearnStats.jsx'

export function FlashcardsScreen({ ctx }) {
  const [topic, setTopic] = useState(null)
  const [ratings, setRatings] = useState(() => loadRatings('matstat'))
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const pool = useMemo(() => C.flashcards.filter((c) => !topic || c.topic === topic), [topic])
  const deck = useMemo(() => nextOrder(pool, ratings), [pool, ratings])
  const card = deck[idx]
  const due = dueCount(pool, ratings)

  const rate = (r) => {
    const next = mergeRatings(ratings, card.id, r)
    setRatings(next); saveRatings('matstat', next)
    setFlipped(false); setIdx((i) => (i + 1 < deck.length ? i + 1 : 0))
  }

  if (!C.flashcards.length) return <div className="wrap"><Empty text="Карточки появятся скоро" /></div>

  return (
    <div className="wrap fade-in" style={{ maxWidth: 720 }}>
      <h2 style={{ fontSize: 24, letterSpacing: "-.02em", margin: "0 0 4px" }}>Карточки</h2>
      <p style={{ color: "var(--tx-3)", marginTop: 0, marginBottom: 18, fontSize: 14 }}>Зубрёжка формул и определений. Осталось повторить: <b className="mono">{due}</b></p>

      <div className="seg" style={{ marginBottom: 18 }}>
        <button className={!topic ? "on" : ""} onClick={() => { setTopic(null); setIdx(0); setFlipped(false) }}>Все</button>
        {C.topics.map((t) => <button key={t.id} className={topic === t.id ? "on" : ""} onClick={() => { setTopic(t.id); setIdx(0); setFlipped(false) }}>{t.short}</button>)}
      </div>

      {!card ? <Empty text="В этой теме карточек нет" /> : (
        <>
          <div style={{ marginBottom: 10 }}><Pbar val={(idx / Math.max(1, deck.length)) * 100} color="var(--ac)" /></div>
          <button onClick={() => setFlipped((f) => !f)} className="card card-pad" style={{ width: "100%", minHeight: 240, display: "flex", flexDirection: "column", gap: 14, textAlign: "left", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <TopicChip topic={card.topic} small />
              <span className="chip" style={{ background: "var(--panel-2)", color: "var(--tx-3)" }}>{flipped ? "ответ" : "вопрос"}</span>
            </div>
            <div style={{ flex: 1, display: "grid", placeItems: "center", fontSize: 17, lineHeight: 1.5, padding: "10px 4px" }}>
              <div><RichText text={flipped ? card.back : card.front} /></div>
            </div>
            {flipped && card.figure && <Figure name={card.figure} caption={card.figureCaption} />}
            {!flipped && <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--tx-3)" }}>нажмите, чтобы перевернуть</div>}
          </button>

          {flipped && (
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <Btn variant="sec" block lg icon={<I.repeat size={16} />} onClick={() => rate('again')}>Повторить</Btn>
              <Btn variant="pri" block lg icon={<I.check size={16} />} onClick={() => rate('know')}>Знаю</Btn>
            </div>
          )}
        </>
      )}
    </div>
  )
}
