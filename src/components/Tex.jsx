import React, { useMemo } from 'react'
import katex from 'katex'
import { splitMath } from '../lib/mathtext.js'

function render(value, displayMode) {
  try {
    return katex.renderToString(value, { displayMode, throwOnError: false, output: 'html' })
  } catch {
    return value
  }
}

// Инлайн-микс текста и формул: "среднее $\bar X$" → текст + KaTeX.
export function RichText({ text, style }) {
  const segs = useMemo(() => splitMath(text), [text])
  return (
    <span style={style}>
      {segs.map((s, i) =>
        s.type === 'text'
          ? <span key={i}>{s.value}</span>
          : <span key={i} style={s.type === 'block' ? { display: 'block', margin: '8px 0', overflowX: 'auto' } : null}
                  dangerouslySetInnerHTML={{ __html: render(s.value, s.type === 'block') }} />
      )}
    </span>
  )
}

// Отдельная display-формула (для шпаргалки/карточек).
export function TexBlock({ tex }) {
  const html = useMemo(() => render(tex, true), [tex])
  return <div style={{ overflowX: 'auto', padding: '2px 0' }} dangerouslySetInnerHTML={{ __html: html }} />
}
