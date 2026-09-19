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
  // TODO(Cris): your Messenger link, e.g. 'https://m.me/<page-or-username>'.
  messengerUrl: '',
  // TODO(Cris): your booking page, e.g. a Google Calendar appointment schedule link.
  bookingUrl: '',
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
  /** What happens on click, for the line under the button. */
  hint: string
  external: boolean
}

const clean = (value: string) => value.trim()

/**
 * The main call to action, by priority: booking page, then Messenger, then
 * email. Null when none are set, and every CTA hides itself.
 */
export const primaryCta = (): Cta | null => {
  const bookingUrl = clean(site.bookingUrl)
  const messengerUrl = clean(site.messengerUrl)
  const email = clean(site.email)

  if (bookingUrl) {
    return { href: bookingUrl, label: 'Book a free call', hint: 'Pick a time that suits you', external: true }
  }
  if (messengerUrl) {
    return { href: messengerUrl, label: 'Book a free call', hint: 'Message me on Messenger', external: true }
  }
  if (email) {
    return { href: `mailto:${email}`, label: 'Book a free call', hint: `Email ${email}`, external: false }
  }
  return null
}

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
