// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Inspector from '~/components/admin/WebsiteBuiltinSectionDesignInspector.vue'
import Design from '~/components/admin/WebsitePageDesignInspector.vue'
import Picker from '~/components/admin/WebsitePageLayoutPicker.vue'
import ContactTypography from '~/components/admin/WebsiteContactTypography.vue'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'

beforeEach(() => { vi.stubGlobal('computed', computed) })
afterEach(() => vi.unstubAllGlobals())
describe('built-in design inspector', () => {
  it('edits Contact typography without losing merchant copy or layout and resets to defaults', async () => {
    const initial = normalizeWebsiteEditorDraft({ contact_page: { info_title: 'Merchant contacts' }, section_designs: { contact: { 'contact-content': { layout: 'compact' } } } })
    const wrapper = mount(Inspector, { props: { modelValue: initial, page: 'contact', section: 'contact-content' }, global: { components: { AdminWebsiteContactTypography: ContactTypography }, stubs: { AdminWebsitePageLayoutPicker: true, AdminWebsitePageDesignInspector: true } } })
    await wrapper.get('input[aria-label="Body text size"]').setValue('14')
    let next = wrapper.emitted('update:modelValue')!.at(-1)![0] as typeof initial
    expect(next.contact_page.info_title).toBe('Merchant contacts')
    expect(next.section_designs?.contact?.['contact-content']).toEqual({ layout: 'compact', typography: { body: 14 } })
    await wrapper.setProps({ modelValue: next })
    await wrapper.get('input[aria-label="Form text size in pixels"]').setValue('999')
    next = wrapper.emitted('update:modelValue')!.at(-1)![0] as typeof initial
    expect(next.section_designs?.contact?.['contact-content']?.typography).toEqual({ body: 14, field: 20 })
    await wrapper.setProps({ modelValue: next })
    await wrapper.get('button').trigger('click')
    next = wrapper.emitted('update:modelValue')!.at(-1)![0] as typeof initial
    expect(next.section_designs?.contact?.['contact-content']).toEqual({ layout: 'compact' })
    expect(next.contact_page.info_title).toBe('Merchant contacts')
    wrapper.unmount()
  })
  it('adjusts stacked story image width while preserving copy and the selected width across layouts', async () => {
    const initial = normalizeWebsiteEditorDraft({ about_content: 'Merchant story', section_designs: { about: { 'about-content': { layout: 'stacked' } } } })
    const wrapper = mount(Inspector, { props: { modelValue: initial, page: 'about', section: 'about-content' }, global: { components: { AdminWebsitePageDesignInspector: Design, AdminWebsitePageLayoutPicker: Picker }, stubs: { Icon: true, AdminWebsiteAboutStoryMediaEditor: true } } })
    expect(wrapper.get('input[aria-label="Image width"]').attributes('value')).toBe('70')
    await wrapper.get('input[aria-label="Image width"]').setValue('45')
    let next = wrapper.emitted('update:modelValue')!.at(-1)![0] as typeof initial
    expect(next.about_content).toBe('Merchant story')
    expect(next.section_designs?.about?.['about-content']?.image_width).toBe(45)
    await wrapper.setProps({ modelValue: next })
    await wrapper.findAll('button').find(button => button.text() === 'Image left')!.trigger('click')
    next = wrapper.emitted('update:modelValue')!.at(-1)![0] as typeof initial
    await wrapper.setProps({ modelValue: next })
    expect(wrapper.find('input[aria-label="Image width"]').exists()).toBe(false)
    expect(next.section_designs?.about?.['about-content']?.image_width).toBe(45)
    wrapper.unmount()
  })
  it('edits layout and design independently, preserving merchant content and other sections', async () => {
    const initial = normalizeWebsiteEditorDraft({ hero_title: 'Merchant heading', section_designs: { home: { stats: { layout: 'band' } } } })
    const wrapper = mount(Inspector, { props: { modelValue: initial, page: 'home', section: 'hero' }, global: { components: { AdminWebsitePageDesignInspector: Design, AdminWebsitePageLayoutPicker: Picker }, stubs: { Icon: true, AdminWebsiteHeroMediaEditor: true, AdminWebsiteAboutStoryMediaEditor: true, AdminWebsiteHowItWorksTypography: true } } })
    await wrapper.findAll('button').find(button => button.text() === 'Media left')!.trigger('click')
    let next = wrapper.emitted('update:modelValue')!.at(-1)![0] as typeof initial
    expect(next.section_designs?.home?.hero?.layout).toBe('media-left')
    expect(next.section_designs?.home?.stats?.layout).toBe('band')
    expect(next.hero_title).toBe('Merchant heading')
    expect(initial.section_designs?.home?.hero).toBeUndefined()
    await wrapper.setProps({ modelValue: next })
    await wrapper.get('input[aria-label="Top spacing"]').setValue('24')
    next = wrapper.emitted('update:modelValue')!.at(-1)![0] as typeof initial
    expect(next.section_designs?.home?.hero).toEqual({ layout: 'media-left', design: { padding_top: 24 } })
    await wrapper.setProps({ modelValue: next })
    await wrapper.findAll('button').find(button => button.text() === 'Theme default')!.trigger('click')
    next = wrapper.emitted('update:modelValue')!.at(-1)![0] as typeof initial
    expect(next.section_designs?.home?.hero).toEqual({ design: { padding_top: 24 } })
    await wrapper.setProps({ modelValue: next })
    await wrapper.findAll('button').find(button => button.text() === 'Reset section design')!.trigger('click')
    next = wrapper.emitted('update:modelValue')!.at(-1)![0] as typeof initial
    expect(next.section_designs).toEqual({ home: { stats: { layout: 'band' } } })
    wrapper.unmount()
  })
})
