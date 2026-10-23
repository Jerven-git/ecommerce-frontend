// @vitest-environment happy-dom

import { mount } from '@vue/test-utils'
import { defineComponent, h, markRaw, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SiteConfig } from '~/composables/useSiteConfig'
import { useWebsiteEditorPreview } from '~/composables/useWebsiteEditorPreview'

describe('useWebsiteEditorPreview', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('sends plain tenant configuration only after the preview is ready', async () => {
    const postMessage = vi.fn()
    const contentWindow = markRaw({ postMessage }) as unknown as Window
    const config = ref({ site_name: 'Tenant Store' } as SiteConfig)
    const activePage = ref<'home'>('home')
    const selectedSection = ref('hero')
    const rendered = vi.fn()
    let preview!: ReturnType<typeof useWebsiteEditorPreview>

    const wrapper = mount(defineComponent({
      setup() {
        preview = useWebsiteEditorPreview({ config, activePage, selectedSection, onRendered: rendered })
        return () => h('div')
      },
    }))
    preview.previewFrame.value = markRaw({ contentWindow }) as HTMLIFrameElement

    preview.sendConfig()
    expect(postMessage).not.toHaveBeenCalled()

    const readyEvent = new Event('message')
    Object.defineProperties(readyEvent, {
      origin: { value: window.location.origin },
      source: { value: contentWindow },
      data: { value: { source: 'ssu-storefront-preview', type: 'ready' } },
    })
    window.dispatchEvent(readyEvent)
    await nextTick()

    expect(postMessage).toHaveBeenCalledWith({
      source: 'ssu-website-editor',
      type: 'preview-config',
      config: { site_name: 'Tenant Store' },
      page: 'home',
    }, window.location.origin)

    wrapper.unmount()
  })

  it('moves from loading to an actionable error when rendering times out', () => {
    vi.useFakeTimers()
    const config = ref({ site_name: 'Tenant Store' } as SiteConfig)
    let preview!: ReturnType<typeof useWebsiteEditorPreview>

    const wrapper = mount(defineComponent({
      setup() {
        preview = useWebsiteEditorPreview({
          config,
          activePage: ref('home'),
          selectedSection: ref('hero'),
          onRendered: vi.fn(),
          timeout: 100,
        })
        return () => h('div')
      },
    }))

    preview.startTimeout()
    vi.advanceTimersByTime(100)

    expect(preview.previewLoading.value).toBe(false)
    expect(preview.previewError.value).toBe(true)

    wrapper.unmount()
  })
})
