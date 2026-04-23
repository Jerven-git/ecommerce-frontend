import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

marked.setOptions({
  gfm: true,
  breaks: true,
})

export function renderMarkdown(source: string | null | undefined): string {
  if (!source) return ''
  const raw = marked.parse(source, { async: false }) as string
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } })
}
