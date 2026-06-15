export function rel(ts) {
  const d = (Date.now() - ts) / 86400000;
  if (d < 1) return "сегодня"; if (d < 2) return "вчера"; return Math.floor(d) + " дн. назад";
}
export const pct1 = (v) => (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
export const money = (v) => '$' + (Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'K' : v.toFixed(0))
