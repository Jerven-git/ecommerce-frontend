import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import registry from '~/utils/builtinSectionRegistry.json'
import { builtinSectionAttributes, builtinSectionDefinition, normalizeBuiltinSectionDesigns } from '~/utils/builtinSectionDesigns'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'
import { websiteEditorChangedAreas } from '~/utils/websiteEditorPublishing'
import { websiteEditorValidationTarget } from '~/utils/websiteEditorValidation'

describe('built-in section design contract', () => {
  it('keeps newsletter colors readable on light and dark backgrounds and preserves explicit text choices', () => {
    const attrs = (design: Record<string, any>) => builtinSectionAttributes({ section_designs: { home: { newsletter: { design } } } }, 'home', 'newsletter')
    expect(attrs({}).style['--newsletter-foreground']).toBe('#ffffff')
    expect(attrs({ background: '#ffffff' }).style['--newsletter-foreground']).toBe('#111827')
    expect(attrs({ background: '#102030' }).style['--newsletter-foreground']).toBe('#ffffff')
    expect(attrs({ background: '#ffffff', text_color: '#123456', alignment: 'center' }).style['--newsletter-foreground']).toBe('#123456')
    expect(attrs({ alignment: 'center' })['data-builtin-alignment']).toBe('center')
    expect(attrs({})['data-builtin-alignment']).toBe('default')
  })
  it('round trips Contact typography and exposes safe CSS for both preview and public rendering', () => {
    const draft = normalizeWebsiteEditorDraft({ section_designs: { contact: { 'contact-content': { layout: 'split', typography: { body: 14, field: 15, page_heading: 32, section_heading: 20 } } } } })
    const reloaded = normalizeWebsiteEditorDraft({}, JSON.parse(JSON.stringify(draft)))
    expect(reloaded.section_designs).toEqual(draft.section_designs)
    expect(builtinSectionAttributes(reloaded, 'contact', 'contact-content').style).toMatchObject({ '--contact-body-size': '14px', '--contact-field-size': '15px', '--contact-page-heading-size': '32px', '--contact-section-heading-size': '20px' })
    expect(normalizeBuiltinSectionDesigns({ contact: { 'contact-content': { typography: { body: 999, field: -1, page_heading: NaN, section_heading: 'url(x)', position: 'fixed' } } }, home: { hero: { typography: { body: 15 } } } })).toEqual({ contact: { 'contact-content': { typography: { body: 22, field: 14 } } } })
  })
  it('round trips a bounded About image width and applies it to shared render attributes', () => {
    const draft = normalizeWebsiteEditorDraft({ section_designs: { about: { 'about-content': { layout: 'stacked', image_width: 45 } } } })
    const reloaded = normalizeWebsiteEditorDraft({}, JSON.parse(JSON.stringify(draft)))
    expect(reloaded.section_designs?.about?.['about-content']?.image_width).toBe(45)
    expect(builtinSectionAttributes(reloaded, 'about', 'about-content').style['--builtin-story-image-width']).toBe('45%')
    expect(builtinSectionAttributes(null, 'about', 'about-content').style['--builtin-story-image-width']).toBe('70%')
    expect(normalizeBuiltinSectionDesigns({ about: { 'about-content': { image_width: 200 } }, home: { hero: { image_width: 50 } } })).toEqual({ about: { 'about-content': { image_width: 100 } } })
    expect(normalizeBuiltinSectionDesigns({ about: { 'about-content': { image_width: -1 } } })).toEqual({ about: { 'about-content': { image_width: 25 } } })
    expect(normalizeBuiltinSectionDesigns({ about: { 'about-content': { image_width: NaN } } })).toEqual({})
  })
  it('keeps frontend and backend layout registries identical', () => {
    expect(registry).toEqual(JSON.parse(readFileSync(new URL('../../../ssu-backend/app/Support/WebsiteEditor/builtin-section-designs.json', import.meta.url), 'utf8')))
  })
  it('retains only registered layouts and bounded CSS values', () => {
    expect(normalizeBuiltinSectionDesigns({ home: { hero: { layout: 'media-right', design: { background: 'url(example)', text_color: '#112233', width: 'wide', alignment: 'center', padding_top: -8, padding_bottom: 1000, corner_radius: 80, position: 'fixed' } }, unknown: { layout: 'split' } }, admin: { hero: { layout: 'split' } } })).toEqual({ home: { hero: { layout: 'media-right', design: { text_color: '#112233', width: 'wide', alignment: 'center', padding_top: 0, padding_bottom: 160, corner_radius: 48 } } } })
    expect(normalizeBuiltinSectionDesigns({ home: { hero: { layout: 'band', design: { width: 'constructor', padding_top: NaN } }, stats: { layout: 'default', design: {} } } })).toEqual({})
    expect(builtinSectionDefinition('home', 'constructor')).toBeUndefined()
    expect(builtinSectionDefinition('constructor', 'prototype')).toBeUndefined()
  })
  it('round trips normalized designs without changing section content', () => {
    const draft = normalizeWebsiteEditorDraft({ hero_title: 'Merchant heading', section_designs: { home: { hero: { layout: 'split', design: { padding_top: 0 } } } } })
    const reloaded = normalizeWebsiteEditorDraft({}, JSON.parse(JSON.stringify(draft)))
    expect(reloaded.section_designs).toEqual(draft.section_designs)
    expect(reloaded.hero_title).toBe('Merchant heading')
  })
  it('previews old snapshots with their original theme defaults', () => {
    const current = { hero_title: 'Current', section_designs: { home: { hero: { layout: 'media-left' } } } }
    expect(normalizeWebsiteEditorDraft(current).section_designs).toEqual(current.section_designs)
    expect(normalizeWebsiteEditorDraft(current, { hero_title: 'Old version' }).section_designs).toEqual({})
  })
  it('uses the same safe render attributes for published and preview data', () => {
    const config = { theme_layout: { id: 'classic' }, section_designs: { home: { stats: { layout: 'band', design: { background: '#112233', text_color: '#ffffff', width: 'wide', padding_top: 24 } } } } }
    const live = builtinSectionAttributes(config, 'home', 'stats')
    expect(builtinSectionAttributes(JSON.parse(JSON.stringify(config)), 'home', 'stats')).toEqual(live)
    expect(live['data-builtin-layout']).toBe('band')
    expect(live.style).toMatchObject({ '--builtin-background': '#112233', '--section-text': '#ffffff', '--section-width': '80rem', '--builtin-padding-top': '24px' })
    expect(live.style['padding-top']).toBeUndefined()
    expect(builtinSectionAttributes(null, 'home', 'hero')['data-builtin-layout']).toBe('default')
  })
  it('reports design edits and validation in their owning page and section', () => {
    const before = normalizeWebsiteEditorDraft({})
    const after = structuredClone(before)
    after.section_designs = { shop: { 'shop-content': { layout: 'list' } }, home: { stats: { layout: 'band' } } }
    expect(websiteEditorChangedAreas(before, after).map(({ id, page, section }) => ({ id, page, section }))).toEqual([
      { id: 'design-home-stats', page: 'home', section: 'stats' }, { id: 'design-shop-shop-content', page: 'shop', section: 'shop-content' },
    ])
    expect(websiteEditorValidationTarget({ 'payload.section_designs.shop.shop-content.design.background': ['Invalid color'] })).toEqual({ page: 'shop', section: 'shop-content' })
  })
})
