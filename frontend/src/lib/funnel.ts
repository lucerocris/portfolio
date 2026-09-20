/**
 * Settings for the /start funnel (the free business audit).
 *
 * Contact values come from src/lib/site.ts so they're set in one place.
 *
 * Buttons on the thank-you screen only render when their value is set, so an
 * empty string simply hides that option.
 */
import { site } from './site'

export const funnel = {
  bookingUrl: site.bookingUrl,
  messengerUrl: site.messengerUrl,
  email: site.email,
  replyTime: site.replyTime,
  // How long the audit takes. Also used in the page copy and the admin.
  auditTurnaround: '48 hours',
}

const clean = (value: string) => value.trim()

export const bookingUrl = () => clean(funnel.bookingUrl) || null
export const messengerUrl = () => clean(funnel.messengerUrl) || null
export const contactEmail = () => clean(funnel.email) || null
