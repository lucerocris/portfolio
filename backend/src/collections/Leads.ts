import { createHash, timingSafeEqual } from 'crypto'
import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
  FieldAccess,
  PayloadRequest,
} from 'payload'

import { notifyNewLead } from '../hooks/notifyNewLead'
import { pushLeadToAsana } from '../hooks/pushLeadToAsana'
import { LEAD_OPTIONS } from '../lib/leadOptions'

/**
 * Leads from the /start funnel ("Free Direct Bookings & Inquiry Audit"),
 * doubling as Cris's mini CRM.
 *
 * Who can do what:
 * - Read / update / delete: logged-in admins only.
 * - Create: admins, or the Astro server presenting the shared
 *   PAYLOAD_LEADS_API_KEY in the `x-leads-key` header. That key can do
 *   nothing except create a lead, and only the questionnaire fields it sends
 *   are kept (see `keepPublicFields`). The CRM fields always start fresh.
 *
 * Why not a Payload user API key: those belong to a user, and every user here
 * is a full admin, so a leaked key would unlock the whole CMS. This key only
 * unlocks "add one lead".
 */

/** Fields the public funnel may set. Everything else is admin-only. */
const PUBLIC_FIELDS = [
  'businessType',
  'businessTypeOther',
  'businessName',
  'link',
  'painPoints',
  'painOther',
  'inquiryVolume',
  'teamSize',
  'budget',
  'timeline',
  'contactName',
  'contactHandle',
  'email',
  'preferredContact',
  'consent',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'referrer',
  'landingPage',
] as const

const isAdmin = ({ req }: { req: PayloadRequest }) => Boolean(req.user)
const adminOnly: Access = isAdmin
const adminOnlyField: FieldAccess = isAdmin

const sha256 = (value: string) => createHash('sha256').update(value).digest()

/** Constant-time check of the `x-leads-key` header. Fails closed when unset. */
const hasLeadsKey = (req: PayloadRequest): boolean => {
  const expected = process.env.PAYLOAD_LEADS_API_KEY ?? ''
  // A short or missing key would be guessable; refuse rather than accept.
  if (expected.length < 32) return false
  const given = req.headers?.get('x-leads-key') ?? ''
  if (!given) return false
  return timingSafeEqual(sha256(given), sha256(expected))
}

const canCreate: Access = ({ req }) => isAdmin({ req }) || hasLeadsKey(req)

// Keep submissions small. Mirrors the caps in frontend/src/lib/leads.ts.
const MAX = {
  short: 80,
  name: 120,
  handle: 120,
  email: 254,
  link: 300,
  other: 200,
  utm: 100,
  url: 500,
} as const

// Strip control characters (keeping newlines out of single-line fields).
const clean = (value: unknown, max: number): string | undefined => {
  if (typeof value !== 'string') return undefined
  // eslint-disable-next-line no-control-regex
  const out = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
  return out ? out.slice(0, max) : undefined
}

/**
 * For anyone who isn't an admin (i.e. the funnel), rebuild `data` from an
 * allowlist so a crafted request can't set status, notes, follow-ups, etc.
 */
const keepPublicFields: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (operation !== 'create' || req.user || !data) return data

  const picked: Record<string, unknown> = {}
  for (const key of PUBLIC_FIELDS) {
    if (data[key] !== undefined) picked[key] = data[key]
  }

  const caps: Partial<Record<(typeof PUBLIC_FIELDS)[number], number>> = {
    businessTypeOther: MAX.short,
    businessName: MAX.name,
    link: MAX.link,
    painOther: MAX.other,
    contactName: MAX.short,
    contactHandle: MAX.handle,
    email: MAX.email,
    utmSource: MAX.utm,
    utmMedium: MAX.utm,
    utmCampaign: MAX.utm,
    referrer: MAX.url,
    landingPage: MAX.url,
  }
  for (const [key, max] of Object.entries(caps)) {
    picked[key] = clean(picked[key], max as number)
  }

  if (Array.isArray(picked.painPoints)) {
    picked.painPoints = [...new Set(picked.painPoints.filter((v) => typeof v === 'string'))].slice(0, 6)
  } else {
    delete picked.painPoints
  }

  // Consent must be explicit.
  picked.consent = picked.consent === true
  return picked
}

/** Server-set values: consent timestamp and the first follow-up date. */
const stampNewLead: CollectionBeforeChangeHook = ({ data, operation, originalDoc }) => {
  if (operation === 'create') {
    const now = new Date()
    if (data.consent) data.consentAt = now.toISOString()
    // The audit is promised within 48 hours, so that's the first deadline.
    if (!data.nextFollowUp) {
      data.nextFollowUp = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()
    }
    data.status ??= 'new'
    data.followups ??= 0
  }

  // A closed lead needs no reminder.
  if (
    operation === 'update' &&
    data.status !== originalDoc?.status &&
    (data.status === 'won' || data.status === 'lost')
  ) {
    data.nextFollowUp = null
  }
  return data
}

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'businessName',
    defaultColumns: ['businessName', 'businessType', 'budget', 'status', 'createdAt'],
    listSearchableFields: ['businessName', 'contactName', 'contactHandle', 'email'],
    group: 'Sales',
    description:
      'Audit requests from /start. Send the audit, then move the status along and log each follow-up. Sort by "Next follow-up" to see who is due.',
    pagination: { defaultLimit: 50 },
  },
  access: {
    create: canCreate,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    beforeValidate: [keepPublicFields],
    beforeChange: [stampNewLead],
    afterChange: [notifyNewLead, pushLeadToAsana],
  },
  timestamps: true,
  fields: [
    // --- Sidebar: the CRM controls Cris touches every day ---
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [...LEAD_OPTIONS.status],
      access: { create: adminOnlyField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'nextFollowUp',
      label: 'Next follow-up',
      type: 'date',
      access: { create: adminOnlyField },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', timeIntervals: 30 },
        description: 'Starts at the 48-hour audit deadline. Cleared when a lead is won or lost.',
      },
    },
    {
      name: 'followups',
      label: 'Follow-ups sent',
      type: 'number',
      defaultValue: 0,
      min: 0,
      access: { create: adminOnlyField },
      admin: {
        position: 'sidebar',
        step: 1,
        description: 'Aim for 7 before giving up on a stage.',
      },
    },
    {
      name: 'consent',
      label: 'Agreed to the privacy notice (RA 10173)',
      type: 'checkbox',
      required: true,
      validate: (value: boolean | null | undefined) =>
        value === true || 'Consent is required to store this lead.',
      // Consent is a record of what the person agreed to, not something to edit.
      access: { update: () => false },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'consentAt',
      label: 'Consent given at',
      type: 'date',
      access: { create: adminOnlyField, update: () => false },
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },

    // --- Main column ---
    {
      type: 'row',
      fields: [
        {
          name: 'businessName',
          label: 'Business',
          type: 'text',
          required: true,
          maxLength: MAX.name,
          admin: { width: '50%' },
        },
        {
          name: 'link',
          label: 'Facebook page / website',
          type: 'text',
          maxLength: MAX.link,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'contactName',
          label: 'Contact name',
          type: 'text',
          required: true,
          maxLength: MAX.short,
          admin: { width: '25%' },
        },
        {
          name: 'contactHandle',
          label: 'Mobile / Messenger',
          type: 'text',
          required: true,
          maxLength: MAX.handle,
          admin: { width: '25%' },
        },
        {
          // Length is capped in keepPublicFields; email fields take no maxLength.
          name: 'email',
          type: 'email',
          admin: { width: '25%' },
        },
        {
          name: 'preferredContact',
          label: 'Prefers',
          type: 'select',
          required: true,
          options: [...LEAD_OPTIONS.preferredContact],
          admin: { width: '25%' },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      access: { create: adminOnlyField },
      admin: {
        rows: 6,
        description: 'Call notes, audit findings, what they said, what to send next.',
      },
    },
    {
      type: 'collapsible',
      label: 'Quiz answers',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'businessType',
              label: 'Type',
              type: 'select',
              required: true,
              options: [...LEAD_OPTIONS.businessType],
              admin: { width: '50%' },
            },
            {
              name: 'businessTypeOther',
              label: 'Other type',
              type: 'text',
              maxLength: MAX.short,
              admin: {
                width: '50%',
                condition: (data) => data?.businessType === 'other',
              },
            },
          ],
        },
        {
          name: 'painPoints',
          label: 'Headaches',
          type: 'select',
          hasMany: true,
          required: true,
          options: [...LEAD_OPTIONS.painPoints],
        },
        {
          name: 'painOther',
          label: 'Other headache',
          type: 'text',
          maxLength: MAX.other,
          admin: {
            condition: (data) => Array.isArray(data?.painPoints) && data.painPoints.includes('other'),
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'inquiryVolume',
              label: 'Inquiries',
              type: 'select',
              required: true,
              options: [...LEAD_OPTIONS.inquiryVolume],
              admin: { width: '25%' },
            },
            {
              name: 'teamSize',
              label: 'Team',
              type: 'select',
              required: true,
              options: [...LEAD_OPTIONS.teamSize],
              admin: { width: '25%' },
            },
            {
              name: 'budget',
              type: 'select',
              required: true,
              options: [...LEAD_OPTIONS.budget],
              admin: { width: '25%' },
            },
            {
              name: 'timeline',
              type: 'select',
              required: true,
              options: [...LEAD_OPTIONS.timeline],
              admin: { width: '25%' },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Source',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'utmSource', label: 'utm_source', type: 'text', maxLength: MAX.utm, admin: { width: '33%' } },
            { name: 'utmMedium', label: 'utm_medium', type: 'text', maxLength: MAX.utm, admin: { width: '33%' } },
            { name: 'utmCampaign', label: 'utm_campaign', type: 'text', maxLength: MAX.utm, admin: { width: '33%' } },
          ],
        },
        { name: 'referrer', type: 'text', maxLength: MAX.url },
        { name: 'landingPage', label: 'Landing page', type: 'text', maxLength: MAX.url },
      ],
    },
  ],
}
