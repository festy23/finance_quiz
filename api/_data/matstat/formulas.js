/* matstat/formulas.js — шпаргалка формул из per-topic модулей (latex — display-формула). */
import { formulas as fm_desc } from './topics/desc.js'
import { formulas as fm_order } from './topics/order.js'
import { formulas as fm_est } from './topics/est.js'
import { formulas as fm_props } from './topics/props.js'
import { formulas as fm_ci } from './topics/ci.js'
import { formulas as fm_ht } from './topics/ht.js'
import { formulas as fm_chi2 } from './topics/chi2.js'
import { formulas as fm_reg } from './topics/reg.js'
import { formulas as fm_sp } from './topics/sp.js'
import { formulas as fm_py } from './topics/py.js'

export const FORMULAS = [
  ...fm_desc, ...fm_order, ...fm_est, ...fm_props, ...fm_ci,
  ...fm_ht, ...fm_chi2, ...fm_reg, ...fm_sp, ...fm_py,
]
