import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface ImageFitParams {
  scale: number
  offsetX: number
  offsetY: number
}

function computeObjectFitParams(
  contW: number, contH: number,
  natW: number, natH: number,
  fit: 'cover' | 'contain' = 'cover',
): ImageFitParams {
  const scale = fit === 'cover'
    ? Math.max(contW / natW, contH / natH)
    : Math.min(contW / natW, contH / natH)
  const dispW = natW * scale
  const dispH = natH * scale
  return {
    scale,
    offsetX: (contW - dispW) / 2,
    offsetY: (contH - dispH) / 2,
  }
}

export function useProductHoverZoom() {
  const containerRef = ref<HTMLElement | null>(null)
  const imageUrl = ref('')
  const zoomFactor = ref(1.5)

  const fitMode = ref<'cover' | 'contain'>('cover')
  const isDesktop = ref(false)
  const show = ref(false)
  const cursorX = ref(0)
  const cursorY = ref(0)
  const clientX = ref(0)
  const clientY = ref(0)

  const naturalW = ref(0)
  const naturalH = ref(0)

  let viewportW = 0
  let viewportH = 0

  function updateViewport() {
    viewportW = window.innerWidth
    viewportH = window.innerHeight
  }

  function onMouseEnter(e: MouseEvent) {
    if (!isDesktop.value || !containerRef.value) return
    updateViewport()
    clientX.value = e.clientX
    clientY.value = e.clientY
    show.value = true
    refreshImageSize()
    move(e)
  }

  function onMouseLeave() {
    show.value = false
  }

  function refreshImageSize() {
    if (!containerRef.value) return
    const img = containerRef.value.querySelector<HTMLImageElement>('img')
    if (img && img.complete && img.naturalWidth) {
      naturalW.value = img.naturalWidth
      naturalH.value = img.naturalHeight
    }
  }

  function move(e: MouseEvent) {
    if (!isDesktop.value || !containerRef.value) return
    clientX.value = e.clientX
    clientY.value = e.clientY

    const rect = containerRef.value.getBoundingClientRect()
    const cx = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const cy = Math.max(0, Math.min(e.clientY - rect.top, rect.height))

    cursorX.value = cx
    cursorY.value = cy
  }

  const lensPosition = computed(() => {
    if (!show.value) return { left: '-9999px', top: '-9999px' }

    const gap = 16
    const lensW = 400

    let left = clientX.value + gap
    let top = clientY.value - lensW / 2

    if (left + lensW > viewportW - gap) {
      left = clientX.value - lensW - gap
    }
    if (top + lensW > viewportH - gap) {
      top = viewportH - lensW - gap
    }
    if (top < gap) {
      top = gap
    }

    return { left: `${left}px`, top: `${top}px` }
  })

  const bgSize = computed(() => {
    if (!naturalW.value || !naturalH.value) return ''
    return `${naturalW.value * zoomFactor.value}px ${naturalH.value * zoomFactor.value}px`
  })

  const bgPosition = computed(() => {
    if (!show.value || !naturalW.value || !naturalH.value || !containerRef.value) return '0 0'

    const rect = containerRef.value.getBoundingClientRect()
    const params = computeObjectFitParams(rect.width, rect.height, naturalW.value, naturalH.value, fitMode.value)

    const ox = (cursorX.value - params.offsetX) / params.scale
    const oy = (cursorY.value - params.offsetY) / params.scale
    const Z = zoomFactor.value

    const half = 200
    return `${half - ox * Z}px ${half - oy * Z}px`
  })

  function checkDesktop() {
    isDesktop.value = !('ontouchstart' in window) && window.innerWidth >= 1024
  }

  onMounted(() => {
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', checkDesktop)
  })

  function setImage(url: string) {
    imageUrl.value = url
  }

  return {
    containerRef,
    imageUrl,
    show,
    cursorX,
    cursorY,
    zoomFactor,
    fitMode,
    lensPosition,
    bgSize,
    bgPosition,
    onMouseEnter,
    onMouseLeave,
    move,
    setImage,
  }
}
