/* screens/Catalog.jsx — лендинг со списком квизов. Переиспользует card/tile-оформление. */
import React, { useEffect, useState } from 'react'
import { I, Logo, Btn } from '../components/ui.jsx'
import { TVChart, anchorsToCloses, genCandles } from '../components/charts.jsx'
import { api } from '../lib/api.js'
import { PLATFORM } from '../lib/platform.js'

export default function Catalog({ onPick }) {
  const [quizzes, setQuizzes] = useState(null)
  const [err, setErr] = useState(false)
  useEffect(() => {
    api.quizzes().then((d) => setQuizzes(d.quizzes)).catch(() => setErr(true))
  }, [])

  const candles = genCandles(anchorsToCloses([[0, 80], [0.4, 110], [0.6, 96], [1, 130]], 50, 1.4, 3), { seed: 9 })

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(1000px 500px at 50% -10%, rgba(41,98,255,.12), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '38%', opacity: 0.25, pointerEvents: 'none' }}>
        <TVChart candles={candles} height={360} autosize />
      </div>

      <div className="wrap fade-in" style={{ maxWidth: 940, position: 'relative', zIndex: 2, padding: '48px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Logo size={34} />
          <div><div className="brand-name" style={{ fontSize: 18 }}>{PLATFORM.name}</div>
            <div className="brand-sub">{PLATFORM.sub}</div></div>
        </div>
        <h2 style={{ fontSize: 28, letterSpacing: '-.03em', margin: '18px 0 6px' }}>{PLATFORM.tagline}</h2>
        <p style={{ color: 'var(--tx-3)', marginTop: 0, marginBottom: 30, fontSize: 14 }}>Прогресс по каждому тренажёру сохраняется отдельно.</p>

        {err && <div className="card card-pad" style={{ color: 'var(--down)' }}>Не удалось загрузить список квизов. Обновите страницу.</div>}

        <div className="grid-tiles" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
          {(quizzes || []).map((q) => (
            <button key={q.id} className="tile" onClick={() => onPick(q.id)} style={{
              textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 168,
            }}>
              <div className="glow" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: `${q.accent}22`, display: 'grid', placeItems: 'center', color: q.accent, boxShadow: `inset 0 0 0 1px ${q.accent}55` }}>{(I[q.icon] || I.brain)({ size: 22 })}</div>
                <I.arrowR size={18} style={{ color: 'var(--tx-3)' }} />
              </div>
              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-.01em' }}>{q.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--tx-3)', marginTop: 6, lineHeight: 1.5 }}>{q.tagline}</div>
              </div>
              <div style={{ display: 'flex', gap: 14, position: 'relative', fontSize: 12, color: 'var(--tx-3)' }}>
                <span className="mono">{q.questionCount} вопросов</span>
                <span className="mono">{q.topicCount} блока</span>
              </div>
            </button>
          ))}

          {quizzes && (
            <div className="tile" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', justifyContent: 'center', minHeight: 168, opacity: .5 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--panel-3)', display: 'grid', placeItems: 'center', color: 'var(--tx-3)' }}>{I.layers({ size: 22 })}</div>
              <div><div style={{ fontWeight: 600, fontSize: 15 }}>Скоро ещё</div>
                <div style={{ fontSize: 12.5, color: 'var(--tx-3)', marginTop: 4 }}>Новые тренажёры в разработке</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
