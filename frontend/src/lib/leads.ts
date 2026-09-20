import type { Lead } from '@backend'

/**
 * Questions for the /start funnel and the server-side checks for its answers.
 *
 * The `value`s are what gets stored in Payload and must match the select
 * options in backend/src/lib/leadOptions.ts. The `satisfies` checks below
 * flag a mismatch in the editor (and in `astro check`).
 */

type Option<V extends string> = { value: V; label: string; hint?: string }

export const businessTypes = [
  { value: 'retail', label: 'Shop or retail', hint: 'A physical store, an online shop, or both' },
  { value: 'food', label: 'Restaurant, café or food business' },
  { value: 'hospitality', label: 'Resort, hotel or events' },
  { value: 'health', label: 'Clinic, health or wellness' },
  { value: 'services', label: 'Services business', hint: 'Salon, repairs, cleaning, agency, school…' },
  { value: 'other', label: 'Something else', hint: 'Tell me what you do' },
] as const satisfies readonly Option<Lead['businessType']>[]

export const painPoints = [
  { value: 'manual', label: 'Too much manual work', hint: 'Paper, spreadsheets, copying things by hand' },
  { value: 'inquiries', label: 'Messages and inquiries slip through the cracks' },
  { value: 'website', label: 'No website, or an outdated one' },
  { value: 'tracking', label: 'Hard to keep track of sales, stock or customers' },
  { value: 'online', label: 'I want customers to order, book or pay online' },
  { value: 'other', label: 'Something else' },
] as const satisfies readonly Option<Lead['painPoints'][number]>[]

export const inquiryVolumes = [
  { value: 'lt10', label: 'Fewer than 10' },
  { value: '10-30', label: '10 to 30' },
  { value: '30-100', label: '30 to 100' },
  { value: '100plus', label: 'More than 100' },
] as const satisfies readonly Option<Lead['inquiryVolume']>[]

export const teamSizes = [
  { value: 'solo', label: 'Just me' },
  { value: '2-5', label: '2 to 5 people' },
  { value: '6-20', label: '6 to 20 people' },
  { value: '20plus', label: 'More than 20' },
] as const satisfies readonly Option<Lead['teamSize']>[]

export const budgets = [
  { value: 'unsure', label: 'Not sure yet' },
  { value: 'lt50k', label: 'Under ₱50,000' },
  { value: '50-100k', label: '₱50,000 to ₱100,000' },
  { value: '100-200k', label: '₱100,000 to ₱200,000' },
  { value: '200kplus', label: '₱200,000 or more' },
] as const satisfies readonly Option<Lead['budget']>[]

export const timelines = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-3m', label: 'In the next 1 to 3 months' },
  { value: 'exploring', label: 'Just exploring for now' },
] as const satisfies readonly Option<Lead['timeline']>[]

export const contactMethods = [
  { value: 'messenger', label: 'Messenger' },
  { value: 'call-text', label: 'Call or text' },
  { value: 'viber', label: 'Viber' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
] as const satisfies readonly Option<Lead['preferredContact']>[]

/** Length caps. Payload enforces the same ones. */
export const MAX = {
  short: 80,
  name: 120,
  handle: 120,
  email: 254,
  link: 300,
  other: 200,
  utm: 100,
  url: 500,
} as const

/** Payload's `create` body: the questionnaire fields only. */
export type LeadInput = Pick<
  Lead,
  | 'businessType'
  | 'businessName'
  | 'painPoints'
  | 'inquiryVolume'
  | 'teamSize'
  | 'budget'
  | 'timeline'
  | 'contactName'
  | 'contactHandle'
  | 'preferredContact'
  | 'consent'
> &
  Partial<
    Pick<
      Lead,
      | 'businessTypeOther'
      | 'link'
      | 'painOther'
      | 'email'
      | 'utmSource'
      | 'utmMedium'
      | 'utmCampaign'
      | 'referrer'
      | 'landingPage'
    >
  >

export type FieldErrors = Partial<Record<string, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Collapse whitespace and control characters, trim, and cap. */
const text = (value: FormDataEntryValue | null, max: number): string => {
  if (typeof value !== 'string') return ''
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
}

const oneOf = <T extends readonly Option<string>[]>(
  options: T,
  value: FormDataEntryValue | null,
): T[number]['value'] | null => {
  const found = options.find((o) => o.value === value)
  return found ? found.value : null
}

/** Only keep http(s) URLs for the referrer; anything else is noise. */
const safeUrl = (value: FormDataEntryValue | null): string | undefined => {
  const raw = text(value, MAX.url)
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href.slice(0, MAX.url) : undefined
  } catch {
    return undefined
  }
}

const optional = (value: string) => value || undefined

export type ValidationResult =
  | { ok: true; data: LeadInput }
  | { ok: false; errors: FieldErrors }

/**
 * Checks a submission. Error messages are shown to the visitor as-is, keyed
 * by the form field name.
 */
export const validateLead = (form: FormData): ValidationResult => {
  const errors: FieldErrors = {}

  const businessType = oneOf(businessTypes, form.get('businessType'))
  if (!businessType) errors.businessType = 'Choose the kind of business you run.'
  const businessTypeOther = text(form.get('businessTypeOther'), MAX.short)
  if (businessType === 'other' && !businessTypeOther) {
    errors.businessTypeOther = 'Tell me what kind of business it is.'
  }

  const businessName = text(form.get('businessName'), MAX.name)
  if (businessName.length < 2) errors.businessName = 'Add your business name.'
  const link = text(form.get('link'), MAX.link)

  const pains = [
    ...new Set(
      form
        .getAll('painPoints')
        .map((v) => oneOf(painPoints, v))
        .filter((v): v is NonNullable<typeof v> => Boolean(v)),
    ),
  ]
  if (pains.length === 0) errors.painPoints = 'Pick at least one.'
  const painOther = text(form.get('painOther'), MAX.other)

  const inquiryVolume = oneOf(inquiryVolumes, form.get('inquiryVolume'))
  if (!inquiryVolume) errors.inquiryVolume = 'Pick the closest range.'
  const teamSize = oneOf(teamSizes, form.get('teamSize'))
  if (!teamSize) errors.teamSize = 'Pick your team size.'
  const budget = oneOf(budgets, form.get('budget'))
  if (!budget) errors.budget = 'Pick one. “Not sure yet” is fine.'
  const timeline = oneOf(timelines, form.get('timeline'))
  if (!timeline) errors.timeline = 'Pick one.'

  const contactName = text(form.get('contactName'), MAX.short)
  if (!contactName) errors.contactName = 'Add your name.'
  const contactHandle = text(form.get('contactHandle'), MAX.handle)
  if (contactHandle.length < 3) errors.contactHandle = 'Add a mobile number or your Messenger name.'
  const email = text(form.get('email'), MAX.email).toLowerCase()
  if (email && !EMAIL_RE.test(email)) errors.email = 'That email address doesn’t look right.'
  const preferredContact = oneOf(contactMethods, form.get('preferredContact'))
  if (!preferredContact) errors.preferredContact = 'Choose how I should reach you.'
  if (preferredContact === 'email' && !email) errors.email = 'Add your email, or pick another way to reach you.'

  if (form.get('consent') !== 'yes') {
    errors.consent = 'Please agree so I can store your answers and contact you.'
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    data: {
      businessType: businessType!,
      businessTypeOther: businessType === 'other' ? businessTypeOther : undefined,
      businessName,
      link: optional(link),
      painPoints: pains,
      painOther: pains.includes('other') ? optional(painOther) : undefined,
      inquiryVolume: inquiryVolume!,
      teamSize: teamSize!,
      budget: budget!,
      timeline: timeline!,
      contactName,
      contactHandle,
      email: optional(email),
      preferredContact: preferredContact!,
      consent: true,
      utmSource: optional(text(form.get('utmSource'), MAX.utm)),
      utmMedium: optional(text(form.get('utmMedium'), MAX.utm)),
      utmCampaign: optional(text(form.get('utmCampaign'), MAX.utm)),
      referrer: safeUrl(form.get('referrer')),
      landingPage: optional(text(form.get('landingPage'), MAX.url)),
    },
  }
}
