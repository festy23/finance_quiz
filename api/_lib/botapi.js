// Тонкая обёртка над Telegram Bot API (нужна только для ответов бота в чат).
const api = (method) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`

export async function sendMessage(chatId, text, extra = {}) {
  try {
    const r = await fetch(api('sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra }),
    })
    return await r.json()
  } catch {
    return null
  }
}
