import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Upsell() {
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
    <section className="section" ref={ref} id="next" aria-labelledby="next-heading">
      <div className="section-inner">
        <div className="section-marker" data-reveal>// 005 — what runs next</div>
        <h2 className="section-headline" id="next-heading" data-reveal>
          once your site's live,<br />
          the rest can run itself.
        </h2>
        <p className="section-body" data-reveal>
          the same system that built your site can handle what comes after —
          follow-up sequences, no-show chasing, lead qualifying, intake forms
          that actually route correctly. that part is optional.
        </p>
        <p className="section-body section-body--dim" data-reveal>
          the site isn't. start with the audit above. that's the door.
        </p>
      </div>
    </section>
  )
}
