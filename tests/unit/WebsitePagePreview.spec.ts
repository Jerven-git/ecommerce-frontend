// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onErrorCaptured, onMounted, ref, shallowRef, watch } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Preview from '~/components/admin/WebsitePagePreview.vue'

const fail = ref(false)
const callbacks: MutationCallback[] = []
const observers: { disconnect: ReturnType<typeof vi.fn> }[] = []
const renderer = defineComponent({ setup: () => () => {
  if (fail.value) throw new Error('Preview render failed')
  return h('section', { 'data-page-block': 'hero' }, 'Preview content')
} })
function mountPreview() {
  return mount(Preview, {
    props: { title: 'Page', document: { blocks: [], seo: { title: null, description: null, noindex: false, og_image_media_id: null }, localized_content: {} }, media: {}, collections: {} },
    global: { components: { StorefrontPageWebsitePageRenderer: renderer } },
  })
}
async function loadFrame(wrapper: ReturnType<typeof mountPreview>) {
  const frame = wrapper.get('iframe').element as HTMLIFrameElement
  const previewDocument = document.implementation.createHTMLDocument()
  previewDocument.body.innerHTML = '<div id="page-preview"></div>'
  Object.defineProperty(frame, 'contentDocument', { configurable: true, value: previewDocument })
  await wrapper.get('iframe').trigger('load')
  await nextTick()
}
beforeEach(() => {
  fail.value = false
  callbacks.length = 0; observers.length = 0
  for (const [name, value] of Object.entries({ computed, nextTick, onBeforeUnmount, onErrorCaptured, onMounted, ref, shallowRef, watch })) vi.stubGlobal(name, value)
  vi.stubGlobal('MutationObserver', class {
    disconnect = vi.fn()
    observe = vi.fn()
    constructor(callback: MutationCallback) { callbacks.push(callback); observers.push(this) }
  })
  vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(123)
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('custom page preview lifecycle', () => {
  it('batches style changes and ignores queued work after unmount', async () => {
    const wrapper = mountPreview()
    await loadFrame(wrapper)
    callbacks[0]!([], {} as MutationObserver)
    callbacks[0]!([], {} as MutationObserver)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
    wrapper.unmount()
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(123)
    expect(observers[0]!.disconnect).toHaveBeenCalled()
    callbacks[0]!([], {} as MutationObserver)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
  })

  it('does not recreate observers for repeated load events on the same document', async () => {
    const wrapper = mountPreview()
    await loadFrame(wrapper)
    await wrapper.get('iframe').trigger('load')
    expect(observers).toHaveLength(1)
    wrapper.unmount()
  })

  it('contains a renderer failure and recovers with a fresh sandboxed frame', async () => {
    const wrapper = mountPreview()
    await loadFrame(wrapper)
    const original = wrapper.get('iframe').element
    fail.value = true
    await nextTick()
    await nextTick()
    expect(wrapper.get('[role="alert"]').text()).toContain('Your draft is unchanged')
    expect(wrapper.find('iframe').exists()).toBe(false)
    fail.value = false
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('iframe').element).not.toBe(original)
    expect(wrapper.get('iframe').attributes('sandbox')).toBe('allow-same-origin')
    await loadFrame(wrapper)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
