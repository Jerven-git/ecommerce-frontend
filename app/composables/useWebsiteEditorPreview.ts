import { computed, nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import type { SiteConfig } from '~/composables/useSiteConfig'
import type { WebsiteEditorPageId } from '~/utils/websiteEditorPages'

interface WebsiteEditorPreviewOptions {
  config: Readonly<Ref<SiteConfig | null>>
  activePage: Readonly<Ref<WebsiteEditorPageId>>
  selectedSection: Readonly<Ref<string>>
  onNavigate?: (href: string) => void
  onRendered: () => void
  timeout?: number
}

export function useWebsiteEditorPreview(options: WebsiteEditorPreviewOptions) {
  const previewFrame = ref<HTMLIFrameElement | null>(null)
  const previewLoading = ref(true)
  const previewError = ref(false)
  const previewReady = ref(false)
  const previewVersion = ref(0)
  const previewUrl = computed(() => `/admin/storefront-preview?version=${previewVersion.value}`)
  let previewTimeout: number | null = null
  let loadTimeout: number | null = null
  let disposed = false

  function clearPreviewTimeout() {
    if (previewTimeout !== null) window.clearTimeout(previewTimeout)
    previewTimeout = null
  }

  function send(message: Record<string, unknown>) {
    if (disposed || !import.meta.client || !previewFrame.value?.contentWindow) return
    // Reactive values cannot cross the iframe boundary. Keep this contract JSON-only.
    const payload = JSON.parse(JSON.stringify({ source: 'ssu-website-editor', ...message })) as Record<string, unknown>
    previewFrame.value.contentWindow.postMessage(payload, window.location.origin)
  }

  function sendConfig(force = false) {
    if ((!previewReady.value && !force) || !options.config.value) return
    send({ type: 'preview-config', config: options.config.value, page: options.activePage.value })
  }

  function selectPage(page: WebsiteEditorPageId) {
    send({ type: 'select-page', page })
  }

  function selectSection(section: string) {
    send({ type: 'select-section', section, page: options.activePage.value })
  }

  function startTimeout() {
    if (disposed) return
    clearPreviewTimeout()
    previewTimeout = window.setTimeout(() => {
      if (!previewLoading.value) return
      previewLoading.value = false
      previewError.value = true
    }, options.timeout ?? 10000)
  }

  function prepare() {
    if (disposed) return
    previewLoading.value = true
    previewError.value = false
  }

  function refresh() {
    if (disposed) return
    if (loadTimeout !== null) window.clearTimeout(loadTimeout)
    loadTimeout = null
    previewReady.value = false
    prepare()
    previewVersion.value += 1
    nextTick(startTimeout)
  }

  function onLoad() {
    if (disposed) return
    if (loadTimeout !== null) window.clearTimeout(loadTimeout)
    const loadedFrame = previewFrame.value
    previewReady.value = false
    prepare()
    startTimeout()
    send({ type: 'preview-ping' })
    loadTimeout = window.setTimeout(() => {
      loadTimeout = null
      if (disposed || previewFrame.value !== loadedFrame) return
      sendConfig(true)
      selectPage(options.activePage.value)
      selectSection(options.selectedSection.value)
    }, 0)
  }

  function onMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin || event.source !== previewFrame.value?.contentWindow) return
    if (event.data?.source !== 'ssu-storefront-preview') return

    if (event.data?.type === 'navigate' && typeof event.data.href === 'string') {
      options.onNavigate?.(event.data.href)
      return
    }

    if (event.data?.type === 'ready') {
      previewReady.value = true
      sendConfig(true)
      return
    }

    if (event.data?.type === 'rendered') {
      clearPreviewTimeout()
      previewReady.value = true
      previewError.value = false
      previewLoading.value = false
      selectPage(options.activePage.value)
      nextTick(() => { if (!disposed) options.onRendered() })
    }
  }

  onMounted(() => window.addEventListener('message', onMessage))
  onBeforeUnmount(() => {
    disposed = true
    if (loadTimeout !== null) window.clearTimeout(loadTimeout)
    loadTimeout = null
    clearPreviewTimeout()
    window.removeEventListener('message', onMessage)
  })

  return {
    previewFrame,
    previewLoading,
    previewError,
    previewVersion,
    previewUrl,
    sendConfig,
    selectPage,
    selectSection,
    startTimeout,
    prepare,
    refresh,
    onLoad,
  }
}
