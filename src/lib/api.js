const json = (r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
const post = (url, body) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })

export const api = {
  content: () => fetch('/api/content').then(json),
  me: () => fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
  authStart: () => post('/api/auth/start').then(json),
  authPoll: (token) => post('/api/auth/poll', { token }).then(json),
  logout: () => post('/api/auth/logout'),
  progress: () => fetch('/api/progress').then(json),
  saveAttempt: (attempt) => post('/api/attempts', attempt).then(json),
  saveTradeResult: (score) => post('/api/tradetest-result', { score }).then(json),
}
