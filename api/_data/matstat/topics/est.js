/* matstat/topics/est.js — Точечное оценивание: метод моментов и ММП.
   LaTeX: KaTeX-совместимые макросы (\hat, \theta, \bar X, \frac, \sqrt, \sum,
   \prod, \ln, \arg\max, \mathrm). Figures: est_order_uniform, est_mm_vs_ml. */

export const questions = [
  {
    id: "est1", topic: "est", difficulty: 1,
    q: "Как строится оценка параметра $\\theta$ методом моментов (ММ)?",
    options: [
      "Приравнивают выборочный момент к теоретическому и решают уравнение: $\\frac{1}{n}\\sum X_i^k = \\mu_k(\\theta)$",
      "Максимизируют функцию правдоподобия $L(\\theta)=\\prod f(X_i;\\theta)$",
      "Берут медиану выборки как оценку параметра",
      "Минимизируют сумму квадратов ошибок $\\sum(X_i-\\theta)^2$",
    ],
    correct: [0], multi: false,
    explain: "Метод моментов: выборочный момент $\\hat\\mu_k=\\frac{1}{n}\\sum X_i^k$ приравнивают к теоретическому $\\mu_k(\\theta)$ и находят $\\hat\\theta$ из этого уравнения. Это самый простой метод оценивания — без задания функции правдоподобия.",
  },
  {
    id: "est2", topic: "est", difficulty: 1,
    q: "Чему равна оценка метода моментов для параметра $\\theta$ распределения $U[0,\\theta]$?",
    options: [
      "$\\hat\\theta^{MM} = 2\\bar X$",
      "$\\hat\\theta^{MM} = X_{(n)}$",
      "$\\hat\\theta^{MM} = \\bar X$",
      "$\\hat\\theta^{MM} = \\sqrt{\\bar X}$",
    ],
    correct: [0], multi: false,
    explain: "Для $U[0,\\theta]$: $\\mathrm{M}X=\\theta/2$, значит $\\bar X=\\theta/2$, откуда $\\hat\\theta^{MM}=2\\bar X$. Это стандартный первый шаг ММ — приравниваем выборочное среднее к теоретическому.",
  },
  {
    id: "est3", topic: "est", difficulty: 2,
    q: "Как строится оценка максимального правдоподобия (ОМП) для параметров $\\theta_1,\\theta_2$ равномерного распределения $U[\\theta_1,\\theta_2]$?",
    options: [
      "$\\hat\\theta_1^{ML}=X_{(1)},\\quad \\hat\\theta_2^{ML}=X_{(n)}$",
      "$\\hat\\theta_1^{ML}=\\bar X - \\sqrt{3s^2},\\quad \\hat\\theta_2^{ML}=\\bar X + \\sqrt{3s^2}$",
      "$\\hat\\theta_1^{ML}=\\min X_i/2,\\quad \\hat\\theta_2^{ML}=\\max X_i/2$",
      "$\\hat\\theta_1^{ML}=0,\\quad \\hat\\theta_2^{ML}=\\bar X$",
    ],
    correct: [0], multi: false,
    figure: "est_order_uniform", figureCaption: "Плотности минимума и максимума (ОМП к границам)",
    explain: "Правдоподобие $L=(\\theta_2-\\theta_1)^{-n}$ максимально при минимальной длине отрезка $[\\theta_1,\\theta_2]$, содержащего все наблюдения. Значит $\\hat\\theta_1^{ML}=X_{(1)}$ (минимум выборки) и $\\hat\\theta_2^{ML}=X_{(n)}$ (максимум).",
  },
  {
    id: "est4", topic: "est", difficulty: 2,
    q: "Чему равны оценки ММ для параметров $\\theta_1,\\theta_2$ распределения $U[\\theta_1,\\theta_2]$? (здесь $s^2=\\frac{1}{n}\\sum(X_i-\\bar X)^2$)",
    options: [
      "$\\hat\\theta_1^{MM}=\\bar X - \\sqrt{3s^2},\\quad \\hat\\theta_2^{MM}=\\bar X + \\sqrt{3s^2}$",
      "$\\hat\\theta_1^{MM}=X_{(1)},\\quad \\hat\\theta_2^{MM}=X_{(n)}$",
      "$\\hat\\theta_1^{MM}=\\bar X - s,\\quad \\hat\\theta_2^{MM}=\\bar X + s$",
      "$\\hat\\theta_1^{MM}=\\bar X - 2s^2,\\quad \\hat\\theta_2^{MM}=\\bar X + 2s^2$",
    ],
    correct: [0], multi: false,
    explain: "Для $U[\\theta_1,\\theta_2]$: $\\mathrm{M}X=\\frac{\\theta_1+\\theta_2}{2}$, $\\mathrm{D}X=\\frac{(\\theta_2-\\theta_1)^2}{12}$. Из системы $\\bar X=\\frac{\\hat\\theta_1+\\hat\\theta_2}{2}$, $s^2=\\frac{(\\hat\\theta_2-\\hat\\theta_1)^2}{12}$ получаем $\\hat\\theta_1^{MM}=\\bar X-\\sqrt{3s^2}$, $\\hat\\theta_2^{MM}=\\bar X+\\sqrt{3s^2}$.",
  },
  {
    id: "est5", topic: "est", difficulty: 2,
    q: "Какова ОМП дисперсии $\\sigma^2$ для нормального распределения $N(a,\\sigma^2)$?",
    options: [
      "$\\widehat{\\sigma^2}^{ML} = s^2 = \\frac{1}{n}\\sum(X_i-\\bar X)^2$",
      "$\\widehat{\\sigma^2}^{ML} = S^2 = \\frac{1}{n-1}\\sum(X_i-\\bar X)^2$",
      "$\\widehat{\\sigma^2}^{ML} = \\frac{1}{n}\\sum X_i^2$",
      "$\\widehat{\\sigma^2}^{ML} = \\bar X^2$",
    ],
    correct: [0], multi: false,
    explain: "Логарифм правдоподобия нормального: $\\ell=-\\frac{n}{2}\\ln\\sigma^2-\\frac{1}{2\\sigma^2}\\sum(X_i-a)^2$. Максимизируя по $\\sigma^2$ при $\\hat a=\\bar X$, получаем $\\widehat{\\sigma^2}^{ML}=\\frac{1}{n}\\sum(X_i-\\bar X)^2=s^2$ (с делителем $n$, не $n-1$). Эта оценка смещённая.",
  },
  {
    id: "est6", topic: "est", difficulty: 2,
    figure: "est_mm_vs_ml", figureCaption: "Распределения ОММ и ОМП для U[0,θ], n=20",
    q: "На графике Монте-Карло для $U[0,\\theta]$, $n=20$: $\\hat\\theta^{MM}=2\\bar X$ и $\\hat\\theta^{ML}=X_{(n)}$. Что наблюдается?",
    options: [
      "$\\hat\\theta^{ML}$ смещена влево от $\\theta$, $\\hat\\theta^{MM}$ симметрична около $\\theta$",
      "$\\hat\\theta^{ML}$ несмещена, $\\hat\\theta^{MM}$ смещена",
      "Обе оценки несмещены и одинаково разброса",
      "$\\hat\\theta^{ML}$ имеет больший разброс, чем $\\hat\\theta^{MM}$",
    ],
    correct: [0], multi: false,
    explain: "$\\hat\\theta^{ML}=X_{(n)}$ всегда $\\le\\theta$, поэтому смещена: $\\mathrm{M}X_{(n)}=\\frac{n}{n+1}\\theta<\\theta$. Зато она имеет меньший разброс. $\\hat\\theta^{MM}=2\\bar X$ несмещена ($\\mathrm{M}(2\\bar X)=\\theta$), но рассеяние больше.",
  },
  {
    id: "est7", topic: "est", difficulty: 3,
    q: "Для сдвинутого показательного $f(x;\\theta_1,\\theta_2)=\\theta_2 e^{-\\theta_2(x-\\theta_1)}$, $x\\ge\\theta_1$. Каковы ОМП?",
    options: [
      "$\\hat\\theta_1^{ML}=X_{(1)},\\quad \\hat\\theta_2^{ML}=\\frac{1}{\\bar X - X_{(1)}}$",
      "$\\hat\\theta_1^{ML}=\\bar X,\\quad \\hat\\theta_2^{ML}=1/\\bar X$",
      "$\\hat\\theta_1^{ML}=X_{(1)},\\quad \\hat\\theta_2^{ML}=1/\\bar X$",
      "$\\hat\\theta_1^{ML}=\\bar X - 1/\\theta_2,\\quad \\hat\\theta_2^{ML}=n/\\sum X_i$",
    ],
    correct: [0], multi: false,
    explain: "$L=\\theta_2^n e^{-\\theta_2\\sum(x_i-\\theta_1)}$. При фиксированном $\\theta_2>0$ функция растёт по $\\theta_1$ до тех пор, пока $\\theta_1\\le X_{(1)}$, значит $\\hat\\theta_1^{ML}=X_{(1)}$. Подставляя, $\\ell=n\\ln\\theta_2-\\theta_2\\sum(x_i-X_{(1)})$; максимизируем по $\\theta_2$: $\\hat\\theta_2^{ML}=n/\\sum(x_i-X_{(1)})=1/(\\bar X-X_{(1)})$.",
  },
  {
    id: "est8", topic: "est", difficulty: 3,
    q: "Несмещённая поправка к ОМП для $U[0,\\theta]$: как получить несмещённую оценку из $X_{(n)}$?",
    options: [
      "$\\tilde\\theta = \\frac{n+1}{n}X_{(n)}$",
      "$\\tilde\\theta = \\frac{n}{n+1}X_{(n)}$",
      "$\\tilde\\theta = X_{(n)} + \\frac{1}{n}$",
      "$\\tilde\\theta = 2X_{(n)} - X_{(1)}$",
    ],
    correct: [0], multi: false,
    explain: "$\\mathrm{M}X_{(n)}=\\frac{n}{n+1}\\theta$, значит $\\mathrm{M}\\!\\left(\\frac{n+1}{n}X_{(n)}\\right)=\\theta$ — несмещённая. Аналогично для $U[\\theta_1,\\theta_2]$: $\\tilde\\theta_1=\\frac{nX_{(1)}-X_{(n)}}{n-1}$, $\\tilde\\theta_2=\\frac{nX_{(n)}-X_{(1)}}{n-1}$.",
  },
  {
    id: "est9", topic: "est", difficulty: 3,
    q: "Для геометрического распределения $P(X=k)=\\theta(1-\\theta)^{k-1}$, $k=1,2,\\dots$. Какова ОМП $\\hat\\theta^{ML}$?",
    options: [
      "$\\hat\\theta^{ML} = \\frac{1}{\\bar X}$",
      "$\\hat\\theta^{ML} = \\bar X$",
      "$\\hat\\theta^{ML} = 1 - \\bar X$",
      "$\\hat\\theta^{ML} = \\frac{n}{\\sum X_i - n}$",
    ],
    correct: [0], multi: false,
    explain: "Логарифм правдоподобия: $\\ell=n\\ln\\theta+\\sum(x_i-1)\\ln(1-\\theta)$. Берём $\\partial\\ell/\\partial\\theta=n/\\theta-\\sum(x_i-1)/(1-\\theta)=0$, откуда $\\hat\\theta^{ML}=n/\\sum x_i=1/\\bar X$. Это же совпадает с ОММ, так как $\\mathrm{M}X=1/\\theta$.",
  },
  {
    id: "est10", topic: "est", difficulty: 1,
    q: "Чем принципиально отличается метод максимального правдоподобия от метода моментов?",
    options: [
      "ММП максимизирует функцию правдоподобия $L(\\theta)=\\prod f(X_i;\\theta)$, ММ приравнивает моменты",
      "ММ всегда даёт несмещённые оценки, ММП — нет",
      "ММП применим только к нормальным выборкам, ММ — к любым",
      "ММ использует порядковые статистики, ММП — среднее",
    ],
    correct: [0], multi: false,
    explain: "ММ (простой): из уравнения $\\hat\\mu_k=\\mu_k(\\theta)$. ММП (эффективнее): $\\hat\\theta=\\arg\\max L(\\theta)$, что эквивалентно $\\arg\\max\\ell(\\theta)=\\sum\\ln f(X_i;\\theta)$. ОМП обычно состоятельна, асимптотически нормальна и эффективна — достигает границы Рао–Крамера в пределе.",
  },
];

export const flashcards = [
  {
    id: "fc_est_1", topic: "est",
    front: "Что такое метод моментов (ММ)?",
    back: "Приравниваем выборочный момент $\\frac{1}{n}\\sum X_i^k$ к теоретическому $\\mu_k(\\theta)$ и решаем уравнение относительно $\\theta$.",
  },
  {
    id: "fc_est_2", topic: "est",
    front: "Что такое оценка максимального правдоподобия (ОМП)?",
    back: "$\\hat\\theta=\\arg\\max_\\theta \\prod_{i=1}^n f(X_i;\\theta)$. На практике максимизируют логарифм: $\\ell(\\theta)=\\sum\\ln f(X_i;\\theta)$.",
  },
  {
    id: "fc_est_3", topic: "est",
    front: "ОМП и ОММ для $U[\\theta_1,\\theta_2]$?",
    back: "ОМП: $\\hat\\theta_1^{ML}=X_{(1)},\\ \\hat\\theta_2^{ML}=X_{(n)}$.\\nОММ: $\\hat\\theta_1^{MM}=\\bar X-\\sqrt{3s^2},\\ \\hat\\theta_2^{MM}=\\bar X+\\sqrt{3s^2}$.",
    figure: "est_order_uniform", figureCaption: "Плотности min/max (ОМП к границам)",
  },
  {
    id: "fc_est_4", topic: "est",
    front: "Почему для $U[\\theta_1,\\theta_2]$ ОМП $=X_{(1)},X_{(n)}$?",
    back: "Правдоподобие $L=(\\theta_2-\\theta_1)^{-n}$ максимально при минимальной длине $[\\theta_1,\\theta_2]$, ещё содержащего все данные. Минимально допустимый отрезок — $[X_{(1)},X_{(n)}]$.",
  },
  {
    id: "fc_est_5", topic: "est",
    front: "Несмещённые поправки к ОМП для $U[\\theta_1,\\theta_2]$?",
    back: "$\\tilde\\theta_1=\\dfrac{nX_{(1)}-X_{(n)}}{n-1},\\qquad \\tilde\\theta_2=\\dfrac{nX_{(n)}-X_{(1)}}{n-1}$",
  },
  {
    id: "fc_est_6", topic: "est",
    front: "ОМП дисперсии для $N(a,\\sigma^2)$?",
    back: "$\\widehat{\\sigma^2}^{ML}=s^2=\\frac{1}{n}\\sum(X_i-\\bar X)^2$ — с делителем $n$ (смещённая оценка). Несмещённая: $S^2=\\frac{n}{n-1}s^2$.",
  },
  {
    id: "fc_est_7", topic: "est",
    front: "ОМП для геометрического $P(k)=\\theta(1-\\theta)^{k-1}$?",
    back: "$\\hat\\theta^{ML}=\\dfrac{1}{\\bar X}$. Совпадает с ОММ, так как $\\mathrm{M}X=1/\\theta$.",
  },
  {
    id: "fc_est_8", topic: "est",
    front: "ОМП и ОММ для сдвинутого показательного $f=\\theta_2 e^{-\\theta_2(x-\\theta_1)}$?",
    back: "ОМП: $\\hat\\theta_1^{ML}=X_{(1)},\\ \\hat\\theta_2^{ML}=\\dfrac{1}{\\bar X-X_{(1)}}$.\\nОММ: $\\hat\\theta_1^{MM}=\\bar X-s,\\ \\hat\\theta_2^{MM}=\\dfrac{1}{s}$.",
  },
  {
    id: "fc_est_9", topic: "est",
    front: "Как сделать ОМП $X_{(n)}$ для $U[0,\\theta]$ несмещённой?",
    back: "$\\mathrm{M}X_{(n)}=\\frac{n}{n+1}\\theta$, поэтому $\\tilde\\theta=\\frac{n+1}{n}X_{(n)}$ несмещённа.",
    figure: "est_mm_vs_ml", figureCaption: "ОМП смещена влево, ОММ — симметрична",
  },
];

export const formulas = [
  {
    id: "fm_est_1", topic: "est",
    name: "Метод моментов (общий принцип)",
    latex: "\\frac{1}{n}\\sum_{i=1}^{n} X_i^k = \\mu_k(\\theta) \\implies \\hat{\\theta}^{MM}",
    note: "Приравниваем $k$-й выборочный момент $\\hat\\mu_k$ к теоретическому $\\mu_k(\\theta)$ и решаем уравнение. При нескольких параметрах берут несколько моментов.",
  },
  {
    id: "fm_est_2", topic: "est",
    name: "Метод максимального правдоподобия (ОМП)",
    latex: "\\hat{\\theta}^{ML} = \\arg\\max_{\\theta}\\, L(\\theta),\\quad L(\\theta) = \\prod_{i=1}^{n} f(X_i;\\theta)",
    note: "На практике максимизируют логарифм правдоподобия $\\ell(\\theta)=\\sum_{i=1}^n \\ln f(X_i;\\theta)$ — это проще. Уравнение $\\ell'(\\theta)=0$ называют уравнением правдоподобия.",
  },
  {
    id: "fm_est_3", topic: "est",
    name: "ОМП для $U[\\theta_1,\\theta_2]$",
    latex: "\\hat{\\theta}_1^{ML} = X_{(1)},\\qquad \\hat{\\theta}_2^{ML} = X_{(n)}",
    note: "Правдоподобие $L=(\\theta_2-\\theta_1)^{-n}$; максимально при минимальном допустимом отрезке, содержащем все данные.",
    figure: "est_order_uniform", figureCaption: "Плотности X_(1) и X_(n) концентрируются у границ",
  },
  {
    id: "fm_est_4", topic: "est",
    name: "ОММ для $U[\\theta_1,\\theta_2]$",
    latex: "\\hat{\\theta}_1^{MM} = \\bar{X} - \\sqrt{3\\,s^2},\\qquad \\hat{\\theta}_2^{MM} = \\bar{X} + \\sqrt{3\\,s^2}",
    note: "Из системы $\\mathrm{M}X=\\bar X$, $\\mathrm{D}X=s^2$: для $U[\\theta_1,\\theta_2]$ получаем $\\mathrm{D}X=(\\theta_2-\\theta_1)^2/12$, откуда $\\theta_2-\\theta_1=2\\sqrt{3s^2}$.",
  },
  {
    id: "fm_est_5", topic: "est",
    name: "Несмещённые поправки к ОМП для $U[\\theta_1,\\theta_2]$",
    latex: "\\tilde{\\theta}_1 = \\frac{n\\,X_{(1)} - X_{(n)}}{n-1},\\qquad \\tilde{\\theta}_2 = \\frac{n\\,X_{(n)} - X_{(1)}}{n-1}",
    note: "ОМП $X_{(1)}, X_{(n)}$ смещены внутрь отрезка. Линейная комбинация даёт несмещённые оценки.",
  },
  {
    id: "fm_est_6", topic: "est",
    name: "ОМП для $N(a,\\sigma^2)$",
    latex: "\\hat{a}^{ML} = \\bar{X},\\qquad \\widehat{\\sigma^2}^{ML} = s^2 = \\frac{1}{n}\\sum_{i=1}^{n}(X_i - \\bar{X})^2",
    note: "$\\hat a^{ML}=\\hat a^{MM}=\\bar X$. ОМП дисперсии смещена: $\\mathrm{M}s^2=\\frac{n-1}{n}\\sigma^2$; несмещённая — $S^2=\\frac{n}{n-1}s^2$.",
  },
  {
    id: "fm_est_7", topic: "est",
    name: "ОМП для сдвинутого показательного",
    latex: "f(x) = \\theta_2\\,e^{-\\theta_2(x-\\theta_1)},\\quad \\hat{\\theta}_1^{ML} = X_{(1)},\\quad \\hat{\\theta}_2^{ML} = \\frac{1}{\\bar{X} - X_{(1)}}",
    note: "Правдоподобие растёт по $\\theta_1$ до $X_{(1)}$; после подстановки $\\hat\\theta_2$ находим из $\\partial\\ell/\\partial\\theta_2=0$.",
  },
  {
    id: "fm_est_8", topic: "est",
    name: "ОМП для геометрического распределения",
    latex: "P(X=k) = \\theta(1-\\theta)^{k-1},\\quad \\hat{\\theta}^{ML} = \\frac{1}{\\bar{X}}",
    note: "Совпадает с ОММ ($\\mathrm{M}X=1/\\theta$). Вывод: $\\ell=n\\ln\\theta+(\\sum x_i-n)\\ln(1-\\theta)$, $\\ell'=0$.",
    figure: "est_mm_vs_ml", figureCaption: "Сравнение ОМП и ОММ (Монте-Карло)",
  },
];
