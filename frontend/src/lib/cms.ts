import type { Media, Project } from '@backend'

/**
 * Base URL of the Payload backend. Set PUBLIC_CMS_URL in any deployed
 * environment — the localhost fallback only exists so `pnpm dev` works
 * with no .env present.
 */
export const CMS_URL = (
  import.meta.env.PUBLIC_CMS_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

/**
 * Edge cache for pages rendered from CMS data. The CDN serves a cached copy
 * for an hour, then keeps serving it for up to a day while it refetches in
 * the background, so CMS edits show up within the hour without a redeploy.
 * Only set this on successful responses, never on a 404 or an error.
 */
export const CMS_PAGE_CACHE_CONTROL =
  'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ProjectLink = NonNullable<Project['links']>[number]
export type ProjectLinkKind = ProjectLink['kind']
export type ProjectTestimonial = NonNullable<Project['testimonial']>

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Resolves a Payload media URL to something the browser can load.
 *
 * Payload returns a relative path (/api/media/file/x.webp) when it proxies
 * uploads, but an absolute CDN URL once DO_SPACES_CDN_URL is set. Prefixing
 * the absolute form with CMS_URL would break it, so only relative paths get
 * the prefix.
 */
export const mediaUrl = (url?: string | null) => {
  if (!url) return undefined
  return url.startsWith('http') ? url : `${CMS_URL}${url}`
}

type MediaLike = string | Media | null | undefined

/** depth=1 populates uploads as objects; anything still a string is unusable. */
export const asMedia = (value: MediaLike): Media | null =>
  value && typeof value !== 'string' ? value : null

type SizeCandidate = { url: string; width: number; height?: number | null }

/**
 * Every usable rendition of an upload, smallest first: the generated
 * `thumbnail` (400w) and `card` (900w) WebP variants plus the original.
 * Sizes with no file are skipped — media uploaded before the sizes existed
 * (e.g. bijouPic.webp) only has its original.
 */
const candidates = (media: Media): SizeCandidate[] => {
  const list: SizeCandidate[] = []

  for (const size of Object.values(media.sizes ?? {})) {
    if (size?.url && size.width) list.push({ url: size.url, width: size.width, height: size.height })
  }
  if (media.url && media.width) list.push({ url: media.url, width: media.width, height: media.height })

  // One entry per width; the generated size wins over an original of the same width.
  const byWidth = new Map<number, SizeCandidate>()
  for (const c of list) if (!byWidth.has(c.width)) byWidth.set(c.width, c)
  return [...byWidth.values()].sort((a, b) => a.width - b.width)
}

/**
 * Picks the smallest generated size that is still at least `minWidth` wide,
 * falling back to the original.
 */
export const sizedUrl = (media: Media | null, minWidth: number) => {
  if (!media) return undefined
  const match = candidates(media).find((c) => c.width >= minWidth)
  return mediaUrl(match?.url ?? media.url)
}

/**
 * `srcset` built from the available Payload sizes (400w, 900w, original).
 * Returns undefined when there is nothing to choose between, e.g. SVGs or
 * legacy uploads without generated sizes.
 */
export const srcsetFor = (media: Media | null) => {
  if (!media) return undefined
  const list = candidates(media)
  if (list.length < 2) return undefined
  return list.map((c) => `${mediaUrl(c.url)} ${c.width}w`).join(', ')
}

/**
 * Attributes for an <img> rendering a Payload upload: a sensible default
 * `src`, a `srcset` for the browser to pick from, and the intrinsic
 * width/height so the browser reserves space before the file arrives (no
 * layout shift). Spread the result onto the element and add `sizes`.
 */
export const imageAttrs = (media: Media | null, defaultWidth = 900) => {
  if (!media?.url) return null
  return {
    src: sizedUrl(media, defaultWidth),
    srcset: srcsetFor(media),
    width: media.width ?? undefined,
    height: media.height ?? undefined,
  }
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Until Cris sets `order` on any project in the admin, this slug leads the
 * list — Nook is the strongest proof (live on the App Store) but is the
 * oldest document, so newest-first put it last.
 */
const FALLBACK_FIRST_SLUG = 'nook'

/**
 * Orders projects by `order` (lower first), then by the API's createdAt
 * order. MongoDB sorts missing values *first* on an ascending sort, so the
 * API's `sort=order,-createdAt` alone would put unordered projects on top;
 * this pushes them after the ordered ones. The sort is stable, so ties keep
 * the newest-first order the API returned.
 */
export const sortProjects = (projects: Project[]): Project[] => {
  const hasOrder = projects.some((p) => typeof p.order === 'number')

  if (!hasOrder) {
    return [...projects].sort(
      (a, b) => Number(b.slug === FALLBACK_FIRST_SLUG) - Number(a.slug === FALLBACK_FIRST_SLUG),
    )
  }

  const rank = (p: Project) => (typeof p.order === 'number' ? p.order : Number.POSITIVE_INFINITY)
  return [...projects].sort((a, b) => rank(a) - rank(b))
}

/** Query string shared by every project list fetch. */
export const PROJECT_LIST_QUERY = 'depth=1&limit=100&sort=order,-createdAt'

type FetchResult<T> = { ok: true; data: T } | { ok: false }

/**
 * Fetches all projects, sorted for display. `ok: false` means the CMS could
 * not be reached or answered with an error — callers show friendly copy and
 * skip caching; the technical detail goes to the server log only.
 */
export const fetchProjects = async (): Promise<FetchResult<Project[]>> => {
  try {
    const response = await fetch(`${CMS_URL}/api/projects?${PROJECT_LIST_QUERY}`)
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${CMS_URL}/api/projects`)
    const data = await response.json()
    return { ok: true, data: sortProjects(data.docs ?? []) }
  } catch (error) {
    console.error('Failed to fetch projects from Payload:', error)
    return { ok: false }
  }
}

/** Fetches one project by slug. `data: null` is a genuine not-found. */
export const fetchProject = async (slug: string): Promise<FetchResult<Project | null>> => {
  try {
    const response = await fetch(
      `${CMS_URL}/api/projects?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
    )
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${CMS_URL}/api/projects`)
    const data = await response.json()
    return { ok: true, data: data.docs?.[0] ?? null }
  } catch (error) {
    console.error(`Failed to fetch project "${slug}" from Payload:`, error)
    return { ok: false }
  }
}

/**
 * The links to show for a project. New `links` entries win; a project that
 * only has the legacy `liveLink` gets it as a single web link, so documents
 * written before the field existed keep working.
 */
export const projectLinks = (project: Project): ProjectLink[] => {
  const links = (project.links ?? []).filter((l) => l?.url && l?.label)
  if (links.length > 0) return links
  if (project.liveLink) {
    return [{ label: `Visit ${project.title}`, url: project.liveLink, kind: 'web' }]
  }
  return []
}

/** A testimonial is only worth rendering when it has a quote. */
export const projectTestimonial = (project: Project): ProjectTestimonial | null =>
  project.testimonial?.quote?.trim() ? project.testimonial : null
