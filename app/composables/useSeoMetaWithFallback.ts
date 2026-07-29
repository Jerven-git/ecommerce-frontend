import type { SiteConfig } from '~/composables/useSiteConfig'

/**
 * Apply SEO meta tags with a fallback chain:
 *   entity-level field -> entity title/excerpt/cover -> site-wide default.
 *
 * Pass either an entity (Product/Post/Service detail) for `useEntitySeo`, or a
 * page slug for `useStaticPageSeo` that reads `siteConfig.pages_seo[slug]`.
 */

type SeoFields = {
  seo_title?: string | null
  seo_description?: string | null
  og_image_url?: string | null
  noindex?: boolean | null
}

type EntityLike = SeoFields & {
  title?: string | null
  name?: string | null
  excerpt?: string | null
  description?: string | null
  cover_image_url?: string | null
  image_url?: string | null
}

function firstNonEmpty(...values: Array<string | null | undefined>): string | undefined {
  for (const v of values) {
    if (v != null && String(v).trim().length > 0) return String(v)
  }
  return undefined
}

function withSiteName(title: string | undefined, siteName: string | undefined): string | undefined {
  if (!title) return siteName
  if (!siteName || title.toLocaleLowerCase().includes(siteName.toLocaleLowerCase())) return title
  return `${title} | ${siteName}`
}

function configuredTitle(
  configured: string | null | undefined,
  fallback: string | null | undefined,
  siteDefault: string | null | undefined,
  siteName: string | null | undefined,
): string | undefined {
  const explicit = firstNonEmpty(configured)
  if (explicit) return explicit

  const fallbackTitle = firstNonEmpty(fallback)
  if (fallbackTitle) return withSiteName(fallbackTitle, firstNonEmpty(siteName))

  return firstNonEmpty(siteDefault, siteName)
}

/**
 * Build the canonical URL for the current request: `<canonical_base_url><path>`
 * with a trailing-slash on the base stripped. Returns undefined when the base
 * URL isn't configured — better to omit the tag than emit a bad one.
 */
function buildCanonical(
  cfg: Partial<SiteConfig>,
  path: string,
  requestHostname: string,
): string | undefined {
  if (isLocalSeoHost(requestHostname)) return undefined

  const base = cfg.canonical_base_url?.trim()
  if (!base) return undefined
  const trimmed = base.replace(/\/$/, '')
  const normalisedPath = path.startsWith('/') ? path : `/${path}`
  return `${trimmed}${normalisedPath}`
}

export function useEntitySeo(entity: MaybeRefOrGetter<EntityLike | null | undefined>) {
  const { siteConfig } = useSiteConfig()
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const requestHostname = useRequestURL().hostname

  const seo = computed(() => {
    const e = toValue(entity) ?? ({} as EntityLike)
    const cfg = siteConfig.value ?? ({} as Partial<SiteConfig>)

    const title = configuredTitle(
      e.seo_title,
      firstNonEmpty(e.title, e.name),
      cfg.default_seo_title,
      cfg.site_name,
    )
    const description = firstNonEmpty(
      e.seo_description,
      e.excerpt,
      e.description,
      cfg.default_seo_description,
    )
    const ogImage = firstNonEmpty(
      e.og_image_url,
      e.cover_image_url,
      e.image_url,
      cfg.default_og_image_url,
    )
    const indexingDisabled = !isSeoIndexingEnabled(runtimeConfig.public.seoIndexingEnabled)
    const robots = indexingDisabled || e.noindex ? 'noindex,nofollow,noarchive' : undefined
    const canonical = buildCanonical(cfg, route.path, requestHostname)
    const siteName = firstNonEmpty(cfg.site_name)

    return { title, description, ogImage, robots, canonical, siteName }
  })

  useSeoMeta({
    title: () => seo.value.title,
    description: () => seo.value.description,
    ogTitle: () => seo.value.title,
    ogDescription: () => seo.value.description,
    ogImage: () => seo.value.ogImage,
    ogUrl: () => seo.value.canonical,
    ogSiteName: () => seo.value.siteName,
    ogType: 'website',
    twitterTitle: () => seo.value.title,
    twitterDescription: () => seo.value.description,
    twitterImage: () => seo.value.ogImage,
    twitterCard: 'summary_large_image',
    robots: () => seo.value.robots,
  })

  useHead({
    link: () => seo.value.canonical
      ? [{ rel: 'canonical', href: seo.value.canonical }]
      : [],
  })
}

export function useStaticPageSeo(slug: string, fallback?: { title?: string; description?: string }) {
  const { siteConfig } = useSiteConfig()
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const requestHostname = useRequestURL().hostname

  const seo = computed(() => {
    const cfg = siteConfig.value ?? ({} as Partial<SiteConfig>)
    const page: SeoFields = (cfg.pages_seo?.[slug] ?? {}) as SeoFields

    const defaultPageTitles: Record<string, string> = {
      about: 'About',
      blog: 'Blog',
      contact: 'Contact',
      home: '',
      services: 'Services',
      shop: 'Shop',
    }
    const title = configuredTitle(
      page.seo_title,
      fallback?.title ?? defaultPageTitles[slug],
      cfg.default_seo_title,
      cfg.site_name,
    )
    const description = firstNonEmpty(
      page.seo_description,
      fallback?.description,
      cfg.default_seo_description,
    )
    const ogImage = firstNonEmpty(page.og_image_url, cfg.default_og_image_url)
    const indexingDisabled = !isSeoIndexingEnabled(runtimeConfig.public.seoIndexingEnabled)
    const robots = indexingDisabled || page.noindex ? 'noindex,nofollow,noarchive' : undefined
    const canonical = buildCanonical(cfg, route.path, requestHostname)
    const siteName = firstNonEmpty(cfg.site_name)

    return { title, description, ogImage, robots, canonical, siteName }
  })

  useSeoMeta({
    title: () => seo.value.title,
    description: () => seo.value.description,
    ogTitle: () => seo.value.title,
    ogDescription: () => seo.value.description,
    ogImage: () => seo.value.ogImage,
    ogUrl: () => seo.value.canonical,
    ogSiteName: () => seo.value.siteName,
    ogType: 'website',
    twitterTitle: () => seo.value.title,
    twitterDescription: () => seo.value.description,
    twitterImage: () => seo.value.ogImage,
    twitterCard: 'summary_large_image',
    robots: () => seo.value.robots,
  })

  useHead({
    link: () => seo.value.canonical
      ? [{ rel: 'canonical', href: seo.value.canonical }]
      : [],
  })
}
