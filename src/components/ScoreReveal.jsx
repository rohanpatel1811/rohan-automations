import { useEffect, useState } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'

// ── Score color by value ─────────────────────────────────────────────────────
function scoreColor(n) {
  if (n >= 90) return '#00C28A'
  if (n >= 50) return '#E8A045'
  return '#FF4D6A'
}

// ── Animated ring + counting number ─────────────────────────────────────────
function ScoreRing({ score, label, delay = 0 }) {
  const [display, setDisplay] = useState(0)
  const radius = 32
  const stroke = 2.5
  const circ = 2 * Math.PI * radius
  const color = scoreColor(score)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplay(score)
      return
    }
    const ctrl = animate(0, score, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      delay,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return ctrl.stop
  }, [score, delay])

  const dashOffset = circ - (score / 100) * circ

  return (
    <motion.div
      className="score-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="score-ring-wrap">
        {/* SVG ring */}
        <svg
          className="score-ring-svg"
          viewBox="0 0 80 80"
          width="80"
          height="80"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke="var(--border-bright)"
            strokeWidth={stroke}
          />
          {/* Score arc */}
          <motion.circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
          />
        </svg>
        {/* Number */}
        <span className="score-number" style={{ color }}>
          {display}
        </span>
      </div>
      <span className="score-label">{label}</span>
    </motion.div>
  )
}

// ── Top issues list ───────────────────────────────────────────────────────────
function IssuesList({ issues }) {
  if (!issues || issues.length === 0) return null
  return (
    <motion.div
      className="issues-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.2 }}
    >
      <p className="issues-heading">// top issues</p>
      {issues.map((issue, i) => (
        <motion.div
          key={i}
          className="issue-row"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 1.3 + i * 0.1 }}
        >
          <span className="issue-icon" aria-hidden="true">⚠</span>
          <div className="issue-body">
            <span className="issue-title">{issue.title}</span>
            {issue.displayValue && (
              <span className="issue-value">{issue.displayValue}</span>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ScoreReveal({ scores, issues }) {
  return (
    <div className="score-reveal">
      <div
        className="score-grid"
        role="region"
        aria-label="Site audit scores"
      >
        <ScoreRing score={scores.performance}   label="performance"   delay={0}   />
        <ScoreRing score={scores.seo}           label="seo"           delay={0.10} />
        <ScoreRing score={scores.accessibility} label="accessibility" delay={0.20} />
        <ScoreRing score={scores.bestPractices} label="best practices" delay={0.30} />
      </div>
      <IssuesList issues={issues} />
    </div>
  )
}
