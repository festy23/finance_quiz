/* aisd/formulas.js — шпаргалка сложностей и ключевых соотношений из per-subtopic
   модулей (latex — display-формула). */
import { formulas as fm_floyd }    from './topics/graph/floyd.js'
import { formulas as fm_flow }     from './topics/graph/flow.js'
import { formulas as fm_matching } from './topics/graph/matching.js'
import { formulas as fm_coloring } from './topics/graph/coloring.js'
import { formulas as fm_exact }    from './topics/str/exact.js'
import { formulas as fm_edit }     from './topics/str/edit.js'
import { formulas as fm_aho }      from './topics/str/aho.js'
import { formulas as fm_strsort }  from './topics/str/strsort.js'
import { formulas as fm_coding }   from './topics/str/coding.js'
import { formulas as fm_greedy }     from './topics/para/greedy.js'
import { formulas as fm_dp }         from './topics/para/dp.js'
import { formulas as fm_branch }     from './topics/para/branch.js'
import { formulas as fm_approx }     from './topics/para/approx.js'
import { formulas as fm_random }     from './topics/para/random.js'
import { formulas as fm_complexity } from './topics/para/complexity.js'

export const FORMULAS = [
  ...fm_floyd, ...fm_flow, ...fm_matching, ...fm_coloring,
  ...fm_exact, ...fm_edit, ...fm_aho, ...fm_strsort, ...fm_coding,
  ...fm_greedy, ...fm_dp, ...fm_branch, ...fm_approx, ...fm_random, ...fm_complexity,
]
