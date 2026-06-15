import React from 'react'
import { I, Btn, Stat } from '../components/ui.jsx'
import { C } from '../lib/content.js'

export function ProfileScreen({ ctx }) {
  const { user, stats, streak, attempts } = ctx
  const totalAnswered = C.topics.reduce((a, t) => a + (stats[t.id]?.answered || 0), 0)
  const totalCorrect = C.topics.reduce((a, t) => a + (stats[t.id]?.correct || 0), 0)
  const acc = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const initial = (user?.name || 'U').slice(0, 1).toUpperCase()

  return (
    <div className="wrap fade-in" style={{ maxWidth: 560 }}>
      <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 24, overflow: 'hidden' }}>
          {user?.photo_url
            ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 0 5px', fontSize: 22, letterSpacing: '-.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</h2>
          <div className="chip" style={{ height: 26, padding: '0 10px', gap: 6, background: 'var(--glass-2)', border: '1px solid var(--border)', color: 'var(--tx-2)', fontSize: 12 }}>
            <I.check size={12} style={{ color: 'var(--ac-hi)' }} /> Вход через Telegram
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ display: 'flex', gap: 26, marginBottom: 16, flexWrap: 'wrap' }}>
        <Stat val={streak} label="дней подряд" color="var(--ac-hi)" />
        <Stat val={totalAnswered} label="ответов" />
        <Stat val={acc + '%'} label="точность" />
        <Stat val={attempts.length} label="сессий" />
      </div>

      <Btn variant="sec" block lg icon={<I.logout size={16} />} onClick={ctx.logout}>Выйти из аккаунта</Btn>
      <p style={{ fontSize: 12, color: 'var(--tx-3)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
        Прогресс сохраняется на сервере и привязан к вашему Telegram — после выхода и повторного входа всё восстановится.
      </p>
    </div>
  )
}
