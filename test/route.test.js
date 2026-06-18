import { describe, it, expect } from 'vitest'
import { parseRoute, quizPath } from '../src/lib/route.js'

describe('parseRoute', () => {
  it('корень = каталог', () => {
    expect(parseRoute('/')).toEqual({ view: 'catalog', quizId: null })
    expect(parseRoute('')).toEqual({ view: 'catalog', quizId: null })
  })
  it('сегмент = квиз', () => {
    expect(parseRoute('/matstat')).toEqual({ view: 'quiz', quizId: 'matstat' })
    expect(parseRoute('/finance/')).toEqual({ view: 'quiz', quizId: 'finance' })
  })
  it('quizPath строит путь', () => {
    expect(quizPath('matstat')).toBe('/matstat')
  })
})
