// Лёгкая «самооценка» флеш-карточек. Оценка карточки: 'know' | 'again'.
// Без интервалов/дат — просто упорядочивание: повторить и новые вперёд, выученные в конец.

export function mergeRatings(ratings, id, rating) {
  return { ...ratings, [id]: rating }
}

export function dueCount(cards, ratings) {
  return cards.filter((c) => ratings[c.id] !== 'know').length
}

export function nextOrder(cards, ratings) {
  const weight = (c) => (ratings[c.id] === 'know' ? 2 : ratings[c.id] === 'again' ? 0 : 1)
  return [...cards].sort((a, b) => weight(a) - weight(b))
}

// localStorage helpers (ключ на квиз). Безопасны в node/SSR (guard на window).
export function loadRatings(quizId) {
  try { return JSON.parse(localStorage.getItem('fc_' + quizId) || '{}') } catch { return {} }
}
export function saveRatings(quizId, ratings) {
  try { localStorage.setItem('fc_' + quizId, JSON.stringify(ratings)) } catch { /* ignore */ }
}
