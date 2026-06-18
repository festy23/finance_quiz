import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './screens/Root.jsx'
import { api } from './lib/api.js'
import './styles.css'

// Telegram Login Widget привязан к одному домену (financequiz-gamma.vercel.app).
// Любой другой *.vercel.app адрес даёт "Bot domain invalid". Канонизируем хост.
const CANONICAL_HOST = 'financequiz-gamma.vercel.app'
if (
  typeof location !== 'undefined' &&
  location.hostname.endsWith('.vercel.app') &&
  location.hostname !== CANONICAL_HOST
) {
  location.replace('https://' + CANONICAL_HOST + location.pathname + location.search)
}

async function boot() {
  // Сессия Telegram глобальна — грузим один раз. Контент квиза подгрузит Root по роуту.
  const me = await api.me() // { user } или null
  ReactDOM.createRoot(document.getElementById('root')).render(<Root initialMe={me} />)
}

function fatal(message) {
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML =
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;' +
      'font-family:system-ui,sans-serif;color:#c9d1e0;background:#0b0d12;text-align:center;line-height:1.5">' +
      '<div><div style="font-size:16px;font-weight:600;margin-bottom:8px">Не удалось загрузить приложение</div>' +
      '<div style="font-size:13px;opacity:.7">' + message + '</div></div></div>'
  }
}

boot().catch(() => fatal('Проверьте соединение и обновите страницу.'))
