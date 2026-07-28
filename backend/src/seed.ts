/**
 * Seed script — populates the Projects + Media collections.
 *
 *   pnpm seed                    # add any project whose slug doesn't exist yet
 *   SEED_FRESH=1 pnpm seed       # delete all projects + media first, then seed
 *
 * Use the env var, not `pnpm seed --fresh` — pnpm swallows the bare flag before
 * it reaches the script, and the wipe silently does not happen.
 *
 * Logos and featured images are generated gradient placeholders unless a real
 * file is given via `logoFile` / `heroFile` (paths are relative to the repo
 * root). Swap the placeholders out in the admin UI as real assets arrive.
 */
import fs from 'fs'
import os from 'os'
import path from 'path'

import config from '@payload-config'
import { getPayload } from 'payload'
import sharp from 'sharp'

/** Minimal valid Lexical editor state for a richText field. */
const richText = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      textFormat: 0,
      children: [
        { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
      ],
    })),
  },
})

type SeedProject = {
  slug: string
  title: string
  subtitle?: string
  shortDescription: string
  cardLinkText?: string
  liveLink?: string
  /** [from, to] gradient stops for generated placeholder art. */
  accent: [string, string]
  services: string[]
  techStack: string[]
  content: string[]
  /** Repo-root-relative path to a real image, if one exists. */
  logoFile?: string
  heroFile?: string
  /** Extra case-study screens. `file` uses a real image; otherwise a placeholder. */
  gallery?: { caption: string; wide?: boolean; file?: string }[]
}

const PROJECTS: SeedProject[] = [
  {
    slug: 'nook',
    title: 'Nook',
    subtitle: 'Cafe discovery, from map search to loyalty stamps.',
    shortDescription:
      'A cafe discovery platform spanning a public web app, a Flutter mobile app, an admin console and an owner-facing business portal — all on one Supabase backend.',
    cardLinkText: 'Nook case study',
    accent: ['#1c1917', '#c2874a'],
    services: ['Product Design', 'Full-Stack Engineering', 'Mobile Development'],
    techStack: ['Next.js 16', 'Supabase', 'Flutter', 'MapLibre', 'PostHog', 'DigitalOcean Spaces'],
    content: [
      'Nook is a cafe discovery platform built around a simple question — where should I go today? It answers with map-based search, AI-assisted recommendations, and reviews from the people who actually work out of these places.',
      'It ships as four clients against a single Supabase backend: a public web app, a Flutter mobile app, an internal admin console, and a business portal where cafe owners claim their listing and manage profile, hours, photos, menu and traffic analytics.',
      'The backend runs eleven Deno edge functions covering semantic cafe search and embedding backfills, presigned review-image uploads, owner invitation and revocation flows, and a loyalty stamp system with grant, revoke and restore paths behind admin auth.',
    ],
    // Brand green (#3A5A40) is ~2.4:1 on the site's #151419 background, so the
    // white recolour is used here. nook-logo.svg keeps the original colour.
    logoFile: 'frontend/public/nook-logoW.svg',
    gallery: [
      { caption: 'Web app — map-based cafe search', wide: true },
      { caption: 'Admin console — listing moderation' },
      { caption: 'Business portal — owner dashboard' },
      { caption: 'Mobile app — cafe detail and stamps' },
      { caption: 'Mobile app — review composer' },
    ],
  },
  {
    slug: 'picklerank',
    title: 'PickleRank PH',
    subtitle: 'The Philippine pickleball rating and tournament ecosystem.',
    shortDescription:
      'Took over a live rating and tournament platform mid-flight and drove it to production readiness — seeding, walkovers, tiebreaks and a team Swiss format.',
    cardLinkText: 'PickleRank case study',
    liveLink: 'https://prph.app',
    accent: ['#14532d', '#84cc16'],
    services: ['Backend Engineering', 'Product Ownership', 'Systems Design'],
    techStack: ['CodeIgniter 4', 'PHP 8.2', 'MySQL', 'Redis', 'Pusher', 'Expo'],
    content: [
      'PickleRank PH is the rating and tournament backbone for Philippine pickleball — player ratings, open-play queue management, and full tournament operations.',
      'I inherited the codebase after its initial build and have been its sole maintainer since, taking it from first deploy through to v3.4.3.',
      'Recent work has focused on holding up under real tournaments: seeding logic, walkovers and withdrawals, tiebreak resolution, and a team Swiss format for eight teams of five pairs. Realtime updates run over Pusher, with MySQL split across a write primary and a read replica.',
    ],
  },
  {
    slug: 'pocket-concerts',
    title: 'Pocket Concerts',
    subtitle: 'Event registration that held up on the night.',
    shortDescription:
      'End-to-end event platform for a live concert — registration, door check-in, donations and a live stage overlay. Took 600 registrants without falling over.',
    cardLinkText: 'Pocket Concerts case study',
    accent: ['#4c1d95', '#e879f9'],
    services: ['Web Design', 'Frontend Engineering', 'Event Operations'],
    techStack: ['Next.js', 'Firebase', 'Tailwind CSS', 'shadcn/ui'],
    content: [
      'Pocket Concerts needed more than a signup form. It needed a registration flow that could absorb a burst of traffic around the announcement, then keep working on the night itself.',
      'The result covers the whole event: public registration, an attendee verification flow for the door, a donation path, an admin console for the organizers, and a live overlay view driven from the same data for display on stage.',
      'It handled 600 registrants for a single event. Firebase backs storage, and the interface was kept deliberately plain so the form stayed usable on whatever phone someone happened to be holding in the queue.',
    ],
  },
  {
    slug: 'bijou',
    title: 'Bijou',
    subtitle: 'A charm-by-charm jewelry storefront with a canvas customizer.',
    shortDescription:
      'Concept ecommerce for a jewelry and charms brand, built around an in-browser customizer that lets shoppers design a piece charm by charm.',
    cardLinkText: 'Bijou case study',
    accent: ['#78350f', '#fcd34d'],
    services: ['Ecommerce Design', 'Frontend Engineering', 'Interaction Design'],
    techStack: ['Next.js', 'TanStack Query', 'Zustand', 'Fabric.js', 'Konva', 'Framer Motion'],
    content: [
      'Bijou is a concept storefront for a jewelry and charms brand, built to test whether product customization could feel like play rather than like filling in a configurator.',
      'The centrepiece is the create route — a canvas customizer on Fabric.js and Konva where shoppers place, arrange and preview charms on a piece before buying, with full undo history behind it.',
      'Around that sits a complete storefront: cart, checkout, customer accounts, multiple saved addresses and order tracking.',
    ],
    logoFile: 'frontend/public/bijou-logoP.svg',
    heroFile: 'frontend/public/bijouPic.webp',
  },
  {
    slug: 'nap-atlas',
    title: 'Nap Atlas',
    subtitle: 'Travel comfort, personalized for every journey.',
    shortDescription:
      'A direct-to-consumer travel brand on Shopify, built around a travel pillow and StoryPatch — collectible iron-on patches that turn it into a record of where you have been.',
    cardLinkText: 'Nap Atlas case study',
    accent: ['#0c4a6e', '#67e8f9'],
    services: ['Shopify Development', 'Conversion Design', 'Brand Strategy'],
    techStack: ['Shopify', 'Liquid', 'Dawn Theme'],
    content: [
      'Nap Atlas is a direct-to-consumer travel brand built on one deceptively simple product: a compact memory-foam travel pillow with an integrated carabiner, so it clips to a bag instead of eating packing space.',
      'What separates it from a shelf of commodity pillows is StoryPatch — iron-on emblems collected trip by trip, turning a travel essential into a keepsake map of everywhere its owner has been.',
      'The store is a customized Shopify Dawn theme with landing and product pages designed around conversion. Currently pre-launch.',
    ],
  },
]

const REPO_ROOT = path.resolve(process.cwd(), '..')

/** Renders a gradient placeholder image carrying the project's label. */
async function makeImage(
  outPath: string,
  opts: { width: number; height: number; from: string; to: string; label: string; fontSize: number },
) {
  const { width, height, from, to, label, fontSize } = opts
  const escaped = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <text x="50%" y="50%" dy="0.35em" text-anchor="middle"
          font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}"
          font-weight="700" fill="#ffffff" fill-opacity="0.92">${escaped}</text>
  </svg>`
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  return outPath
}

const initials = (title: string) =>
  title
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

/** Uses the real file when it exists, otherwise renders a placeholder. */
function resolveAsset(rel: string | undefined) {
  if (!rel) return null
  const abs = path.resolve(REPO_ROOT, rel)
  return fs.existsSync(abs) ? abs : null
}

async function seed() {
  // pnpm can swallow bare flags before they reach the script, so accept an env
  // var too: `SEED_FRESH=1 pnpm seed` is the reliable form.
  const fresh = process.argv.includes('--fresh') || process.env.SEED_FRESH === '1'
  const payload = await getPayload({ config })
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'payload-seed-'))

  if (fresh) {
    payload.logger.info('--fresh: clearing existing projects and media')
    await payload.delete({ collection: 'projects', where: {}, overrideAccess: true })
    await payload.delete({ collection: 'media', where: {}, overrideAccess: true })
  }

  let created = 0
  let skipped = 0

  for (const p of PROJECTS) {
    const existing = await payload.find({
      collection: 'projects',
      where: { slug: { equals: p.slug } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      payload.logger.info(`skip  ${p.slug} (already exists)`)
      skipped++
      continue
    }

    const [from, to] = p.accent

    const logoPath =
      resolveAsset(p.logoFile) ??
      (await makeImage(path.join(tmp, `${p.slug}-logo.png`), {
        width: 512,
        height: 512,
        from,
        to,
        label: initials(p.title),
        fontSize: 200,
      }))

    const heroPath =
      resolveAsset(p.heroFile) ??
      (await makeImage(path.join(tmp, `${p.slug}-hero.png`), {
        width: 1600,
        height: 900,
        from,
        to,
        label: p.title,
        fontSize: 110,
      }))

    if (resolveAsset(p.heroFile)) payload.logger.info(`      using real hero image: ${p.heroFile}`)

    const logo = await payload.create({
      collection: 'media',
      data: { alt: `${p.title} logo` },
      filePath: logoPath,
      overrideAccess: true,
    })
    const featuredImage = await payload.create({
      collection: 'media',
      data: { alt: `${p.title} featured image` },
      filePath: heroPath,
      overrideAccess: true,
    })

    const gallery = []
    for (const [i, shot] of (p.gallery ?? []).entries()) {
      const shotPath =
        resolveAsset(shot.file) ??
        (await makeImage(path.join(tmp, `${p.slug}-gallery-${i + 1}.png`), {
          width: shot.wide ? 1600 : 1200,
          height: 900,
          from,
          to,
          label: shot.caption,
          fontSize: shot.wide ? 64 : 54,
        }))

      const image = await payload.create({
        collection: 'media',
        data: { alt: `${p.title} — ${shot.caption}` },
        filePath: shotPath,
        overrideAccess: true,
      })

      gallery.push({ image: image.id, caption: shot.caption, wide: shot.wide ?? false })
    }

    await payload.create({
      collection: 'projects',
      overrideAccess: true,
      data: {
        title: p.title,
        slug: p.slug,
        subtitle: p.subtitle,
        shortDescription: p.shortDescription,
        cardLinkText: p.cardLinkText,
        liveLink: p.liveLink,
        logo: logo.id,
        featuredImage: featuredImage.id,
        content: richText(p.content),
        services: p.services.map((serviceName) => ({ serviceName })),
        techStack: p.techStack.map((techName) => ({ techName })),
        gallery,
      },
    })

    payload.logger.info(`seed  ${p.slug}`)
    created++
  }

  fs.rmSync(tmp, { recursive: true, force: true })
  payload.logger.info(`done — ${created} created, ${skipped} skipped`)
  process.exit(0)
}

// Top-level await is required: `payload run` exits as soon as module evaluation
// finishes, so a floating promise here would be abandoned before it resolves.
try {
  await seed()
} catch (err) {
  console.error(err)
  process.exit(1)
}
