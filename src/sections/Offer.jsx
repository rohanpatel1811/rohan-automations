import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Offer() {
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
    <section className="section" ref={ref} id="offer" aria-labelledby="offer-heading">
      <div className="section-inner">
        <div className="section-marker" data-reveal>// 001 — offer</div>
        <h2 className="section-headline" id="offer-heading" data-reveal>
          i'll rebuild your worst page.<br />
          free. yours to keep.
        </h2>
        <p className="section-body" data-reveal>
          whatever your site scored up there — i'll take your worst-performing
          page, rebuild it clean, and send it to you. no invoice. no pitch.
          yours whether we ever speak again.
        </p>
        <p className="section-body section-body--dim" data-reveal>
          if you like what you see and want the full site rebuilt, we can talk.
          if not, you still got a better page.
        </p>
      </div>
    </section>
  )
}
