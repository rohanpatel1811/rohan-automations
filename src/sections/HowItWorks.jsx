import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    n: '01',
    title: 'you paste your url',
    body: 'the tool runs a real google audit. scores load in 15–30 seconds. no email gate, no signup.',
  },
  {
    n: '02',
    title: 'i send a rebuilt mockup',
    body: 'within 48 hours, you get a rebuilt version of your worst-scoring page. built, not mocked up in figma.',
  },
  {
    n: '03',
    title: 'you approve what ships',
    body: 'nothing goes live without your explicit sign-off. you see every change before it touches your site.',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      // Section header
      gsap.from('[data-reveal]', {
        y: 22, opacity: 0, duration: 0.75, stagger: 0.09,
        ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 78%' },
      })
      // Step cards stagger in
      gsap.from('.step-card', {
        y: 28, opacity: 0, duration: 0.6, stagger: 0.14,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.steps-grid', start: 'top 80%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section" ref={ref} id="how" aria-labelledby="how-heading">
      <div className="section-inner" style={{ maxWidth: '900px' }}>
        <div className="section-marker" data-reveal>// 003 — process</div>
        <h2 className="section-headline" id="how-heading" data-reveal>
          how it works
        </h2>
        <div className="steps-grid" role="list">
          {STEPS.map((s) => (
            <div key={s.n} className="step-card" role="listitem">
              <span className="step-n" aria-hidden="true">{s.n}</span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
