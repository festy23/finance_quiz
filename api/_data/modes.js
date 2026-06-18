/* modes.js — общие режимы тренировки для всех квизов (DRY). */
export const DEFAULT_MODES = {
  full:   { id: "full",   name: "Полный экзамен", desc: "Все вопросы блока. Проверка ответов — в конце.", icon: "exam", feedback: "end",   count: null },
  quick:  { id: "quick",  name: "Быстрый",        desc: "10 случайных вопросов. Мгновенная проверка.",     icon: "bolt", feedback: "instant", count: 10 },
  repeat: { id: "repeat", name: "Повторение",     desc: "Только темы, где вы ошибались. Интервальный повтор.", icon: "repeat", feedback: "instant", count: 12 },
};
