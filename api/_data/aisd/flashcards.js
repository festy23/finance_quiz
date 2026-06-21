/* aisd/flashcards.js — flip-карточки из per-subtopic модулей (front/back с LaTeX $…$). */
import { flashcards as f_floyd }    from './topics/graph/floyd.js'
import { flashcards as f_flow }     from './topics/graph/flow.js'
import { flashcards as f_matching } from './topics/graph/matching.js'
import { flashcards as f_coloring } from './topics/graph/coloring.js'
import { flashcards as f_exact }    from './topics/str/exact.js'
import { flashcards as f_edit }     from './topics/str/edit.js'
import { flashcards as f_aho }      from './topics/str/aho.js'
import { flashcards as f_strsort }  from './topics/str/strsort.js'
import { flashcards as f_coding }   from './topics/str/coding.js'
import { flashcards as f_greedy }     from './topics/para/greedy.js'
import { flashcards as f_dp }         from './topics/para/dp.js'
import { flashcards as f_branch }     from './topics/para/branch.js'
import { flashcards as f_approx }     from './topics/para/approx.js'
import { flashcards as f_random }     from './topics/para/random.js'
import { flashcards as f_complexity } from './topics/para/complexity.js'

export const FLASHCARDS = [
  ...f_floyd, ...f_flow, ...f_matching, ...f_coloring,
  ...f_exact, ...f_edit, ...f_aho, ...f_strsort, ...f_coding,
  ...f_greedy, ...f_dp, ...f_branch, ...f_approx, ...f_random, ...f_complexity,
]
