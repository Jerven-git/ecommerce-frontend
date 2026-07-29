import type { SiteConfig } from '~/composables/useSiteConfig'
import type { JsonLdValue } from '~/composables/useJsonLd'

export interface BreadcrumbItem {
  name: string
  path: string
}

export function seoBaseUrl(
  config: Partial<SiteConfig>,
  requestUrl: URL,
): string {
  const canonical = config.canonical_base_url?.trim()
  if (!isLocalSeoHost(requestUrl.hostname) && canonical) {
    return canonical.replace(/\/$/, '')
  }
  return requestUrl.origin.replace(/\/$/, '')
}

export function seoUrl(baseUrl: string, path: string): string {
  const normalisedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalisedPath}`
}

export function organizationJsonLd(
  config: Partial<SiteConfig>,
  baseUrl: string,
): JsonLdValue | null {
  if (!config.site_name) return null

  const contacts = [
    ...(config.contact_entries ?? []),
    { label: 'General', email: config.contact_email, phone: config.contact_phone },
  ]
    .filter(entry => entry.email || entry.phone)
    .filter((entry, index, entries) =>
      entries.findIndex(candidate =>
        candidate.email === entry.email && candidate.phone === entry.phone
      ) === index
    )

  const sameAs = (config.social_links ?? [])
    .map(link => link.url?.trim())
    .filter((url): url is string => Boolean(url))

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: config.site_name,
    url: `${baseUrl}/`,
    ...(config.logo_url
      ? {
          logo: {
            '@type': 'ImageObject',
            url: config.logo_url,
          },
        }
      : {}),
    ...(contacts.length
      ? {
          contactPoint: contacts.map(contact => ({
            '@type': 'ContactPoint',
            contactType: contact.label || 'customer service',
            ...(contact.email ? { email: contact.email } : {}),
            ...(contact.phone ? { telephone: contact.phone } : {}),
          })),
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}

export function breadcrumbJsonLd(
  baseUrl: string,
  items: BreadcrumbItem[],
): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: seoUrl(baseUrl, item.path),
    })),
  }
}
