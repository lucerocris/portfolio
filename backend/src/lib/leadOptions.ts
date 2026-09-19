/**
 * Answer options for the /start funnel, as stored on a lead. The frontend
 * keeps its own copy with friendlier wording (frontend/src/lib/leads.ts);
 * the `value`s must stay in sync.
 */
export const LEAD_OPTIONS = {
  businessType: [
    { label: 'Resort', value: 'resort' },
    { label: 'Boutique hotel', value: 'hotel' },
    { label: 'Event venue / events business', value: 'events' },
    { label: 'Other business', value: 'other' },
  ],
  painPoints: [
    { label: 'Inquiries pile up in Messenger', value: 'messenger' },
    { label: 'No website / outdated website', value: 'website' },
    { label: 'Paying OTA commissions', value: 'ota' },
    { label: 'Bookings & deposits tracked by hand', value: 'manual' },
    { label: 'Wants online payments / deposits', value: 'payments' },
    { label: 'Other', value: 'other' },
  ],
  inquiryVolume: [
    { label: 'Under 10 / week', value: 'lt10' },
    { label: '10–30 / week', value: '10-30' },
    { label: '30–100 / week', value: '30-100' },
    { label: '100+ / week', value: '100plus' },
  ],
  teamSize: [
    { label: 'Just me', value: 'solo' },
    { label: '2–5', value: '2-5' },
    { label: '6–20', value: '6-20' },
    { label: '20+', value: '20plus' },
  ],
  budget: [
    { label: 'Not sure yet', value: 'unsure' },
    { label: 'Under ₱50k', value: 'lt50k' },
    { label: '₱50–100k', value: '50-100k' },
    { label: '₱100–200k', value: '100-200k' },
    { label: '₱200k+', value: '200kplus' },
  ],
  timeline: [
    { label: 'ASAP', value: 'asap' },
    { label: '1–3 months', value: '1-3m' },
    { label: 'Just exploring', value: 'exploring' },
  ],
  preferredContact: [
    { label: 'Messenger', value: 'messenger' },
    { label: 'Call / text', value: 'call-text' },
    { label: 'Viber', value: 'viber' },
    { label: 'WhatsApp', value: 'whatsapp' },
    { label: 'Email', value: 'email' },
  ],
  status: [
    { label: 'New', value: 'new' },
    { label: 'Audit sent', value: 'audit-sent' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Call booked', value: 'call-booked' },
    { label: 'Proposal', value: 'proposal' },
    { label: 'Won', value: 'won' },
    { label: 'Lost', value: 'lost' },
  ],
} as const

export const labelFor = (
  key: keyof typeof LEAD_OPTIONS,
  value: string | null | undefined,
): string => LEAD_OPTIONS[key].find((o) => o.value === value)?.label ?? value ?? '—'
