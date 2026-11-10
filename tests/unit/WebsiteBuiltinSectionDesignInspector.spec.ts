// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Inspector from '~/components/admin/WebsiteBuiltinSectionDesignInspector.vue'
import Design from '~/components/admin/WebsitePageDesignInspector.vue'
import Picker from '~/components/admin/WebsitePageLayoutPicker.vue'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'

beforeEach(() => { vi.stubGlobal('computed', computed) })
afterEach(() => vi.unstubAllGlobals())
describe('built-in design inspector', () => {
  it('edits layout and design independently, preserving merchant content and other sections', async () => {
    const initial = normalizeWebsiteEditorDraft({ hero_title: 'Merchant heading', section_designs: { home: { stats: { layout: 'band' } } } })
    const wrapper = mount(Inspector, { props: { modelValue: initial, page: 'home', section: 'hero' }, global: { components: { AdminWebsitePageDesignInspector: Design, AdminWebsitePageLayoutPicker: Picker }, stubs: { Icon: true } } })
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
