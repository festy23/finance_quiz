import React, { useEffect, useRef, useState } from 'react'
import { Logo } from '../components/ui.jsx'
import { TVChart, anchorsToCloses, genCandles } from '../components/charts.jsx'

const BOT = import.meta.env.VITE_TELEGRAM_BOT_USERNAME

// Telegram вызывает window.onTelegramAuth(user) после успешного входа в виджете.
export default function Auth({ onLogin }) {
  const slot = useRef(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // onLogin (ctx.login) бросает исключение при сбое — ловим и показываем ошибку.
    window.onTelegramAuth = async (user) => {
      setError(null)
      setBusy(true)
      try {
        await onLogin(user)
      } catch {
        setError('Не удалось войти. Проверьте соединение и попробуйте ещё раз.')
      } finally {
        setBusy(false)
      }
    }
    const s = document.createElement('script')
    s.src = 'https://telegram.org/js/telegram-widget.js?22'
    s.async = true
    s.setAttribute('data-telegram-login', BOT)
    s.setAttribute('data-size', 'large')
    s.setAttribute('data-radius', '12')
    s.setAttribute('data-request-access', 'write')
    s.setAttribute('data-onauth', 'onTelegramAuth(user)')
    slot.current?.appendChild(s)
    return () => { delete window.onTelegramAuth }
  }, [onLogin])

  const candles = genCandles(anchorsToCloses([[0, 80], [0.4, 110], [0.6, 96], [1, 130]], 50, 1.4, 3), { seed: 9 })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(1000px 500px at 50% -10%, rgba(41,98,255,.14), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '45%', opacity: 0.3, pointerEvents: 'none' }}>
        <TVChart candles={candles} height={360} autosize />
      </div>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 410, padding: 30, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
          <Logo size={34} />
          <div>
            <div className="brand-name" style={{ fontSize: 16 }}>Кванта</div>
            <div className="brand-sub">тренажёр по финансам</div>
          </div>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, letterSpacing: '-.02em' }}>Вход через Telegram</h2>
        <p style={{ fontSize: 13, color: 'var(--tx-3)', marginTop: 0, lineHeight: 1.5 }}>
          Авторизация и сохранение прогресса — только через Telegram. Нажмите кнопку ниже.
        </p>
        <div ref={slot} style={{ marginTop: 22, minHeight: 48, display: 'flex', justifyContent: 'center', opacity: busy ? 0.5 : 1, pointerEvents: busy ? 'none' : 'auto' }} />
        {busy && <p style={{ fontSize: 12, color: 'var(--tx-3)', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>Входим…</p>}
        {error && <p style={{ fontSize: 12.5, color: 'var(--down, #ef5350)', textAlign: 'center', marginTop: 12, marginBottom: 0, lineHeight: 1.45 }}>{error}</p>}
        <p style={{ fontSize: 11, color: 'var(--tx-3)', textAlign: 'center', marginTop: 18, marginBottom: 0, lineHeight: 1.5 }}>
          Мы получаем только ваш Telegram-профиль (имя и фото). Пароль не требуется.
        </p>
      </div>
    </div>
  )
}
