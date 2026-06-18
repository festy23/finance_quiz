// Чистая оценка ачивок. Отделена от UI, поэтому тестируется в node-окружении.

// Сводит computeStats + список попыток в плоский набор метрик для правил.
export function buildMetrics({ stats, topics, attempts, bestStreak }) {
  const totalAnswered = topics.reduce((a, t) => a + (stats[t.id]?.answered || 0), 0)
  const totalCorrect = topics.reduce((a, t) => a + (stats[t.id]?.correct || 0), 0)
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const perfectMaxSize = attempts.reduce(
    (mx, a) => (a.score === a.total && a.total > mx ? a.total : mx), 0
  )
  const masteryByTopic = {}
  for (const t of topics) masteryByTopic[t.id] = stats[t.id]?.mastery || 0
  const allTopicsMinMastery = topics.length
    ? Math.min(...topics.map((t) => stats[t.id]?.mastery || 0)) : 0
  return {
    totalAnswered, totalCorrect, accuracy, perfectMaxSize,
    attemptsCount: attempts.length, bestStreak: bestStreak || 0,
    masteryByTopic, allTopicsMinMastery,
  }
}

export function evalRule(rule, m) {
  switch (rule.kind) {
    case 'attempts':         return m.attemptsCount >= rule.n
    case 'totalAnswered':    return m.totalAnswered >= rule.n
    case 'accuracy':         return m.totalAnswered >= rule.n && m.accuracy >= rule.pct
    case 'perfectSession':   return m.perfectMaxSize >= rule.size
    case 'streak':           return m.bestStreak >= rule.days
    case 'topicMastery':     return (m.masteryByTopic[rule.topic] || 0) >= rule.pct
    case 'allTopicsMastery': return m.allTopicsMinMastery >= rule.pct
    default:                 return false
  }
}

export function buildAchievements(defs, metrics) {
  return defs.map((d) => ({ ...d, got: evalRule(d.rule, metrics) }))
}
