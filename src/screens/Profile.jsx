import React, { useRef, useState } from 'react'
import { I, Btn, Stat } from '../components/ui.jsx'
import { C } from '../lib/content.js'
import { api } from '../lib/api.js'

// Ужимаем выбранное фото до квадрата 256×256 (cover-кроп) и отдаём JPEG data-URL —
// так файл лёгкий (~15–30 КБ) и аватар не «сжимается» по форме.
function fileToSquareDataUrl(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size; canvas.height = size
        const ctx = canvas.getContext('2d')
        const s = Math.min(img.width, img.height)
        const sx = (img.width - s) / 2, sy = (img.height - s) / 2
        ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export function ProfileScreen({ ctx }) {
  const { user, stats, streak, attempts } = ctx
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const totalAnswered = C.topics.reduce((a, t) => a + (stats[t.id]?.answered || 0), 0)
  const totalCorrect = C.topics.reduce((a, t) => a + (stats[t.id]?.correct || 0), 0)
  const acc = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const initial = (user?.name || 'U').slice(0, 1).toUpperCase()

  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { setErr('Нужен файл-изображение'); return }
    setErr(null); setBusy(true)
    try {
      const dataUrl = await fileToSquareDataUrl(file)
      const { url } = await api.uploadAvatar(dataUrl)
      ctx.setAvatar(url)
    } catch {
      setErr('Не удалось загрузить фото, попробуйте другое')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="wrap fade-in" style={{ maxWidth: 560 }}>
      <input ref={fileRef} type="file" accept="image/*" onChange={onPick} style={{ display: 'none' }} />

      <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
        <button onClick={() => !busy && fileRef.current?.click()} title="Изменить фото"
          style={{ position: 'relative', width: 72, height: 72, flex: '0 0 72px', padding: 0, border: 'none', background: 'none', cursor: busy ? 'default' : 'pointer', borderRadius: 20 }}>
          <div className="avatar" style={{ width: 72, height: 72, flex: '0 0 72px', borderRadius: 20, fontSize: 26, overflow: 'hidden' }}>
            {user?.photo_url
              ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initial}
          </div>
          <span style={{ position: 'absolute', right: -2, bottom: -2, width: 26, height: 26, borderRadius: '50%', background: 'var(--ac)', display: 'grid', placeItems: 'center', border: '2px solid var(--bg-1)', boxShadow: 'var(--sheen)' }}>
            {busy ? <span style={{ width: 11, height: 11, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'block', animation: 'spin .7s linear infinite' }} /> : <I.camera size={13} style={{ color: '#fff' }} />}
          </span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 0 5px', fontSize: 22, letterSpacing: '-.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</h2>
          <div className="chip" style={{ height: 26, padding: '0 10px', gap: 6, background: 'var(--glass-2)', border: '1px solid var(--border)', color: 'var(--tx-2)', fontSize: 12 }}>
            <I.check size={12} style={{ color: 'var(--ac-hi)' }} /> Вход через Telegram
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <Btn variant="sec" icon={<I.camera size={15} />} onClick={() => !busy && fileRef.current?.click()} disabled={busy}>{busy ? 'Загрузка…' : 'Сменить фото'}</Btn>
        {err && <span style={{ fontSize: 12.5, color: 'var(--down, #ef5350)' }}>{err}</span>}
      </div>

      <div className="card card-pad" style={{ display: 'flex', gap: 26, marginBottom: 16, flexWrap: 'wrap' }}>
        <Stat val={streak} label="дней подряд" color="var(--ac-hi)" />
        <Stat val={totalAnswered} label="ответов" />
        <Stat val={acc + '%'} label="точность" />
        <Stat val={attempts.length} label="сессий" />
      </div>

      <Btn variant="sec" block lg icon={<I.logout size={16} />} onClick={ctx.logout}>Выйти из аккаунта</Btn>
      <p style={{ fontSize: 12, color: 'var(--tx-3)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
        Прогресс и фото сохраняются на сервере и привязаны к вашему Telegram — после выхода и повторного входа всё восстановится.
      </p>
    </div>
  )
}
