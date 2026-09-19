import type { APIRoute } from 'astro'

import { CMS_URL } from '../../lib/cms'
import { validateLead } from '../../lib/leads'

/**
 * POST /start/submit: receives the /start quiz.
 *
 * Lives outside /api/ because vercel.json sends /api/* to the Payload backend.
 *
 * - The quiz's JS sends `Accept: application/json` and gets JSON back.
 * - The no-JS form gets a 303 redirect: to /start/thanks on success, or back
 *   to /start with an error code.
 *
 * Leads are created in Payload server-to-server with PAYLOAD_LEADS_API_KEY,
 * a key that can only create leads (see backend/src/collections/Leads.ts).
 * Astro's built-in origin check already rejects cross-site form posts.
 */

export const prerender = false

const MAX_BODY_BYTES = 16 * 1024
// Nobody reads eight questions in under three seconds.
const MIN_FILL_MS = 3000
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 }

// Best-effort, per serverless instance. It stops a burst from one client,
// not a determined attacker; Payload's key check is the real gate.
const hits = new Map<string, number[]>()
const rateLimited = (ip: string) => {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > RATE_LIMIT.max
}

const UTM_FIELDS = [
  ['utmSource', 'utm_source'],
  ['utmMedium', 'utm_medium'],
  ['utmCampaign', 'utm_campaign'],
] as const

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })

const redirect = (location: string) =>
  new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store' } })

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json')

  let form: FormData | null = null

  const fail = (status: number, code: string, message: string, errors?: Record<string, string | undefined>) => {
    if (wantsJson) return json(status, { ok: false, code, message, errors })
    // Back to the form, keeping the UTM tags so a retry is still attributed.
    const query = new URLSearchParams({ error: code })
    for (const [field, param] of UTM_FIELDS) {
      const value = form?.get(field)
      if (typeof value === 'string' && value) query.set(param, value.slice(0, 100))
    }
    return redirect(`/start?${query}#form`)
  }

  // Pretend it worked, so bots learn nothing.
  const fakeSuccess = () => (wantsJson ? json(200, { ok: true }) : redirect('/start/thanks'))

  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > MAX_BODY_BYTES) {
    return fail(413, 'too-large', 'That submission is too large.')
  }

  try {
    form = await request.formData()
  } catch {
    return fail(400, 'bad-request', 'Something went wrong sending the form. Please try again.')
  }

  // Honeypot: a field people never see. Anything in it means a bot.
  const trap = form.get('website')
  if (typeof trap === 'string' && trap.trim() !== '') return fakeSuccess()

  const renderedAt = Number(form.get('ts'))
  if (Number.isFinite(renderedAt) && renderedAt > 0 && Date.now() - renderedAt < MIN_FILL_MS) {
    return fakeSuccess()
  }

  let ip = ''
  try {
    ip = clientAddress
  } catch {
    // Not available in every runtime.
  }
  ip ||= request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) {
    return fail(429, 'rate-limited', 'Too many submissions. Please wait a few minutes and try again.')
  }

  const result = validateLead(form)
  if (!result.ok) {
    return fail(422, 'invalid', 'A few answers need another look.', result.errors)
  }

  const apiKey = process.env.PAYLOAD_LEADS_API_KEY
  if (!apiKey) {
    console.error('[start] PAYLOAD_LEADS_API_KEY is not set; cannot save leads.')
    return fail(503, 'unavailable', 'The form is not accepting submissions right now.')
  }

  try {
    const res = await fetch(`${CMS_URL}/api/leads?depth=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-leads-key': apiKey,
      },
      body: JSON.stringify(result.data),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      // Log the status and Payload's field names only; never the answers.
      let detail = ''
      try {
        const body = (await res.json()) as { errors?: { data?: { errors?: { path?: string }[] } }[] }
        detail = (body.errors ?? [])
          .flatMap((e) => e.data?.errors ?? [])
          .map((e) => e.path)
          .filter(Boolean)
          .join(', ')
      } catch {
        // Not JSON; the status is enough.
      }
      console.error(`[start] Payload rejected the lead: HTTP ${res.status}${detail ? ` (${detail})` : ''}`)
      return fail(502, 'save-failed', 'Your answers could not be saved.')
    }
  } catch (error) {
    console.error('[start] Could not reach Payload:', error instanceof Error ? error.name : error)
    return fail(502, 'save-failed', 'Your answers could not be saved.')
  }

  const firstName = result.data.contactName.split(' ')[0]
  return wantsJson ? json(200, { ok: true, firstName }) : redirect('/start/thanks')
}

// Anything but POST: send people to the quiz.
export const GET: APIRoute = () => redirect('/start')
