/* screens/Formulas.jsx — справочник формул: поиск + фильтр по темам + display-формулы. */
import React, { useState, useMemo } from 'react'
import { I, TopicChip } from '../components/ui.jsx'
import { TexBlock, RichText } from '../components/Tex.jsx'
import { Figure } from '../components/Figure.jsx'
import { C } from '../lib/content.js'
import { Empty } from './LearnStats.jsx'

export function FormulasScreen({ ctx }) {
  const [q, setQ] = useState("")
  const [topic, setTopic] = useState(null)
  const term = q.trim().toLowerCase()
  const list = useMemo(() => C.formulas.filter((f) =>
    (!topic || f.topic === topic) &&
    (!term || (f.name + ' ' + (f.note || '') + ' ' + f.latex).toLowerCase().includes(term))
  ), [term, topic])

  return (
    <div className="wrap fade-in" style={{ maxWidth: 880 }}>
      <h2 style={{ fontSize: 24, letterSpacing: "-.03em", margin: "0 0 4px" }}>Шпаргалка формул</h2>
      <p style={{ color: "var(--tx-3)", marginTop: 0, marginBottom: 20, fontSize: 14 }}>{C.formulas.length} формул курса — поиск и фильтр по темам</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 0 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--tx-3)", pointerEvents: "none" }}><I.filter size={15} /></span>
          <input className="input" style={{ paddingLeft: 38 }} placeholder="Поиск формулы…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="seg">
          <button className={!topic ? "on" : ""} onClick={() => setTopic(null)}>Все</button>
          {C.topics.map((t) => <button key={t.id} className={topic === t.id ? "on" : ""} onClick={() => setTopic(t.id)}>{t.short}</button>)}
        </div>
      </div>

      {list.length === 0 ? <Empty text="Ничего не найдено" />
        : <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {list.map((f) => (
            <div key={f.id} className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.3 }}>{f.name}</span>
                <span style={{ flex: "0 0 auto" }}><TopicChip topic={f.topic} small /></span>
              </div>
              <TexBlock tex={f.latex} />
              {f.note && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "var(--tx-2)" }}><RichText text={f.note} /></p>}
              {f.figure && <Figure name={f.figure} caption={f.figureCaption} />}
            </div>
          ))}
        </div>}
    </div>
  )
}
