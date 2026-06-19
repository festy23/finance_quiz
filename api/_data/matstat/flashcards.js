/* matstat/flashcards.js — flip-карточки из per-topic модулей (front/back могут содержать LaTeX $…$). */
import { flashcards as f_desc } from './topics/desc.js'
import { flashcards as f_order } from './topics/order.js'
import { flashcards as f_est } from './topics/est.js'
import { flashcards as f_props } from './topics/props.js'
import { flashcards as f_ci } from './topics/ci.js'
import { flashcards as f_ht } from './topics/ht.js'
import { flashcards as f_chi2 } from './topics/chi2.js'
import { flashcards as f_reg } from './topics/reg.js'
import { flashcards as f_sp } from './topics/sp.js'
import { flashcards as f_py } from './topics/py.js'

export const FLASHCARDS = [
  ...f_desc, ...f_order, ...f_est, ...f_props, ...f_ci,
  ...f_ht, ...f_chi2, ...f_reg, ...f_sp, ...f_py,
]
