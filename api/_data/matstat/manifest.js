import { QUESTIONS, TOPICS } from './questions.js'
import { GLOSSARY } from './glossary.js'
import { FLASHCARDS } from './flashcards.js'
import { FORMULAS } from './formulas.js'
import { MATSTAT_ACHIEVEMENTS } from './achievements.js'
import { DEFAULT_MODES } from '../modes.js'

export const matstatQuiz = {
  id: "matstat",
  title: "Математическая статистика",
  tagline: "Оценивание, доверительные интервалы, гипотезы, регрессия, случайные процессы",
  brand: { name: "СтатКвиз", sub: "подготовка к контрольной" },
  accent: "#22c55e",
  icon: "brain",
  features: { glossary: true, tradetest: false, flashcards: true, formulas: true },
  topics: TOPICS,
  questions: QUESTIONS,
  modes: DEFAULT_MODES,
  glossary: GLOSSARY,
  tradetest: [],
  flashcards: FLASHCARDS,
  formulas: FORMULAS,
  achievements: MATSTAT_ACHIEVEMENTS,
}
