import { sql } from './_lib/db.js'
import { requireUser } from './_lib/auth.js'
import { computeStreak } from './_lib/quiz.js'
import { DEFAULT_QUIZ } from './_data/registry.js'

// Чистая функция — превращает строки БД в форму стора клиента. Тестируется отдельно.
export function buildStore({ user, attempts, qstatsRows, wrongRows, dayRows, meta }) {
  const qstats = {}
  for (const r of qstatsRows) qstats[r.question_id] = { seen: r.seen, correct: r.correct }
  const days = {}
  for (const r of dayRows) days[String(r.day).slice(0, 10)] = r.answered
  const bestStreak = Math.max(meta?.best_streak || 0, computeStreak(Object.keys(days)))
  return {
    user,
    attempts: attempts.map((a) => ({
      id: a.id, mode: a.mode, topic: a.topic, score: a.score, total: a.total,
      qids: a.qids, answers: a.answers, spark: a.spark, date: Date.parse(a.created_at),
    })),
    qstats,
    wrong: wrongRows.map((r) => r.question_id),
    days,
    bestStreak,
    ttBest: meta?.tt_best ?? null,
  }
}

export default async function handler(req, res) {
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })
  const uid = u.id
  const quiz = req.query?.quiz || DEFAULT_QUIZ

  const [attempts, qstatsRows, wrongRows, dayRows, metaRows, userRows] = await Promise.all([
    sql`select id, mode, topic, score, total, qids, answers, spark, created_at from attempts where user_id = ${uid} and quiz_id = ${quiz} order by created_at desc limit 60`,
    sql`select question_id, seen, correct from qstats where user_id = ${uid} and quiz_id = ${quiz}`,
    sql`select question_id from wrong where user_id = ${uid} and quiz_id = ${quiz}`,
    sql`select day, answered from days where user_id = ${uid} and quiz_id = ${quiz}`,
    sql`select best_streak, tt_best from user_meta where user_id = ${uid} and quiz_id = ${quiz}`,
    sql`select avatar_url from users where id = ${uid}`,
  ])

  res.json(buildStore({
    user: { id: u.id, name: u.name, photo_url: userRows[0]?.avatar_url || u.photo_url },
    attempts, qstatsRows, wrongRows, dayRows, meta: metaRows[0] || {},
  }))
}
