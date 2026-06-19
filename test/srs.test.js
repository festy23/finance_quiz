import { describe, it, expect } from 'vitest'
import { nextOrder, mergeRatings, dueCount } from '../src/lib/srs.js'

describe('srs (flashcards)', () => {
  it('mergeRatings перезаписывает оценку карточки', () => {
    expect(mergeRatings({ a: 'know' }, 'b', 'again')).toEqual({ a: 'know', b: 'again' })
    expect(mergeRatings({ a: 'know' }, 'a', 'again')).toEqual({ a: 'again' })
  })
  it('dueCount = карточки без оценки know', () => {
    const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    expect(dueCount(cards, { a: 'know', b: 'again' })).toBe(2) // b(again) + c(нет оценки)
  })
  it('nextOrder ставит «again» и новые вперёд, «know» — в конец', () => {
    const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const order = nextOrder(cards, { a: 'know', b: 'again' }).map((c) => c.id)
    expect(order[order.length - 1]).toBe('a')      // know — в конец
    expect(order.slice(0, 2).sort()).toEqual(['b', 'c']) // again + new — вперёд
  })
})
