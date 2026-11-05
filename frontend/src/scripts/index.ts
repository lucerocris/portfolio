/**
 * Behaviour for the one-pager home page (pages/index.astro).
 *
 * - Hash routes swap views in place: #index, #about, #contact, #work/<slug>.
 * - Hovering or focusing a project dims the others, moves the marker, and
 *   shows a preview card that tilts with cursor speed.
 * - Opening a project grows the preview image into the case figure with the
 *   View Transitions API where supported; elsewhere it wipes in.
 * - Phones: the first tap previews in a bottom sheet, the second opens.
 * - Esc closes a case, ←/→ step between cases, ↑/↓ move through the index.
 */

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const touch = matchMedia('(hover: none)')

const body = document.body
const views = new Map<string, HTMLElement>()
document.querySelectorAll<HTMLElement>('.view[data-view]').forEach((v) => views.set(v.dataset.view!, v))

const indexView = views.get('index')!
const links = [...indexView.querySelectorAll<HTMLAnchorElement>('.idx-link')]
const marker = indexView.querySelector<HTMLElement>('.idx-marker')!
const idxWrap = indexView.querySelector<HTMLElement>('.idx-wrap')!
const stack = indexView.querySelector<HTMLElement>('.peek-stack')!
const card = indexView.querySelector<HTMLElement>('.peek-card')!
const peekImgs = [...indexView.querySelectorAll<HTMLImageElement>('.peek-imgs img')]
const metas = [...indexView.querySelectorAll<HTMLElement>('.meta')]
const sheet = document.querySelector<HTMLElement>('.sheet')!
const sheetItems = [...sheet.querySelectorAll<HTMLElement>('.sheet-item')]
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')]
const footer = document.querySelector<HTMLElement>('.op-foot')!

/* ---------- Routing ---------- */

let current = 'index'
let returnTimer = 0

const routeFromHash = () => {
  const name = decodeURIComponent(location.hash.slice(1))
  return views.has(name) ? name : 'index'
}

const setNav = (name: string) => {
  const section = name.startsWith('work/') ? 'index' : name
  body.dataset.view = name.split('/')[0]
  navLinks.forEach((a) => {
    if (a.dataset.nav === section) a.setAttribute('aria-current', 'page')
    else a.removeAttribute('aria-current')
  })
}

views.forEach((v, name) => {
  if (name !== current) v.inert = true
})

function show(name: string) {
  if (name === current) return
  const from = views.get(current)!
  const to = views.get(name)!
  const activeIndex = activeI

  const swap = () => {
    from.classList.remove('is-active', 'is-entering', 'is-fading', 'is-returning')
    from.inert = true
    to.classList.add('is-active')
    to.inert = false
    to.scrollTop = 0
    current = name
    setNav(name)
    clearActive()
    closeSheet()
  }

  // Index → case: the preview image grows into the case figure.
  const peek = activeIndex != null ? peekImgs[activeIndex] : null
  const fig = to.querySelector<HTMLImageElement>('.case-fig img.case-shot')
  const canMorph =
    !reduce &&
    'startViewTransition' in document &&
    from === indexView &&
    name.startsWith('work/') &&
    peek &&
    fig &&
    links[activeIndex!]?.getAttribute('href') === `#${name}` &&
    peek.offsetParent !== null

  if (canMorph) {
    peek.style.viewTransitionName = 'shot'
    const t = (document as Document & { startViewTransition: (cb: () => void) => { finished: Promise<void> } })
      .startViewTransition(() => {
        peek.style.viewTransitionName = ''
        fig.style.viewTransitionName = 'shot'
        swap()
      })
    t.finished.finally(() => {
      fig.style.viewTransitionName = ''
    })
    return
  }

  // Case → elsewhere: cross-fade instead of the wipe, so the case never
  // blinks out over an empty screen. Back on the index the names rise again.
  if (!reduce && from.dataset.view!.startsWith('work/') && !name.startsWith('work/')) {
    const back = () => {
      swap()
      if (to === indexView) {
        to.classList.remove('is-returning')
        void to.offsetWidth
        to.classList.add('is-returning')
        clearTimeout(returnTimer)
        returnTimer = window.setTimeout(() => to.classList.remove('is-returning'), 1400)
      }
    }
    if ('startViewTransition' in document) {
      const root = document.documentElement
      root.classList.add('vt-back')
      const t = (document as Document & { startViewTransition: (cb: () => void) => { finished: Promise<void> } })
        .startViewTransition(back)
      t.finished.finally(() => root.classList.remove('vt-back'))
    } else {
      back()
      to.classList.remove('is-fading')
      void to.offsetWidth
      to.classList.add('is-fading')
    }
    return
  }

  swap()
  if (!reduce) {
    to.classList.remove('is-entering')
    void to.offsetWidth
    to.classList.add('is-entering')
  }
}

const initial = routeFromHash()
if (initial !== 'index') {
  // Land straight on the requested view, without the wipe.
  indexView.classList.remove('is-active')
  indexView.inert = true
  const v = views.get(initial)!
  v.classList.add('is-active')
  v.inert = false
  current = initial
}
setNav(current)

addEventListener('hashchange', () => show(routeFromHash()))
// After the load sequence, later reveals use short, undelayed fades.
setTimeout(() => document.documentElement.classList.add('loaded'), 1600)

/* ---------- Hover preview ---------- */

let activeI: number | null = null
let leaveTimer = 0

function setActive(i: number) {
  clearTimeout(leaveTimer)
  if (activeI === i) return
  const prev = activeI
  activeI = i
  indexView.dataset.active = String(i)
  links.forEach((a, j) => a.classList.toggle('is-on', j === i))

  // Marker: centred on the row's cap height.
  const row = links[i]
  marker.style.setProperty('--my', `${row.offsetTop + row.offsetHeight * 0.45 - 6}px`)

  // Image: the new one wipes up over the last one.
  peekImgs.forEach((img, j) => {
    img.classList.toggle('is-on', j === i)
    img.classList.toggle('is-prev', j === prev)
  })
  metas.forEach((m, j) => m.classList.toggle('is-on', j === i))

  // Stack follows the row, kept between the header and the footer.
  const wrapTop = idxWrap.getBoundingClientRect().top
  const rowTop = row.getBoundingClientRect().top
  const minTop = 96
  const maxTop = footer.getBoundingClientRect().top - stack.offsetHeight - 24
  const top = Math.max(minTop, Math.min(rowTop - 40, maxTop))
  stack.style.setProperty('--py', `${top - wrapTop}px`)
}

function clearActive() {
  activeI = null
  delete indexView.dataset.active
  links.forEach((a) => a.classList.remove('is-on'))
}

links.forEach((a, i) => {
  a.addEventListener('mouseenter', () => {
    if (!touch.matches) setActive(i)
  })
  a.addEventListener('focus', () => setActive(i))
  a.addEventListener('click', (e) => {
    // Phones: first tap previews, second tap opens.
    if (touch.matches && activeI !== i) {
      e.preventDefault()
      setActive(i)
      openSheet(i)
    }
  })
})

const list = indexView.querySelector('.idx')!
list.addEventListener('mouseleave', () => {
  if (touch.matches) return
  leaveTimer = window.setTimeout(clearActive, 140)
})
list.addEventListener('focusout', (e) => {
  if (!list.contains((e as FocusEvent).relatedTarget as Node)) clearActive()
})

/* Card tilt and drift from cursor speed (desktop only). */
if (!reduce) {
  let x = 0, y = 0, lastX = 0, vx = 0
  let rot = 3, tx = 0, ty = 0
  let raf = 0

  indexView.addEventListener('mousemove', (e) => {
    x = e.clientX
    y = e.clientY
    if (!raf) raf = requestAnimationFrame(tick)
  })

  function tick() {
    raf = 0
    vx = vx * 0.8 + (x - lastX) * 0.2
    lastX = x
    const r = card.getBoundingClientRect()
    const dx = x - (r.left + r.width / 2)
    const dy = y - (r.top + r.height / 2)
    const targetRot = 3 + Math.max(-4, Math.min(4, vx * 0.12))
    const targetTx = Math.max(-18, Math.min(18, dx * 0.03))
    const targetTy = Math.max(-18, Math.min(18, dy * 0.03))
    rot += (targetRot - rot) * 0.15
    tx += (targetTx - tx) * 0.15
    ty += (targetTy - ty) * 0.15
    card.style.setProperty('--rot', `${rot.toFixed(2)}deg`)
    card.style.setProperty('--tx', `${tx.toFixed(1)}px`)
    card.style.setProperty('--ty', `${ty.toFixed(1)}px`)
    // Keep easing back to rest after the cursor stops.
    if (Math.abs(targetRot - rot) > 0.05 || Math.abs(vx) > 0.1) raf = requestAnimationFrame(tick)
  }
}

/* ---------- Phone sheet ---------- */

function openSheet(i: number) {
  sheetItems.forEach((s, j) => {
    s.classList.toggle('is-on', j === i)
    s.querySelector('a')!.tabIndex = j === i ? 0 : -1
  })
  sheet.classList.add('is-open')
  sheet.setAttribute('aria-hidden', 'false')
}

function closeSheet() {
  sheet.classList.remove('is-open')
  sheet.setAttribute('aria-hidden', 'true')
  sheetItems.forEach((s) => (s.querySelector('a')!.tabIndex = -1))
}

document.addEventListener('click', (e) => {
  const t = e.target as Node
  if (sheet.classList.contains('is-open') && !sheet.contains(t) && !list.contains(t)) {
    closeSheet()
    clearActive()
  }
})

/* ---------- Keyboard ---------- */

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return

  if (current.startsWith('work/')) {
    const view = views.get(current)!
    if (e.key === 'Escape') {
      location.hash = '#index'
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const a = view.querySelector<HTMLAnchorElement>(`.pager [data-dir="${e.key === 'ArrowLeft' ? 'prev' : 'next'}"]`)
      if (a) location.hash = a.getAttribute('href')!
    }
    return
  }

  if (current === 'index' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault()
    const at = links.indexOf(document.activeElement as HTMLAnchorElement)
    const step = e.key === 'ArrowDown' ? 1 : -1
    const next = at < 0 ? (step > 0 ? 0 : links.length - 1) : (at + step + links.length) % links.length
    links[next].focus()
  }

  if (e.key === 'Escape') {
    closeSheet()
    clearActive()
  }
})

/* ---------- Cebu clock ---------- */

const clock = document.querySelector<HTMLElement>('[data-clock]')
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' })
  const tick = () => (clock.textContent = `${fmt.format(new Date())} in Cebu`)
  tick()
  setInterval(tick, 20_000)
}
