import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWebsitePageBlockCatalog } from '~/composables/useWebsitePageBlockCatalog'
import type { WebsitePageBlockDefinitionResponse } from '~/types/websitePage'

const response: WebsitePageBlockDefinitionResponse = {
  schema_version: 1,
  data: [
    {
      type: 'hero',
      label: 'Hero',
      description: 'Introduce the page.',
      icon: 'heroicons:photo',
      content_mode: 'manual',
      variants: ['centered', 'split'],
      default_variant: 'centered',
      content_keys: ['heading', 'body'],
      settings_keys: ['media_id'],
      defaults: {
        content: { heading: '', body: '', primary_action: { label: '', link: '' }, secondary_action: { label: '', link: '' } },
        settings: { media_id: null, overlay_opacity: 55 },
      },
      editor: {
        fields: [],
        settings: [{ key: 'overlay_opacity', label: 'Overlay strength', control: 'number', min: 0, max: 100, step: 5 }],
        media: { setting: 'media_id', alt_setting: null },
        action: null,
        actions: [{ key: 'primary_action', label: 'Primary button' }, { key: 'secondary_action', label: 'Secondary button' }],
        repeater: null,
        dynamic: null,
      },
    },
    {
      type: 'features',
      label: 'Features',
      description: 'Build feature cards.',
      icon: 'heroicons:squares-2x2',
      content_mode: 'manual',
      variants: ['grid', 'cards'],
      default_variant: 'grid',
      content_keys: ['heading', 'subtitle', 'items'],
      settings_keys: ['columns'],
      defaults: { content: { heading: '', subtitle: '', items: [] }, settings: { columns: 3 } },
      editor: {
        fields: [],
        settings: [],
        media: null,
        action: null,
        actions: [],
        repeater: {
          label: 'Feature cards',
          item_label: 'Feature card',
          max_items: 2,
          default_item: { icon: null, title: '', description: '', link: null },
          fields: [
            { key: 'title', label: 'Title', control: 'text', max: 150 },
            { key: 'description', label: 'Description', control: 'textarea', max: 1000 },
            { key: 'link', label: 'Link (optional)', control: 'text', max: 500 },
          ],
        },
        dynamic: null,
      },
    },
    {
      type: 'product-list',
      label: 'Products',
      description: 'Connect existing products.',
      icon: 'heroicons:cube',
      content_mode: 'connected',
      variants: ['grid'],
      default_variant: 'grid',
      content_keys: ['heading', 'body'],
      settings_keys: ['source', 'item_ids', 'limit'],
      defaults: { content: { heading: '', body: '' }, settings: { source: 'recent', item_ids: [], limit: 8 } },
      editor: {
        fields: [],
        settings: [],
        media: null,
        action: null,
        actions: [],
        repeater: null,
        dynamic: { sources: ['recent', 'selected'], default_source: 'recent', supports_category: false, supports_selection: true },
      },
    },
  ],
}

describe('useWebsitePageBlockCatalog', () => {
  beforeEach(() => {
    vi.stubGlobal('useNuxtApp', () => ({
      $apiFetch: vi.fn().mockResolvedValue(response),
    }))
  })

  it('creates blank sections from the server contract without sharing nested defaults', async () => {
    const catalog = useWebsitePageBlockCatalog()
    await catalog.load()

    const first = catalog.createBlock('hero')
    const second = catalog.createBlock('hero')
    first.content.heading = 'Changed locally'

    expect(first.schema_version).toBe(1)
    expect(first.variant).toBe('centered')
    expect(second.content.heading).toBe('')
    expect(catalog.label('hero')).toBe('Hero')
    expect(catalog.actions(first)).toHaveLength(2)
    expect(catalog.settings(first)[0]?.key).toBe('overlay_opacity')
  })

  it('uses server-provided connected-content sources and defaults', async () => {
    const catalog = useWebsitePageBlockCatalog()
    await catalog.load()
    const block = catalog.createBlock('product-list')

    expect(catalog.isConnected(block)).toBe(true)
    expect(catalog.dynamicSources(block)).toEqual(['recent', 'selected'])
    expect(block.settings).toEqual({ source: 'recent', item_ids: [], limit: 8 })
  })

  it('adds, limits, reorders, and removes repeater items from the server contract', async () => {
    const catalog = useWebsitePageBlockCatalog()
    await catalog.load()
    const block = catalog.createBlock('features')

    expect(catalog.canAddRepeaterItem(block)).toBe(true)
    catalog.addRepeaterItem(block)
    block.content.items[0].title = 'First'
    catalog.addRepeaterItem(block)
    expect(block.content.items[1].title).toBe('')
    block.content.items[1].title = 'Second'
    catalog.addRepeaterItem(block)

    expect(block.content.items).toHaveLength(2)
    expect(catalog.canAddRepeaterItem(block)).toBe(false)

    catalog.moveRepeaterItem(block, 1, -1)
    expect(block.content.items.map((item: Record<string, any>) => item.title)).toEqual(['Second', 'First'])

    catalog.removeRepeaterItem(block, 0)
    expect(block.content.items.map((item: Record<string, any>) => item.title)).toEqual(['First'])
    expect(catalog.canAddRepeaterItem(block)).toBe(true)
  })
})
