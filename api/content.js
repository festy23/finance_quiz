import { QUESTIONS, TOPICS, MODES } from './_data/questions.js'
import { GLOSSARY } from './_data/glossary.js'
import { TRADETEST } from './_data/tradetest.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')
  res.json({ topics: TOPICS, questions: QUESTIONS, modes: MODES, glossary: GLOSSARY, tradetest: TRADETEST })
}
