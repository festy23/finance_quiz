import { sql } from './_lib/db.js'
import { requireUser } from './_lib/auth.js'
import { computeStreak, scoreAttempt } from './_lib/quiz.js'
import { getQuiz, DEFAULT_QUIZ } from './_data/registry.js'

const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })

  const { quiz: quizId = DEFAULT_QUIZ, mode, topic = null, qids, answers, date } = req.body || {}
  if (!Array.isArray(qids) || typeof answers !== 'object' || !answers) {
    return res.status(400).json({ error: 'bad request' })
  }
  const quiz = getQuiz(quizId)
  if (!quiz) return res.status(404).json({ error: 'quiz not found' })

  const uid = u.id
  const when = date || Date.now()
  const { score, spark, results } = scoreAttempt(quiz, qids, answers)

  for (const { id, ok } of results) {
    await sql`
      insert into qstats (user_id, quiz_id, question_id, seen, correct)
      values (${uid}, ${quizId}, ${id}, 1, ${ok ? 1 : 0})
      on conflict (user_id, quiz_id, question_id) do update
        set seen = qstats.seen + 1, correct = qstats.correct + ${ok ? 1 : 0}`
    if (ok) {
      await sql`delete from wrong where user_id = ${uid} and quiz_id = ${quizId} and question_id = ${id}`
    } else {
      await sql`insert into wrong (user_id, quiz_id, question_id) values (${uid}, ${quizId}, ${id}) on conflict (user_id, quiz_id, question_id) do nothing`
    }
  }

  const attemptId = 'a' + quizId + '-' + when
  await sql`
    insert into attempts (id, user_id, quiz_id, mode, topic, score, total, qids, answers, spark)
    values (${attemptId}, ${uid}, ${quizId}, ${mode}, ${topic}, ${score}, ${qids.length},
            ${JSON.stringify(qids)}::jsonb, ${JSON.stringify(answers)}::jsonb, ${JSON.stringify(spark)}::jsonb)
    on conflict (id) do nothing`

  const day = dayKey(when)
  await sql`
    insert into days (user_id, quiz_id, day, answered) values (${uid}, ${quizId}, ${day}, ${qids.length})
    on conflict (user_id, quiz_id, day) do update set answered = days.answered + ${qids.length}`

  const dayRows = await sql`select day from days where user_id = ${uid} and quiz_id = ${quizId}`
  const streak = computeStreak(dayRows.map((r) => String(r.day).slice(0, 10)))
  await sql`
    insert into user_meta (user_id, quiz_id, best_streak) values (${uid}, ${quizId}, ${streak})
    on conflict (user_id, quiz_id) do update set best_streak = greatest(user_meta.best_streak, ${streak})`

  res.json({ attempt: { id: attemptId, mode, topic, score, total: qids.length, date: when, qids, answers, spark } })
}
