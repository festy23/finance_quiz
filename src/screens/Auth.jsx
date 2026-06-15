import React, { useEffect, useRef, useState } from 'react'
import { Logo, Btn, I } from '../components/ui.jsx'
import { TVChart, anchorsToCloses, genCandles } from '../components/charts.jsx'
import { api } from '../lib/api.js'

// Вход через deep-link в бота:
//  1) /api/auth/start → одноразовый токен + ссылка t.me/<bot>?start=<token>
//  2) пользователь жмёт Start в боте → webhook подтверждает токен
//  3) опрашиваем /api/auth/poll, на статусе ok сессия уже выставлена → onLogin()
export default function Auth({ onLogin }) {
  const [link, setLink] = useState(null)
  const [phase, setPhase] = useState('loading') // loading | ready | waiting | error
  const tokenRef = useRef(null)
  const pollRef = useRef(null)

  const newToken = async () => {
    setPhase('loading')
    try {
      const { token, url } = await api.authStart()
      tokenRef.current = token
      setLink(url)
      setPhase('ready')
    } catch {
      setPhase('error')
    }
  }

  useEffect(() => {
    newToken()
    return () => clearInterval(pollRef.current)
  }, [])

  const startPolling = () => {
    setPhase('waiting')
    clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const r = await api.authPoll(tokenRef.current)
        if (r.status === 'ok') {
          clearInterval(pollRef.current)
          await onLogin()
        } else if (r.status === 'expired') {
          clearInterval(pollRef.current)
          await newToken()
        }
      } catch {
        /* временная сетевая ошибка — продолжаем опрос */
      }
    }, 2500)
  }

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
            <div className="brand-name" style={{ fontSize: 16 }}>67quant</div>
            <div className="brand-sub">тренажёр по финансам</div>
          </div>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, letterSpacing: '-.02em' }}>Вход через Telegram</h2>
        <p style={{ fontSize: 13, color: 'var(--tx-3)', marginTop: 0, lineHeight: 1.5 }}>
          Нажмите кнопку — откроется бот <b>@{import.meta.env.VITE_TELEGRAM_BOT_USERNAME}</b>. Там нажмите <b>Start</b>, и вы автоматически войдёте.
        </p>

        <div style={{ marginTop: 22 }}>
          {phase === 'error' ? (
            <Btn variant="pri" lg block icon={<I.repeat size={16} />} onClick={newToken}>Не удалось — повторить</Btn>
          ) : (
            <a href={link || '#'} target="_blank" rel="noopener noreferrer"
               onClick={(e) => { if (!link) { e.preventDefault(); return } startPolling() }}
               style={{ textDecoration: 'none', display: 'block', pointerEvents: phase === 'loading' ? 'none' : 'auto', opacity: phase === 'loading' ? 0.6 : 1 }}>
              <Btn variant="pri" lg block icon={<I.arrowR size={17} />}>
                {phase === 'loading' ? 'Готовим вход…' : 'Войти через Telegram'}
              </Btn>
            </a>
          )}

          {phase === 'waiting' && (
            <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12.5, color: 'var(--tx-3)', lineHeight: 1.5 }}>
              Ожидаем подтверждения в боте…<br />
              Не открылся Telegram? <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ac-hi)' }}>Открыть бота вручную</a>
            </div>
          )}
        </div>

        <p style={{ fontSize: 11, color: 'var(--tx-3)', textAlign: 'center', marginTop: 18, marginBottom: 0, lineHeight: 1.5 }}>
          Мы получаем только ваш Telegram-профиль (имя и фото). Пароль не требуется.
        </p>
      </div>
    </div>
  )
}
