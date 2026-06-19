export const questions = [
  {
    id: "order1", topic: "order", difficulty: 1, figure: "order_max_uniform", figureCaption: "ФР максимума для U[0,θ]",
    q: "Чему равна функция распределения максимума $X_{(n)}=\\max\\{X_1,\\dots,X_n\\}$ выборки из распределения $F(x)$?",
    options: ["$F_{(n)}(x)=F(x)^n$", "$F_{(n)}(x)=1-(1-F(x))^n$", "$F_{(n)}(x)=nF(x)$", "$F_{(n)}(x)=F(x)^{1/n}$"],
    correct: [0], multi: false,
    explain: "Все элементы должны быть меньше $x$: $\\mathrm{P}(X_{(n)}<x)=\\mathrm{P}(X_1<x,\\dots,X_n<x)=F(x)^n$ в силу независимости.",
  },
  {
    id: "order2", topic: "order", difficulty: 1,
    q: "Чему равна ФР минимума $X_{(1)}$ выборки из $F(x)$?",
    options: ["$1-(1-F(x))^n$", "$F(x)^n$", "$1-F(x)^n$", "$n(1-F(x))$"],
    correct: [0], multi: false,
    explain: "$\\mathrm{P}(X_{(1)}<x)=1-\\mathrm{P}(\\text{все}\\ \\ge x)=1-(1-F(x))^n$.",
  },
  {
    id: "order3", topic: "order", difficulty: 2, figure: "order_cdf_k", figureCaption: "F_(k) для U[0,1], n=10",
    q: "ФР $k$-й порядковой статистики выражается через биномиальные вероятности. Почему?",
    options: [
      "Событие $\\{X_{(k)}<x\\}$ значит «не менее $k$ элементов $<x$», а число таких элементов $\\sim\\mathrm{Bin}(n,F(x))$",
      "Порядковые статистики независимы и одинаково распределены",
      "Сумма порядковых статистик имеет биномиальное распределение",
      "Это верно только для дискретных распределений",
    ],
    correct: [0], multi: false,
    explain: "Каждый элемент попадает «левее $x$» с вероятностью $p=F(x)$ независимо, поэтому число элементов $<x$ есть $\\mathrm{Bin}(n,F(x))$, и $F_{(k)}(x)=\\sum_{m=k}^n\\binom{n}{m}F^m(1-F)^{n-m}$.",
  },
  {
    id: "order4", topic: "order", difficulty: 2, figure: "order_min_density", figureCaption: "Плотность минимума для U[0,1]",
    q: "Для выборки из $U[0,1]$ чему равно $\\mathrm{M}X_{(1)}$ (матожидание минимума)?",
    options: ["$\\dfrac{1}{n+1}$", "$\\dfrac{1}{n}$", "$\\dfrac{n}{n+1}$", "$\\dfrac{1}{2n}$"],
    correct: [0], multi: false,
    explain: "Плотность $f_{(1)}(x)=n(1-x)^{n-1}$; интеграл $\\int_0^1 x\\,n(1-x)^{n-1}dx=\\frac{1}{n+1}$. Это частный случай $\\mathrm{Beta}(1,n)$.",
  },
  {
    id: "order5", topic: "order", difficulty: 2,
    q: "Распределение $k$-й порядковой статистики выборки из $U[0,1]$ — это…",
    options: ["$\\mathrm{Beta}(k,\\,n-k+1)$", "$\\mathrm{Beta}(n-k+1,\\,k)$", "$\\mathrm{Bin}(n,k/n)$", "$\\mathrm{Gamma}(k,1)$"],
    correct: [0], multi: false,
    explain: "Плотность $f_{(k)}(x)=\\frac{n!}{(k-1)!(n-k)!}x^{k-1}(1-x)^{n-k}$ — ровно плотность $\\mathrm{Beta}(k,\\,n-k+1)$; отсюда $\\mathrm{M}X_{(k)}=\\frac{k}{n+1}$.",
  },
  {
    id: "order6", topic: "order", difficulty: 3, figure: "order_max_uniform", figureCaption: "ФР максимума для U[0,θ]",
    q: "Для $X_i\\sim U[0,\\theta]$ оценка $\\hat\\theta_n=X_{(n)}$. Почему она состоятельна?",
    options: [
      "$\\mathrm{P}(|X_{(n)}-\\theta|>\\varepsilon)=\\big(\\tfrac{\\theta-\\varepsilon}{\\theta}\\big)^n\\to0$",
      "$X_{(n)}$ несмещена, поэтому состоятельна",
      "$\\mathrm{M}X_{(n)}=\\theta$ при любом $n$",
      "$X_{(n)}$ имеет нормальное распределение при больших $n$",
    ],
    correct: [0], multi: false,
    explain: "$F_{X_{(n)}}(x)=(x/\\theta)^n$, поэтому $\\mathrm{P}(X_{(n)}<\\theta-\\varepsilon)=((\\theta-\\varepsilon)/\\theta)^n\\to0$ — сходимость по вероятности к $\\theta$. При этом оценка смещена: $\\mathrm{M}X_{(n)}=\\frac{n}{n+1}\\theta$.",
  },
]

export const flashcards = [
  { id: "fc_order_1", topic: "order", front: "ФР минимума $X_{(1)}$ выборки из $F(x)$?", back: "$F_{(1)}(x)=1-(1-F(x))^n$" },
  { id: "fc_order_2", topic: "order", front: "ФР максимума $X_{(n)}$?", back: "$F_{(n)}(x)=F(x)^n$" },
  { id: "fc_order_3", topic: "order", front: "ФР $k$-й порядковой статистики?", back: "$F_{(k)}(x)=\\sum_{m=k}^{n}\\binom{n}{m}F^m(1-F)^{n-m}$" },
  { id: "fc_order_4", topic: "order", front: "Плотность $f_{(k)}(x)$?", back: "$f_{(k)}(x)=\\dfrac{n!}{(k-1)!(n-k)!}F^{k-1}(1-F)^{n-k}f$" },
  { id: "fc_order_5", topic: "order", front: "$\\mathrm{M}X_{(k)}$ и $\\mathrm{D}X_{(k)}$ для $U[0,1]$?", back: "$\\mathrm{M}X_{(k)}=\\dfrac{k}{n+1},\\quad \\mathrm{D}X_{(k)}=\\dfrac{k(n-k+1)}{(n+1)^2(n+2)}$" },
  { id: "fc_order_6", topic: "order", front: "Распределение $X_{(k)}$ для $U[0,1]$ — какое семейство?", back: "Бета-распределение $\\mathrm{Beta}(k,\\,n-k+1)$." },
  { id: "fc_order_7", topic: "order", front: "$f_{(1)}(x)$ для $U[0,1]$?", back: "$f_{(1)}(x)=n(1-x)^{n-1}$, $\\ \\mathrm{M}X_{(1)}=\\dfrac1{n+1}$" },
]

export const formulas = [
  { id: "fm_order_1", topic: "order", name: "ФР минимума и максимума",
    latex: "F_{(1)}(x)=1-(1-F(x))^n,\\qquad F_{(n)}(x)=F(x)^n",
    note: "Минимум: хотя бы один $<x$ (= $1-\\mathrm P(\\text{все}\\ge x)$); максимум: все $<x$.", figure: "order_max_uniform", figureCaption: "ФР максимума для U[0,θ]" },
  { id: "fm_order_2", topic: "order", name: "ФР k-й порядковой статистики",
    latex: "F_{(k)}(x)=\\sum_{m=k}^{n}\\binom{n}{m}F(x)^m(1-F(x))^{n-m}=I_{F(x)}(k,\\,n-k+1)",
    note: "Число элементов $<x$ имеет $\\mathrm{Bin}(n,F(x))$; $I_x$ — неполная бета-функция.", figure: "order_cdf_k", figureCaption: "F_(k) для U[0,1], n=10" },
  { id: "fm_order_3", topic: "order", name: "Плотность k-й порядковой статистики",
    latex: "f_{(k)}(x)=\\frac{n!}{(k-1)!(n-k)!}\\,F(x)^{k-1}(1-F(x))^{n-k}f(x)",
    note: "Для $U[0,1]$ это бета-распределение $\\mathrm{Beta}(k,\\,n-k+1)$." },
  { id: "fm_order_4", topic: "order", name: "Моменты порядковой статистики (U[0,1])",
    latex: "\\mathrm{M}X_{(k)}=\\frac{k}{n+1},\\qquad \\mathrm{D}X_{(k)}=\\frac{k(n-k+1)}{(n+1)^2(n+2)}",
    note: "Следствие бета-распределения." },
  { id: "fm_order_5", topic: "order", name: "Плотность минимума (U[0,1])",
    latex: "f_{(1)}(x)=n(1-x)^{n-1},\\quad \\mathrm{M}X_{(1)}=\\frac{1}{n+1},\\quad \\mathrm{D}X_{(1)}=\\frac{n}{(n+1)^2(n+2)}",
    figure: "order_min_density", figureCaption: "Плотность минимума для U[0,1]" },
]
