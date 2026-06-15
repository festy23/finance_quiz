import { describe, it, expect, beforeAll } from 'vitest'
import { signSession, verifySession, serializeCookie, parseCookies } from '../api/_lib/auth.js'

beforeAll(() => { process.env.JWT_SECRET = 'test-secret-test-secret-test-secret' })

describe('session jwt', () => {
  it('signs and verifies a round-trip payload', async () => {
    const token = await signSession({ id: 42, telegram_id: 777, first_name: 'Иван' })
    const payload = await verifySession(token)
    expect(payload.id).toBe(42)
    expect(payload.telegram_id).toBe(777)
  })

  it('returns null for a garbage token', async () => {
    expect(await verifySession('not-a-jwt')).toBeNull()
  })
})

describe('cookies', () => {
  it('serializes httpOnly cookie', () => {
    const c = serializeCookie('fq_session', 'abc', { maxAge: 100 })
    expect(c).toContain('fq_session=abc')
    expect(c).toContain('HttpOnly')
    expect(c).toContain('Max-Age=100')
  })

  it('parses a cookie header', () => {
    expect(parseCookies('a=1; fq_session=xyz')).toMatchObject({ a: '1', fq_session: 'xyz' })
  })
})
