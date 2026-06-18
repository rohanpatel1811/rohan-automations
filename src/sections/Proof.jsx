import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Proof() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('[data-reveal]', {
        y: 22, opacity: 0, duration: 0.75, stagger: 0.09,
        ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 78%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section section--alt" ref={ref} id="proof" aria-labelledby="proof-heading">
      <div className="section-inner">
        <div className="section-marker" data-reveal>// 002 — proof</div>
        <h2 className="section-headline" id="proof-heading" data-reveal>
          i'm early. that's why<br />
          this offer's this good.
        </h2>
        <p className="section-body" data-reveal>
          no portfolio of client sites yet. no logos. just the site you're looking
          at right now — which is the proof. if i can build this, i can build yours.
          and because i'm early, i'm hungry to prove it.
        </p>
        <p className="section-body" data-reveal>
          the audit tool above isn't decoration. it calls the google pagespeed api
          live against your actual url and returns real scores. no smoke, no canned
          results. that's what i build: things that work.
        </p>
        {/* v2: client before/afters, IG build timelapses */}
      </div>
    </section>
  )
}
