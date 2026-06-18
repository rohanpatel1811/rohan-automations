import WebGLBackground from '../components/WebGLBackground'
import AuditTerminal from '../components/AuditTerminal'

export default function Hero() {
  return (
    <section className="hero" id="hero" aria-label="Site audit">
      {/* Ambient WebGL — subordinate, never competes with the terminal */}
      <WebGLBackground />

      <div className="hero-content">
        {/* Wordmark */}
        <div className="hero-wordmark" aria-label="rohan.automations">
          rohan.automations
        </div>

        {/* Headline — the terminal IS the hero, copy sets up the action */}
        <div className="hero-headline">
          <span className="hero-line">paste your site.</span>
          <span className="hero-line hero-line--dim">
            see what's costing you bookings.
          </span>
        </div>

        {/* The audit tool — conversion engine + proof of competence */}
        <AuditTerminal />

        {/* Tagline — appears once, quietly, below the action */}
        <p className="hero-tagline" aria-label="Tagline">
          automate the work. keep the judgment.
        </p>
      </div>
    </section>
  )
}
