/**
 * Everything about how to reach Cris, in one place.
 *
 * Filling in the empty values below is all it takes to switch on the
 * matching links across the site. Empty values render nothing.
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

  // The address on the résumé; shown as a mailto link.
  email: 'lucerocris22@gmail.com',
  messengerUrl: 'https://m.me/crislawrence.lucero',

  cvPath: '/Lucero_cris.pdf',
  replyTime: 'within 24 hours',

  socials,
}

const clean = (value: string) => value.trim()

export type ContactMethod = {
  kind: 'messenger' | 'email' | 'cv'
  label: string
  href: string
  external: boolean
  download?: boolean
}

/** Every contact route that is set, in priority order. */
export const contactMethods = (): ContactMethod[] => {
  const methods: ContactMethod[] = []
  const messengerUrl = clean(site.messengerUrl)
  const email = clean(site.email)

  if (messengerUrl) methods.push({ kind: 'messenger', label: 'Messenger', href: messengerUrl, external: true })
  if (email) methods.push({ kind: 'email', label: email, href: `mailto:${email}`, external: false })
  return methods
}

