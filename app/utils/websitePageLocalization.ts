import type { WebsitePageDocument } from '~/types/websitePage'

// Editor documents are JSON data and may be wrapped in Vue reactive proxies.
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T }

function mergeLocalizedItems(defaultItems: unknown[], localizedItems: unknown[]) {
  const items = clone(defaultItems)

  localizedItems.forEach((localizedItem, index) => {
    const defaultItem = items[index]
    if (!defaultItem || typeof defaultItem !== 'object' || !localizedItem || typeof localizedItem !== 'object') return
    items[index] = { ...defaultItem, ...localizedItem }
  })

  return items
}

function mergeLocalizedContent(content: Record<string, any>, localized: Record<string, any>) {
  const merged = clone(content)

  for (const [key, value] of Object.entries(localized)) {
    if (key === 'items' && Array.isArray(value)) {
      merged[key] = mergeLocalizedItems(Array.isArray(merged[key]) ? merged[key] : [], value)
    } else if (value && typeof value === 'object' && !Array.isArray(value) && merged[key] && typeof merged[key] === 'object' && !Array.isArray(merged[key])) {
      merged[key] = { ...merged[key], ...value }
    } else {
      merged[key] = value
    }
  }

  return merged
}

export function applyWebsitePageLocale(document: WebsitePageDocument, locale: string): WebsitePageDocument {
  const localized = document.localized_content[locale]
  const resolved = clone(document)

  if (!localized) return resolved

  resolved.seo = { ...resolved.seo, ...localized.seo }
  resolved.blocks = resolved.blocks.map((block) => {
    const localizedContent = localized.blocks?.[block.id]?.content
    if (!localizedContent) return block

    return {
      ...block,
      content: mergeLocalizedContent(block.content, localizedContent),
    }
  })

  return resolved
}
