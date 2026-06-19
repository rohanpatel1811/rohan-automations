/ Vercel serverless function — Node.js 20 (native fetch, no deps)
// Called by the frontend: GET /api/audit?url=https://example.com

export default async function handler(req, res) {
      // CORS — allow the same-origin Vercel deployment plus local dev
  res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
      if (req.method !== 'GET') {
              return res.status(405).json({ error: true, message: 'method not allowed.' })
      }

  // ── Validate input URL ───────────────────────────────────────────────────
  const rawUrl = (req.query.url || '').trim()

  if (!rawUrl) {
          return res.status(400).json({
                    error: true,
                    message: 'no url provided. pass ?url= in the request.',
          })
  }

  let parsed
      try {
              parsed = new URL(rawUrl)
              if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol')
      } catch {
              return res.status(400).json({
                        error: true,
                        message: `"${rawUrl}" doesn't look like a valid url. try https://yoursite.com`,
              })
      }

  // ── Build PSI request ────────────────────────────────────────────────────
  const apiKey = process.env.PSI_API_KEY
      const psiUrl =
              'https://www.googleapis.com/pagespeedonline/v5/runPagespeed' +
              `?url=${encodeURIComponent(rawUrl)}` +
              '&strategy=mobile' +
              '&category=performance' +
              '&category=seo' +
              '&category=accessibility' +
              '&category=best-practices' +
              (apiKey ? `&key=${apiKey}` : '')

  // ── Fetch from PSI ────────────────────────────────────────────────────────
  let psiRes
      try {
              const controller = new AbortController()
              // maxDuration is 60s; abort PSI at 52s to leave time for Sheets logging + response
        const timeout = setTimeout(() => controller.abort(), 52_000)
              psiRes = await fetch(psiUrl, { signal: controller.signal })
              clearTimeout(timeout)
      } catch (err) {
              if (err.name === 'AbortError') {
                        return res.status(504).json({
                                    error: true,
                                    message: 'audit timed out. some sites are too slow or block crawlers. try again.',
                        })
              }
              return res.status(502).json({
                        error: true,
                        message: "couldn't reach pagespeed insights. check your connection and retry.",
              })
      }

  // ── Parse PSI body ────────────────────────────────────────────────────────
  let body
      try {
              body = await psiRes.json()
      } catch {
              return res.status(500).json({
                        error: true,
                        message: 'pagespeed returned an unparseable response.',
              })
      }

  if (!psiRes.ok) {
          const msg = (body?.error?.message || `pagespeed returned ${psiRes.status}`).toLowerCase()
          return res.status(psiRes.status >= 400 && psiRes.status < 600 ? psiRes.status : 500).json({
                    error: true,
                    message: msg,
          })
  }

  // ── Extract Lighthouse results ─────────────────────────────────────────
  const lhr = body.lighthouseResult
      if (!lhr) {
              return res.status(500).json({
                        error: true,
                        message: 'pagespeed ran but returned no lighthouse data. the site may have blocked the crawl.',
              })
      }

  // ── Scores (0–100) ─────────────────────────────────────────────────────
  const cats = lhr.categories || {}
        const scores = {
                performance:   Math.round((cats.performance?.score       ?? 0) * 100),
                seo:           Math.round((cats.seo?.score               ?? 0) * 100),
                accessibility: Math.round((cats.accessibility?.score     ?? 0) * 100),
                bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
        }

  // ── Top 3 failing audits ──────────────────────────────────────────────
  const SKIP_TYPES = new Set([
          'debugdata', 'screenshot', 'filmstrip', 'treemap-data',
          'criticalrequestchain', 'table',
        ])

  const allAudits = Object.values(lhr.audits || {})
      const issues = allAudits
        .filter(a => {
                  if (a.score === null || a.score === 1 || a.score >= 0.9) return false
                  if (!a.displayValue) return false
                  if (SKIP_TYPES.has(a.details?.type)) return false
                  return true
        })
        .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
        .slice(0, 3)
        .map(a => ({
                  title: a.title ?? '',
                  displayValue: a.displayValue ?? '',
        }))

  // ── Log to Google Sheets ──────────────────────────────────────────────
  // Must be awaited — Vercel kills the process the moment we return,
  // so fire-and-forget never completes. Cap at 4s so it never delays the user.
  const webhookUrl = process.env.SHEETS_WEBHOOK_URL
      if (webhookUrl) {
              try {
                        await Promise.race([
                                    fetch(webhookUrl, {
                                                  method: 'POST',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({
                                                                  url:           rawUrl,
                                                                  performance:   scores.performance,
                                                                  seo:           scores.seo,
                                                                  accessibility: scores.accessibility,
                                                                  bestPractices: scores.bestPractices,
                                                                  country:       req.headers['x-vercel-ip-country']        || '',
                                                                  city:          req.headers['x-vercel-ip-city']           || '',
                                                                  region:        req.headers['x-vercel-ip-country-region'] || '',
                                                  }),
                                    }),
                                    new Promise(resolve => setTimeout(resolve, 4_000)),
                                  ])
              } catch { /* never block the audit response */ }
      }

  return res.status(200).json({ scores, issues })
}
