<template>
  <div ref="container" class="relative overflow-hidden bg-white">
    <iframe ref="frame" :title="iframeTitle || 'Private page preview'" tabindex="-1" class="block h-full w-full border-0 bg-white" :style="canvasStyle" sandbox="allow-same-origin" :srcdoc="frameDocument" @load="prepareFrame" />
    <Teleport v-if="target" :to="target">
      <div aria-label="Page layout preview" @click.capture.prevent="selectFromPreview" @submit.capture.prevent @keydown.enter.capture.prevent @keydown.space.capture.prevent>
        <StorefrontPageWebsitePageRenderer :title="title" :document="document" :media="media" :collections="collections" preview />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { WebsitePageCollectionItem, WebsitePageDocument, WebsitePageMedia } from '~/types/websitePage'

const props = defineProps<{
  iframeTitle?: string
  fitCanvas?: boolean
  canvasWidth?: number
  selectedBlockId?: string | null
  title: string
  document: WebsitePageDocument
  media: Record<number, WebsitePageMedia>
  collections: Record<string, WebsitePageCollectionItem[]>
}>()

const emit = defineEmits<{ 'select-block': [id: string] }>()
function selectFromPreview(event: MouseEvent) {
  const element = event.target as Element | null
  const section = element?.closest<HTMLElement>('[data-page-block]')
  if (section?.dataset.pageBlock) emit('select-block', section.dataset.pageBlock)
}
const frame = ref<HTMLIFrameElement | null>(null)
const container = ref<HTMLElement | null>(null)
const canvasScale = ref(1)
const canvasHeight = ref(760)
const viewportWidth = computed(() => props.canvasWidth === 390 ? 390 : 1100)
let contentObserver: ResizeObserver | null = null
let sizeObserver: ResizeObserver | null = null
const canvasStyle = computed(() => props.fitCanvas ? {
  position: 'absolute' as const, width: `${viewportWidth.value}px`, height: `${canvasHeight.value}px`,
  left: '50%', top: '50%', transform: `translate(-50%, -50%) scale(${canvasScale.value})`,
} : {})
const target = shallowRef<HTMLElement | null>(null)
const frameDocument = '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:white"><div id="page-preview"></div></body></html>'
let stylesObserver: MutationObserver | null = null

// A real document viewport lets the shared renderer use its responsive breakpoints.
// Only application styles are copied; no user HTML or executable scripts enter srcdoc.
function syncStyles() {
  const preview = frame.value?.contentDocument
  if (!preview) return
  preview.head.querySelectorAll('[data-preview-style]').forEach(node => node.remove())
  window.document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
    const copy = node.cloneNode(true) as HTMLElement
    copy.setAttribute('data-preview-style', '')
    preview.head.append(copy)
  })
  const editorStyle = preview.createElement('style')
  editorStyle.setAttribute('data-preview-style', '')
  const accent = getComputedStyle(window.document.body).getPropertyValue('--admin-accent').trim() || '#2563eb'
  editorStyle.textContent = `[data-page-block]{cursor:pointer}[data-editor-selected="true"]{outline:2px solid ${accent};outline-offset:-2px}`
  preview.head.append(editorStyle)
  preview.documentElement.lang = window.document.documentElement.lang
  preview.documentElement.style.cssText = window.document.documentElement.style.cssText
}

function updateCanvas() {
  if (!props.fitCanvas || !container.value) return
  const content = target.value
  canvasHeight.value = Math.max(1, Math.ceil(content?.getBoundingClientRect().height ?? 760))
  canvasScale.value = Math.max(.01, Math.min(container.value.clientWidth / viewportWidth.value, container.value.clientHeight / canvasHeight.value))
}

function prepareFrame() {
  stylesObserver?.disconnect()
  syncStyles()
  target.value = frame.value?.contentDocument?.getElementById('page-preview') ?? null
  contentObserver?.disconnect()
  if (props.fitCanvas && target.value) {
    contentObserver = new ResizeObserver(updateCanvas)
    contentObserver.observe(target.value)
    updateCanvas()
  }
  stylesObserver = new MutationObserver(syncStyles)
  stylesObserver.observe(window.document.head, { childList: true, subtree: true, characterData: true })
}

watch(() => props.selectedBlockId, async id => {
  await nextTick()
  const sections = frame.value?.contentDocument?.querySelectorAll<HTMLElement>('[data-page-block]')
  sections?.forEach(section => {
    section.dataset.editorSelected = String(section.dataset.pageBlock === id)
    if (section.dataset.pageBlock === id) section.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  })
})
onMounted(() => {
  if (!props.fitCanvas || !container.value) return
  sizeObserver = new ResizeObserver(updateCanvas)
  sizeObserver.observe(container.value)
})
watch(viewportWidth, async () => { await nextTick(); updateCanvas() })
onBeforeUnmount(() => { stylesObserver?.disconnect(); sizeObserver?.disconnect(); contentObserver?.disconnect() })
</script>
