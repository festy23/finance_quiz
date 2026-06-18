// Мини-роутер: путь '/' → каталог, '/<quizId>' → квиз. Без react-router.
export function parseRoute(pathname) {
  const seg = String(pathname || '/').replace(/^\/+|\/+$/g, '').split('/')[0]
  return seg ? { view: 'quiz', quizId: seg } : { view: 'catalog', quizId: null }
}

export function quizPath(id) {
  return '/' + id
}
