/**
 * The projects on the home page index, in display order. Copy is taken from
 * the CMS seed (backend/src/seed.ts); screenshots live in public/work/.
 *
 * Keep this to four or five: the index is one screen and never scrolls.
 */

export type Work = {
  slug: string
  /** Name as set in the index. Keep it short — it is shown at ~104px. */
  name: string
  /** Full name, used in the preview card and the case panel. */
  title: string
  /** One line under the name on phones. */
  tagline: string
  /** Two lines next to the preview card. */
  summary: string
  /** The line under the case-panel title. */
  subtitle: string
  body: string[]
  role: string
  stack: string
  stackShort: string
  status: string
  link?: { href: string; label: string }
  image: { src: string; alt: string; caption: string; position?: string }
}

export const work: Work[] = [
  {
    slug: 'nook',
    name: 'Nook',
    title: 'Nook',
    tagline: 'iOS & web — café discovery',
    summary: 'Café discovery: a web app, a Flutter app, an admin console and an owner portal, all on one Supabase backend.',
    subtitle: 'Café discovery, from map search to loyalty stamps.',
    body: [
      'Nook answers one question: where should I go today? Map-based search, AI-assisted recommendations, and reviews from the people who actually work out of these places.',
      'It ships as four clients on one Supabase backend, with eleven edge functions behind it: semantic search, review uploads, owner invitations and a loyalty stamp system.',
    ],
    role: 'Product design\nFull-stack, mobile',
    stack: 'Next.js, Supabase\nFlutter, MapLibre, PostHog',
    stackShort: 'Next.js · Supabase · Flutter · MapLibre',
    status: 'Live — on the App Store',
    link: { href: 'https://www.nookph.app', label: 'nookph.app' },
    image: { src: '/work/nook.webp', alt: 'Nook home page: café search with filters and house picks', caption: 'nookph.app — home' },
  },
  {
    slug: 'picklerank',
    name: 'PickleRank',
    title: 'PickleRank PH',
    tagline: 'Ratings & tournaments, live',
    summary: 'The Philippine pickleball rating and tournament platform. Sole maintainer, from first deploy to v3.4.3.',
    subtitle: 'The Philippine pickleball rating and tournament ecosystem.',
    body: [
      'I took over a live rating and tournament platform mid-flight and drove it to production readiness: seeding, walkovers and withdrawals, tiebreaks, and a team Swiss format for eight teams of five pairs.',
      'Sole maintainer since the initial build, from first deploy to v3.4.3. Realtime updates run over Pusher, with MySQL split across a write primary and a read replica.',
    ],
    role: 'Backend engineering\nProduct ownership',
    stack: 'CodeIgniter 4, PHP 8.2\nMySQL, Redis, Pusher, Expo',
    stackShort: 'CodeIgniter 4 · MySQL · Redis · Pusher',
    status: 'Live — v3.4.3',
    link: { href: 'https://prph.app', label: 'prph.app' },
    image: { src: '/work/picklerank.webp', alt: 'PickleRank PH home page: “Earn your rank.”', caption: 'prph.app — home' },
  },
  {
    slug: 'study-hub',
    name: 'Study Hub',
    title: 'Study Hub',
    tagline: 'CS practice with a C tracer',
    summary: 'Practice for every CS course, built from its own slides, with a step-through C tracer.',
    subtitle: 'Practice for every course, marked like the real checkpoint.',
    body: [
      'One study site for Programming 1 and 2, data structures, discrete maths, graph theory, automata and security, each built from its own course slides.',
      'Drills, mock exams that can swap in a fresh version of any question, and a C tracer that steps through code line by line with the memory beside it.',
    ],
    role: 'Design\nFull-stack',
    stack: 'Next.js, React\nTypeScript, Tailwind CSS',
    stackShort: 'Next.js · TypeScript · C tracer',
    status: 'Live',
    link: { href: 'https://studyhub.dcism.org', label: 'studyhub.dcism.org' },
    image: { src: '/work/studyhub.webp', alt: 'Study Hub home page: subjects grid with Programming 1 and 2 and Discrete Structures', caption: 'studyhub.dcism.org — subjects' },
  },
  {
    slug: 'nap-atlas',
    name: 'Nap Atlas',
    title: 'Nap Atlas',
    tagline: 'Shopify — travel brand',
    summary: 'Shopify store for a travel-pillow brand with collectible iron-on StoryPatches.',
    subtitle: 'Travel comfort, personalised for every journey.',
    body: [
      'A direct-to-consumer travel brand built on one product: a compact memory-foam pillow with a built-in carabiner, so it clips to a bag instead of eating packing space.',
      'StoryPatch iron-on emblems turn it into a record of every trip. The store is a customised Shopify Dawn theme with landing and product pages designed around conversion.',
    ],
    role: 'Shopify development\nConversion design',
    stack: 'Shopify, Liquid\nDawn theme',
    stackShort: 'Shopify · Liquid · Dawn',
    status: 'Pre-launch',
    image: { src: '/work/napatlas.webp', alt: 'Nap Atlas home page: “Travel Different. Rest Different.” with a red pillow clipped to a backpack', caption: 'Nap Atlas — home', position: 'center' },
  },
]
