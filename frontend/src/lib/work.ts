/**
 * The projects on the home page index, in display order, and the experience
 * list. Copy follows the CMS seed (backend/src/seed.ts) and the résumé
 * (~/personal/business/cv/resume.html); screenshots live in public/work/.
 *
 * The index is one screen and never scrolls: seven projects is the ceiling
 * (--display in index.css is sized for seven rows).
 */

export type Work = {
  slug: string
  /** Name as set in the index. Keep it short — it is shown at ~90px. */
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
  /** The case panel's button. `text` defaults to "Visit <label> ↗". */
  link?: { href: string; label: string; text?: string }
  image: { src: string; alt: string; caption: string; position?: string }
  /** Phone screens shown in the case panel instead of the web screenshot. */
  screens?: { src: string; alt: string }[]
  /** Caption under the phone screens. */
  screensCaption?: string
  /**
   * Desktop app screens. With `screens` too, the case panel shows the desktop
   * window with the phones laid over its corner; the first one is `image`.
   */
  desktop?: { src: string; alt: string; label: string }[]
}

export const work: Work[] = [
  {
    slug: 'nook',
    name: 'Nook',
    title: 'Nook',
    tagline: 'iOS & web — café discovery',
    summary: 'Café discovery: a Flutter app on the App Store, a web app, an admin console and an owner portal, all on one Supabase backend.',
    subtitle: 'Café discovery, from map search to loyalty stamps.',
    body: [
      'Nook answers one question: where should I go today? Map-based search, AI-assisted recommendations, and reviews from the people who actually work out of these places.',
      'Founder and project lead on a 3-person team. I wrote most of the code across the mobile app, web app, admin console and owner portal, with Row-Level Security as the authorization boundary. 50 cafés listed so far.',
    ],
    role: 'Founder, project lead\nMost of the code',
    stack: 'Flutter, Next.js\nSupabase, MapLibre',
    stackShort: 'Flutter · Next.js · Supabase',
    status: 'Live — App Store',
    link: { href: 'https://apps.apple.com/ph/app/nook-cafe-finder/id6782604940', label: 'the App Store', text: 'Get it on the App Store ↗' },
    image: { src: '/work/nook.webp', alt: 'Nook web app: café search with filters and house picks', caption: 'nookph.app — home' },
    screens: [
      { src: '/work/nook-app-1.webp', alt: 'Nook iOS app: Featured cafés on the home screen' },
      { src: '/work/nook-app-2.webp', alt: 'Nook iOS app: map with a list of nearby cafés' },
      { src: '/work/nook-app-3.webp', alt: 'Nook iOS app: café detail with rating, hours and amenities' },
    ],
    screensCaption: 'iOS app — Featured, Map, Café',
  },
  {
    slug: 'loft',
    name: 'Loft',
    title: 'Loft',
    tagline: 'Desktop & Android — AI agent control',
    summary: 'One inbox for every Claude Code agent on my laptop: a desktop app, and an Android app to answer them by voice from anywhere.',
    subtitle: 'Mission control for background coding agents, on the desk and in the pocket.',
    body: [
      'I run many Claude Code agents at once, across two accounts with separate billing. Loft puts them all in one place: who is working, who needs an answer and what it asked, with an inbox and a board, projects, live usage limits per account, and a live terminal into any agent.',
      'The Android app pairs with the laptop over Tailscale using a revocable per-phone token, so nothing is open to the internet. Agents waiting on me arrive as notifications, questions come up as tappable choices, and I can answer by voice: speech streams to Whisper running on the laptop, with words appearing as I talk.',
    ],
    role: 'Design and build\nDesktop, Android, server',
    stack: 'Python, Tauri, xterm.js\nFlutter, Tailscale, Whisper',
    stackShort: 'Python · Tauri · Flutter · Whisper',
    status: 'In daily use',
    image: { src: '/work/loft.webp', alt: 'Loft desktop app: agents grouped by project, one asking how many times failed webhooks should retry', caption: 'Desktop app — Inbox' },
    desktop: [
      { src: '/work/loft.webp', alt: 'Loft desktop app: agents grouped by project, one asking how many times failed webhooks should retry', label: 'Inbox' },
      { src: '/work/loft-board.webp', alt: 'Loft desktop app: board view with Todo, Working, Needs you and Done columns per project', label: 'Board' },
    ],
    screens: [
      { src: '/work/loft-app-1.webp', alt: 'Loft Android app: inbox grouped by project with usage bars for two accounts' },
      { src: '/work/loft-app-2.webp', alt: 'Loft Android app: chat view with an agent question shown as tappable choices' },
      { src: '/work/loft-app-3.webp', alt: 'Loft Android app: Loft Assistant answering “What needs me?”' },
    ],
    screensCaption: 'Android — Inbox, Chat, Assistant',
  },
  {
    slug: 'picklerank',
    name: 'PickleRank',
    title: 'PickleRank PH',
    tagline: 'Ratings & tournaments, 2026',
    summary: 'The Philippine pickleball rating and tournament platform. I maintained it alone from July to September 2026.',
    subtitle: 'The Philippine pickleball rating and tournament ecosystem.',
    body: [
      'I took over a live production platform from its original developer and maintained it alone: the REST API, admin console and Expo mobile client, with Redis, Pusher realtime and S3.',
      'Work focused on holding up under real tournaments: seeding, walkovers and withdrawals, and tiebreaks. On tournament days I led the tech team, running live event operations and fixing issues on the spot.',
    ],
    role: 'Platform maintainer\nTech lead, events',
    stack: 'CodeIgniter 4, PHP 8.2\nMySQL, Redis, Pusher, Expo',
    stackShort: 'CodeIgniter 4 · MySQL · Redis · Pusher',
    status: 'Jul – Sep 2026',
    link: { href: 'https://prph.app', label: 'prph.app' },
    image: { src: '/work/picklerank.webp', alt: 'PickleRank PH home page: “Earn your rank.”', caption: 'prph.app — home' },
  },
  {
    slug: 'pocket-concerts',
    name: 'Pocket Concerts',
    title: 'Pocket Concerts',
    tagline: '600 registrants, one night',
    summary: 'Registration, QR tickets and door check-in for a live concert. Only engineer; it took 600 registrants without falling over.',
    subtitle: 'Event registration that held up on the night.',
    body: [
      'The whole event in one system: public registration, QR-code tickets sent by email, an in-browser QR scanner staff used at the door, a donation path, and an admin console for the organisers.',
      'It handled 600 registrants for a single event. The interface was kept deliberately plain, so the form stayed usable on whatever phone someone was holding in the queue.',
    ],
    role: 'Software developer\nOnly engineer',
    stack: 'Next.js, Firebase\nTailwind CSS, shadcn/ui',
    stackShort: 'Next.js · Firebase · QR check-in',
    status: 'Shipped — Oct 2025',
    link: { href: '/projects/pocket-concerts', label: 'full case study', text: 'Read the full case study →' },
    image: { src: '/work/pocket-concerts.webp', alt: 'Pocket Concerts admin: donations dashboard with totals and a donor table', caption: 'Admin console — donations', position: 'left top' },
  },
  {
    slug: 'bijou',
    name: 'Bijou',
    title: 'Bijou & Charms',
    tagline: 'Charm bracelets, built to order',
    summary: 'A custom charm-bracelet store with a drag-and-drop configurator. Led a 4-person team and owned the frontend.',
    subtitle: 'A charm-by-charm jewellery store with a canvas customiser.',
    body: [
      'The centrepiece is the create flow: a drag-and-drop configurator where shoppers place, arrange and preview charms on a bracelet before buying, with full undo history behind it.',
      'Project lead on a 4-person team. I owned the headless storefront end to end and built the Laravel 12 backend with the team: Sanctum auth, a Filament admin, queued jobs and Pest tests.',
    ],
    role: 'Project lead\nFrontend owner',
    stack: 'Next.js, Turborepo\nLaravel 12, Filament',
    stackShort: 'Next.js · Laravel 12 · Turborepo',
    status: 'Live',
    link: { href: 'https://bijouandcharms.com', label: 'bijouandcharms.com' },
    image: { src: '/work/bijou.webp', alt: 'Bijou & Charms home page: charm bracelets on pink, “Your daily dose of shine!”', caption: 'bijouandcharms.com — home' },
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
      'StoryPatch iron-on emblems turn it into a record of every trip. I rebuilt the landing and product pages for conversion with custom sections and Liquid components on a Dawn theme.',
    ],
    role: 'Sole developer\nShopify, conversion',
    stack: 'Shopify, Liquid\nDawn theme',
    stackShort: 'Shopify · Liquid · Dawn',
    status: 'Pre-launch',
    image: { src: '/work/napatlas.webp', alt: 'Nap Atlas home page: “Travel Different. Rest Different.” with a red pillow clipped to a backpack', caption: 'Nap Atlas — home', position: 'center' },
  },
]

export type Role = {
  when: string
  title: string
  org: string
  note: string
  /** Optional link to the matching case panel or page. */
  href?: string
}

/** Experience, newest first. Evo Tech wording stays general (NDA). */
export const experience: Role[] = [
  {
    when: 'Aug 2026 — now',
    title: 'Software Engineer Intern',
    org: 'Evo Tech Software Solutions · Cebu, hybrid',
    note: 'Automations that replace repetitive manual work for an operations team: monitoring that catches issues and turns each into a ready-to-work ticket.',
  },
  {
    when: 'Jul — Sep 2026',
    title: 'Platform Maintainer & Tech Lead',
    org: 'PickleRank PH · part-time',
    note: 'Maintained a live rating and tournament platform alone, and led the tech team on tournament days.',
    href: '#work/picklerank',
  },
  {
    when: 'Jun 2026 — now',
    title: 'Independent Developer',
    org: 'Self-employed · Cebu',
    note: 'Websites, software and automation for small businesses, including a Shopify storefront rebuilt for conversion.',
  },
  {
    when: 'Oct 2025',
    title: 'Software Developer',
    org: 'Pocket Concerts',
    note: 'Only engineer on registration and door check-in for a concert with 600 registrants.',
    href: '#work/pocket-concerts',
  },
]
