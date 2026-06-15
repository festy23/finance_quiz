import { sql } from '../_lib/db.js'
import { verifyTelegramLogin } from '../_lib/telegram.js'
import { signSession, setSessionCookie } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })

  const fields = verifyTelegramLogin(req.body, process.env.TELEGRAM_BOT_TOKEN)
  if (!fields) return res.status(401).json({ error: 'invalid telegram signature' })

  const tgId = Number(fields.id)
  const rows = await sql`
    insert into users (telegram_id, username, first_name, last_name, photo_url)
    values (${tgId}, ${fields.username || null}, ${fields.first_name || null}, ${fields.last_name || null}, ${fields.photo_url || null})
    on conflict (telegram_id) do update
      set username = excluded.username,
          first_name = excluded.first_name,
          last_name = excluded.last_name,
          photo_url = excluded.photo_url
    returning id, telegram_id, username, first_name, last_name, photo_url`
  const user = rows[0]
  await sql`insert into user_meta (user_id, best_streak) values (${user.id}, 0) on conflict do nothing`

  const token = await signSession({
    id: Number(user.id), telegram_id: Number(user.telegram_id),
    name: user.first_name || user.username, photo_url: user.photo_url,
  })
  setSessionCookie(res, token)
  res.json({ user: { id: Number(user.id), name: user.first_name || user.username, username: user.username, photo_url: user.photo_url } })
}
