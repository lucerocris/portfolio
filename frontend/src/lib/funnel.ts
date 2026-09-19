/**
 * Settings for the /start funnel (the free Direct Bookings & Inquiry Audit).
 *
 * Buttons on the thank-you screen only render when their value is set, so an
 * empty string simply hides that option.
 */
export const funnel = {
  // TODO(Cris): your booking page for the free 15-minute call, e.g. a Google
  // Calendar appointment schedule link (calendar.app.google/...).
  bookingUrl: '',
  // TODO(Cris): your Messenger link, e.g. 'https://m.me/<page-or-username>'.
  messengerUrl: '',
  // TODO(Cris): the address you want audit replies to come from / go to.
  email: '',
  // Shown as "I reply {replyTime}." Matches the promise in the site audit.
  replyTime: 'within 24 hours',
  // How long the audit takes. Also used in the page copy and the admin.
  auditTurnaround: '48 hours',
}

const clean = (value: string) => value.trim()

export const bookingUrl = () => clean(funnel.bookingUrl) || null
export const messengerUrl = () => clean(funnel.messengerUrl) || null
export const contactEmail = () => clean(funnel.email) || null
