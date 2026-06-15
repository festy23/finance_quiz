import crypto from 'node:crypto'
import { sql } from '../_lib/db.js'
import { serializeCookie } from '../_lib/auth.js'

// Создаёт одноразовый login-токен + deep-link в бота. Чтобы исключить login-CSRF,
// токен привязывается к браузеру: выдаём httpOnly-cookie с nonce и храним его хеш
// в строке токена. /api/auth/poll примет токен только из того же браузера.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })

  const token = crypto.randomBytes(16).toString('hex')
  const nonce = crypto.randomBytes(24).toString('hex')
  const browserHash = crypto.createHash('sha256').update(nonce).digest('hex')

  await sql`insert into login_tokens (token, status, browser_hash) values (${token}, 'pending', ${browserHash})`
  res.setHeader('Set-Cookie', serializeCookie('login_nonce', nonce, { maxAge: 600 }))

  const bot = process.env.TELEGRAM_BOT_USERNAME
  res.json({ token, url: `https://t.me/${bot}?start=${token}` })
}
