/* screens/Root.jsx — верхнеуровневый роутер платформы.
   '/' → каталог; '/<quizId>' → загрузка контента+прогресса и рендер App.
   Навигация через history.pushState + popstate, без перезагрузки страницы. */
import React, { useEffect, useState, useCallback, useRef } from 'react'
import App from '../App.jsx'
import Catalog from './Catalog.jsx'
import { api } from '../lib/api.js'
import { initContent } from '../lib/content.js'
import { parseRoute, quizPath } from '../lib/route.js'

export default function Root({ initialMe }) {
  const [me] = useState(initialMe)                       // Telegram-сессия глобальна
  const [route, setRoute] = useState(() => parseRoute(location.pathname))
  const [loaded, setLoaded] = useState(null)             // { quizId, store } | null
  const [phase, setPhase] = useState('idle')             // idle | loading | error
  const fetchGenRef = useRef(0)

  // Загружает контент квиза в синглтон C + прогресс пользователя.
  const enterQuiz = useCallback(async (quizId) => {
    const gen = ++fetchGenRef.current
    setPhase('loading')
    try {
      const content = await api.content(quizId)
      if (gen !== fetchGenRef.current) return        // newer navigation won — drop stale result
      initContent(content)
      let store = null
      if (me) { try { store = await api.progress(quizId) } catch { store = null } }
      if (gen !== fetchGenRef.current) return
      setLoaded({ quizId, store })
      setPhase('idle')
    } catch {
      if (gen === fetchGenRef.current) setPhase('error')
    }
  }, [me])

  // Реакция на изменение route (включая back/forward).
  useEffect(() => {
    if (route.view === 'quiz') {
      if (!loaded || loaded.quizId !== route.quizId) enterQuiz(route.quizId)
    } else {
      setLoaded(null)
    }
  }, [route, loaded, enterQuiz])

  useEffect(() => {
    const onPop = () => setRoute(parseRoute(location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const goCatalog = useCallback(() => {
    history.pushState({}, '', '/')
    setRoute({ view: 'catalog', quizId: null })
  }, [])
  const goQuiz = useCallback((id) => {
    history.pushState({}, '', quizPath(id))
    setRoute({ view: 'quiz', quizId: id })
  }, [])

  if (route.view === 'catalog') return <Catalog onPick={goQuiz} />

  if (phase === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center', color: 'var(--tx-2)' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Не удалось загрузить квиз</div>
          <button className="btn btn-pri" onClick={goCatalog}>← Все квизы</button>
        </div>
      </div>
    )
  }

  if (!loaded || loaded.quizId !== route.quizId) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--tx-3)', fontSize: 13 }}>Загрузка…</div>
  }

  return (
    <App
      key={loaded.quizId}                     // полный сброс state при смене квиза
      quizId={loaded.quizId}
      initialUser={me?.user || null}
      initialStore={loaded.store}
      onExitQuiz={goCatalog}
    />
  )
}
