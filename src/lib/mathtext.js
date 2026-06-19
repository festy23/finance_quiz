// Разбивает строку на сегменты текста и формул. $$…$$ — блочная, $…$ — инлайн.
// Экранированный \$ остаётся литералом доллара. Чистая функция — тестируется в node.
export function splitMath(input) {
  const text = input == null ? '' : String(input)
  if (!text) return []
  const out = []
  let buf = ''
  let i = 0
  const pushText = () => { if (buf) { out.push({ type: 'text', value: buf }); buf = '' } }
  while (i < text.length) {
    const ch = text[i]
    if (ch === '\\' && text[i + 1] === '$') { buf += '$'; i += 2; continue }
    if (ch === '$') {
      const block = text[i + 1] === '$'
      const open = block ? '$$' : '$'
      const close = text.indexOf(open, i + open.length)
      if (close === -1) { buf += ch; i += 1; continue } // незакрытый — литерал
      pushText()
      out.push({ type: block ? 'block' : 'inline', value: text.slice(i + open.length, close) })
      i = close + open.length
      continue
    }
    buf += ch; i += 1
  }
  pushText()
  return out
}
