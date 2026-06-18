/* viz/matstat.jsx — интерактивные визуализации для матстата. */
import React, { useMemo, useState } from 'react'
import { I } from '../ui.jsx'
import { VSlider } from './finance.jsx'

function VizFrame({ title, badge, children, controls }) {
  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title"><I.chart size={14} />{title}</span>
        {badge && <span className="chip" style={{ background: 'var(--glass-2)', color: 'var(--tx-3)' }}>{badge}</span>}
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
        {controls && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{controls}</div>}
      </div>
    </div>
  )
}

const W = 360, H = 170, PAD = 6
const normalPdf = (x, mu, sigma) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI))

/* ---------- normaldist: нормальная кривая + правило 68-95-99.7 ---------- */
function NormalDist() {
  const [mu, setMu] = useState(0)
  const [sigma, setSigma] = useState(1)
  const view = { min: -6, max: 6 }
  const { path, area, peak } = useMemo(() => {
    const n = 120
    const xs = Array.from({ length: n + 1 }, (_, i) => view.min + (i / n) * (view.max - view.min))
    const ys = xs.map((x) => normalPdf(x, mu, sigma))
    const peak = Math.max(...ys, normalPdf(mu, mu, sigma))
    const sx = (x) => PAD + ((x - view.min) / (view.max - view.min)) * (W - 2 * PAD)
    const sy = (y) => H - PAD - (y / peak) * (H - 2 * PAD)
    const path = xs.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(ys[i]).toFixed(1)}`).join(' ')
    // заливка ±1σ
    const inband = xs.filter((x) => x >= mu - sigma && x <= mu + sigma)
    const bandTop = inband.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(normalPdf(x, mu, sigma)).toFixed(1)}`).join(' ')
    const area = inband.length
      ? `${bandTop} L${sx(inband[inband.length - 1]).toFixed(1)} ${H - PAD} L${sx(inband[0]).toFixed(1)} ${H - PAD} Z`
      : ''
    return { path, area, peak }
  }, [mu, sigma])
  return (
    <VizFrame title="Нормальное распределение" badge="68–95–99.7"
      controls={<>
        <VSlider label="Среднее μ" value={mu} min={-3} max={3} step={0.1} onChange={setMu} fmt={(v) => v.toFixed(1)} accent="#22c55e" />
        <VSlider label="Отклонение σ" value={sigma} min={0.5} max={3} step={0.1} onChange={setSigma} fmt={(v) => v.toFixed(1)} accent="#22c55e" />
      </>}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {area && <path d={area} fill="rgba(34,197,94,.18)" />}
        <path d={path} fill="none" stroke="#22c55e" strokeWidth="2" />
      </svg>
      <div style={{ fontSize: 12.5, color: 'var(--tx-3)', lineHeight: 1.5 }}>
        Закрашена область ±1σ — в неё попадает ≈68% значений. Двигайте μ (сдвиг) и σ (ширина).
      </div>
    </VizFrame>
  )
}

/* ---------- clt: распределение выборочного среднего ---------- */
// Детерминированный ГПСЧ (mulberry32), чтобы перерисовка была воспроизводимой.
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function CLT() {
  const [n, setN] = useState(1)
  const [seed, setSeed] = useState(1)
  // Исходное распределение — равномерное на [0,1] (заведомо НЕ нормальное).
  // Берём 600 выборок размера n, считаем средние, строим гистограмму.
  const bins = useMemo(() => {
    const rnd = mulberry32(seed * 2654435761)
    const K = 600, B = 24
    const counts = new Array(B).fill(0)
    for (let s = 0; s < K; s++) {
      let sum = 0
      for (let i = 0; i < n; i++) sum += rnd()
      const mean = sum / n
      const bi = Math.min(B - 1, Math.max(0, Math.floor(mean * B)))
      counts[bi]++
    }
    const mx = Math.max(...counts, 1)
    return counts.map((c) => c / mx)
  }, [n, seed])
  const BW = W / bins.length
  return (
    <VizFrame title="Центральная предельная теорема" badge="ЦПТ"
      controls={<>
        <VSlider label="Размер выборки n" value={n} min={1} max={30} step={1} onChange={setN} accent="#a855f7" />
        <button className="btn btn-sec" style={{ height: 32, fontSize: 12.5 }} onClick={() => setSeed((s) => s + 1)}>
          <I.repeat size={14} /> Пересэмплировать
        </button>
      </>}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {bins.map((v, i) => (
          <rect key={i} x={i * BW + 1} y={H - v * (H - 8)} width={BW - 2} height={v * (H - 8)}
            fill="#a855f7" opacity="0.85" rx="1.5" />
        ))}
      </svg>
      <div style={{ fontSize: 12.5, color: 'var(--tx-3)', lineHeight: 1.5 }}>
        Исходные данные равномерны (плоские). При n=1 гистограмма средних плоская, но с ростом n
        распределение средних стягивается к нормальному «колоколу».
      </div>
    </VizFrame>
  )
}

export const VIZ_MATSTAT = {
  normaldist: NormalDist,
  clt: CLT,
}
