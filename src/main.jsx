import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { api } from './lib/api.js'
import { initContent } from './lib/content.js'
import './styles.css'

async function boot() {
  // Контент нужен синхронно экранам — грузим до первого рендера.
  const content = await api.content()
  initContent(content)
  const me = await api.me() // { user } или null
  const progress = me ? await api.progress() : null
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App initialUser={me?.user || null} initialStore={progress} />
  )
}

boot()
