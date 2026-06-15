import crypto from 'node:crypto'
import { sql } from '../_lib/db.js'
import { signSession, serializeCookie, parseCookies, SESSION_COOKIE } from '../_lib/auth.js'

const TTL_MS = 10 * 60 * 1000 // токен живёт 10 минут

// Опрос статуса входа. Токен принимается ТОЛЬКО из того браузера, что начал вход
// (cookie login_nonce, хеш сверяется с browser_hash строки) — защита от login-CSRF.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  const token = req.body && req.body.token
  if (!token) return res.status(400).json({ error: 'no token' })

  const nonce = parseCookies(req.headers.cookie || '')['login_nonce']
  if (!nonce) return res.status(401).json({ status: 'mismatch' })

  const rows = await sql`select * from login_tokens where token = ${token}`
  const lt = rows[0]
  if (!lt) return res.json({ status: 'expired' })
  if (Date.now() - new Date(lt.created_at).getTime() > TTL_MS) return res.json({ status: 'expired' })

  // привязка к исходному браузеру
  const h = crypto.createHash('sha256').update(nonce).digest('hex')
  if (!lt.browser_hash || h !== lt.browser_hash) return res.status(401).json({ status: 'mismatch' })

  if (lt.status === 'pending') return res.json({ status: 'pending' })
  if (lt.status !== 'confirmed') return res.json({ status: 'expired' })

  const urows = await sql`
    insert into users (telegram_id, username, first_name, last_name, photo_url)
    values (${lt.telegram_id}, ${lt.username || null}, ${lt.first_name || null}, ${lt.last_name || null}, ${lt.photo_url || null})
    on conflict (telegram_id) do update
      set username = excluded.username, first_name = excluded.first_name, last_name = excluded.last_name
    returning id, telegram_id, username, first_name, last_name, photo_url`
  const user = urows[0]
  await sql`insert into user_meta (user_id, best_streak) values (${user.id}, 0) on conflict do nothing`
  await sql`update login_tokens set status = 'used' where token = ${token}`

  const jwt = await signSession({
    id: Number(user.id), telegram_id: Number(user.telegram_id),
    name: user.first_name || user.username, photo_url: user.photo_url,
  })
  // ставим сессию и гасим nonce-cookie
  res.setHeader('Set-Cookie', [
    serializeCookie(SESSION_COOKIE, jwt),
    serializeCookie('login_nonce', '', { maxAge: 0 }),
  ])
  res.json({ status: 'ok', user: { id: Number(user.id), name: user.first_name || user.username, photo_url: user.photo_url } })
}
