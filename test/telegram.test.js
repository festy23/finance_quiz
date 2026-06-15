import { describe, it, expect } from 'vitest'
import crypto from 'node:crypto'
import { verifyTelegramLogin } from '../api/_lib/telegram.js'

const TOKEN = '123456:TESTTOKEN'

// Собираем валидно подписанные данные тем же алгоритмом, что Telegram.
function sign(fields, token) {
  const checkString = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n')
  const secret = crypto.createHash('sha256').update(token).digest()
  return crypto.createHmac('sha256', secret).update(checkString).digest('hex')
}

describe('verifyTelegramLogin', () => {
  const base = { id: 777, first_name: 'Иван', username: 'ivan', auth_date: Math.floor(Date.now() / 1000) }

  it('accepts a correctly signed payload', () => {
    const data = { ...base, hash: sign(base, TOKEN) }
    const out = verifyTelegramLogin(data, TOKEN)
    expect(out).toBeTruthy()
    expect(Number(out.id)).toBe(777)
  })

  it('rejects a tampered payload', () => {
    const data = { ...base, hash: sign(base, TOKEN) }
    data.first_name = 'Мэллори'
    expect(verifyTelegramLogin(data, TOKEN)).toBeNull()
  })

  it('rejects a wrong-token signature', () => {
    const data = { ...base, hash: sign(base, 'other:TOKEN') }
    expect(verifyTelegramLogin(data, TOKEN)).toBeNull()
  })

  it('rejects a stale auth_date (older than 24h)', () => {
    const old = { ...base, auth_date: Math.floor(Date.now() / 1000) - 90000 }
    const data = { ...old, hash: sign(old, TOKEN) }
    expect(verifyTelegramLogin(data, TOKEN)).toBeNull()
  })
})
