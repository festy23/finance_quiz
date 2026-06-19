/* matstat/questions.js — таксономия тем + сборка банка вопросов из per-topic модулей.
   LaTeX в q/options/explain; опционально figure:"<key>" (SVG из public/figures/matstat). */
import { questions as q_desc } from './topics/desc.js'
import { questions as q_order } from './topics/order.js'
import { questions as q_est } from './topics/est.js'
import { questions as q_props } from './topics/props.js'
import { questions as q_ci } from './topics/ci.js'
import { questions as q_ht } from './topics/ht.js'
import { questions as q_chi2 } from './topics/chi2.js'
import { questions as q_reg } from './topics/reg.js'
import { questions as q_sp } from './topics/sp.js'
import { questions as q_py } from './topics/py.js'

export const TOPICS = [
  { id: "desc",  name: "Описательная статистика и ЭФР",  short: "ОС", color: "#22c55e", accent: "#22c55e" },
  { id: "order", name: "Порядковые статистики",          short: "ПС", color: "#10b981", accent: "#10b981" },
  { id: "est",   name: "Точечное оценивание",            short: "ОЦ", color: "#a855f7", accent: "#a855f7" },
  { id: "props", name: "Свойства оценок",                short: "СВ", color: "#8b5cf6", accent: "#8b5cf6" },
  { id: "ci",    name: "Доверительные интервалы",        short: "ДИ", color: "#f59e0b", accent: "#f59e0b" },
  { id: "ht",    name: "Проверка гипотез",               short: "ПГ", color: "#ef4444", accent: "#ef4444" },
  { id: "chi2",  name: "Критерии χ²",                     short: "χ²", color: "#f97316", accent: "#f97316" },
  { id: "reg",   name: "Линейная регрессия",             short: "РГ", color: "#3b82f6", accent: "#3b82f6" },
  { id: "sp",    name: "Случайные процессы",             short: "СП", color: "#06b6d4", accent: "#06b6d4" },
  { id: "py",    name: "Python-вычисления",              short: "Py", color: "#eab308", accent: "#eab308" },
]

export const QUESTIONS = [
  ...q_desc, ...q_order, ...q_est, ...q_props, ...q_ci,
  ...q_ht, ...q_chi2, ...q_reg, ...q_sp, ...q_py,
]
