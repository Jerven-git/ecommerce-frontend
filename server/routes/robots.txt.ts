import type { TenantSeoConfig } from '../utils/tenantSeo'
import {
  fetchTenantApi,
  indexingEnabled,
  isLocalHostname,
  tenantBaseUrl,
} from '../utils/tenantSeo'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Vary', 'Host')

  const requestUrl = getRequestURL(event)

  if (!indexingEnabled(event) || isLocalHostname(requestUrl.hostname)) {
    setHeader(event, 'Cache-Control', 'no-store')
    return 'User-agent: *\nDisallow: /\n'
  }

  let siteConfig: TenantSeoConfig
  try {
    const response = await fetchTenantApi<{ data: TenantSeoConfig }>(event, '/site-config')
    siteConfig = response.data
  } catch {
    setResponseStatus(event, 503)
    setHeader(event, 'Cache-Control', 'no-store')
    return 'User-agent: *\nDisallow: /\n'
  }

  const baseUrl = tenantBaseUrl(event, siteConfig)
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=600')

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /super-admin/',
    'Disallow: /cart',
    'Disallow: /checkout',
    'Disallow: /favorites',
    'Disallow: /tracking',
    'Disallow: /order-success',
    'Disallow: /payment/',
    'Disallow: /backorder/pay/',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ].join('\n')
})

