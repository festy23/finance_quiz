import { put } from '@vercel/blob'

// Тонкая обёртка над Telegram Bot API.
const base = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

async function call(method, params) {
  const r = await fetch(`${base()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return r.json()
}

export async function sendMessage(chatId, text, extra = {}) {
  try {
    return await call('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...extra })
  } catch {
    return null
  }
}

// Скачивает фото профиля пользователя из Telegram и кладёт в Vercel Blob.
// Возвращает публичный URL или null (если фото скрыто/нет). Best-effort.
export async function fetchProfilePhotoUrl(tgUserId) {
  try {
    const ups = await call('getUserProfilePhotos', { user_id: tgUserId, limit: 1 })
    if (!ups.ok || !ups.result.total_count) return null
    const sizes = ups.result.photos[0]
    const fileId = sizes[sizes.length - 1].file_id // самый крупный размер
    const gf = await call('getFile', { file_id: fileId })
    if (!gf.ok) return null
    const fp = gf.result.file_path
    const res = await fetch(`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fp}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const blob = await put(`tg-avatars/${tgUserId}-${Date.now()}.${fp.split('.').pop() || 'jpg'}`, buf, {
      access: 'public',
      contentType: res.headers.get('content-type') || 'image/jpeg',
    })
    return blob.url
  } catch {
    return null
  }
}
