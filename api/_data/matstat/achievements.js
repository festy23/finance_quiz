/* matstat/achievements.js — ачивки матстат-квиза (правила см. src/lib/achievements.js). */
export const MATSTAT_ACHIEVEMENTS = [
  { id: "first",   name: "Первый шаг", desc: "Пройти первый квиз",        icon: "play",  color: "var(--ac)",     rule: { kind: "attempts", n: 1 } },
  { id: "streak",  name: "В ритме",    desc: "Серия 3 дня",                icon: "flame", color: "var(--down)",   rule: { kind: "streak", days: 3 } },
  { id: "perfect", name: "Без ошибок", desc: "100% в сессии 5+",           icon: "target",color: "var(--ok)",     rule: { kind: "perfectSession", size: 5 } },
  { id: "thirty",  name: "Практик",    desc: "30 ответов",                 icon: "layers",color: "var(--purple)", rule: { kind: "totalAnswered", n: 30 } },
  { id: "prob",    name: "Интервальщик", desc: "Доверительные интервалы на 60%",    icon: "brain", color: "var(--ac)",     rule: { kind: "topicMastery", topic: "ci", pct: 60 } },
  { id: "scholar", name: "Эрудит",     desc: "Все блоки на 60%",           icon: "brain", color: "var(--ac)",     rule: { kind: "allTopicsMastery", pct: 60 } },
  { id: "ace",     name: "Снайпер",    desc: "Точность 90%+",              icon: "star",  color: "var(--warn)",   rule: { kind: "accuracy", n: 10, pct: 90 } },
];
