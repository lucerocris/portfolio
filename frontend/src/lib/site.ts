/**
 * Everything about how to reach Cris, in one place.
 *
 * Filling in the empty values below is all it takes to switch on the
 * matching buttons and links across the site: the nav and hero CTA, the
 * "Work with me" blocks, and the footer. Empty values render nothing.
 */

export type SocialIcon = 'github' | 'linkedin' | 'instagram' | 'facebook'

export type Social = {
  label: string
  href: string
  icon: SocialIcon
}

const socials: Social[] = [
  { label: 'GitHub', href: 'https://github.com/lucerocris', icon: 'github' },
  // TODO(Cris): the CV README says there is no LinkedIn yet. Check this
  // profile still exists, or delete this line.
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/cris-lawrence-lucero-29639433b/', icon: 'linkedin' },
  { label: 'Instagram', href: 'https://www.instagram.com/crislucero22/', icon: 'instagram' },
  { label: 'Facebook', href: 'https://www.facebook.com/crislawrence.lucero', icon: 'facebook' },
]

export const site = {
  name: 'Cris Lucero',
  role: 'Web & App Developer',
  location: 'Cebu, Philippines',

  // TODO(Cris): the address you want enquiries sent to (shown as a mailto link).
  email: '',
  messengerUrl: 'https://m.me/crislawrence.lucero',
  // Google Calendar appointment schedule: "Free 15-minute call", 15 min,
  // Tue/Thu evenings, Fri, Sat and Sun mornings (PHT), with a Meet link.
  bookingUrl:
    'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ07vE32Epec-9JtbaTNq5kkCZW0z5Gaz6uNE487R2Nv-kWEswgkzt9cmuvsJbp0IsDLls-RyHBN',
  // TODO(Cris): starting price in pesos, digits and commas only, e.g. '15,000'.
  // Shows "Projects start at ₱15,000" under the hero CTA.
  startingPrice: '',

  cvPath: '/Lucero_cris.pdf',
  replyTime: 'within 24 hours',

  socials,
}

export type Cta = {
  href: string
  label: string
  external: boolean
}

const clean = (value: string) => value.trim()

/**
 * The main call to action: the free audit funnel at /start, which ends with
 * the booking link. It lives on this site, so it always shows.
 */
export const primaryCta = (): Cta => ({ href: '/start', label: 'Get a free audit', external: false })

export type ContactMethod = {
  kind: 'booking' | 'messenger' | 'email' | 'cv'
  label: string
  href: string
  external: boolean
  download?: boolean
}

/** Every contact route that is set, in priority order. */
export const contactMethods = (): ContactMethod[] => {
  const methods: ContactMethod[] = []
  const bookingUrl = clean(site.bookingUrl)
  const messengerUrl = clean(site.messengerUrl)
  const email = clean(site.email)

  if (bookingUrl) methods.push({ kind: 'booking', label: 'Book a free call', href: bookingUrl, external: true })
  if (messengerUrl) methods.push({ kind: 'messenger', label: 'Messenger', href: messengerUrl, external: true })
  if (email) methods.push({ kind: 'email', label: email, href: `mailto:${email}`, external: false })
  return methods
}

/** "Projects start at ₱15,000", or null when no price is set. */
export const startingPriceText = () => {
  const price = clean(site.startingPrice).replace(/^₱/, '')
  return price ? `Projects start at ₱${price}` : null
}
