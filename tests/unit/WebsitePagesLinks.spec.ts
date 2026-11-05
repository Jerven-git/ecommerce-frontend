// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { computed, defineComponent, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WebsitePages from '~/pages/admin/website-pages/index.vue'
import { useStorefrontUrl } from '~/composables/useStorefrontUrl'

const auth = reactive({ user: { store: { slug: 'alpha', domain: null as string | null, domain_verified: false } } })
const apiFetch = vi.fn()
const host = defineComponent({ components: { WebsitePages }, template: '<Suspense><WebsitePages /></Suspense>' })

function renderPages() {
  return mount(host, {
    global: {
      stubs: {
        Icon: true,
        NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
        AdminPageHeader: { template: '<header><slot name="actions" /></header>' },
        AdminSpinner: true,
        AdminPagination: true,
        AdminToast: true,
      },
    },
  })
}

describe('published website page links', () => {
  beforeEach(() => {
    window.location.href = 'http://localhost:8000/admin/website-pages'
    auth.user.store = { slug: 'alpha', domain: null, domain_verified: false }
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('ref', ref)
    vi.stubGlobal('reactive', reactive)
    vi.stubGlobal('watch', watch)
    vi.stubGlobal('onBeforeUnmount', onBeforeUnmount)
    vi.stubGlobal('definePageMeta', vi.fn())
    vi.stubGlobal('useRoute', () => ({ query: {} }))
    vi.stubGlobal('useAuthStore', () => auth)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { storefrontBaseDomain: 'localhost' } }))
    vi.stubGlobal('useStorefrontUrl', useStorefrontUrl)
    vi.stubGlobal('useNuxtApp', () => ({ $apiFetch: apiFetch }))
    vi.stubGlobal('useAdminToast', () => ({ showToast: vi.fn() }))
    apiFetch.mockResolvedValue({
      data: [
        { uuid: 'published', title: 'Our story', path: '/company/renamed-draft', published_path: '/company/our-story', is_published: true, published_version: 1 },
        { uuid: 'private', title: 'Private page', path: '/private', is_published: false },
      ],
      last_page: 1,
      total: 2,
    })
  })

  it('opens the creation form from the editor shortcut', async () => {
    vi.stubGlobal('useRoute', () => ({ query: { create: '1' } }))
    const wrapper = renderPages()
    await flushPromises()
    expect(wrapper.get('#new-page-title').text()).toBe('Create a private page draft')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('opens custom page editing directly in the unified workspace', async () => {
    const wrapper = renderPages()
    await flushPromises()
    expect(wrapper.find('a[href="/admin/website-editor?customPage=published"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/admin/website-editor?customPage=private"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/admin/website-pages/published"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('opens a published page on its admin store subdomain instead of the apex', async () => {
    const wrapper = renderPages()
    await flushPromises()
    const links = wrapper.findAll('a[aria-label="Open published page"]')
    expect(links).toHaveLength(1)
    expect(links[0]!.attributes('href')).toBe('http://alpha.localhost:8000/company/our-story')
    wrapper.unmount()
  })

  it('uses the verified store domain and retains a local development port', async () => {
    auth.user.store = { slug: 'alpha', domain: 'shop.example.test', domain_verified: true }
    const wrapper = renderPages()
    await flushPromises()
    expect(wrapper.get('a[aria-label="Open published page"]').attributes('href'))
      .toBe('http://shop.example.test:8000/company/our-story')
    wrapper.unmount()
  })

  it('follows a changed store identity and ignores unverified domain claims', async () => {
    auth.user.store = { slug: 'beta', domain: 'unverified.example.test', domain_verified: false }
    const wrapper = renderPages()
    await flushPromises()
    expect(wrapper.get('a[aria-label="Open published page"]').attributes('href'))
      .toBe('http://beta.localhost:8000/company/our-story')
    auth.user.store = { slug: 'gamma', domain: null, domain_verified: false }
    await flushPromises()
    expect(wrapper.get('a[aria-label="Open published page"]').attributes('href'))
      .toBe('http://gamma.localhost:8000/company/our-story')
    wrapper.unmount()
  })
})
