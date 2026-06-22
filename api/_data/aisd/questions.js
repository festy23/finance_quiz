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

// 15 билетов = 15 тем (id = имя модуля). group/groupName — раздел экзамена (для группировки).
const G = { graph: "#6366f1", str: "#ec4899", para: "#14b8a6" }
const GN = { graph: "Графовые алгоритмы", str: "Строковые алгоритмы", para: "Парадигмы разработки" }
export const TOPICS = [
  { id: "floyd",      group: "graph", short: "1.1", name: "Флойд–Уоршелл" },
  { id: "flow",       group: "graph", short: "1.2", name: "Максимальный поток" },
  { id: "matching",   group: "graph", short: "1.3", name: "Паросочетания" },
  { id: "coloring",   group: "graph", short: "1.4", name: "Раскраска графа" },
  { id: "exact",      group: "str",   short: "2.1", name: "Точный поиск (КМП/БМХ)" },
  { id: "edit",       group: "str",   short: "2.2", name: "Редакционное расстояние" },
  { id: "aho",        group: "str",   short: "2.3", name: "Ахо–Корасик" },
  { id: "strsort",    group: "str",   short: "2.4", name: "Сортировка строк" },
  { id: "coding",     group: "str",   short: "2.5", name: "Кодирование и сжатие" },
  { id: "greedy",     group: "para",  short: "3.1", name: "Жадный алгоритм" },
  { id: "dp",         group: "para",  short: "3.2", name: "Динамическое программирование" },
  { id: "branch",     group: "para",  short: "3.3", name: "Ветви и границы" },
  { id: "approx",     group: "para",  short: "3.4", name: "Приближённый алгоритм (PTAS)" },
  { id: "random",     group: "para",  short: "3.5", name: "Стохастический алгоритм" },
  { id: "complexity", group: "para",  short: "3.6", name: "Сведение, P и NP" },
].map((t) => ({ ...t, color: G[t.group], accent: G[t.group], groupName: GN[t.group] }))

export const QUESTIONS = [
  ...q_floyd, ...q_flow, ...q_matching, ...q_coloring,
  ...q_exact, ...q_edit, ...q_aho, ...q_strsort, ...q_coding,
  ...q_greedy, ...q_dp, ...q_branch, ...q_approx, ...q_random, ...q_complexity,
]
