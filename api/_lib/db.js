import { neon } from '@neondatabase/serverless'

let _sql
function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL)
  return _sql
}

// Tagged template + .query() proxy — initializes lazily on first use.
export const sql = new Proxy(function sql(...args) { return getSql()(...args) }, {
  get(_, prop) {
    const target = getSql()
    const v = target[prop]
    return typeof v === 'function' ? v.bind(target) : v
  },
})
