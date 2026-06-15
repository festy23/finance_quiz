import { requireUser } from '../_lib/auth.js'

export default async function handler(req, res) {
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })
  res.json({ user: { id: u.id, name: u.name, photo_url: u.photo_url } })
}
