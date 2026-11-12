// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useScrollReveal, useScrollRevealAll } from '~/composables/useScrollReveal'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import About from '~/pages/about.vue'
import { SITE_CONFIG_PREVIEW } from '~/utils/siteConfigPreview'
const config = ref<any>(null)
beforeEach(() => {
  config.value = { site_name: 'Merchant store', about_image_url: '/cover.png', about_story_image_url: '/story.png', about_content: 'Merchant story', about_highlights: { items: [] }, homepage_stats: { items: [] }, section_designs: { about: { 'about-content': { layout: 'image-right' } } } }
  for (const [key, value] of Object.entries({ computed, ref, watch })) vi.stubGlobal(key, value)
  vi.stubGlobal('useSiteConfig', () => ({ siteConfig: config }))
  vi.stubGlobal('useModules', () => ({ isEnabled: () => true }))
  vi.stubGlobal('useStaticPageSeo', vi.fn())
  vi.stubGlobal('useScrollReveal', () => ({ revealRef: ref(null) }))
  vi.stubGlobal('useScrollRevealAll', () => ({ addRevealRef: () => {} }))
  vi.stubGlobal('Image', class { onload?: () => void; onerror?: () => void; set src(_url: string) { this.onload?.() } })
})
afterEach(() => vi.unstubAllGlobals())
const render = (preview = false) => mount(About, { global: { stubs: { Icon: true, NuxtLink: true }, provide: preview ? { [SITE_CONFIG_PREVIEW as symbol]: config } : {} } })
describe('About page image separation', () => {
  it('updates cover and story images independently and does not fall back to the cover', async () => {
    const wrapper = render()
    expect(wrapper.get('section').attributes('style')).toContain('/cover.png')
    expect(wrapper.get('[data-builtin-layout-grid] img').attributes('src')).toBe('/story.png')
    config.value.about_image_url = '/replacement-cover.png'
    await nextTick()
    expect(wrapper.get('[data-builtin-layout-grid] img').attributes('src')).toBe('/story.png')
    config.value.about_story_image_url = '/replacement-story.png'
    await nextTick()
    expect(wrapper.get('section').attributes('style')).toContain('/replacement-cover.png')
    config.value.about_story_image_url = null
    await nextTick()
    expect(wrapper.find('[data-builtin-layout-grid] img').exists()).toBe(false)
    expect(wrapper.find('[data-editor-empty-story-image]').exists()).toBe(false)
    wrapper.unmount()
  })
  it('keeps story text visible when image changes patch its layout classes', async () => {
    config.value.about_story_image_url = null
    vi.stubGlobal('onMounted', onMounted)
    vi.stubGlobal('onUnmounted', onUnmounted)
    vi.stubGlobal('useScrollReveal', useScrollReveal)
    vi.stubGlobal('useScrollRevealAll', useScrollRevealAll)
    vi.stubGlobal('IntersectionObserver', class {
      constructor(private callback: (entries: any[]) => void) {}
      observe(target: Element) { this.callback([{ target, isIntersecting: true }]) }
      unobserve() {}
      disconnect() {}
    })
    const style = document.createElement('style')
    style.textContent = 'div { opacity: 1 } .reveal { opacity: 0 } .reveal-visible { opacity: 1 }'
    document.head.append(style)
    const wrapper = mount(About, { attachTo: document.body, global: { stubs: { Icon: true, NuxtLink: true } } })
    try {
      await nextTick()
      const narrative = () => wrapper.get('[data-builtin-layout-grid] > div:last-child').element
      expect(getComputedStyle(narrative()).opacity).toBe('1')
      config.value.about_story_image_url = '/new-story.png'
      await nextTick()
      expect(getComputedStyle(narrative()).opacity).toBe('1')
      expect(narrative().textContent).toContain('Merchant story')
      config.value.about_story_image_url = null
      await nextTick()
      expect(getComputedStyle(narrative()).opacity).toBe('1')
    } finally {
      wrapper.unmount()
      style.remove()
    }
  })
  it('shows an editor-only story image frame for an image layout with no story image', () => {
    config.value.about_story_image_url = null
    const wrapper = render(true)
    expect(wrapper.get('[data-editor-empty-story-image]').text()).toContain('Add an Our story image')
    expect(wrapper.get('section').attributes('style')).toContain('/cover.png')
    wrapper.unmount()
  })
})
