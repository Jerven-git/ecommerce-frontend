import { describe, expect, it } from 'vitest'
import { websitePageSectionStyle } from '~/utils/websitePageDesign'
import { websitePageExampleBlock, websitePageStarterContent } from '~/utils/websitePageStarters'
import type { WebsitePageBlock, WebsitePageBlockDefinition } from '~/types/websitePage'

const block = (design: Record<string, unknown>): WebsitePageBlock => ({ id: 'style', type: 'hero', schema_version: 1, visible: true, variant: 'centered', content: {}, settings: { design } })

describe('Website page section presentation', () => {
  it('preserves legacy layouts when no design overrides were saved', () => {
    expect(websitePageSectionStyle(block({}))).toEqual({})
  })

  it('applies bounded appearance values and rejects arbitrary CSS', () => {
    const style = websitePageSectionStyle(block({ background: 'url(https://example.test)', text_color: '#112233', alignment: 'right', width: 'wide', padding_top: -10, padding_bottom: 1000, corner_radius: 8 }))
    expect(style['background-color']).toBeUndefined()
    expect(style.color).toBe('#112233')
    expect(style['--section-width']).toBe('80rem')
    expect(style['--section-align']).toBe('right')
    expect(style['padding-top']).toBe('0px')
    expect(style['padding-bottom']).toBe('160px')
    expect(style['border-radius']).toBe('8px')
    expect(websitePageSectionStyle(block({ width: 'constructor', padding_top: '100px', alignment: 'absolute' }))).toEqual({})
  })

  it('creates independent editable starter content without fabricated figures', () => {
    const definition = { type: 'stats', defaults: { content: { heading: '', items: [] }, settings: { columns: 3 } }, editor: { actions: [] } } as unknown as WebsitePageBlockDefinition
    const content = websitePageStarterContent(definition)
    expect(content.heading).toBeTruthy()
    expect(content.items).toHaveLength(3)
    expect(content.items.every((item: any) => item.value === '')).toBe(true)
    content.items[0].value = 'Merchant value'
    expect(definition.defaults.content.items).toEqual([])
    expect(websitePageExampleBlock(definition, 'band').variant).toBe('band')
  })
})
