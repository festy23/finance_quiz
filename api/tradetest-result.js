import { sql } from './_lib/db.js'
import { requireUser } from './_lib/auth.js'
import { computeStreak } from './_lib/quiz.js'
import { getQuiz, DEFAULT_QUIZ } from './_data/registry.js'

const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })

  const quizId = req.body?.quiz || DEFAULT_QUIZ
  const quiz = getQuiz(quizId)
  if (!quiz || !quiz.features.tradetest) return res.status(404).json({ error: 'tradetest not available' })

  const score = Number(req.body?.score)
  if (!Number.isFinite(score)) return res.status(400).json({ error: 'bad request' })
  const uid = u.id
  const day = dayKey(Date.now())
  const n = quiz.tradetest.length

  await sql`
    insert into days (user_id, quiz_id, day, answered) values (${uid}, ${quizId}, ${day}, ${n})
    on conflict (user_id, quiz_id, day) do update set answered = days.answered + ${n}`

  const dayRows = await sql`select day from days where user_id = ${uid} and quiz_id = ${quizId}`
  const streak = computeStreak(dayRows.map((r) => String(r.day).slice(0, 10)))

  await sql`
    insert into user_meta (user_id, quiz_id, best_streak, tt_best) values (${uid}, ${quizId}, ${streak}, ${score})
    on conflict (user_id, quiz_id) do update
      set tt_best = greatest(coalesce(user_meta.tt_best, 0), ${score}),
          best_streak = greatest(user_meta.best_streak, ${streak})`

  res.json({ ttBest: score, ok: true })
}
