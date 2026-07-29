import type { SitemapEntity, TenantSeoConfig } from '../utils/tenantSeo'
import {
  fetchAllTenantEntities,
  fetchTenantApi,
  indexingEnabled,
  isLocalHostname,
  tenantBaseUrl,
  xmlEscape,
} from '../utils/tenantSeo'

interface SitemapUrl {
  path: string
  lastmod?: string | null
  changefreq: 'daily' | 'weekly' | 'monthly'
  priority: string
}

function validLastmod(value?: string | null): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Vary', 'Host')

  const requestUrl = getRequestURL(event)
  const isLocal = isLocalHostname(requestUrl.hostname)
  const mayCache = indexingEnabled(event) && !isLocal
  setHeader(
    event,
    'Cache-Control',
    mayCache
      ? 'public, max-age=300, s-maxage=600, stale-while-revalidate=600'
      : 'no-store',
  )

  try {
    const [
      configResponse,
      products,
      posts,
      services,
    ] = await Promise.all([
      fetchTenantApi<{ data: TenantSeoConfig }>(event, '/site-config'),
      fetchAllTenantEntities<SitemapEntity>(event, '/products', { is_active: 1 }),
      fetchAllTenantEntities<SitemapEntity>(event, '/posts'),
      fetchAllTenantEntities<SitemapEntity>(event, '/services'),
    ])

    const config = configResponse.data
    const baseUrl = tenantBaseUrl(event, config)
    const modules = {
      shop: true,
      blog: true,
      services: true,
      about: true,
      contact: true,
      ...(config.modules_enabled ?? {}),
    }
    const pageIsIndexable = (slug: string) => !config.pages_seo?.[slug]?.noindex
    const urls: SitemapUrl[] = []

    if (pageIsIndexable('home')) {
      urls.push({ path: '/', changefreq: 'daily', priority: '1.0' })
    }
    if (modules.shop && pageIsIndexable('shop')) {
      urls.push({ path: '/shop', changefreq: 'daily', priority: '0.9' })
    }
    if (modules.blog && pageIsIndexable('blog')) {
      urls.push({ path: '/blog', changefreq: 'weekly', priority: '0.8' })
    }
    if (modules.services && pageIsIndexable('services')) {
      urls.push({ path: '/services', changefreq: 'weekly', priority: '0.8' })
    }
    if (modules.about && pageIsIndexable('about')) {
      urls.push({ path: '/about', changefreq: 'monthly', priority: '0.6' })
    }
    if (modules.contact && pageIsIndexable('contact')) {
      urls.push({ path: '/contact', changefreq: 'monthly', priority: '0.5' })
    }

    if (modules.shop) {
      urls.push(...products
        .filter(product => product.slug && product.is_active !== false && !product.noindex)
        .map(product => ({
          path: `/product/${encodeURIComponent(product.slug)}`,
          lastmod: product.updated_at,
          changefreq: 'weekly' as const,
          priority: '0.8',
        })))
    }

    if (modules.blog) {
      urls.push(...posts
        .filter(post => post.slug && post.is_published !== false && !post.noindex)
        .map(post => ({
          path: `/blog/${encodeURIComponent(post.slug)}`,
          lastmod: post.updated_at,
          changefreq: 'monthly' as const,
          priority: '0.7',
        })))
    }

    if (modules.services) {
      urls.push(...services
        .filter(service => service.slug && service.is_published !== false && !service.noindex)
        .map(service => ({
          path: `/services/${encodeURIComponent(service.slug)}`,
          lastmod: service.updated_at,
          changefreq: 'monthly' as const,
          priority: '0.7',
        })))
    }

    const entries = urls.map((url) => {
      const lastmod = validLastmod(url.lastmod)
      return [
        '  <url>',
        `    <loc>${xmlEscape(`${baseUrl}${url.path}`)}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        `    <changefreq>${url.changefreq}</changefreq>`,
        `    <priority>${url.priority}</priority>`,
        '  </url>',
      ].join('\n')
    }).join('\n')

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      entries,
      '</urlset>',
      '',
    ].join('\n')
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Sitemap data is temporarily unavailable',
      cause: error,
    })
  }
})

