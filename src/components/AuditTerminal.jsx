import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScoreReveal from './ScoreReveal'
import BookingEmbed from './BookingEmbed'

/**
 * Streaming lines shown while the PSI request is in flight.
 * One line per ~1100ms. The last line fires when both streaming
 * completes AND the fetch has resolved.
 */
const buildStreamLines = (domain) => [
  `> fetching ${domain}...`,
  `> connecting to pagespeed insights...`,
  `> measuring largest contentful paint...`,
  `> auditing seo metadata...`,
  `> checking accessibility tree...`,
  `> analyzing best practices...`,
  `> computing scores...`,
]

// ── PSI constants ─────────────────────────────────────────────────────────────
const PSI_BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const SKIP_TYPES = new Set([
  'debugdata', 'screenshot', 'filmstrip', 'treemap-data',
  'criticalrequestchain', 'table',
])

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeUrl(raw) {
  const s = raw.trim()
  if (!s.startsWith('http://') && !s.startsWith('https://')) return 'https://' + s
  return s
}

function getDomain(url) {
  try { return new URL(url).hostname } catch { return url }
}

/** Call PSI directly from the browser — no server timeout. */
async function runPSI(url) {
  const psiUrl =
    PSI_BASE +
    `?url=${encodeURIComponent(url)}` +
    '&strategy=mobile' +
    '&category=performance' +
    '&category=seo' +
    '&category=accessibility' +
    '&category=best-practices'

  const res  = await fetch(psiUrl)
  const body = await res.json()

  if (!res.ok) {
    const msg = (body?.error?.message || `pagespeed returned ${res.status}`).toLowerCase()
    throw Object.assign(new Error(msg), { psiError: true })
  }

  const lhr = body.lighthouseResult
  if (!lhr) {
    throw Object.assign(
      new Error('pagespeed ran but returned no lighthouse data. the site may have blocked the crawl.'),
      { psiError: true }
    )
  }

  // Scores 0–100
  const cats = lhr.categories || {}
  const scores = {
    performance:   Math.round((cats.performance?.score       ?? 0) * 100),
    seo:           Math.round((cats.seo?.score               ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score     ?? 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
  }

  // Top 3 failing audits with human-readable values
  const issues = Object.values(lhr.audits || {})
    .filter(a => {
      if (a.score === null || a.score === 1 || a.score >= 0.9) return false
      if (!a.displayValue) return false
      if (SKIP_TYPES.has(a.details?.type)) return false
      return true
    })
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 3)
    .map(a => ({ title: a.title ?? '', displayValue: a.displayValue ?? '' }))

  return { scores, issues }
}

/** Fire-and-forget — log scores to Sheets via /api/log (never blocks the UI). */
function logToSheets(url, scores) {
  fetch('/api/log', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ url, ...scores }),
  }).catch(() => {})
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AuditTerminal() {
  const [urlInput, setUrlInput]       = useState('')
  const [status, setStatus]           = useState('idle') // idle | loading | done | error
  const [lines, setLines]             = useState([])
  const [result, setResult]           = useState(null)
  const [errorLine, setErrorLine]     = useState('')
  const [showBooking, setShowBooking] = useState(false)

  // Refs for the streaming race condition
  const resolvedData   = useRef(null)
  const lineIndexRef   = useRef(0)
  const streamLines    = useRef([])
  const intervalRef    = useRef(null)
  const terminalEl     = useRef(null)
  const inputEl        = useRef(null)

  // Auto-scroll terminal to bottom as new lines appear
  useEffect(() => {
    if (terminalEl.current) {
      terminalEl.current.scrollTop = terminalEl.current.scrollHeight
    }
  }, [lines])

  // ── Reset ──────────────────────────────────────────────────────────────────
  function reset() {
    clearInterval(intervalRef.current)
    setStatus('idle')
    setLines([])
    setResult(null)
    setErrorLine('')
    setShowBooking(false)
    resolvedData.current = null
    lineIndexRef.current = 0
    streamLines.current  = []
    setTimeout(() => inputEl.current?.focus(), 60)
  }

  // ── Finish (after both stream complete + data ready) ───────────────────────
  function finish(data) {
    setLines(prev => [...prev, '> done.'])
    setTimeout(() => {
      setResult(data)
      setStatus('done')
    }, 650)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    if (e) e.preventDefault()
    const raw = urlInput.trim()
    if (!raw || status === 'loading') return

    const full   = normalizeUrl(raw)
    const domain = getDomain(full)

    // Client-side URL shape validation
    try { new URL(full) } catch {
      setStatus('error')
      setErrorLine(`> "${raw}" doesn't look like a valid url. try yoursite.com`)
      return
    }

    // Reset state for new run
    clearInterval(intervalRef.current)
    setStatus('loading')
    setLines([])
    setResult(null)
    setErrorLine('')
    setShowBooking(false)
    resolvedData.current = null
    lineIndexRef.current = 0
    streamLines.current  = buildStreamLines(domain)

    // Stream lines while PSI is running (browser fetch — no 10s cap)
    intervalRef.current = setInterval(() => {
      const i   = lineIndexRef.current
      const all = streamLines.current

      if (i < all.length) {
        setLines(prev => [...prev, all[i]])
        lineIndexRef.current++
      } else {
        // All lines shown — if data already resolved, finish now
        clearInterval(intervalRef.current)
        if (resolvedData.current) finish(resolvedData.current)
        // else: PSI resolve handler calls finish()
      }
    }, 1100)

    // Call PSI directly from the browser — Vercel timeout doesn't apply
    try {
      const data = await runPSI(full)

      // Log to Sheets in the background (never blocks UI)
      logToSheets(full, data.scores)

      // Race resolution: check if stream has finished already
      resolvedData.current = data
      if (lineIndexRef.current >= streamLines.current.length) {
        clearInterval(intervalRef.current)
        finish(data)
      }
      // else: interval fires finish() when the last line completes
    } catch (err) {
      clearInterval(intervalRef.current)
      setStatus('error')
      setErrorLine(
        err.psiError
          ? `> ${err.message}`
          : '> network error reaching pagespeed insights. check your connection and retry.'
      )
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const isRunning    = status === 'loading'
  const showTerminal = status === 'loading' || status === 'done' || status === 'error'

  return (
    <div className="audit-terminal">
      {/* URL Input */}
      <form onSubmit={handleSubmit} aria-label="Site audit">
        <div className="audit-input-group">
          <span className="audit-prompt" aria-hidden="true">$</span>
          <input
            ref={inputEl}
            type="text"
            className="audit-input"
            placeholder="yourcoachingsite.com"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={isRunning}
            aria-label="Enter your website URL"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <button
            type="submit"
            className="audit-btn"
            disabled={isRunning || !urlInput.trim()}
            aria-label={isRunning ? 'Audit running' : 'Run site audit'}
          >
            {isRunning
              ? <><span className="audit-btn-dot" aria-hidden="true" />running</>
              : 'run audit'
            }
          </button>
        </div>
      </form>

      {/* Terminal output */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            ref={terminalEl}
            className="terminal-output"
            initial={{ opacity: 0, scaleY: 0.92, originY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            role="log"
            aria-live="polite"
            aria-label="Audit progress"
          >
            {lines.map((line, i) => (
              <motion.span
                key={`line-${i}`}
                className={`terminal-line${line === '> done.' ? ' terminal-line--done' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
              >
                {line}
              </motion.span>
            ))}

            {/* Blinking cursor while loading */}
            {isRunning && (
              <span className="terminal-cursor" aria-hidden="true">▊</span>
            )}

            {/* Error line with retry */}
            {status === 'error' && (
              <motion.span
                className="terminal-line terminal-line--error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {errorLine}
                <button className="terminal-retry" onClick={reset}>
                  retry
                </button>
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score reveal + booking */}
      <AnimatePresence>
        {status === 'done' && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ScoreReveal scores={result.scores} issues={result.issues} />

            {/* CTA appears at peak intent — after scores load */}
            {!showBooking && (
              <motion.div
                className="audit-cta"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.8 }}
              >
                <span className="audit-cta-label">want the free rebuild?</span>
                <button
                  className="cta-btn"
                  onClick={() => setShowBooking(true)}
                >
                  book a 15-min call →
                </button>
              </motion.div>
            )}

            {/* Inline booking slides in */}
            <AnimatePresence>
              {showBooking && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <BookingEmbed />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
