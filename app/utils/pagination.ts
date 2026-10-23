export const PAGINATION_ELLIPSIS = '…' as const

export type PaginationItem = number | typeof PAGINATION_ELLIPSIS

/**
 * Build a compact, stable page list around the current page.
 *
 * The first and last pages are always retained. Invalid API values are
 * normalised so consumers never render page zero or a current page beyond the
 * available range.
 */
export function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  const total = Math.max(1, Math.trunc(totalPages) || 1)
  const current = Math.min(total, Math.max(1, Math.trunc(currentPage) || 1))

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages: PaginationItem[] = [1]
  if (current > 3) pages.push(PAGINATION_ELLIPSIS)

  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) {
    pages.push(page)
  }

  if (current < total - 2) pages.push(PAGINATION_ELLIPSIS)
  pages.push(total)

  return pages
}
