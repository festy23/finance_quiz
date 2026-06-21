import { financeQuiz } from './finance/manifest.js'
import { matstatQuiz } from './matstat/manifest.js'
import { aisdQuiz } from './aisd/manifest.js'

// Порядок здесь = порядок карточек в каталоге.
const QUIZZES = [financeQuiz, matstatQuiz, aisdQuiz]
const BY_ID = new Map(QUIZZES.map((q) => [q.id, q]))

export const DEFAULT_QUIZ = 'finance'

// Лёгкий список для каталога — без тяжёлых массивов вопросов/словаря.
export function listQuizzes() {
  return QUIZZES.map((q) => ({
    id: q.id,
    title: q.title,
    tagline: q.tagline,
    accent: q.accent,
    icon: q.icon,
    features: q.features,
    topicCount: q.topics.length,
    questionCount: q.questions.length,
  }))
}

export function getQuiz(id) {
  return BY_ID.get(id) || null
}
