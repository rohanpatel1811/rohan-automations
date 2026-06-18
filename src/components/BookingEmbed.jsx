import { useEffect } from 'react'
import Cal, { getCalApi } from '@calcom/embed-react'

/**
 * Cal.com inline booking embed.
 * Dark theme, brand color matched to accent, no navbar chrome.
 * Slides in below the score reveal after user clicks "book a call."
 */
export default function BookingEmbed() {
  useEffect(() => {
    ;(async () => {
      try {
        const cal = await getCalApi({ namespace: '15min' })
        cal('ui', {
          theme: 'dark',
          cssVarsPerTheme: {
            dark: { 'cal-brand': '#00C28A' },
          },
          hideEventTypeDetails: false,
          layout: 'month_view',
        })
      } catch (e) {
        // Non-fatal — embed still loads visually via the Cal component
        console.warn('Cal.com ui config failed:', e)
      }
    })()
  }, [])

  return (
    <div className="booking-wrap">
      <p className="booking-label">// book a 15-min call</p>
      <Cal
        namespace="15min"
        calLink="rohan-automations/15min"
        style={{ width: '100%', minHeight: '560px', overflow: 'scroll' }}
        config={{ layout: 'month_view' }}
      />
    </div>
  )
}
