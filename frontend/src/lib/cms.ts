import type { Media } from '@backend'

/**
 * Base URL of the Payload backend. Set PUBLIC_CMS_URL in any deployed
 * environment — the localhost fallback only exists so `pnpm dev` works
 * with no .env present.
 */
export const CMS_URL = (
  import.meta.env.PUBLIC_CMS_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

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

/**
 * Picks the smallest generated size that is still at least `minWidth` wide,
 * falling back to the original. Payload generates `thumbnail` (400w) and
 * `card` (900w) WebP variants that would otherwise go unused, leaving pages
 * to download full-resolution originals.
 */
export const sizedUrl = (media: Media | null, minWidth: number) => {
  if (!media) return undefined

  const candidates = Object.values(media.sizes ?? {})
    .filter((size): size is NonNullable<typeof size> => Boolean(size?.url && size?.width))
    .filter((size) => (size.width ?? 0) >= minWidth)
    .sort((a, b) => (a.width ?? 0) - (b.width ?? 0))

  return mediaUrl(candidates[0]?.url ?? media.url)
}
