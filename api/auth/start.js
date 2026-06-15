import crypto from 'node:crypto'
import { sql } from '../_lib/db.js'

// Создаёт одноразовый login-токен и deep-link в бота. Фронт открывает ссылку
// и опрашивает /api/auth/poll, пока пользователь не нажмёт Start в боте.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  const token = crypto.randomBytes(16).toString('hex')
  await sql`insert into login_tokens (token, status) values (${token}, 'pending')`
  const bot = process.env.TELEGRAM_BOT_USERNAME
  res.json({ token, url: `https://t.me/${bot}?start=${token}` })
}
