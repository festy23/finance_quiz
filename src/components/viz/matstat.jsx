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

/* ---------- htpower: мощность Z-критерия (правосторонний) ---------- */
// Слайдеры: n (1..100), Δ = μ₁ − μ₀ (0..2).
// Рисует две нормальные кривые N(0, 1/√n) и N(Δ, 1/√n),
// закрашивает α-хвост (правее c) и β-область (левее c под H₁).
// Аппроксимация функции ошибок (Abramowitz–Stegun 7.1.26). Локальная — не патчим Math.
function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  const r = 1 - poly * Math.exp(-x * x)
  return x >= 0 ? r : -r
}
function stdNormCdf(z) {
  // Φ(z) через erf (достаточно точна для визуализации).
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

function HtPower() {
  const [n, setN] = useState(20)
  const [delta, setDelta] = useState(1.0)

  const { path0, path1, areaAlpha, areaBeta, power, cSvgX, sigmaVal } = useMemo(() => {
    const sigmaVal = 1 / Math.sqrt(n)       // σ_X̄ при σ_pop=1
    const zAlpha = 1.6449                   // z_{0.95}
    const cVal = zAlpha * sigmaVal          // критическое значение (μ₀=0)
    const power = 1 - stdNormCdf((cVal - delta) / sigmaVal)

    const view = { min: -0.5, max: Math.max(delta + 0.6, 0.8) }
    const range = view.max - view.min

    const sx = (x) => PAD + ((x - view.min) / range) * (W - 2 * PAD)
    const N_PT = 140
    const peak0 = normalPdf(0, 0, sigmaVal)
    const peak1 = normalPdf(delta, delta, sigmaVal)
    const peak  = Math.max(peak0, peak1, 0.001)
    const sy = (y) => H - PAD - (y / peak) * (H - 2 * PAD - 10)

    const xs = Array.from({ length: N_PT + 1 }, (_, i) => view.min + (i / N_PT) * range)
    const ys0 = xs.map((x) => normalPdf(x, 0, sigmaVal))
    const ys1 = xs.map((x) => normalPdf(x, delta, sigmaVal))

    const path0 = xs.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(ys0[i]).toFixed(1)}`).join(' ')
    const path1 = xs.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(ys1[i]).toFixed(1)}`).join(' ')

    // α — правый хвост H₀ (x ≥ cVal)
    const xsA = xs.filter((x) => x >= cVal)
    const areaAlpha = xsA.length > 1
      ? xsA.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(normalPdf(x, 0, sigmaVal)).toFixed(1)}`).join(' ')
        + ` L${sx(xsA[xsA.length - 1]).toFixed(1)} ${H - PAD} L${sx(xsA[0]).toFixed(1)} ${H - PAD} Z`
      : ''

    // β — левый хвост H₁ (x < cVal)
    const xsB = xs.filter((x) => x < cVal)
    const areaBeta = xsB.length > 1
      ? xsB.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(normalPdf(x, delta, sigmaVal)).toFixed(1)}`).join(' ')
        + ` L${sx(xsB[xsB.length - 1]).toFixed(1)} ${H - PAD} L${sx(xsB[0]).toFixed(1)} ${H - PAD} Z`
      : ''

    const cSvgX = sx(cVal)
    return { path0, path1, areaAlpha, areaBeta, power, cSvgX, sigmaVal }
  }, [n, delta])

  return (
    <VizFrame title="Мощность Z-критерия" badge="α=0.05 правосторонний"
      controls={<>
        <VSlider label="Объём выборки n" value={n} min={1} max={100} step={1} onChange={setN}
          fmt={(v) => String(v)} accent="#3b82f6" />
        <VSlider label="Эффект Δ = μ₁ − μ₀" value={delta} min={0} max={2} step={0.05} onChange={setDelta}
          fmt={(v) => v.toFixed(2)} accent="#22c55e" />
      </>}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {areaAlpha && <path d={areaAlpha} fill="rgba(239,68,68,.30)" />}
        {areaBeta  && <path d={areaBeta}  fill="rgba(245,158,11,.28)" />}
        <path d={path0} fill="none" stroke="#3b82f6" strokeWidth="2" />
        <path d={path1} fill="none" stroke="#22c55e" strokeWidth="2" />
        {/* Вертикаль критического значения */}
        <line x1={cSvgX} y1={PAD} x2={cSvgX} y2={H - PAD} stroke="rgba(255,255,255,.35)" strokeWidth="1.2" strokeDasharray="4 3" />
      </svg>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--tx-3)' }}>
        <span style={{ color: '#ef4444' }}>■ α = 0.05</span>
        <span style={{ color: '#f59e0b' }}>■ β = {(1 - power).toFixed(3)}</span>
        <span style={{ color: '#22c55e', fontWeight: 600 }}>W = {power.toFixed(3)}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--tx-3)', lineHeight: 1.5 }}>
        Синяя кривая — H₀ (μ=0), зелёная — H₁ (μ=Δ). Красная зона — ошибка I рода (α),
        жёлтая — ошибка II рода (β). Мощность W=1−β растёт с n и Δ.
      </div>
    </VizFrame>
  )
}

export const VIZ_MATSTAT = {
  normaldist: NormalDist,
  clt: CLT,
  htpower: HtPower,
}
