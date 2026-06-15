import crypto from 'node:crypto'

const MAX_AGE_SEC = 86400 // 24 часа

// Возвращает проверенные поля (без hash) или null, если подпись/срок невалидны.
export function verifyTelegramLogin(data, botToken) {
  if (!data || typeof data.hash !== 'string') return null
  const { hash, ...fields } = data

  const checkString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join('\n')

  const secret = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex')

  // constant-time сравнение
  const a = Buffer.from(hmac, 'hex')
  const b = Buffer.from(hash, 'hex')
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

  const authDate = Number(fields.auth_date)
  if (!authDate || Date.now() / 1000 - authDate > MAX_AGE_SEC) return null

  return fields
}
