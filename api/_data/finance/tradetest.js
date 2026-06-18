/* tradetest.js — declarative synthetic-chart questions. The screen builds candles
   via anchorsToCloses + genCandles and maps reveal annotations. Plain JS -> window.
   chart: { seriesType, anchors, n, vol, seed, volume, indicator,
            lines:[{from:[frac,val],to:[frac,val],color,dashed}],
            markers:[{frac,position,color,shape,text}],
            priceLines:[{price,color,dashed,title}] }   ← lines/markers/priceLines are REVEAL-only */
export const TRADETEST = [
  {
    id: "tt1", tag: "Паттерн",
    q: "Какой графический паттерн формируется на этом свечном графике?",
    chart: {
      seriesType: "candle", n: 64, vol: 1.1, seed: 5, volume: true,
      anchors: [[0,90],[.12,108],[.2,98],[.32,122],[.42,99],[.55,110],[.66,98],[.78,88],[1,78]],
      priceLines: [{ price: 98, color: "#787b86", dashed: true, title: "линия шеи" }],
      markers: [
        { frac: .12, position: "aboveBar", color: "#9aa", shape: "circle", text: "ЛП" },
        { frac: .32, position: "aboveBar", color: "#3b76ff", shape: "circle", text: "голова" },
        { frac: .55, position: "aboveBar", color: "#9aa", shape: "circle", text: "ПП" },
        { frac: .70, position: "belowBar", color: "#f0616d", shape: "arrowDown", text: "пробой" },
      ],
    },
    options: ["Голова и плечи", "Двойная вершина", "Восходящий треугольник", "Бычий флаг"],
    correct: [0],
    explain: "«Голова и плечи» — разворот после роста: левое плечо, более высокая голова, правое плечо ниже. Сигнал на продажу — после пробоя линии шеи вниз с ростом объёма.",
  },
  {
    id: "tt2", tag: "Паттерн",
    q: "Что это за разворотная фигура?",
    chart: {
      seriesType: "candle", n: 60, vol: 1.1, seed: 8, volume: true,
      anchors: [[0,88],[.15,118],[.3,101],[.45,119],[.6,99],[.74,93],[1,80]],
      priceLines: [{ price: 100, color: "#f0616d", dashed: true, title: "уровень" }],
      markers: [{ frac: .66, position: "belowBar", color: "#f0616d", shape: "arrowDown", text: "пробой" }],
    },
    options: ["Двойная вершина", "Двойное дно", "Голова и плечи", "Симметричный треугольник"],
    correct: [0],
    explain: "Двойная вершина: цена дважды не может пройти уровень сопротивления. Сигнал появляется только после пробоя минимума между вершинами.",
  },
  {
    id: "tt3", tag: "Паттерн",
    q: "Какая фигура изображена и куда вероятен выход?",
    chart: {
      seriesType: "candle", n: 60, vol: 1.0, seed: 33, volume: true,
      anchors: [[0,80],[.14,118],[.28,92],[.4,112],[.52,98],[.62,108],[.72,103],[.82,118],[1,136]],
      lines: [
        { from: [0,120], to: [.72,107], color: "#787b86", dashed: true },
        { from: [0,78],  to: [.72,100], color: "#787b86", dashed: true },
      ],
      markers: [{ frac: .8, position: "belowBar", color: "#2ebd9c", shape: "arrowUp", text: "пробой" }],
    },
    options: ["Симметричный треугольник", "Голова и плечи", "Двойная вершина", "Нисходящий канал"],
    correct: [0],
    explain: "Симметричный треугольник — консолидация с сужением колебаний. Направление подтверждается пробоем границы, а не самим видом фигуры. Цель = высота основания.",
  },
  {
    id: "tt4", tag: "Паттерн",
    q: "Какой паттерн формируется у основания?",
    chart: {
      seriesType: "candle", n: 60, vol: 1.0, seed: 14, volume: true,
      anchors: [[0,120],[.15,92],[.28,109],[.43,90],[.58,110],[.72,116],[1,130]],
      priceLines: [{ price: 109, color: "#2ebd9c", dashed: true, title: "уровень" }],
      markers: [{ frac: .66, position: "aboveBar", color: "#2ebd9c", shape: "arrowUp", text: "пробой" }],
    },
    options: ["Двойное дно", "Двойная вершина", "Голова и плечи", "Восходящий клин"],
    correct: [0],
    explain: "Двойное дно — зеркало двойной вершины: цена дважды отскакивает от поддержки. Сигнал на покупку — после пробоя локального максимума между двумя минимумами.",
  },
  {
    id: "tt5", tag: "Тренд",
    q: "Какой тип тренда преобладает на графике?",
    chart: {
      seriesType: "area", n: 70, vol: 1.0, seed: 41,
      anchors: [[0,60],[.3,80],[.5,73],[.75,102],[1,124]],
      lines: [{ from: [0,58], to: [1,118], color: "#2ebd9c", dashed: true }],
    },
    options: ["Восходящий", "Нисходящий", "Боковой (флэт)", "Разворотный"],
    correct: [0],
    explain: "Восходящий тренд — последовательно растущие минимумы и максимумы. Линию тренда строят по возрастающим минимумам как динамическую поддержку.",
  },
  {
    id: "tt6", tag: "Тренд",
    q: "Определите характер тренда.",
    chart: {
      seriesType: "area", n: 70, vol: 1.0, seed: 52,
      anchors: [[0,130],[.25,112],[.45,120],[.7,92],[1,68]],
      lines: [{ from: [0,134], to: [1,76], color: "#f0616d", dashed: true }],
    },
    options: ["Восходящий", "Нисходящий", "Боковой (флэт)", "Расширяющийся"],
    correct: [1],
    explain: "Нисходящий тренд — снижающиеся максимумы и минимумы. Линия тренда строится по убывающим максимумам и работает как динамическое сопротивление.",
  },
  {
    id: "tt7", tag: "Тренд",
    q: "Что описывает поведение цены на графике?",
    chart: {
      seriesType: "candle", n: 64, vol: 1.0, seed: 61, volume: true,
      anchors: [[0,100],[.12,114],[.24,98],[.38,113],[.5,99],[.64,114],[.78,99],[1,112]],
      priceLines: [
        { price: 114, color: "#f0616d", dashed: true, title: "сопротивление" },
        { price: 98, color: "#2ebd9c", dashed: true, title: "поддержка" },
      ],
    },
    options: ["Восходящий тренд", "Нисходящий тренд", "Боковой диапазон (флэт)", "Голова и плечи"],
    correct: [2],
    explain: "Боковой тренд (флэт): цена колеблется в горизонтальном диапазоне между поддержкой и сопротивлением. Осцилляторы (RSI) в такой фазе работают лучше трендовых индикаторов.",
  },
  {
    id: "tt8", tag: "Тип графика",
    q: "Какой тип отображения данных используется на графике?",
    chart: {
      seriesType: "candle", n: 40, vol: 1.2, seed: 71,
      anchors: [[0,80],[.4,108],[.6,96],[1,124]],
    },
    options: ["Свечной (candlestick)", "Линейный", "Горный (area)", "Бары (OHLC)"],
    correct: [0],
    explain: "Японские свечи: тело показывает диапазон open–close, тени — максимум и минимум периода. Самый информативный тип для технического анализа.",
  },
  {
    id: "tt9", tag: "Тип графика",
    q: "Какой это тип графика?",
    chart: {
      seriesType: "line", n: 60, vol: .8, seed: 73,
      anchors: [[0,80],[.3,100],[.5,92],[.75,112],[1,128]],
    },
    options: ["Свечной (candlestick)", "Линейный", "Бары (OHLC)", "Точечный"],
    correct: [1],
    explain: "Линейный график соединяет только цены закрытия. Он скрывает внутридневной размах, зато наглядно показывает общий тренд.",
  },
  {
    id: "tt10", tag: "Тип графика",
    q: "Какой формат отображения котировок изображён?",
    chart: {
      seriesType: "bars", n: 44, vol: 1.2, seed: 77,
      anchors: [[0,90],[.35,116],[.6,100],[1,126]],
    },
    options: ["Свечной (candlestick)", "Линейный", "Горный (area)", "Бары (OHLC)"],
    correct: [3],
    explain: "Бары (OHLC): вертикальная черта — диапазон high–low, левая засечка — open, правая — close. Альтернатива свечам без закраски тела.",
  },
  {
    id: "tt11", tag: "Индикатор",
    q: "Какой индикатор показан в нижней панели?",
    chart: {
      seriesType: "candle", n: 80, vol: 1.2, seed: 27, indicator: "rsi",
      anchors: [[0,80],[.2,128],[.34,112],[.5,70],[.66,96],[.82,132],[1,120]],
    },
    options: ["RSI", "MACD", "Объём", "Скользящая средняя"],
    correct: [0],
    explain: "RSI — осциллятор 0–100 с зонами перекупленности (>70) и перепроданности (<30). Колеблется в фиксированном диапазоне, в отличие от MACD.",
  },
  {
    id: "tt12", tag: "Индикатор",
    q: "Какой индикатор изображён под графиком цены?",
    chart: {
      seriesType: "candle", n: 80, vol: 1.3, seed: 51, indicator: "macd",
      anchors: [[0,90],[.2,110],[.35,96],[.5,124],[.66,104],[.82,130],[1,112]],
    },
    options: ["RSI", "MACD", "Stochastic", "ADX"],
    correct: [1],
    explain: "MACD — разность EMA(12) и EMA(26) с сигнальной линией EMA(9) и гистограммой. В отличие от RSI не ограничен диапазоном 0–100 и центрируется вокруг нуля.",
  },
];
