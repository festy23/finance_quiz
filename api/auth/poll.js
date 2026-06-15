import { sql } from '../_lib/db.js'
import { signSession, setSessionCookie } from '../_lib/auth.js'

const TTL_MS = 10 * 60 * 1000 // токен живёт 10 минут

// Фронт опрашивает этот эндпоинт с login-токеном. Когда бот подтвердил вход
// (status='confirmed'), создаём/находим пользователя, ставим cookie-сессию.
export default async function handler(req, res) {
  const token = req.query.token
  if (!token) return res.status(400).json({ error: 'no token' })

  const rows = await sql`select * from login_tokens where token = ${token}`
  const lt = rows[0]
  if (!lt) return res.json({ status: 'expired' })
  if (Date.now() - new Date(lt.created_at).getTime() > TTL_MS) return res.json({ status: 'expired' })
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
  setSessionCookie(res, jwt)
  res.json({ status: 'ok', user: { id: Number(user.id), name: user.first_name || user.username, photo_url: user.photo_url } })
}
