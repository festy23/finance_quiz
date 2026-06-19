export const questions = [
  {
    id: "sp1", topic: "sp", difficulty: 1,
    q: "Чему равна корреляционная функция стандартного процесса Винера $W(t)$?",
    options: [
      "$R_W(t,s)=\\min(t,s)$",
      "$R_W(t,s)=\\max(t,s)$",
      "$R_W(t,s)=ts$",
      "$R_W(t,s)=|t-s|$",
    ],
    correct: [0], multi: false,
    explain: "Для стандартного процесса Винера $\\mathrm{M}[W(t)W(s)]=\\min(t,s)$. Это следует из независимости приращений и равенства $\\mathrm{D}[W(t)]=t$. При $s\\leq t$: $\\mathrm{M}[W(t)W(s)]=\\mathrm{M}[(W(t)-W(s)+W(s))W(s)]=\\mathrm{M}[W(s)^2]=s=\\min(t,s)$.",
    figure: "sp_brownian_bridge", figureCaption: "Траектории процесса Винера и броуновского моста",
  },
  {
    id: "sp2", topic: "sp", difficulty: 2,
    q: "Броуновский мост $X(t)=W(t)-tW(1)$, $t\\in[0,1]$. Чему равна его корреляционная функция?",
    options: [
      "$R_X(t,s)=\\min(t,s)-ts$",
      "$R_X(t,s)=\\min(t,s)+ts$",
      "$R_X(t,s)=e^{-|t-s|}$",
      "$R_X(t,s)=\\min(t,s)$",
    ],
    correct: [0], multi: false,
    explain: "Вычитаем $tW(1)$: $\\mathrm{M}[X(t)X(s)]=\\mathrm{M}[(W(t)-tW(1))(W(s)-sW(1))]$. Раскрывая, получаем $\\min(t,s)-ts\\cdot 1-st\\cdot 1+ts\\cdot 1=\\min(t,s)-ts$. Ключевой факт: $\\mathrm{M}[W(t)W(1)]=\\min(t,1)=t$ при $t\\in[0,1]$.",
    figure: "sp_bridge_corr", figureCaption: "Корреляционная функция броуновского моста $R_X(t,s)=\\min(t,s)-ts$",
  },
  {
    id: "sp3", topic: "sp", difficulty: 1,
    q: "Телеграфный сигнал $X(t)=X_0\\cdot(-1)^{N(t)}$, где $N(t)\\sim\\mathrm{Poiss}(\\lambda t)$. Чему равна его корреляционная функция?",
    options: [
      "$R_X(t,s)=e^{-2\\lambda|t-s|}$",
      "$R_X(t,s)=e^{-\\lambda|t-s|}$",
      "$R_X(t,s)=\\min(t,s)$",
      "$R_X(t,s)=\\lambda|t-s|$",
    ],
    correct: [0], multi: false,
    explain: "При $|X_0|=1$ и $s\\leq t$: $\\mathrm{M}[X(t)X(s)]=\\mathrm{P}(\\text{чётное число скачков на }[s,t])-\\mathrm{P}(\\text{нечётное})$. Число скачков на $[s,t]$ — $\\mathrm{Poiss}(\\lambda(t-s))$. Разность вероятностей чётности равна $e^{-2\\lambda(t-s)}$, откуда $R_X=e^{-2\\lambda|t-s|}$.",
    figure: "sp_telegraph", figureCaption: "Траектории телеграфного сигнала",
  },
  {
    id: "sp4", topic: "sp", difficulty: 2,
    q: "Квадратическая вариация стандартного процесса Винера на $[a,b]$:",
    options: [
      "$\\sum_{i}(\\Delta W_i)^2\\xrightarrow{L^2}b-a$",
      "$\\sum_{i}(\\Delta W_i)^2\\xrightarrow{L^2}0$",
      "$\\sum_{i}(\\Delta W_i)^2\\xrightarrow{L^2}W(b)^2$",
      "$\\sum_{i}(\\Delta W_i)^2\\xrightarrow{L^2}(b-a)^2$",
    ],
    correct: [0], multi: false,
    explain: "Квадратическая вариация: $\\sum_{i=1}^n(W(t_i)-W(t_{i-1}))^2\\xrightarrow{L^2}b-a$ при $\\|\\Delta\\|\\to 0$. Каждое $(\\Delta W_i)^2$ имеет матожидание $\\Delta t_i$, поэтому сумма сходится к $b-a$. Это принципиально отличает Винер от дифференцируемых функций, где вариация $\\to 0$.",
  },
  {
    id: "sp5", topic: "sp", difficulty: 3,
    q: "Пусть $X(t)$ — стандартный процесс Винера. Какие из утверждений верны? (несколько ответов)",
    options: [
      "$W(0)=0$ п.н.",
      "Приращения $W(t)-W(s)$ и $W(r)-W(q)$ независимы при $s\\leq t\\leq q\\leq r$",
      "$W(t)-W(s)\\sim\\mathcal{N}(0,t-s)$ при $s<t$",
      "Пути $W(\\cdot)$ непрерывны и дифференцируемы п.н.",
    ],
    correct: [0, 1, 2], multi: true,
    explain: "Пути Винера непрерывны п.н., но нигде не дифференцируемы — их квадратическая вариация равна $t$, что невозможно для дифференцируемых функций. Остальные три свойства — определяющие аксиомы стандартного винеровского процесса.",
  },
  {
    id: "sp6", topic: "sp", difficulty: 2,
    q: "Геометрическое броуновское движение $S(t)=S_0 e^{\\sigma W(t)+\\mu t}$. Чему равно $\\mathrm{M}[S(t)]$?",
    options: [
      "$S_0\\,e^{\\mu t+\\sigma^2 t/2}$",
      "$S_0\\,e^{\\mu t}$",
      "$S_0\\,e^{\\sigma^2 t}$",
      "$S_0\\,e^{\\mu t-\\sigma^2 t/2}$",
    ],
    correct: [0], multi: false,
    explain: "Так как $\\sigma W(t)\\sim\\mathcal{N}(0,\\sigma^2 t)$, то $\\mathrm{M}[e^{\\sigma W(t)}]=e^{\\sigma^2 t/2}$ (момент логнормального). Откуда $\\mathrm{M}[S(t)]=S_0 e^{\\mu t}\\cdot e^{\\sigma^2 t/2}=S_0 e^{\\mu t+\\sigma^2 t/2}$.",
  },
  {
    id: "sp7", topic: "sp", difficulty: 2,
    q: "Корреляционная функция $R_X(t,s)=e^{-2|t-s|}$ соответствует стационарному процессу. Какова его спектральная плотность?",
    options: [
      "$S(\\omega)=\\dfrac{4}{4+\\omega^2}$",
      "$S(\\omega)=\\dfrac{2}{4+\\omega^2}$",
      "$S(\\omega)=e^{-2\\omega}$",
      "$S(\\omega)=\\dfrac{1}{2+|\\omega|}$",
    ],
    correct: [0], multi: false,
    explain: "Преобразование Фурье: $S(\\omega)=\\int_{-\\infty}^{+\\infty}e^{-2|\\tau|}e^{-i\\omega\\tau}d\\tau=\\frac{2\\cdot 2}{4+\\omega^2}=\\frac{4}{4+\\omega^2}$ (формула преобразования двустороннего экспоненциального корня).",
    figure: "sp_corr_telegraph", figureCaption: "Корреляционная функция телеграфного сигнала $R_X(\\tau)=e^{-2\\lambda|\\tau|}$",
  },
  {
    id: "sp8", topic: "sp", difficulty: 3,
    q: "Для геометрического броуновского движения (ГБД) корреляционная функция равна:",
    options: [
      "$R_X(t,s)=S_0^2 e^{\\mu(t+s)+\\sigma^2(t+s)/2}(e^{\\sigma^2\\min(t,s)}-1)$",
      "$R_X(t,s)=e^{-\\sigma^2|t-s|}$",
      "$R_X(t,s)=\\min(t,s)$",
      "$R_X(t,s)=S_0^2 e^{\\mu(t+s)}$",
    ],
    correct: [0], multi: false,
    explain: "Центрированный процесс $\\tilde{S}(t)=S(t)-\\mathrm{M}[S(t)]$. После вычислений $\\mathrm{M}[S(t)S(s)]-\\mathrm{M}[S(t)]\\mathrm{M}[S(s)]=S_0^2 e^{\\mu(t+s)+\\sigma^2(t+s)/2}(e^{\\sigma^2\\min(t,s)}-1)$. Ключевое: $\\mathrm{M}[e^{\\sigma W(t)+\\sigma W(s)}]=e^{\\sigma^2(t+s)/2+\\sigma^2\\min(t,s)}$ по свойствам ковариации Гауссова вектора.",
  },
  {
    id: "sp9", topic: "sp", difficulty: 1,
    q: "Броуновский мост $X(t)$ — это процесс Винера, «закреплённый» на обоих концах. Каково $X(0)$ и $X(1)$?",
    options: [
      "$X(0)=0$ и $X(1)=0$",
      "$X(0)=0$ и $X(1)=W(1)$",
      "$X(0)=1$ и $X(1)=0$",
      "$X(0)=W(0)$ и $X(1)=W(1)$",
    ],
    correct: [0], multi: false,
    explain: "Броуновский мост $X(t)=W(t)-tW(1)$ обращается в нуль при $t=0$ ($X(0)=W(0)-0=0$) и при $t=1$ ($X(1)=W(1)-1\\cdot W(1)=0$). Это «мост» между двумя нулевыми точками.",
  },
  {
    id: "sp10", topic: "sp", difficulty: 3,
    q: "Какое из неравенств задаёт квадратичную вариацию Дулинского–Квадратини для Винера на $[0,1]$?",
    options: [
      "$\\mathrm{M}\\left[\\left(\\sum_i(\\Delta W_i)^2-1\\right)^2\\right]\\to 0$",
      "$\\mathrm{M}\\left[\\sum_i|\\Delta W_i|\\right]\\to 0$",
      "$\\sup_i|\\Delta W_i|\\to 0$ п.н.",
      "$\\sum_i(\\Delta W_i)^2\\xrightarrow{\\text{п.н.}}\\infty$",
    ],
    correct: [0], multi: false,
    explain: "Сходимость квадратической вариации $\\sum(\\Delta W_i)^2\\to b-a$ понимается в смысле $L^2$: $\\mathrm{M}\\left[(\\sum(\\Delta W_i)^2-(b-a))^2\\right]\\to 0$ при $\\|\\Delta\\|\\to 0$. Это даёт $[W,W]_t=t$, «$dW\\cdot dW=dt$» в записи Ито.",
  },
]

export const flashcards = [
  {
    id: "fc_sp_1", topic: "sp",
    front: "Корреляционная функция процесса Винера",
    back: "$R_W(t,s)=\\mathrm{M}[W(t)W(s)]=\\min(t,s)$\n\nСледует из независимости приращений: при $s\\leq t$ берём $\\mathrm{M}[W(s)(W(t)-W(s)+W(s))]=\\mathrm{D}[W(s)]=s$.",
    figure: "sp_brownian_bridge",
  },
  {
    id: "fc_sp_2", topic: "sp",
    front: "Броуновский мост — определение и корреляционная функция",
    back: "$X(t)=W(t)-tW(1),\\quad t\\in[0,1]$\n\n$X(0)=X(1)=0$ п.н.\n\n$R_X(t,s)=\\min(t,s)-ts$",
    figure: "sp_bridge_corr",
  },
  {
    id: "fc_sp_3", topic: "sp",
    front: "Телеграфный сигнал — модель и КФ",
    back: "$X(t)=X_0\\cdot(-1)^{N(t)}$, $N(t)\\sim\\mathrm{Poiss}(\\lambda t)$\n\n$R_X(t,s)=e^{-2\\lambda|t-s|}$\n\nЭкспоненциально затухающая стационарная КФ.",
    figure: "sp_telegraph",
  },
  {
    id: "fc_sp_4", topic: "sp",
    front: "Квадратическая вариация Винера",
    back: "$\\sum_{i=1}^n(W(t_i)-W(t_{i-1}))^2\\xrightarrow{L^2}b-a$\n\nФормально: $[W,W]_t=t$, то есть «$dW\\cdot dW=dt$».\n\nПути Винера имеют конечную квадратическую вариацию, но бесконечную первого порядка.",
  },
  {
    id: "fc_sp_5", topic: "sp",
    front: "Геометрическое броуновское движение — матожидание",
    back: "$S(t)=S_0 e^{\\sigma W(t)+\\mu t}$\n\n$\\mathrm{M}[S(t)]=S_0 e^{\\mu t+\\sigma^2 t/2}$\n\nИз $\\mathrm{M}[e^{\\sigma W(t)}]=e^{\\sigma^2 t/2}$ (логнормальное распределение).",
  },
  {
    id: "fc_sp_6", topic: "sp",
    front: "Корреляционная функция ГБД",
    back: "$R_X(t,s)=S_0^2 e^{\\mu(t+s)+\\frac{\\sigma^2(t+s)}{2}}\\bigl(e^{\\sigma^2\\min(t,s)}-1\\bigr)$\n\nГБД не стационарно; его КФ зависит от обоих аргументов отдельно.",
  },
  {
    id: "fc_sp_7", topic: "sp",
    front: "Аксиомы стандартного процесса Винера",
    back: "1. $W(0)=0$ п.н.\n2. Независимые приращения.\n3. $W(t)-W(s)\\sim\\mathcal{N}(0,t-s)$.\n4. Непрерывные траектории п.н.\n\nСледствие: $\\mathrm{D}[W(t)]=t$, $\\mathrm{M}[W(t)]=0$.",
  },
  {
    id: "fc_sp_8", topic: "sp",
    front: "Спектральная плотность телеграфного сигнала",
    back: "При $R_X(\\tau)=e^{-2\\lambda|\\tau|}$:\n\n$S(\\omega)=\\dfrac{4\\lambda}{4\\lambda^2+\\omega^2}$\n\nЛоренцевская форма — широкополосный спектр при малых $\\lambda$.",
    figure: "sp_corr_telegraph",
  },
]

export const formulas = [
  {
    id: "fm_sp_1", topic: "sp",
    name: "КФ процесса Винера",
    latex: "R_W(t,s)=\\mathrm{M}[W(t)\\,W(s)]=\\min(t,s)",
    note: "Определяющее свойство стандартного процесса Винера.",
  },
  {
    id: "fm_sp_2", topic: "sp",
    name: "КФ броуновского моста",
    latex: "R_X(t,s)=\\min(t,s)-ts,\\quad t,s\\in[0,1]",
    note: "$X(t)=W(t)-tW(1)$; мост обращается в нуль на обоих концах.",
  },
  {
    id: "fm_sp_3", topic: "sp",
    name: "КФ телеграфного сигнала",
    latex: "R_X(t,s)=e^{-2\\lambda|t-s|}",
    note: "Стационарный процесс; $\\lambda$ — интенсивность пуассоновских скачков.",
  },
  {
    id: "fm_sp_4", topic: "sp",
    name: "Квадратическая вариация Винера",
    latex: "\\sum_{i=1}^{n}\\bigl(W(t_i)-W(t_{i-1})\\bigr)^2\\xrightarrow{L^2}b-a",
    note: "При $\\|\\Delta\\|\\to 0$; формально $[W,W]_t=t$.",
  },
  {
    id: "fm_sp_5", topic: "sp",
    name: "Матожидание геометрического броуновского движения",
    latex: "\\mathrm{M}\\bigl[S_0 e^{\\sigma W(t)+\\mu t}\\bigr]=S_0\\,e^{\\mu t+\\sigma^2 t/2}",
    note: "Момент логнормального распределения.",
  },
  {
    id: "fm_sp_6", topic: "sp",
    name: "КФ ГБД (геометрического броуновского движения)",
    latex: "R_X(t,s)=S_0^2\\,e^{\\mu(t+s)+\\frac{\\sigma^2(t+s)}{2}}\\!\\left(e^{\\sigma^2\\min(t,s)}-1\\right)",
    note: "Нестационарный процесс; КФ зависит от $t$ и $s$ по отдельности.",
  },
  {
    id: "fm_sp_7", topic: "sp",
    name: "Нормальное приращение Винера",
    latex: "W(t)-W(s)\\sim\\mathcal{N}(0,\\,t-s),\\quad 0\\leq s<t",
    note: "Третья аксиома стандартного Винера.",
  },
  {
    id: "fm_sp_8", topic: "sp",
    name: "Спектральная плотность телеграфного сигнала",
    latex: "S(\\omega)=\\frac{4\\lambda}{4\\lambda^2+\\omega^2}",
    note: "Преобразование Фурье от $e^{-2\\lambda|\\tau|}$.",
  },
]
