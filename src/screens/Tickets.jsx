/* screens/Tickets.jsx — «Билеты» (fast review): все экзаменационные билеты в едином
   формате (Задача → Идея → Алгоритм → Корректность → Сложность → Ограничения → Пример),
   разворачиваемые карточки. Лёгкая разметка: **жирный**, *курсив*, `код`; pre-блоки — ASCII. */
import React, { useState, useMemo } from 'react'
import { I, TopicChip } from '../components/ui.jsx'
import { Figure } from '../components/Figure.jsx'
import { C } from '../lib/content.js'
import { Empty } from './LearnStats.jsx'

// Цвет рубрики по её подписи (label) — порядок правил важен (сложность раньше корректности).
const LABEL_RULES = [
  [/задача|постановк/i,          '#64748b'],
  [/сложност/i,                  '#d97706'],
  [/ограничен/i,                 '#dc2626'],
  [/контрпример/i,               '#dc2626'],
  [/пример/i,                    '#db2777'],
  [/теорем|гарант/i,             '#16a34a'],
  [/корректн|доказ|оптимальн/i,  '#7c3aed'],
  [/иде|понятия|сведени|класс/i, '#6366f1'],
  [/алгоритм|рекуррент|подход|fail|вариант|поиск|усиление/i, '#0ea5e9'],
]
function labelColor(label = '') {
  for (const [re, c] of LABEL_RULES) if (re.test(label)) return c
  return '#8a93a6'
}

// Инлайн-разметка: **жирный**, *курсив*, `моноширинный`. Формулы — обычный Unicode.
const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g
function Inline({ text }) {
  const parts = useMemo(() => String(text || '').split(INLINE).filter((s) => s !== ''), [text])
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="tk-code">{p.slice(1, -1)}</code>
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>
    return <React.Fragment key={i}>{p}</React.Fragment>
  })
}

function Block({ b }) {
  const col = b.label ? labelColor(b.label) : 'var(--border-strong)'
  return (
    <div style={{ paddingLeft: 11, borderLeft: `2.5px solid ${col}`, margin: '11px 0' }}>
      {b.label && <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: col, marginBottom: 3 }}>{b.label}</div>}
      {b.pre != null
        ? <pre className="tk-pre">{b.pre}</pre>
        : <div style={{ fontSize: 14, lineHeight: 1.62, color: 'var(--tx)' }}><Inline text={b.body} /></div>}
    </div>
  )
}

function TicketCard({ t, open, onToggle }) {
  const intro = (t.blocks.find((b) => /задача|понятия|иде/i.test(b.label || '')) || t.blocks[0] || {}).body || ''
  return (
    <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ width: '100%', textAlign: 'left', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
        <span className="chip" style={{ background: 'var(--panel-2)', color: 'var(--tx-3)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{t.ref || '№' + t.num}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 4 }}><TopicChip topic={t.topic} small /></div>
          <div style={{ fontSize: 15.5, fontWeight: 650, lineHeight: 1.35, marginBottom: open ? 0 : 4 }}>{t.title}</div>
          {!open && <div style={{ fontSize: 12.5, color: 'var(--tx-3)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}><Inline text={intro} /></div>}
        </div>
        <I.chevR size={18} style={{ color: 'var(--tx-3)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flex: '0 0 18px', marginTop: 2 }} />
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          <div className="divider" style={{ margin: '0 0 4px' }} />
          {t.blocks.map((b, i) => <Block key={i} b={b} />)}
          {t.figures?.length > 0 && (
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: t.figures.length > 1 ? 'repeat(auto-fit,minmax(220px,1fr))' : '1fr', marginTop: 12 }}>
              {t.figures.map((f) => <Figure key={f.name} name={f.name} caption={f.caption} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const GROUP_LABEL = { graph: 'Графы', str: 'Строки', para: 'Парадигмы' }

export function TicketsScreen() {
  const [group, setGroup] = useState(null)
  const [openId, setOpenId] = useState(null)
  // карта тема→раздел и список разделов (билеты теперь = отдельные темы, фильтруем по разделу)
  const topicGroup = useMemo(() => Object.fromEntries(C.topics.map((t) => [t.id, t.group])), [])
  const groups = useMemo(() => {
    const seen = new Set(), out = []
    for (const t of C.topics) if (t.group && !seen.has(t.group)) { seen.add(t.group); out.push(t.group) }
    return out
  }, [])
  const list = useMemo(() => C.tickets.filter((t) => !group || topicGroup[t.topic] === group), [group, topicGroup])

  if (!C.tickets?.length) return <div className="wrap"><Empty text="Билеты появятся скоро" /></div>

  return (
    <div className="wrap fade-in" style={{ maxWidth: 820 }}>
      <style>{`
        .tk-code{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:.88em;background:var(--panel-2);padding:1px 5px;border-radius:4px;color:var(--tx);white-space:nowrap}
        .tk-pre{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:12px;line-height:1.45;background:var(--bg-1);border:1px solid var(--border);border-radius:8px;padding:12px 14px;margin:6px 0 2px;overflow-x:auto;color:var(--tx-2);white-space:pre}
      `}</style>
      <h2 style={{ fontSize: 24, letterSpacing: '-.02em', margin: '0 0 4px' }}>Билеты · fast review</h2>
      <p style={{ color: 'var(--tx-3)', marginTop: 0, marginBottom: 18, fontSize: 14 }}>
        Все {C.tickets.length} билетов в едином формате: задача → идея → алгоритм → корректность → сложность → ограничения → пример. Жмите билет, чтобы развернуть.
      </p>

      <div className="seg" style={{ marginBottom: 18 }}>
        <button className={!group ? 'on' : ''} onClick={() => { setGroup(null); setOpenId(null) }}>Все</button>
        {groups.map((g) => <button key={g} className={group === g ? 'on' : ''} onClick={() => { setGroup(g); setOpenId(null) }}>{GROUP_LABEL[g] || g}</button>)}
      </div>

      {!list.length ? <Empty text="В этом разделе билетов нет" /> : list.map((t) => (
        <TicketCard key={t.id} t={t} open={openId === t.id} onToggle={() => setOpenId((id) => (id === t.id ? null : t.id))} />
      ))}
    </div>
  )
}
