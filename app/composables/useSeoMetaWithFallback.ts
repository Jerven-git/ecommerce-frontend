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

export function useEntitySeo(entity: MaybeRefOrGetter<EntityLike | null | undefined>) {
  const { siteConfig } = useSiteConfig()

  const seo = computed(() => {
    const e = toValue(entity) ?? ({} as EntityLike)
    const cfg = siteConfig.value ?? ({} as Partial<SiteConfig>)

    const title = firstNonEmpty(e.seo_title, e.title, e.name, cfg.default_seo_title, cfg.site_name)
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
    const robots = e.noindex ? 'noindex,nofollow' : undefined

    return { title, description, ogImage, robots }
  })

  useSeoMeta({
    title: () => seo.value.title,
    description: () => seo.value.description,
    ogTitle: () => seo.value.title,
    ogDescription: () => seo.value.description,
    ogImage: () => seo.value.ogImage,
    twitterTitle: () => seo.value.title,
    twitterDescription: () => seo.value.description,
    twitterImage: () => seo.value.ogImage,
    twitterCard: 'summary_large_image',
    robots: () => seo.value.robots,
  })
}

export function useStaticPageSeo(slug: string, fallback?: { title?: string; description?: string }) {
  const { siteConfig } = useSiteConfig()

  const seo = computed(() => {
    const cfg = siteConfig.value ?? ({} as Partial<SiteConfig>)
    const page: SeoFields = (cfg.pages_seo?.[slug] ?? {}) as SeoFields

    const title = firstNonEmpty(page.seo_title, fallback?.title, cfg.default_seo_title, cfg.site_name)
    const description = firstNonEmpty(
      page.seo_description,
      fallback?.description,
      cfg.default_seo_description,
    )
    const ogImage = firstNonEmpty(page.og_image_url, cfg.default_og_image_url)
    const robots = page.noindex ? 'noindex,nofollow' : undefined

    return { title, description, ogImage, robots }
  })

  useSeoMeta({
    title: () => seo.value.title,
    description: () => seo.value.description,
    ogTitle: () => seo.value.title,
    ogDescription: () => seo.value.description,
    ogImage: () => seo.value.ogImage,
    twitterTitle: () => seo.value.title,
    twitterDescription: () => seo.value.description,
    twitterImage: () => seo.value.ogImage,
    twitterCard: 'summary_large_image',
    robots: () => seo.value.robots,
  })
}
