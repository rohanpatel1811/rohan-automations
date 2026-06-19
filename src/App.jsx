import Hero from './sections/Hero'
import Offer from './sections/Offer'
import Proof from './sections/Proof'
import HowItWorks from './sections/HowItWorks'
import Judgment from './sections/Judgment'
import Upsell from './sections/Upsell'

export default function App() {
  return (
    <>
      <main>
        <Hero />
        <Offer />
        <Proof />
        <HowItWorks />
        <Judgment />
        <Upsell />
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        borderTop: '1px solid #1e1e2e',
        fontSize: '0.75rem',
        fontFamily: "'JetBrains Mono', monospace",
        color: '#3a3a5a',
        letterSpacing: '0.04em',
      }}>
        © {new Date().getFullYear()} rohan.automations &nbsp;·&nbsp;{' '}
        <a href="/privacy.html" style={{ color: '#5b5b7a', textDecoration: 'none' }}
           onMouseOver={e => e.target.style.color='#00e5a0'}
           onMouseOut={e  => e.target.style.color='#5b5b7a'}>
          privacy policy
        </a>
        &nbsp;·&nbsp;
        <a href="mailto:rohanpatel0088@gmail.com" style={{ color: '#5b5b7a', textDecoration: 'none' }}
           onMouseOver={e => e.target.style.color='#00e5a0'}
           onMouseOut={e  => e.target.style.color='#5b5b7a'}>
          contact
        </a>
      </footer>
    </>
  )
}
