/* aisd/questions.js — таксономия тем (3 раздела экзамена) + сборка банка вопросов
   из per-subtopic модулей. LaTeX в q/options/explain; опционально figure:"<key>"
   (SVG из public/figures/aisd). */
import { questions as q_floyd }    from './topics/graph/floyd.js'
import { questions as q_flow }     from './topics/graph/flow.js'
import { questions as q_matching } from './topics/graph/matching.js'
import { questions as q_coloring } from './topics/graph/coloring.js'
import { questions as q_exact }    from './topics/str/exact.js'
import { questions as q_edit }     from './topics/str/edit.js'
import { questions as q_aho }      from './topics/str/aho.js'
import { questions as q_strsort }  from './topics/str/strsort.js'
import { questions as q_coding }   from './topics/str/coding.js'
import { questions as q_greedy }     from './topics/para/greedy.js'
import { questions as q_dp }         from './topics/para/dp.js'
import { questions as q_branch }     from './topics/para/branch.js'
import { questions as q_approx }     from './topics/para/approx.js'
import { questions as q_random }     from './topics/para/random.js'
import { questions as q_complexity } from './topics/para/complexity.js'

export const TOPICS = [
  { id: "graph", name: "Графовые алгоритмы",     short: "ГА", color: "#6366f1", accent: "#6366f1" },
  { id: "str",   name: "Строковые алгоритмы",    short: "СА", color: "#ec4899", accent: "#ec4899" },
  { id: "para",  name: "Парадигмы разработки",   short: "ПР", color: "#14b8a6", accent: "#14b8a6" },
]

export const QUESTIONS = [
  ...q_floyd, ...q_flow, ...q_matching, ...q_coloring,
  ...q_exact, ...q_edit, ...q_aho, ...q_strsort, ...q_coding,
  ...q_greedy, ...q_dp, ...q_branch, ...q_approx, ...q_random, ...q_complexity,
]
