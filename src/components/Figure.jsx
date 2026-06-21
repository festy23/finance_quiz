import React from 'react'
import { I } from './ui.jsx'
import { C } from '../lib/content.js'

// Статичный предрендеренный SVG-график. name → /figures/<quizId>/<name>.svg
export function Figure({ name, caption }) {
  const quiz = C.quizId || 'matstat'
  return (
    <div className="viz" style={{ background: 'var(--bg-1)' }}>
      <div className="viz-head">
        <span className="viz-title"><I.chart size={14} />{caption || 'График'}</span>
        <span className="chip" style={{ background: 'var(--glass-2)', color: 'var(--tx-3)' }}>matplotlib</span>
      </div>
      <div style={{ padding: 10, display: 'flex', justifyContent: 'center' }}>
        <img src={`/figures/${quiz}/${name}.svg`} alt={caption || name}
             style={{ maxWidth: '100%', height: 'auto', display: 'block' }} loading="lazy" />
      </div>
    </div>
  )
}
