import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Judgment() {
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
    <section className="section section--alt" ref={ref} id="judgment" aria-labelledby="judgment-heading">
      <div className="section-inner">
        <div className="section-marker" data-reveal>// 004 — judgment</div>
        <h2 className="section-headline" id="judgment-heading" data-reveal>
          ai does the work.<br />
          you approve everything.
        </h2>
        <p className="section-body" data-reveal>
          every page is built with ai — copy, layout, code. that's how i build
          fast and keep costs low. but every decision that touches your brand
          or your clients goes through you first. nothing ships without your
          explicit sign-off.
        </p>
        <p className="section-body" data-reveal>
          that's not a workflow detail. that's the actual product. you get the
          speed of ai with a human checkpoint before anything reaches a real client.
        </p>
      </div>
    </section>
  )
}
