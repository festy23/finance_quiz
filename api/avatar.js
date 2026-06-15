import { put, del } from '@vercel/blob'
import { sql } from './_lib/db.js'
import { requireUser } from './_lib/auth.js'

// Загрузка аватара: клиент шлёт ужатый data-URL (JPEG/PNG/WebP), файл кладём в
// Vercel Blob, короткий публичный URL пишем в users.avatar_url. Старый файл чистим.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })

  const dataUrl = req.body && req.body.dataUrl
  const m = typeof dataUrl === 'string' && dataUrl.match(/^data:(image\/(png|jpeg|webp));base64,(.+)$/)
  if (!m) return res.status(400).json({ error: 'bad image' })
  const contentType = m[1]
  const buf = Buffer.from(m[3], 'base64')
  if (buf.length > 700 * 1024) return res.status(413).json({ error: 'too large' })

  const old = (await sql`select avatar_url from users where id = ${u.id}`)[0]?.avatar_url
  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg'
  const blob = await put(`avatars/${u.id}-${Date.now()}.${ext}`, buf, { access: 'public', contentType })

  await sql`update users set avatar_url = ${blob.url} where id = ${u.id}`
  if (old && old.includes('.blob.vercel-storage.com')) { try { await del(old) } catch {} }

  res.json({ url: blob.url })
}
