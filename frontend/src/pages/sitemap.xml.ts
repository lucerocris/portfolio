import type { APIRoute } from 'astro'

import { CMS_URL } from '../lib/cms'

const STATIC_PATHS = ['/', '/about', '/projects', '/start']

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? 'http://localhost:4321/').replace(/\/+$/, '')

  let slugs: string[] = []
  try {
    const res = await fetch(`${CMS_URL}/api/projects?limit=100&depth=0`)
    const data = await res.json()
    slugs = (data.docs ?? []).map((d: { slug?: string }) => d.slug).filter(Boolean)
  } catch (error) {
    // A sitemap missing the project pages beats a 500 on /sitemap.xml.
    console.error('sitemap: could not reach Payload:', error)
  }

  const urls = [...STATIC_PATHS, ...slugs.map((s) => `/projects/${s}`)]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${base}${path}</loc></url>`).join('\n')}
</urlset>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
