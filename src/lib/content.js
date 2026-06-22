// Синглтон контента. Заполняется один раз при входе в квиз (Root) до рендера App,
// поэтому экраны читают C.* синхронно (как раньше window.*).
export const C = {
  quizId: null, brand: { name: "", sub: "" }, accent: "#3b76ff", features: {},
  topics: [], questions: [], modes: {}, glossary: [], tradetest: [], achievements: [],
  flashcards: [], formulas: [], tickets: [],
}

export function initContent(data) {
  C.quizId = data.quizId || null
  C.brand = data.brand || { name: "", sub: "" }
  C.accent = data.accent || "#3b76ff"
  C.features = data.features || {}
  C.topics = data.topics || []
  C.questions = data.questions || []
  C.modes = data.modes || {}
  C.glossary = data.glossary || []
  C.tradetest = data.tradetest || []
  C.achievements = data.achievements || []
  C.flashcards = data.flashcards || []
  C.formulas = data.formulas || []
  C.tickets = data.tickets || []
}
