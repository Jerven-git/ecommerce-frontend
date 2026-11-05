import type { WebsiteNavigationItem } from '~/composables/useSiteConfig'

/** Resolve private editor page references for its preview, using this store's pages. */
export function resolveNavigationPages(
  items: readonly WebsiteNavigationItem[],
  pages: readonly { uuid: string; path: string }[],
): WebsiteNavigationItem[] {
  const paths = new Map(pages.map(page => [page.uuid, page.path]))
  const resolve = (entries: readonly WebsiteNavigationItem[]): WebsiteNavigationItem[] => entries.flatMap(item => {
    const children = resolve(item.children ?? [])
    if (item.kind !== 'page') return [{ ...item, children }]
    const path = paths.get(item.value ?? '')
    return path ? [{ ...item, kind: 'link' as const, value: path, children }] : []
  })
  return resolve(items)
}

/** Use the same safe destination schemes as the website navigation contract. */
export function storefrontNavigationLinks(items: readonly WebsiteNavigationItem[]) {
  const links: Array<{ id: string; label: string; to: string }> = []
  const visit = (entries: readonly WebsiteNavigationItem[]) => {
    for (const item of entries) {
      if (!item.visible) continue
      const value = item.value ?? ''
      if (item.kind === 'link' && item.label.trim()
        && ((value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')) || value.startsWith('#') || /^(https?:\/\/|mailto:|tel:)/i.test(value))) {
        links.push({ id: item.id, label: item.label, to: value })
      }
      visit(item.children ?? [])
    }
  }
  visit(items)
  return links
}
