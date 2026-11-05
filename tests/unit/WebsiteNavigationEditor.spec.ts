// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { computed, defineComponent, ref, watch } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WebsiteNavigationEditor from '~/components/admin/WebsiteNavigationEditor.vue'
import { resolveNavigationPages, storefrontNavigationLinks } from '~/utils/websiteNavigation'
import type { WebsiteNavigationItem } from '~/composables/useSiteConfig'
import type { WebsitePageSummary } from '~/types/websitePage'

const page = { uuid: '9674fb74-0e46-4012-b865-939417d45a19', title: 'Our story', path: '/our-story', is_published: true } as WebsitePageSummary
const home: WebsiteNavigationItem = { id: 'home', label: 'Home', kind: 'link', value: '/', visible: true, children: [] }
function render(items = [home], extra = {}) {
  return mount(WebsiteNavigationEditor, {
    props: { modelValue: items, pages: [page, { ...page, uuid: 'private', title: 'Private', is_published: false }], ...extra },
    global: { stubs: { Icon: defineComponent({ template: '<span />' }) } },
  })
}

beforeEach(() => {
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('watch', watch)
  vi.stubGlobal('useModules', () => ({ isEnabled: () => false }))
})

describe('store header navigation', () => {
  it('adds a published page by stable UUID and resolves it into the preview header path', async () => {
    const wrapper = render()
    expect(wrapper.findAll('option').map(option => option.text())).toEqual(['Choose a destination', 'Our story · /our-story'])
    await wrapper.get('select').setValue(`page:${page.uuid}`)
    await wrapper.findAll('button').find(button => button.text() === 'Add to header')!.trigger('click')
    const items = wrapper.emitted('update:modelValue')?.[0]?.[0] as WebsiteNavigationItem[]
    expect(items[1]).toMatchObject({ label: 'Our story', kind: 'page', value: page.uuid, visible: true })
    expect(storefrontNavigationLinks(resolveNavigationPages(items, [page]))).toEqual([
      { id: 'home', label: 'Home', to: '/' },
      { id: items[1]!.id, label: 'Our story', to: '/our-story' },
    ])
    expect(items[1]!.kind).toBe('page')
    await wrapper.setProps({ modelValue: items })
    expect(wrapper.findAll('option')).toHaveLength(1)
  })

  it('preselects the requested published page without changing the website draft', async () => {
    const wrapper = render([home], { requestedPageUuid: page.uuid, loading: true, pages: [] })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ loading: false, pages: [page] })
    expect((wrapper.get('select').element as HTMLSelectElement).value).toBe(`page:${page.uuid}`)
    expect(wrapper.get('[role="status"]').text()).toContain('save and publish')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.findAll('button').find(button => button.text() === 'Add to header')!.trigger('click')
    expect((wrapper.emitted('update:modelValue')![0]![0] as WebsiteNavigationItem[])[1]).toMatchObject({ kind: 'page', value: page.uuid })
  })

  it('does not duplicate an existing hidden page link or enable it automatically', () => {
    const item: WebsiteNavigationItem = { id: 'story', label: 'Our story', kind: 'page', value: page.uuid, visible: false, children: [] }
    const wrapper = render([home, item], { requestedPageUuid: page.uuid })
    expect(wrapper.get('[role="status"]').text()).toContain('already has a link in the website draft')
    expect((wrapper.get('select').element as HTMLSelectElement).value).toBe('')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(item.visible).toBe(false)
  })

  it('recognizes existing published-path links even when the next draft renames the page', () => {
    const renamed = { ...page, path: '/new-draft-path', published_path: '/our-story' }
    const wrapper = render([{ ...home, value: '/our-story' }], { pages: [renamed], requestedPageUuid: page.uuid })
    expect(wrapper.get('[role="status"]').text()).toContain('already has a link')
    expect(wrapper.findAll('option').some(option => option.attributes('value') === `page:${page.uuid}`)).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('rejects private or unknown requested pages and enforces menu capacity', async () => {
    const wrapper = render([home], { requestedPageUuid: 'private' })
    expect(wrapper.get('[role="status"]').text()).toContain('unavailable or not published')
    expect((wrapper.get('select').element as HTMLSelectElement).value).toBe('')
    await wrapper.setProps({ requestedPageUuid: 'foreign' })
    expect(wrapper.get('[role="status"]').text()).toContain('unavailable or not published')
    await wrapper.setProps({ requestedPageUuid: page.uuid, modelValue: Array.from({ length: 20 }, (_, i) => ({ ...home, id: String(i) })) })
    expect(wrapper.get('select').attributes('disabled')).toBeDefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('edits, hides, reorders and removes links without mutating the input', async () => {
    const custom: WebsiteNavigationItem = { id: 'story', label: page.title, kind: 'page', value: page.uuid, visible: true, children: [] }
    const wrapper = render([home, custom])
    await wrapper.get('[aria-label="Menu label 2"]').setValue('Story')
    expect((wrapper.emitted('update:modelValue')!.at(-1)![0] as WebsiteNavigationItem[])[1]!.label).toBe('Story')
    await wrapper.get('[aria-label="Hide Our story"]').trigger('click')
    expect((wrapper.emitted('update:modelValue')!.at(-1)![0] as WebsiteNavigationItem[])[1]!.visible).toBe(false)
    await wrapper.get('[aria-label="Move Our story up"]').trigger('click')
    expect((wrapper.emitted('update:modelValue')!.at(-1)![0] as WebsiteNavigationItem[])[0]!.id).toBe('story')
    await wrapper.get('[aria-label="Remove Our story"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toEqual([home])
    expect(custom.label).toBe('Our story')
    expect(custom.visible).toBe(true)
  })

  it('keeps private or unresolved pages and hidden parent groups out of the public menu', () => {
    const items: WebsiteNavigationItem[] = [
      home,
      { ...home, id: 'group', kind: 'group', value: null, visible: false, children: [{ ...home, id: 'child', value: '/secret' }] },
      { ...home, id: 'unknown', kind: 'page', value: 'unknown' },
      { ...home, id: 'unsafe', value: '//another-store.example.test/path' },
    ]
    expect(storefrontNavigationLinks(resolveNavigationPages(items, [page]))).toEqual([{ id: 'home', label: 'Home', to: '/' }])
  })

  it('can add the Home link again after it was removed', async () => {
    const wrapper = render([])
    await wrapper.get('select').setValue('link:/')
    await wrapper.findAll('button').find(button => button.text() === 'Add to header')!.trigger('click')
    expect((wrapper.emitted('update:modelValue')![0]![0] as WebsiteNavigationItem[])[0])
      .toMatchObject({ label: 'Home', kind: 'link', value: '/', visible: true })
  })

  it('shows page-load errors and can retry without changing saved links', async () => {
    const wrapper = render([home], { error: 'Pages could not be loaded.' })
    expect(wrapper.get('[role="alert"]').text()).toContain('Pages could not be loaded.')
    await wrapper.get('[role="alert"] button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
