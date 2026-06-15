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
