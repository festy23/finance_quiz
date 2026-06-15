import { C } from './content.js'

export function arrEq(a, b) {
  const x = [...a].sort(), y = [...b].sort()
  return x.length === y.length && x.every((v, i) => v === y[i])
}

export function isCorrect(q, ans) {
  return ans && arrEq(ans, q.correct)
}

export const QData = {
  byTopic: (tid) => C.questions.filter((q) => q.topic === tid),
  question: (id) => C.questions.find((q) => q.id === id),
  shuffle: (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  },
}

export const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

export function computeStats(qstats) {
  const out = {}
  C.topics.forEach((t) => {
    const qs = QData.byTopic(t.id)
    let seen = 0, corr = 0
    qs.forEach((q) => { const st = qstats[q.id]; if (st && st.seen > 0) { seen++; if (st.correct > 0) corr++ } })
    out[t.id] = { answered: seen, correct: corr, mastery: qs.length ? Math.round(corr / qs.length * 100) : 0 }
  })
  return out
}

export function computeStreak(days) {
  let n = 0
  const d = new Date()
  if (!days[dayKey(d)]) d.setDate(d.getDate() - 1)
  for (let i = 0; i < 400; i++) { if (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1) } else break }
  return n
}
