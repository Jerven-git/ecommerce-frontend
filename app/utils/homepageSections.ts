import type { HomepageSectionId, HomepageSectionSetting } from '~/composables/useSiteConfig'

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionSetting[] = [
  { id: 'hero', visible: true },
  { id: 'featured-products', visible: true },
  { id: 'showcase', visible: true },
  { id: 'watch-shop', visible: true },
  { id: 'best-sellers', visible: true },
  { id: 'how-it-works', visible: true },
  { id: 'features', visible: true },
  { id: 'stats', visible: true },
  { id: 'statement', visible: true },
  { id: 'newsletter', visible: true },
]

export const HOMEPAGE_SECTION_IDS: HomepageSectionId[] = DEFAULT_HOMEPAGE_SECTIONS.map(section => section.id)

export const HOMEPAGE_SECTION_LABELS: Record<HomepageSectionId, string> = {
  hero: 'Hero',
  'featured-products': 'Featured products',
  showcase: 'Showcase',
  'watch-shop': 'Watch & Shop',
  'best-sellers': 'Best sellers',
  'how-it-works': 'How it works',
  features: 'Features',
  stats: 'Stats',
  statement: 'Statement',
  newsletter: 'Newsletter',
}

const allowedIds = new Set<HomepageSectionId>(HOMEPAGE_SECTION_IDS)

export function normalizeHomepageSections(value?: HomepageSectionSetting[] | null): HomepageSectionSetting[] {
  const supplied = Array.isArray(value)
    ? value.filter(section => section && allowedIds.has(section.id))
    : []
  const seen = new Set<HomepageSectionId>()
  const normalized: HomepageSectionSetting[] = []

  for (const section of supplied) {
    if (seen.has(section.id)) continue
    seen.add(section.id)
    normalized.push({ id: section.id, visible: section.visible !== false })
  }

  for (const section of DEFAULT_HOMEPAGE_SECTIONS) {
    if (!seen.has(section.id)) normalized.push({ ...section })
  }

  return normalized
}
