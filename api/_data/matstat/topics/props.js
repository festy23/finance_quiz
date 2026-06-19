/* matstat/topics/props.js — Свойства оценок: несмещённость, состоятельность, эффективность,
   информация Фишера, граница Рао–Крамера.
   LaTeX в полях q/options/explain/front/back/latex рендерится KaTeX ($…$ / $$…$$). */

export const questions = [
  // ── difficulty 1 ────────────────────────────────────────────────────────
  {
    id: "props1", topic: "props", difficulty: 1,
    q: "Оценка $\\hat\\theta_n$ называется несмещённой, если…",
    options: [
      "$\\mathrm{M}\\hat\\theta_n = \\theta$ при любом $n$",
      "$\\hat\\theta_n \\xrightarrow{P} \\theta$ при $n\\to\\infty$",
      "$\\mathrm{D}\\hat\\theta_n \\to 0$ при $n\\to\\infty$",
      "$\\hat\\theta_n = \\theta$ для всех реализаций",
    ],
    correct: [0], multi: false,
    explain: "Несмещённость означает, что математическое ожидание оценки равно истинному параметру: $\\mathrm{M}\\hat\\theta_n=\\theta$. Состоятельность ($\\xrightarrow{P}$) — другое свойство: сходимость по вероятности при $n\\to\\infty$.",
  },
  {
    id: "props2", topic: "props", difficulty: 1,
    q: "Смещённая выборочная дисперсия $s^2=\\frac{1}{n}\\sum(X_i-\\bar X)^2$ имеет математическое ожидание…",
    options: [
      "$\\frac{n-1}{n}\\sigma^2$",
      "$\\sigma^2$",
      "$\\frac{n+1}{n}\\sigma^2$",
      "$\\frac{\\sigma^2}{n}$",
    ],
    correct: [0], multi: false,
    figure: "props_bias_s2", figureCaption: "Смещение s² (делитель n) vs S² (делитель n−1)",
    explain: "$\\mathrm{M}s^2 = \\frac{n-1}{n}\\sigma^2 \\neq \\sigma^2$ — оценка смещена вниз. Делитель $n-1$ исправляет это: $\\mathrm{M}S^2 = \\sigma^2$, где $S^2 = \\frac{n}{n-1}s^2$.",
  },
  {
    id: "props3", topic: "props", difficulty: 1,
    q: "Чему равна исправленная (несмещённая) дисперсия $S^2$ через смещённую $s^2$?",
    options: [
      "$S^2 = \\frac{n}{n-1}\\,s^2$",
      "$S^2 = \\frac{n-1}{n}\\,s^2$",
      "$S^2 = \\frac{n+1}{n}\\,s^2$",
      "$S^2 = n\\,s^2$",
    ],
    correct: [0], multi: false,
    explain: "Из $\\mathrm{M}s^2 = \\frac{n-1}{n}\\sigma^2$ получаем, что $S^2 = \\frac{n}{n-1}s^2$ удовлетворяет $\\mathrm{M}S^2 = \\sigma^2$. Это стандартная «поправка Бесселя».",
  },
  {
    id: "props4", topic: "props", difficulty: 1,
    q: "Оценка $\\hat\\theta_n$ состоятельна, если…",
    options: [
      "$\\hat\\theta_n \\xrightarrow{P} \\theta$ при $n\\to\\infty$",
      "$\\mathrm{M}\\hat\\theta_n = \\theta$",
      "$\\mathrm{D}\\hat\\theta_n = \\frac{1}{nI(\\theta)}$",
      "$\\hat\\theta_n$ принимает только целые значения",
    ],
    correct: [0], multi: false,
    explain: "Состоятельность — сходимость по вероятности к истинному значению при $n\\to\\infty$: $\\forall\\varepsilon>0,\\ \\mathrm{P}(|\\hat\\theta_n-\\theta|>\\varepsilon)\\to0$. Несмещённость — отдельное понятие (условие на МО при фиксированном $n$).",
  },

  // ── difficulty 2 ────────────────────────────────────────────────────────
  {
    id: "props5", topic: "props", difficulty: 2,
    q: "Информация Фишера $I(\\theta)$ определяется как…",
    options: [
      "$\\mathrm{M}\\!\\left[\\left(\\frac{\\partial}{\\partial\\theta}\\ln f(X;\\theta)\\right)^{\\!2}\\right]$",
      "$\\mathrm{M}\\!\\left[\\frac{\\partial^2}{\\partial\\theta^2}\\ln f(X;\\theta)\\right]$",
      "$-\\ln L(\\theta)$",
      "$\\left(\\mathrm{D}\\!\\left[\\frac{\\partial}{\\partial\\theta}\\ln L(\\theta)\\right]\\right)^{1/2}$",
    ],
    correct: [0], multi: false,
    explain: "$I(\\theta)=\\mathrm{M}\\!\\left[(\\partial_\\theta\\ln f)^2\\right] = -\\mathrm{M}[\\partial^2_\\theta\\ln f]$ (второе равенство — при выполнении условий регулярности). Это «крутизна» функции правдоподобия: чем выше $I$, тем точнее можно оценить $\\theta$.",
  },
  {
    id: "props6", topic: "props", difficulty: 2,
    q: "Граница Рао–Крамера для несмещённой оценки $\\hat\\theta$ по выборке размера $n$ гласит:",
    options: [
      "$\\mathrm{D}\\hat\\theta \\ge \\dfrac{1}{n\\,I(\\theta)}$",
      "$\\mathrm{D}\\hat\\theta \\ge n\\,I(\\theta)$",
      "$\\mathrm{D}\\hat\\theta \\ge \\dfrac{I(\\theta)}{n}$",
      "$\\mathrm{D}\\hat\\theta \\ge \\dfrac{1}{\\sqrt{n\\,I(\\theta)}}$",
    ],
    correct: [0], multi: false,
    explain: "Граница: $\\mathrm{D}\\hat\\theta \\ge \\frac{1}{nI(\\theta)}$. Оценка, достигающая этой границы точно, называется **эффективной**. При больших $n$ ОМП асимптотически эффективна.",
  },
  {
    id: "props7", topic: "props", difficulty: 2,
    q: "Для геометрического распределения $\\mathrm{P}(X=k)=\\theta^k(1-\\theta)$ информация Фишера равна…",
    options: [
      "$\\dfrac{1}{\\theta(1-\\theta)}$",
      "$\\dfrac{1}{\\theta^2}$",
      "$\\dfrac{1}{(1-\\theta)^2}$",
      "$\\theta(1-\\theta)$",
    ],
    correct: [0], multi: false,
    explain: "$\\ln f = k\\ln\\theta + \\ln(1-\\theta)$; производная $\\partial_\\theta\\ln f = \\frac{k}{\\theta}-\\frac{1}{1-\\theta}$; после вычисления $\\mathrm{M}[(\\partial_\\theta\\ln f)^2]$ получаем $I(\\theta)=\\frac{1}{\\theta(1-\\theta)}$. Граница = $\\theta(1-\\theta)/n = \\mathrm{D}\\bar X$ — $\\bar X$ эффективна.",
  },
  {
    id: "props8", topic: "props", difficulty: 2,
    q: "Для Лапласа $f(x;\\theta)=\\frac{1}{2\\lambda}e^{-|x-\\theta|/\\lambda}$ выборочное среднее $\\bar X$ — оценка $\\theta$. По сравнению с границей Рао–Крамера дисперсия $\\mathrm{D}\\bar X$…",
    options: [
      "В 2 раза больше границы: $\\mathrm{D}\\bar X = \\frac{2\\lambda^2}{n} > \\frac{\\lambda^2}{n}$",
      "Равна границе: $\\bar X$ эффективна",
      "В $\\sqrt{2}$ раз больше",
      "Ниже границы — это невозможно для несмещённых оценок",
    ],
    correct: [0], multi: false,
    figure: "props_efficiency", figureCaption: "D(x̄) vs граница Рао–Крамера (Лаплас, λ=1)",
    explain: "У Лапласа $\\mathrm{D}X=2\\lambda^2$, поэтому $\\mathrm{D}\\bar X=2\\lambda^2/n$. Информация $I(\\theta)=1/\\lambda^2$, граница = $\\lambda^2/n$. Отношение $=2$ — $\\bar X$ неэффективна; оптимальная оценка — выборочная медиана.",
  },
  {
    id: "props9", topic: "props", difficulty: 2,
    q: "Оценка $X_{(n)}=\\max\\{X_1,\\dots,X_n\\}$ для $U[0,\\theta]$: состоятельна ли она, несмещена ли?",
    options: [
      "Состоятельна, но смещена ($\\mathrm{M}X_{(n)}=\\frac{n}{n+1}\\theta$)",
      "Состоятельна и несмещена",
      "Несмещена, но несостоятельна",
      "Ни состоятельна, ни несмещена",
    ],
    correct: [0], multi: false,
    explain: "$\\mathrm{M}X_{(n)}=\\frac{n}{n+1}\\theta\\neq\\theta$ — смещена. При этом $\\mathrm{P}(|X_{(n)}-\\theta|>\\varepsilon)=\\left(\\frac{\\theta-\\varepsilon}{\\theta}\\right)^n\\to0$ — состоятельна. Несмещённая поправка: $\\tilde\\theta=\\frac{n+1}{n}X_{(n)}$.",
  },

  // ── difficulty 3 ────────────────────────────────────────────────────────
  {
    id: "props10", topic: "props", difficulty: 3,
    q: "Для оценки $\\hat\\theta=\\bar X\\cdot\\frac{N-\\bar X}{N}$ параметра $\\theta$ биномиального $\\mathrm{Bin}(N,\\theta)$ (по выборке из $n$ копий) математическое ожидание равно…",
    options: [
      "$\\theta\\!\\left(1-\\frac{1}{nN}\\right)$ — асимптотически несмещённая",
      "$\\theta$ — точно несмещённая",
      "$\\theta(1-\\theta)$ — смещение зависит от $\\theta$",
      "$\\frac{N-1}{N}\\theta$",
    ],
    correct: [0], multi: false,
    explain: "$\\mathrm{M}[\\bar X^2]=\\mathrm{D}\\bar X+(\\mathrm{M}\\bar X)^2=\\frac{N\\theta(1-\\theta)}{n}+(N\\theta)^2$. Подставляя: $\\mathrm{M}\\hat\\theta=\\theta-\\frac{\\theta(1-\\theta)}{nN}=\\theta\\left(1-\\frac{1}{nN}\\right)\\to\\theta$ при $n\\to\\infty$.",
  },
  {
    id: "props11", topic: "props", difficulty: 3,
    q: "Несмещённая оценка $\\sigma$ через $\\frac{1}{n}\\sum|X_i-m|$ (при известном $\\mathrm{M}X=m$) требует множителя $C$. При нормальном $N(m,\\sigma^2)$ верно $C=$…",
    options: [
      "$\\sqrt{\\pi/2}$",
      "$\\sqrt{2/\\pi}$",
      "$\\pi/2$",
      "$2/\\pi$",
    ],
    correct: [0], multi: false,
    explain: "Для $X\\sim N(0,\\sigma^2)$: $\\mathrm{M}|X|=\\sigma\\sqrt{2/\\pi}$, поэтому $\\frac{1}{n}\\sum|X_i-m|$ оценивает $\\sigma\\sqrt{2/\\pi}$. Несмещённая оценка $\\sigma$: $\\hat\\sigma=\\sqrt{\\pi/2}\\cdot\\frac{1}{n}\\sum|X_i-m|$, т.е. $C=\\sqrt{\\pi/2}$.",
  },
]

export const flashcards = [
  {
    id: "fc_props_1", topic: "props",
    front: "Что значит «несмещённая оценка»?",
    back: "$\\mathrm{M}\\hat\\theta = \\theta$ для любого $n$. Ошибка в среднем равна нулю.",
  },
  {
    id: "fc_props_2", topic: "props",
    front: "Что значит «состоятельная оценка»?",
    back: "$\\hat\\theta_n \\xrightarrow{P} \\theta$ при $n\\to\\infty$: $\\mathrm{P}(|\\hat\\theta_n-\\theta|>\\varepsilon)\\to0$ для любого $\\varepsilon>0$.",
  },
  {
    id: "fc_props_3", topic: "props",
    front: "Почему $s^2=\\frac{1}{n}\\sum(X_i-\\bar X)^2$ смещена?",
    back: "$\\mathrm{M}s^2 = \\frac{n-1}{n}\\sigma^2 \\neq \\sigma^2$. Делитель $n$ «не компенсирует» потерю степени свободы при оценке $\\bar X$. Исправление: $S^2=\\frac{n}{n-1}s^2$.",
    figure: "props_bias_s2", figureCaption: "Монте-Карло: s² смещена, S² несмещена",
  },
  {
    id: "fc_props_4", topic: "props",
    front: "Информация Фишера $I(\\theta)$ — формула?",
    back: "$I(\\theta) = \\mathrm{M}\\!\\left[\\left(\\frac{\\partial \\ln f(X;\\theta)}{\\partial\\theta}\\right)^{\\!2}\\right] = -\\mathrm{M}\\!\\left[\\frac{\\partial^2 \\ln f(X;\\theta)}{\\partial\\theta^2}\\right]$",
  },
  {
    id: "fc_props_5", topic: "props",
    front: "Граница Рао–Крамера для несмещённой оценки?",
    back: "$\\mathrm{D}\\hat\\theta \\ge \\dfrac{1}{n\\,I(\\theta)}$. Оценка, достигающая границы, называется эффективной.",
  },
  {
    id: "fc_props_6", topic: "props",
    front: "Пример: оценка состоятельна, но смещена. Какая?",
    back: "$X_{(n)}=\\max_i X_i$ для $U[0,\\theta]$: $\\mathrm{M}X_{(n)}=\\frac{n}{n+1}\\theta\\neq\\theta$ (смещена), но $X_{(n)}\\xrightarrow{P}\\theta$ (состоятельна).",
  },
  {
    id: "fc_props_7", topic: "props",
    front: "Что значит «эффективная оценка»?",
    back: "Несмещённая оценка, дисперсия которой совпадает с границей Рао–Крамера: $\\mathrm{D}\\hat\\theta = \\frac{1}{nI(\\theta)}$. Для геометрического распределения $\\bar X$ — эффективна.",
  },
  {
    id: "fc_props_8", topic: "props",
    front: "Информация Фишера геометрического распределения $\\mathrm{P}(X=k)=\\theta^k(1-\\theta)$?",
    back: "$I(\\theta)=\\dfrac{1}{\\theta(1-\\theta)}$, граница Рао–Крамера $=\\theta(1-\\theta)/n = \\mathrm{D}\\bar X$ — $\\bar X$ эффективна.",
  },
  {
    id: "fc_props_9", topic: "props",
    front: "Для Лапласа $f=\\frac{1}{2\\lambda}e^{-|x-\\theta|/\\lambda}$: $I(\\theta)$ и эффективна ли $\\bar X$?",
    back: "$I(\\theta)=1/\\lambda^2$; $\\mathrm{D}\\bar X=2\\lambda^2/n$ — вдвое больше границы $\\lambda^2/n$. $\\bar X$ неэффективна; лучше — выборочная медиана.",
    figure: "props_efficiency", figureCaption: "D(x̄) vs граница Рао–Крамера, Лаплас",
  },
]

export const formulas = [
  {
    id: "fm_props_1", topic: "props",
    name: "Несмещённость оценки",
    latex: "\\mathrm{M}\\hat\\theta = \\theta",
    note: "Смещение $b(\\hat\\theta)=\\mathrm{M}\\hat\\theta-\\theta=0$. Несмещённость — свойство при фиксированном $n$.",
  },
  {
    id: "fm_props_2", topic: "props",
    name: "Состоятельность (сходимость по вероятности)",
    latex: "\\hat\\theta_n \\xrightarrow{P} \\theta \\quad (n\\to\\infty)",
    note: "$\\forall\\varepsilon>0:\\; \\mathrm{P}(|\\hat\\theta_n-\\theta|>\\varepsilon)\\to0$. Следует из несмещённости и $\\mathrm{D}\\hat\\theta_n\\to0$ (через неравенство Чебышёва).",
  },
  {
    id: "fm_props_3", topic: "props",
    name: "Смещение $s^2$ и исправленная $S^2$",
    latex: "\\mathrm{M}s^2 = \\frac{n-1}{n}\\sigma^2, \\qquad S^2 = \\frac{n}{n-1}s^2,\\quad \\mathrm{M}S^2 = \\sigma^2",
    note: "Поправка Бесселя: делим на $n-1$, чтобы учесть потерю одной степени свободы при оценке $\\bar X$.",
    figure: "props_bias_s2", figureCaption: "Монте-Карло: s² vs S², σ²=1, n=10",
  },
  {
    id: "fm_props_4", topic: "props",
    name: "Информация Фишера (одно наблюдение)",
    latex: "I(\\theta) = \\mathrm{M}\\!\\left[\\left(\\frac{\\partial \\ln f(X;\\theta)}{\\partial\\theta}\\right)^{\\!2}\\right] = -\\mathrm{M}\\!\\left[\\frac{\\partial^2 \\ln f(X;\\theta)}{\\partial\\theta^2}\\right]",
    note: "При условии регулярности оба выражения совпадают. Информация выборки $= nI(\\theta)$.",
  },
  {
    id: "fm_props_5", topic: "props",
    name: "Граница Рао–Крамера",
    latex: "\\mathrm{D}\\hat\\theta \\ge \\frac{1}{n\\,I(\\theta)}",
    note: "Нижняя граница дисперсии любой несмещённой оценки. Оценка, достигающая границы, — эффективная.",
  },
  {
    id: "fm_props_6", topic: "props",
    name: "Информация Фишера: геометрическое распределение",
    latex: "I(\\theta) = \\frac{1}{\\theta(1-\\theta)}, \\qquad \\mathrm{D}\\bar X = \\frac{\\theta(1-\\theta)}{n} = \\frac{1}{nI(\\theta)}",
    note: "$\\bar X$ — эффективная оценка $\\theta$ для геометрического распределения.",
  },
  {
    id: "fm_props_7", topic: "props",
    name: "Лаплас: информация Фишера и неэффективность $\\bar X$",
    latex: "I(\\theta)=\\frac{1}{\\lambda^2},\\quad \\mathrm{D}\\bar X=\\frac{2\\lambda^2}{n},\\quad \\frac{\\mathrm{D}\\bar X}{1/(nI)}=2",
    note: "$\\bar X$ вдвое менее эффективна, чем граница. Оптимальная оценка — выборочная медиана ($\\mathrm{D}\\,\\mathrm{med}\\approx\\lambda^2/n$).",
    figure: "props_efficiency", figureCaption: "D(x̄) vs граница Рао–Крамера (Лаплас)",
  },
]
