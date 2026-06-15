import { requireUser } from '../_lib/auth.js'
import { sql } from '../_lib/db.js'

export default async function handler(req, res) {
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })
  const rows = await sql`select avatar_url from users where id = ${u.id}`
  res.json({ user: { id: u.id, name: u.name, photo_url: rows[0]?.avatar_url || u.photo_url } })
}
