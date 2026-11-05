import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'

const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{8,128}$/

function requestId(event: H3Event): string {
  const incoming = getRequestHeader(event, 'x-request-id')?.trim()

  return incoming && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID()
}

function isDocumentRequest(path: string): boolean {
  if (
    path === '/__health'
    || path === '/robots.txt'
    || path === '/sitemap.xml'
    || path.startsWith('/_nuxt/')
  ) {
    return false
  }

  return !/\.[A-Za-z0-9]{1,8}$/.test(path)
}

export default defineEventHandler((event) => {
  const startedAt = performance.now()
  const id = requestId(event)
  const url = getRequestURL(event)
  const host = (getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || '')
    .split(',')[0]
    .trim()
    .toLowerCase()

  setResponseHeader(event, 'x-request-id', id)
  setResponseHeader(event, 'x-ssu-renderer', 'nuxt-ssr')

  if (isDocumentRequest(url.pathname)) {
    appendResponseHeader(event, 'vary', 'Accept-Language')
    appendResponseHeader(event, 'vary', 'Cookie')
    setResponseHeader(event, 'cache-control', 'private, no-store, max-age=0')
    setResponseHeader(event, 'surrogate-control', 'no-store')
  }

  event.node.res.once('finish', () => {
    console.info(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'ssr_request',
      request_id: id,
      method: event.method,
      host,
      path: url.pathname,
      status: event.node.res.statusCode,
      duration_ms: Math.round((performance.now() - startedAt) * 100) / 100,
      renderer: 'nuxt-ssr',
    }))
  })
})
