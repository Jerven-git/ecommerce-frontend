// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import * as Vue from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Picker from '~/components/admin/WebsiteEditorPagePicker.vue'
import type { WebsitePageSummary } from '~/types/websitePage'

const pages = [
  { uuid: 'story', title: 'Our story', path: '/our-story', is_published: true, has_unpublished_changes: true },
  { uuid: 'draft', title: 'Information', path: '/information', is_published: false },
] as WebsitePageSummary[]
const options = [{ id: 'home' as const, label: 'Home page', icon: 'heroicons:home', path: '/', storefrontDisabled: false }]
function render(extra = {}) {
  return mount(Picker, { props: { modelValue: 'home', options, customPages: pages, ...extra }, global: { stubs: {
    Icon: true, NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
  } } })
}
beforeEach(() => {
  for (const name of ['ref', 'computed', 'watch', 'nextTick', 'onMounted', 'onBeforeUnmount', 'useId'] as const) vi.stubGlobal(name, Vue[name])
  HTMLElement.prototype.scrollIntoView = vi.fn()
})
describe('unified page access', () => {
  it('shows tenant pages with honest publication states and existing editor routes', async () => {
    const wrapper = render()
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('a[href="/admin/website-editor?customPage=story"]').text()).toContain('Live · Unpublished changes')
    expect(wrapper.get('a[href="/admin/website-editor?customPage=draft"]').text()).toContain('Private draft')
    expect(wrapper.get('a[href="/admin/website-pages?create=1"]').text()).toBe('Create page')
  })
  it('searches custom titles and paths without changing the selected built-in page', async () => {
    const wrapper = render()
    await wrapper.get('button').trigger('click')
    await wrapper.get('input').setValue('/information')
    expect(wrapper.find('a[href="/admin/website-editor?customPage=story"]').exists()).toBe(false)
    expect(wrapper.find('a[href="/admin/website-editor?customPage=draft"]').exists()).toBe(true)
    expect(wrapper.get('button').attributes('aria-label')).toBe('Preview page: Home page')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
  it('identifies the selected custom page without marking Home selected', async () => {
    const wrapper = render({ selectedCustomPage: pages[0] })
    expect(wrapper.get('button').attributes('aria-label')).toBe('Preview page: Our story')
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('[role="option"]').attributes('aria-selected')).toBe('false')
    expect(wrapper.get('a[aria-current="page"]').attributes('href')).toBe('/admin/website-editor?customPage=story')
  })

  it('preserves built-in keyboard selection and Escape closes the chooser', async () => {
    const wrapper = render()
    await wrapper.get('button').trigger('click')
    await wrapper.get('[role="listbox"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['home']])
    await wrapper.get('button').trigger('click')
    await wrapper.get('[role="dialog"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })
  it('reports loading and failure instead of presenting stale links, and permits retry', async () => {
    const wrapper = render({ customPagesLoading: true })
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toContain('Loading')
    await wrapper.setProps({ customPagesLoading: false, customPagesError: 'Unable to load pages' })
    expect(wrapper.find('a[href="/admin/website-editor?customPage=story"]').exists()).toBe(false)
    await wrapper.findAll('button').find(button => button.text() === 'Try again')!.trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
