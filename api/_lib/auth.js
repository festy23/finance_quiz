import { SignJWT, jwtVerify } from 'jose'

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET)
export const SESSION_COOKIE = 'fq_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 дней

export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret())
}

export async function verifySession(token) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload
  } catch {
    return null
  }
}

export function serializeCookie(name, value, { maxAge = MAX_AGE } = {}) {
  return [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    `Max-Age=${maxAge}`,
  ].join('; ')
}

export function parseCookies(header = '') {
  return Object.fromEntries(
    header.split(';').map((c) => c.trim()).filter(Boolean).map((c) => {
      const i = c.indexOf('=')
      return [c.slice(0, i), c.slice(i + 1)]
    })
  )
}

// Достаёт пользователя из cookie запроса. null, если нет валидной сессии.
export async function requireUser(req) {
  const cookies = parseCookies(req.headers.cookie || '')
  return verifySession(cookies[SESSION_COOKIE])
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE, token))
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE, '', { maxAge: 0 }))
}
