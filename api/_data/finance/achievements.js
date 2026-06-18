/* achievements.js — декларативные ачивки финансового квиза.
   rule — одно из правил, понимаемых src/lib/achievements.js:
     { kind: 'attempts', n }
     { kind: 'totalAnswered', n }
     { kind: 'accuracy', n, pct }        // ответов >= n И точность >= pct%
     { kind: 'perfectSession', size }    // была сессия score===total и total>=size
     { kind: 'streak', days }
     { kind: 'topicMastery', topic, pct }
     { kind: 'allTopicsMastery', pct } */
export const FINANCE_ACHIEVEMENTS = [
  { id: "first",   name: "Первый шаг", desc: "Пройти первый квиз",          icon: "play",  color: "var(--ac)",     rule: { kind: "attempts", n: 1 } },
  { id: "ta",      name: "Чартист",    desc: "Освоить тех. анализ на 50%",   icon: "trend", color: "var(--warn)",   rule: { kind: "topicMastery", topic: "ta", pct: 50 } },
  { id: "streak",  name: "В ритме",    desc: "Серия 3 дня",                  icon: "flame", color: "var(--down)",   rule: { kind: "streak", days: 3 } },
  { id: "perfect", name: "Без ошибок", desc: "100% в сессии 5+",             icon: "target",color: "var(--ok)",     rule: { kind: "perfectSession", size: 5 } },
  { id: "ten",     name: "Десятка",    desc: "50 ответов",                   icon: "layers",color: "var(--purple)", rule: { kind: "totalAnswered", n: 50 } },
  { id: "scholar", name: "Эрудит",     desc: "Освоить все блоки на 60%",     icon: "brain", color: "var(--ac)",     rule: { kind: "allTopicsMastery", pct: 60 } },
  { id: "fund",    name: "Аналитик",   desc: "Фунд. анализ 70%",             icon: "chart", color: "var(--ac)",     rule: { kind: "topicMastery", topic: "fa", pct: 70 } },
  { id: "ace",     name: "Снайпер",    desc: "Точность 90%+",                icon: "star",  color: "var(--warn)",   rule: { kind: "accuracy", n: 10, pct: 90 } },
];
