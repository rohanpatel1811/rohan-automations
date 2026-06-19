// Lightweight audit logger — accepts POST from the browser after PSI runs client-side.
// Only job: forward scores + geo to the Google Sheets webhook.
// Well within Vercel Hobby 10s limit (Sheets webhook takes <2s).

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'method not allowed.' })
  }

  const { url, performance, seo, accessibility, bestPractices } = req.body || {}

  const webhookUrl = process.env.SHEETS_WEBHOOK_URL
  if (webhookUrl && url) {
    try {
      await Promise.race([
        fetch(webhookUrl, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            performance,
            seo,
            accessibility,
            bestPractices,
            country: req.headers['x-vercel-ip-country']        || '',
            city:    req.headers['x-vercel-ip-city']           || '',
            region:  req.headers['x-vercel-ip-country-region'] || '',
          }),
        }),
        new Promise(resolve => setTimeout(resolve, 4_000)), // 4s cap
      ])
    } catch { /* never block the response */ }
  }

  return res.status(200).json({ ok: true })
}
