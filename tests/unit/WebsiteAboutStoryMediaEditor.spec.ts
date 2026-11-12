// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Editor from '~/components/admin/WebsiteAboutStoryMediaEditor.vue'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'
import { websiteEditorChangedAreas } from '~/utils/websiteEditorPublishing'
const { uploadDraftAsset } = vi.hoisted(() => ({ uploadDraftAsset: vi.fn() }))
vi.mock('~/composables/useWebsiteEditorDraft', async importOriginal => ({ ...await importOriginal<typeof import('~/composables/useWebsiteEditorDraft')>(), useWebsiteEditorDraft: () => ({ uploadDraftAsset }) }))
const draft = () => normalizeWebsiteEditorDraft({ about_image_url: '/cover.png' } as any, { about_media_id: 9, about_image_url: '/cover.png', about_content: 'Merchant story', section_designs: { about: { 'about-content': { layout: 'image-right' } } } })
const render = () => mount(Editor, { props: { modelValue: draft() }, global: { stubs: { AdminMediaUploader: true, AdminWebsiteEditorMediaLibrary: true } } })
describe('independent About story image', () => {
  it('uploads to its own slot while preserving the cover and chosen layout', async () => {
    uploadDraftAsset.mockResolvedValue({ id: 17, collection: 'about_story', url: '/story.png', mime_type: 'image/png' })
    const wrapper = render()
    const file = new File(['image'], 'story.png', { type: 'image/png' })
    wrapper.findComponent({ name: 'AdminMediaUploader' }).vm.$emit('select', file)
    await flushPromises()
    expect(uploadDraftAsset).toHaveBeenCalledWith('about_story', file)
    const next = wrapper.emitted('update:modelValue')!.at(-1)![0] as ReturnType<typeof draft>
    expect(next).toMatchObject({ about_media_id: 9, about_image_url: '/cover.png', about_story_media_id: 17, about_story_image_url: '/story.png', section_designs: draft().section_designs })
    expect(websiteEditorChangedAreas(draft(), next).map(area => area.id)).toEqual(['about'])
    wrapper.unmount()
  })
  it('reuses and removes a story image without modifying the cover', async () => {
    const wrapper = render()
    wrapper.findComponent({ name: 'AdminMediaUploader' }).vm.$emit('browse')
    await flushPromises()
    wrapper.findComponent({ name: 'AdminWebsiteEditorMediaLibrary' }).vm.$emit('selected', { id: 18, collection: 'about_story', url: '/library-story.png', mime_type: 'image/png' })
    await flushPromises()
    const next = wrapper.emitted('update:modelValue')!.at(-1)![0] as ReturnType<typeof draft>
    expect(next.about_story_image_url).toBe('/library-story.png')
    await wrapper.setProps({ modelValue: next })
    wrapper.findComponent({ name: 'AdminMediaUploader' }).vm.$emit('remove')
    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toMatchObject({ about_media_id: 9, about_image_url: '/cover.png', about_story_media_id: null, about_story_image_url: null })
    wrapper.unmount()
  })
  it('does not borrow current story media when previewing a historical payload without that field', () => {
    const current = { about_image_url: '/cover.png', about_story_image_url: '/new-story.png' } as any
    expect(normalizeWebsiteEditorDraft(current).about_story_image_url).toBe('/new-story.png')
    expect(normalizeWebsiteEditorDraft(current, { about_content: 'Historical story' }).about_story_image_url).toBeNull()
    expect(normalizeWebsiteEditorDraft(current, { about_story_image_url: null }).about_story_image_url).toBeNull()
  })
})
