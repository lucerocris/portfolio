import type { CollectionAfterChangeHook } from 'payload'

import { labelFor } from '../lib/leadOptions'

/**
 * Pings Cris's phone when a lead comes in, if LEAD_NOTIFY_URL is set.
 *
 * Supports an ntfy topic URL (https://ntfy.sh/<topic>, or a self-hosted ntfy)
 * and a Discord webhook URL, told apart by host. Neither channel is private,
 * so the message carries only the business name, type and budget plus a link
 * to the admin. Contact details stay in the CMS.
 *
 * Failures are logged and swallowed: the lead is already saved, and a flaky
 * notification service must never turn a submission into an error.
 */

const DISCORD_HOSTS = new Set([
  'discord.com',
  'discordapp.com',
  'ptb.discord.com',
  'canary.discord.com',
])

const TIMEOUT_MS = 3000

// Where the admin link points. Defaults to the live site.
const adminBase = () =>
  (process.env.LEAD_ADMIN_BASE_URL || 'https://crislucero.surgestudio.tech').replace(/\/+$/, '')

/** One line, no markup, no mentions, bounded length. */
const oneLine = (value: unknown, max = 80) =>
  String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

// The name sits mid-line, so only inline markdown needs escaping.
const escapeDiscord = (value: string) => value.replace(/([\\*_~`|[\]<>])/g, '\\$1')

type Target = { kind: 'discord' | 'ntfy'; url: URL }

export const parseNotifyUrl = (raw: string | undefined): Target | null => {
  if (!raw) return null
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return null

  if (DISCORD_HOSTS.has(url.hostname)) {
    // Any other Discord URL is a copy-paste mistake, not an ntfy server.
    return url.pathname.startsWith('/api/webhooks/') ? { kind: 'discord', url } : null
  }
  return { kind: 'ntfy', url }
}

export const buildNotification = (
  target: Target,
  lead: { id: string; businessName?: unknown; businessType?: unknown; budget?: unknown },
): { headers: Record<string, string>; body: string } => {
  const business = oneLine(lead.businessName) || 'Unnamed business'
  const type = labelFor('businessType', oneLine(lead.businessType))
  const budget = labelFor('budget', oneLine(lead.budget))
  const adminUrl = `${adminBase()}/admin/collections/leads/${encodeURIComponent(lead.id)}`

  if (target.kind === 'discord') {
    return {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `New lead: **${escapeDiscord(business)}** (${type}, ${budget})\n${adminUrl}`,
        // Never let a business name ping anyone.
        allowed_mentions: { parse: [] },
      }),
    }
  }

  return {
    // ntfy reads these headers. Header values must stay ASCII, so the
    // business name (and the peso sign) only go in the body.
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      Title: 'New lead',
      Tags: 'inbox_tray',
      Priority: 'high',
      Click: adminUrl,
    },
    body: `New lead: ${business} (${type}, ${budget})\n${adminUrl}`,
  }
}

export const notifyNewLead: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const target = parseNotifyUrl(process.env.LEAD_NOTIFY_URL)
  if (!target) return doc

  try {
    const { headers, body } = buildNotification(target, doc)
    const res = await fetch(target.url, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      req.payload.logger.warn(`[leads] notification failed with HTTP ${res.status}`)
    }
  } catch (error) {
    req.payload.logger.warn(
      `[leads] notification failed: ${error instanceof Error ? error.name : 'unknown error'}`,
    )
  }
  return doc
}
