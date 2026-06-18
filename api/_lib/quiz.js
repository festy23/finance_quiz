// Серверная копия проверки ответов и подсчёта серии.
// Дублирует src/lib/quiz.js намеренно: разные корни (src vs api) деплоятся отдельно.

export function arrEq(a, b) {
  const x = [...a].sort(), y = [...b].sort()
  return x.length === y.length && x.every((v, i) => v === y[i])
}

export function isCorrect(q, ans) {
  return Array.isArray(ans) && arrEq(ans, q.correct)
}

const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

// days: массив строк 'YYYY-MM-DD'. Возвращает длину серии до сегодня.
export function computeStreak(daySet) {
  const set = new Set(daySet)
  let n = 0
  const d = new Date()
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1)
  for (let i = 0; i < 400; i++) {
    if (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1) } else break
  }
  return n
}

// Чистый подсчёт попытки. quiz.questions — массив {id, correct}.
// Возвращает { score, spark, results:[{id, ok}] }. Неизвестные id — неверные.
export function scoreAttempt(quiz, qids, answers) {
  const byId = new Map(quiz.questions.map((q) => [q.id, q]))
  let score = 0
  const spark = []
  const results = []
  for (const id of qids) {
    const q = byId.get(id)
    const ok = !!q && isCorrect(q, answers[id])
    if (ok) score++
    spark.push(ok ? 100 : 20)
    results.push({ id, ok })
  }
  return { score, spark, results }
}
