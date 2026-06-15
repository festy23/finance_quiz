// Синглтон контента. Заполняется один раз в main.jsx до рендера App,
// поэтому экраны читают C.* синхронно (как раньше window.*).
export const C = { topics: [], questions: [], modes: {}, glossary: [], tradetest: [] }

export function initContent(data) {
  C.topics = data.topics || []
  C.questions = data.questions || []
  C.modes = data.modes || {}
  C.glossary = data.glossary || []
  C.tradetest = data.tradetest || []
}
