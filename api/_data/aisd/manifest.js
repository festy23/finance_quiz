import { QUESTIONS, TOPICS } from './questions.js'
import { GLOSSARY } from './glossary.js'
import { FLASHCARDS } from './flashcards.js'
import { FORMULAS } from './formulas.js'
import { AISD_ACHIEVEMENTS } from './achievements.js'
import { DEFAULT_MODES } from '../modes.js'

export const aisdQuiz = {
  id: "aisd",
  title: "Алгоритмы и структуры данных",
  tagline: "Графовые и строковые алгоритмы, парадигмы разработки",
  brand: { name: "АлгоКвиз", sub: "подготовка к экзамену" },
  accent: "#6366f1",
  icon: "graph",
  features: { glossary: true, tradetest: false, flashcards: true, formulas: true },
  topics: TOPICS,
  questions: QUESTIONS,
  modes: DEFAULT_MODES,
  glossary: GLOSSARY,
  tradetest: [],
  flashcards: FLASHCARDS,
  formulas: FORMULAS,
  achievements: AISD_ACHIEVEMENTS,
}
