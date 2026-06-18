import { QUESTIONS, TOPICS } from './questions.js'
import { GLOSSARY } from './glossary.js'
import { TRADETEST } from './tradetest.js'
import { FINANCE_ACHIEVEMENTS } from './achievements.js'
import { DEFAULT_MODES } from '../modes.js'

export const financeQuiz = {
  id: "finance",
  title: "Финансы и трейдинг",
  tagline: "Личные финансы, отчётность, фундаментальный и технический анализ",
  brand: { name: "67quant", sub: "тренажёр по финансам" },
  accent: "#3b76ff",
  icon: "chart",
  features: { glossary: true, tradetest: true },
  topics: TOPICS,
  questions: QUESTIONS,
  modes: DEFAULT_MODES,
  glossary: GLOSSARY,
  tradetest: TRADETEST,
  achievements: FINANCE_ACHIEVEMENTS,
}
