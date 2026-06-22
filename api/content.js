import { getQuiz, DEFAULT_QUIZ } from './_data/registry.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
  const id = req.query?.quiz || DEFAULT_QUIZ
  const q = getQuiz(id)
  if (!q) return res.status(404).json({ error: 'quiz not found' })
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')
  res.json({
    quizId: q.id,
    brand: q.brand,
    accent: q.accent,
    features: q.features,
    topics: q.topics,
    questions: q.questions,
    modes: q.modes,
    glossary: q.features.glossary ? q.glossary : [],
    tradetest: q.features.tradetest ? q.tradetest : [],
    flashcards: q.features.flashcards ? (q.flashcards || []) : [],
    formulas: q.features.formulas ? (q.formulas || []) : [],
    tickets: q.features.tickets ? (q.tickets || []) : [],
    achievements: q.achievements,
  })
}
