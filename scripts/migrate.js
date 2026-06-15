import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)
const ddl = readFileSync(new URL('../api/_lib/schema.sql', import.meta.url), 'utf8')

const statements = ddl.split(';').map((s) => s.trim()).filter(Boolean)
for (const stmt of statements) {
  // neon() http-функция выполняет произвольный SQL-текст при вызове со строкой.
  await sql(stmt)
}
console.log(`migrated: ${statements.length} statements`)
