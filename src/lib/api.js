const json = (r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
const post = (url, body) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })

export const api = {
  quizzes: () => fetch('/api/quizzes').then(json),
  content: (quiz) => fetch('/api/content?quiz=' + encodeURIComponent(quiz)).then(json),
  me: () => fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
  authStart: () => post('/api/auth/start').then(json),
  authPoll: (token) => post('/api/auth/poll', { token }).then(json),
  logout: () => post('/api/auth/logout'),
  progress: (quiz) => fetch('/api/progress?quiz=' + encodeURIComponent(quiz)).then(json),
  saveAttempt: (quiz, attempt) => post('/api/attempts', { quiz, ...attempt }).then(json),
  saveTradeResult: (quiz, score) => post('/api/tradetest-result', { quiz, score }).then(json),
  uploadAvatar: (dataUrl) => post('/api/avatar', { dataUrl }).then(json),
}
