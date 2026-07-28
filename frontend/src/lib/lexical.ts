/**
 * Minimal Lexical -> HTML serializer for Payload richText fields.
 *
 * Covers the node types the Projects editor can produce (paragraphs, headings,
 * lists, quotes, links, inline formatting). Unknown nodes fall through to their
 * children rather than disappearing, so new editor features degrade to plain
 * text instead of vanishing.
 */

type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  format?: number | string
  listType?: string
  url?: string
  fields?: { url?: string; newTab?: boolean }
  children?: LexicalNode[]
}

export type LexicalRoot = { root?: { children?: LexicalNode[] } }

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** Blocks javascript: and data: URLs that would otherwise be injected verbatim. */
const safeUrl = (raw: string) => {
  const url = raw.trim()
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url
  if (url.startsWith('/') || url.startsWith('#')) return url
  return '#'
}

// Lexical packs inline formatting into a bitmask on each text node.
const IS_BOLD = 1
const IS_ITALIC = 2
const IS_STRIKETHROUGH = 4
const IS_UNDERLINE = 8
const IS_CODE = 16
const IS_SUBSCRIPT = 32
const IS_SUPERSCRIPT = 64

function renderText(node: LexicalNode) {
  let html = escapeHtml(node.text ?? '')
  const format = typeof node.format === 'number' ? node.format : 0

  if (format & IS_CODE) html = `<code>${html}</code>`
  if (format & IS_BOLD) html = `<strong>${html}</strong>`
  if (format & IS_ITALIC) html = `<em>${html}</em>`
  if (format & IS_UNDERLINE) html = `<u>${html}</u>`
  if (format & IS_STRIKETHROUGH) html = `<s>${html}</s>`
  if (format & IS_SUBSCRIPT) html = `<sub>${html}</sub>`
  if (format & IS_SUPERSCRIPT) html = `<sup>${html}</sup>`

  return html
}

function renderChildren(nodes?: LexicalNode[]): string {
  return (nodes ?? []).map(renderNode).join('')
}

function renderNode(node: LexicalNode): string {
  switch (node.type) {
    case 'text':
      return renderText(node)

    case 'linebreak':
      return '<br />'

    case 'paragraph': {
      const inner = renderChildren(node.children)
      // Lexical emits an empty trailing paragraph on most documents.
      return inner.trim() ? `<p>${inner}</p>` : ''
    }

    case 'heading': {
      const tag = /^h[1-6]$/.test(node.tag ?? '') ? node.tag : 'h2'
      return `<${tag}>${renderChildren(node.children)}</${tag}>`
    }

    case 'quote':
      return `<blockquote>${renderChildren(node.children)}</blockquote>`

    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${renderChildren(node.children)}</${tag}>`
    }

    case 'listitem':
      return `<li>${renderChildren(node.children)}</li>`

    case 'link':
    case 'autolink': {
      const href = safeUrl(node.fields?.url ?? node.url ?? '#')
      const target = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${escapeHtml(href)}"${target}>${renderChildren(node.children)}</a>`
    }

    case 'horizontalrule':
      return '<hr />'

    default:
      return node.children ? renderChildren(node.children) : ''
  }
}

export function lexicalToHtml(content: unknown): string {
  const root = (content as LexicalRoot | null | undefined)?.root
  if (!root?.children) return ''
  return renderChildren(root.children)
}
