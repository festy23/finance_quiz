import { listQuizzes } from './_data/registry.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')
  res.json({ quizzes: listQuizzes() })
}
