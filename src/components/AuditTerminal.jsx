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

// ── Helpers ──────────────────────────────────────────────────────────────────
function normalizeUrl(raw) {
  const s = raw.trim()
  if (!s.startsWith('http://') && !s.startsWith('https://')) return 'https://' + s
  return s
}

function getDomain(url) {
  try { return new URL(url).hostname } catch { return url }
}

// ── Component ────────────────────────────────────────────────────────────────
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

  // ── Reset ─────────────────────────────────────────────────────────────────
  function reset() {
    clearInterval(intervalRef.current)
    setStatus('idle')
    setLines([])
    setResult(null)
    setErrorLine('')
    setShowBooking(false)
    resolvedData.current  = null
    lineIndexRef.current  = 0
    streamLines.current   = []
    setTimeout(() => inputEl.current?.focus(), 60)
  }

  // ── Finish (after both stream complete + data ready) ──────────────────────
  function finish(data) {
    setLines(prev => [...prev, '> done.'])
    setTimeout(() => {
      setResult(data)
      setStatus('done')
    }, 650)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    if (e) e.preventDefault()
    const raw = urlInput.trim()
    if (!raw || status === 'loading') return

    const full   = normalizeUrl(raw)
    const domain = getDomain(full)

    // Validate URL shape client-side (real validation also in API)
    try { new URL(full) } catch {
      setStatus('error')
      setErrorLine(`> "${raw}" doesn't look like a valid url. try yoursite.com`)
      return
    }

    // ── Reset state for new run ─────────────────────────────────────────────
    clearInterval(intervalRef.current)
    setStatus('loading')
    setLines([])
    setResult(null)
    setErrorLine('')
    setShowBooking(false)
    resolvedData.current = null
    lineIndexRef.current = 0
    streamLines.current  = buildStreamLines(domain)

    // ── Stream lines while we wait for the real fetch ──────────────────────
    intervalRef.current = setInterval(() => {
      const i = lineIndexRef.current
      const all = streamLines.current

      if (i < all.length) {
        setLines(prev => [...prev, all[i]])
        lineIndexRef.current++
      } else {
        // All lines shown — if data already resolved, finish now
        clearInterval(intervalRef.current)
        if (resolvedData.current) {
          finish(resolvedData.current)
        }
        // else: fetch resolve handler will call finish()
      }
    }, 1100)

    // ── Real fetch ────────────────────────────────────────────────────────
    try {
      const res  = await fetch(`/api/audit?url=${encodeURIComponent(full)}`)
      const data = await res.json()

      if (data.error) {
        // API returned a clean error shape — show it in terminal voice
        clearInterval(intervalRef.current)
        setStatus('error')
        setErrorLine(`> ${data.message}`)
        return
      }

      // Data ready — check if streaming has finished
      resolvedData.current = data
      if (lineIndexRef.current >= streamLines.current.length) {
        // Stream already done; finish immediately
        clearInterval(intervalRef.current)
        finish(data)
      }
      // else: interval will call finish() when the last line fires
    } catch {
      clearInterval(intervalRef.current)
      setStatus('error')
      setErrorLine(`> network error reaching the audit server. check your connection and retry.`)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const isRunning = status === 'loading'
  const showTerminal = status === 'loading' || status === 'done' || status === 'error'

  return (
    <div className="audit-terminal">
      {/* ── URL Input ──────────────────────────────────────────────────────── */}
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

      {/* ── Terminal output ─────────────────────────────────────────────────── */}
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

      {/* ── Score reveal + booking ──────────────────────────────────────────── */}
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
