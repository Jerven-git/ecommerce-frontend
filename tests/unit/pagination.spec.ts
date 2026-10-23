import { describe, expect, it } from 'vitest'
import { getPaginationItems, PAGINATION_ELLIPSIS } from '~/utils/pagination'

describe('getPaginationItems', () => {
  it('returns every page when the result fits without truncation', () => {
    expect(getPaginationItems(3, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('keeps the active neighbourhood and both boundaries', () => {
    expect(getPaginationItems(5, 10)).toEqual([
      1,
      PAGINATION_ELLIPSIS,
      4,
      5,
      6,
      PAGINATION_ELLIPSIS,
      10,
    ])
  })

  it('does not add an ellipsis when the neighbouring range reaches an edge', () => {
    expect(getPaginationItems(2, 10)).toEqual([1, 2, 3, PAGINATION_ELLIPSIS, 10])
    expect(getPaginationItems(9, 10)).toEqual([1, PAGINATION_ELLIPSIS, 8, 9, 10])
  })

  it('normalises invalid and out-of-range API values', () => {
    expect(getPaginationItems(0, 0)).toEqual([1])
    expect(getPaginationItems(99, 10)).toEqual([1, PAGINATION_ELLIPSIS, 9, 10])
  })
})
