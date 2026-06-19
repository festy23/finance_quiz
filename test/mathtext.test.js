import { describe, it, expect } from 'vitest'
import { splitMath } from '../src/lib/mathtext.js'

describe('splitMath', () => {
  it('обычный текст — один сегмент', () => {
    expect(splitMath('просто текст')).toEqual([{ type: 'text', value: 'просто текст' }])
  })
  it('инлайн-формула между текстом', () => {
    expect(splitMath('среднее $\\bar X$ растёт')).toEqual([
      { type: 'text', value: 'среднее ' },
      { type: 'inline', value: '\\bar X' },
      { type: 'text', value: ' растёт' },
    ])
  })
  it('блочная формула $$…$$', () => {
    expect(splitMath('итог: $$E=mc^2$$')).toEqual([
      { type: 'text', value: 'итог: ' },
      { type: 'block', value: 'E=mc^2' },
    ])
  })
  it('несколько инлайнов', () => {
    const segs = splitMath('$a$ и $b$')
    expect(segs.map((s) => s.type)).toEqual(['inline', 'text', 'inline'])
  })
  it('пустой/undefined вход', () => {
    expect(splitMath('')).toEqual([])
    expect(splitMath(undefined)).toEqual([])
  })
})
