// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, provide, ref, type Ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSiteConfig, type SiteConfig } from '~/composables/useSiteConfig'
import { SITE_CONFIG_PREVIEW } from '~/utils/siteConfigPreview'
import { storefrontNavigationLinks } from '~/utils/websiteNavigation'

describe('preview configuration isolation', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('retains resolved custom links when the shared admin cache refreshes', async () => {
    const states = new Map<string, Ref<unknown>>()
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('useRoute', () => ({ path: '/admin/storefront-preview', query: {} }))
    vi.stubGlobal('useRequestURL', () => new URL('http://localhost:8000/admin/storefront-preview'))
    vi.stubGlobal('useState', (key: string, init: () => unknown) => {
      if (!states.has(key)) states.set(key, ref(init()))
      return states.get(key)
    })
    const navigation = [{ id: 'information', kind: 'link' as const, label: 'Information', value: '/information', visible: true, children: [] }]
    const preview = ref({ navigation } as SiteConfig)
    let shared!: ReturnType<typeof useSiteConfig>
    let scoped!: ReturnType<typeof useSiteConfig>
    const Child = defineComponent({
      setup() {
        scoped = useSiteConfig()
        return () => h('nav', storefrontNavigationLinks(scoped.siteConfig.value?.navigation ?? []).map(link => h('a', { href: link.to }, link.label)))
      },
    })
    const wrapper = mount(defineComponent({
      setup() {
        shared = useSiteConfig()
        provide(SITE_CONFIG_PREVIEW, preview)
        return () => h(Child)
      },
    }))
    // The admin endpoint returns stable UUID references, not storefront links.
    shared.siteConfig.value = { navigation: [{ ...navigation[0]!, kind: 'page', value: 'page-uuid' }] } as SiteConfig
    expect(scoped.siteConfig.value?.navigation).toEqual(navigation)
    await nextTick()
    expect(wrapper.get('a').text()).toBe('Information')
    expect(wrapper.get('a').attributes('href')).toBe('/information')
    shared.invalidateSiteConfig('admin')
    expect(scoped.siteConfig.value?.navigation).toEqual(navigation)
    expect(shared.siteConfig.value).toBeNull()
    await nextTick()
    expect(wrapper.get('a').text()).toBe('Information')
    wrapper.unmount()
  })
})
