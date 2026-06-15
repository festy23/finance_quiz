import { sql } from './_lib/db.js'
import { requireUser } from './_lib/auth.js'
import { computeStreak } from './_lib/quiz.js'
import { TRADETEST } from './_data/tradetest.js'

const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })

  const score = Number(req.body?.score)
  if (!Number.isFinite(score)) return res.status(400).json({ error: 'bad request' })
  const uid = u.id
  const day = dayKey(Date.now())

  await sql`
    insert into days (user_id, day, answered) values (${uid}, ${day}, ${TRADETEST.length})
    on conflict (user_id, day) do update set answered = days.answered + ${TRADETEST.length}`

  const dayRows = await sql`select day from days where user_id = ${uid}`
  const streak = computeStreak(dayRows.map((r) => String(r.day).slice(0, 10)))

  await sql`
    insert into user_meta (user_id, best_streak, tt_best) values (${uid}, ${streak}, ${score})
    on conflict (user_id) do update
      set tt_best = greatest(coalesce(user_meta.tt_best, 0), ${score}),
          best_streak = greatest(user_meta.best_streak, ${streak})`

  res.json({ ttBest: score, ok: true })
}
