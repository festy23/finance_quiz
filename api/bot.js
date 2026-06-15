import { sql } from './_lib/db.js'
import { sendMessage } from './_lib/botapi.js'

const SITE = process.env.SITE_URL || 'https://financequiz-gamma.vercel.app'

// Webhook бота. Telegram шлёт сюда апдейты. Секретный заголовок подтверждает,
// что запрос действительно от Telegram (задаётся в setWebhook secret_token).
export default async function handler(req, res) {
  if (req.headers['x-telegram-bot-api-secret-token'] !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(401).end()
  }
  const update = req.body || {}
  const msg = update.message
  if (msg && typeof msg.text === 'string') {
    const from = msg.from || {}
    const chatId = msg.chat.id
    const m = msg.text.match(/^\/start(?:\s+(\S+))?/)
    if (m) {
      const token = m[1]
      if (token) {
        // привязываем Telegram-аккаунт к login-токену
        const rows = await sql`
          update login_tokens
             set telegram_id = ${from.id},
                 username    = ${from.username || null},
                 first_name  = ${from.first_name || null},
                 last_name   = ${from.last_name || null},
                 status      = 'confirmed'
           where token = ${token} and status = 'pending'
           returning token`
        if (rows.length) {
          await sendMessage(chatId, '✅ <b>Готово!</b> Вернитесь на сайт — вход выполнен.')
        } else {
          await sendMessage(chatId, 'Эта ссылка для входа устарела. Откройте сайт и нажмите «Войти» ещё раз.')
        }
      } else {
        // голый /start без токена — просто приветствие с кнопкой на сайт
        await sendMessage(chatId, 'Привет! Это бот тренажёра «Кванта». Открой приложение кнопкой ниже.', {
          reply_markup: { inline_keyboard: [[{ text: 'Открыть Кванту', url: SITE }]] },
        })
      }
    }
  }
  res.status(200).json({ ok: true })
}
