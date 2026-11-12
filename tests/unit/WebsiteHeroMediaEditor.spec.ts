// @vitest-environment happy-dom
import { mount, flushPromises } from '@vue/test-utils'
import { computed, ref, watch } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MediaEditor from '~/components/admin/WebsiteHeroMediaEditor.vue'
import Hero from '~/components/storefront/home/Hero.vue'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'

const { uploadDraftAsset } = vi.hoisted(() => ({ uploadDraftAsset: vi.fn() }))
vi.mock('~/composables/useWebsiteEditorDraft', async importOriginal => ({ ...await importOriginal<typeof import('~/composables/useWebsiteEditorDraft')>(), useWebsiteEditorDraft: () => ({ uploadDraftAsset }) }))
beforeEach(() => {
  uploadDraftAsset.mockReset()
  for (const [key, value] of Object.entries({ computed, ref, watch })) vi.stubGlobal(key, value)
})
afterEach(() => vi.unstubAllGlobals())
const initial = () => normalizeWebsiteEditorDraft({ hero_title: 'Merchant headline', section_designs: { home: { hero: { layout: 'media-left' } } } } as any)
const mountEditor = () => mount(MediaEditor, { props: { modelValue: initial() }, global: { stubs: { AdminMediaUploader: true, AdminWebsiteEditorMediaLibrary: true } } })

describe('home hero media editing', () => {
  it('uploads through the private hero endpoint and preserves changes made during the upload', async () => {
    let finish!: (value: any) => void
    uploadDraftAsset.mockReturnValue(new Promise(resolve => { finish = resolve }))
    const wrapper = mountEditor()
    const file = new File(['image'], 'hero.png', { type: 'image/png' })
    wrapper.findComponent({ name: 'AdminMediaUploader' }).vm.$emit('select', file)
    await wrapper.setProps({ modelValue: { ...initial(), hero_title: 'Latest headline' } })
    finish({ id: 17, collection: 'hero', url: '/private/hero.png', mime_type: 'image/png' })
    await flushPromises()
    expect(uploadDraftAsset).toHaveBeenCalledWith('hero', file)
    const next = wrapper.emitted('update:modelValue')!.at(-1)![0] as any
    expect(next).toMatchObject({ hero_title: 'Latest headline', hero_media_id: 17, hero_image_url: '/private/hero.png', hero_media_mime: 'image/png' })
    expect(next.section_designs).toEqual(initial().section_designs)
    wrapper.unmount()
  })
  it('supports selecting existing media and removing it without resetting layout', async () => {
    const wrapper = mountEditor()
    wrapper.findComponent({ name: 'AdminMediaUploader' }).vm.$emit('browse')
    await flushPromises()
    wrapper.findComponent({ name: 'AdminWebsiteEditorMediaLibrary' }).vm.$emit('selected', { id: 18, collection: 'hero', url: '/hero.webm', mime_type: 'video/webm' })
    await flushPromises()
    const next = wrapper.emitted('update:modelValue')!.at(-1)![0] as any
    expect(next.hero_media_mime).toBe('video/webm')
    await wrapper.setProps({ modelValue: next })
    wrapper.findComponent({ name: 'AdminMediaUploader' }).vm.$emit('remove')
    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toMatchObject({ hero_media_id: null, hero_image_url: null, hero_media_mime: null, section_designs: initial().section_designs })
    wrapper.unmount()
  })
  it('keeps existing media when an upload fails and shows a recoverable error', async () => {
    uploadDraftAsset.mockRejectedValue(new Error('Please retry this upload'))
    const wrapper = mountEditor()
    wrapper.findComponent({ name: 'AdminMediaUploader' }).vm.$emit('select', new File(['x'], 'hero.png'))
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Please retry')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
  it.each(['split', 'media-left', 'media-right'])('keeps a media area for an empty %s editor preview without publishing the placeholder', async layout => {
    const config = { ...initial(), section_designs: { home: { hero: { layout } } } }
    const wrapper = mount(Hero, { props: { siteConfig: config as any, editorPreview: true }, global: { stubs: { NuxtLink: true, Icon: true } } })
    expect(wrapper.find('.builtin-hero-side__inner--media').exists()).toBe(true)
    expect(wrapper.get('[data-editor-empty-media]').text()).toContain('Add hero media')
    expect(wrapper.get('section').classes()).toContain(`builtin-hero-side--${layout}`)
    await wrapper.setProps({ editorPreview: false })
    expect(wrapper.find('[data-editor-empty-media]').exists()).toBe(false)
    await wrapper.setProps({ siteConfig: { ...config, hero_image_url: '/hero.png', hero_media_mime: 'image/png' } as any })
    expect(wrapper.get('.builtin-hero-side__media img').attributes('src')).toBe('/hero.png')
    wrapper.unmount()
  })
})
