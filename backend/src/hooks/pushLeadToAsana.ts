import type { CollectionAfterChangeHook } from 'payload'

import { labelFor } from '../lib/leadOptions'

/**
 * Creates an Asana task for each new lead, so leads land in the Asana mobile
 * app with a push notification instead of waiting in the admin.
 *
 * Needs ASANA_TOKEN (a free Personal Access Token) and ASANA_PROJECT_GID.
 * ASANA_SECTION_GID is optional: set it to drop tasks straight into a "New"
 * column. Without the env vars the hook does nothing.
 *
 * Asana is private to Cris, so the task carries the contact details — unlike
 * the ntfy/Discord ping, which goes over a public channel.
 *
 * Failures are logged and swallowed: the lead is already saved in Payload,
 * and Asana being down must never turn a submission into an error.
 */

const TIMEOUT_MS = 5000
const API = 'https://app.asana.com/api/1.0/tasks'

const adminBase = () =>
  (process.env.LEAD_ADMIN_BASE_URL || 'https://crislucero.surgestudio.tech').replace(/\/+$/, '')

const clean = (value: unknown, max = 200) =>
  String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

/** YYYY-MM-DD, `days` from now, in UTC. Good enough for a 48-hour deadline. */
const dueOn = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10)

type LeadDoc = Record<string, unknown> & { id: string }

export const buildAsanaTask = (lead: LeadDoc) => {
  const business = clean(lead.businessName) || 'Unnamed business'
  const type = labelFor('businessType', clean(lead.businessType))
  const pains = Array.isArray(lead.painPoints)
    ? lead.painPoints.map((p) => labelFor('painPoints', clean(p))).join(', ')
    : '—'

  const lines = [
    `Business: ${business} (${type}${lead.businessTypeOther ? `: ${clean(lead.businessTypeOther)}` : ''})`,
    `Link: ${clean(lead.link) || '—'}`,
    '',
    `Contact: ${clean(lead.contactName) || '—'}`,
    `Reach them on: ${clean(lead.contactHandle) || '—'} (prefers ${labelFor('preferredContact', clean(lead.preferredContact))})`,
    `Email: ${clean(lead.email) || '—'}`,
    '',
    `Problems: ${pains}${lead.painOther ? ` — ${clean(lead.painOther)}` : ''}`,
    `Inquiries/week: ${labelFor('inquiryVolume', clean(lead.inquiryVolume))}`,
    `Team size: ${labelFor('teamSize', clean(lead.teamSize))}`,
    `Budget: ${labelFor('budget', clean(lead.budget))}`,
    `Timeline: ${labelFor('timeline', clean(lead.timeline))}`,
    '',
    `Came from: ${clean(lead.utmSource) || 'direct'}${lead.utmCampaign ? ` / ${clean(lead.utmCampaign)}` : ''}`,
    `Full record: ${adminBase()}/admin/collections/leads/${encodeURIComponent(lead.id)}`,
    '',
    'Next: send the audit (3 fixes) within 48 hours, then offer a call.',
  ]

  const data: Record<string, unknown> = {
    name: `${business} — ${type}`,
    notes: lines.join('\n'),
    due_on: dueOn(2),
  }

  const project = process.env.ASANA_PROJECT_GID?.trim()
  const section = process.env.ASANA_SECTION_GID?.trim()
  // A section membership implies the project, but Asana wants both.
  if (project && section) data.memberships = [{ project, section }]
  if (project) data.projects = [project]

  return data
}

export const pushLeadToAsana: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const token = process.env.ASANA_TOKEN?.trim()
  const project = process.env.ASANA_PROJECT_GID?.trim()
  if (!token || !project) return doc

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ data: buildAsanaTask(doc as LeadDoc) }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      // Asana echoes the request back in errors; log the status only.
      req.payload.logger.warn(`[leads] Asana task failed with HTTP ${res.status}`)
    }
  } catch (error) {
    req.payload.logger.warn(
      `[leads] Asana task failed: ${error instanceof Error ? error.name : 'unknown error'}`,
    )
  }
  return doc
}
