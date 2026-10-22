import { describe, expect, it } from 'vitest'
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  normalizeHomepageSections,
} from '~/utils/homepageSections'

describe('normalizeHomepageSections', () => {
  it('preserves supplied order and appends newly introduced sections', () => {
    const normalized = normalizeHomepageSections([
      { id: 'newsletter', visible: false },
      { id: 'hero', visible: true },
    ])

    expect(normalized.slice(0, 2)).toEqual([
      { id: 'newsletter', visible: false },
      { id: 'hero', visible: true },
    ])
    expect(normalized).toHaveLength(DEFAULT_HOMEPAGE_SECTIONS.length)
    expect(new Set(normalized.map(section => section.id)).size).toBe(normalized.length)
  })

  it('drops unknown and duplicate section identifiers', () => {
    const normalized = normalizeHomepageSections([
      { id: 'hero', visible: false },
      { id: 'hero', visible: true },
      { id: 'unknown-section', visible: true },
    ] as never)

    expect(normalized.filter(section => section.id === 'hero')).toEqual([
      { id: 'hero', visible: false },
    ])
    expect(normalized.some(section => String(section.id) === 'unknown-section')).toBe(false)
  })

  it('returns independent defaults instead of exposing shared mutable state', () => {
    const first = normalizeHomepageSections()
    first[0]!.visible = false

    expect(normalizeHomepageSections()[0]!.visible).toBe(true)
    expect(DEFAULT_HOMEPAGE_SECTIONS[0]!.visible).toBe(true)
  })
})
