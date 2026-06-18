import { QUESTIONS, TOPICS } from './questions.js'
import { GLOSSARY } from './glossary.js'
import { MATSTAT_ACHIEVEMENTS } from './achievements.js'
import { DEFAULT_MODES } from '../modes.js'

export const matstatQuiz = {
  id: "matstat",
  title: "Математическая статистика",
  tagline: "Описательная статистика, распределения и проверка гипотез",
  brand: { name: "СтатКвиз", sub: "тренажёр по матстату" },
  accent: "#22c55e",
  icon: "brain",
  features: { glossary: true, tradetest: false },
  topics: TOPICS,
  questions: QUESTIONS,
  modes: DEFAULT_MODES,
  glossary: GLOSSARY,
  tradetest: [],
  achievements: MATSTAT_ACHIEVEMENTS,
}
