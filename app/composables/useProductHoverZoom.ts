import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface ImageFitParams {
  scale: number
  offsetX: number
  offsetY: number
}

const LENS_SIZE = 400

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
  const zoomFactor = ref(2.5)

  const fitMode = ref<'cover' | 'contain'>('cover')
  const isDesktop = ref(false)
  const show = ref(false)
  const cursorX = ref(0)
  const cursorY = ref(0)
  const clientX = ref(0)
  const clientY = ref(0)

  const naturalW = ref(0)
  const naturalH = ref(0)
  const containerW = ref(0)
  const containerH = ref(0)

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
    containerW.value = rect.width
    containerH.value = rect.height
    const cx = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const cy = Math.max(0, Math.min(e.clientY - rect.top, rect.height))

    cursorX.value = cx
    cursorY.value = cy
  }

  const lensPosition = computed(() => {
    if (!show.value) return { left: '-9999px', top: '-9999px' }

    const gap = 16
    const lensW = LENS_SIZE

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
    if (!naturalW.value || !naturalH.value || !containerW.value || !containerH.value) return ''

    const params = computeObjectFitParams(
      containerW.value,
      containerH.value,
      naturalW.value,
      naturalH.value,
      fitMode.value,
    )
    const scale = Math.max(
      params.scale * zoomFactor.value,
      LENS_SIZE / naturalW.value,
      LENS_SIZE / naturalH.value,
    )

    return `${naturalW.value * scale}px ${naturalH.value * scale}px`
  })

  const bgPosition = computed(() => {
    if (!show.value || !naturalW.value || !naturalH.value || !containerRef.value) return '0 0'

    if (!containerW.value || !containerH.value) return '0 0'

    const params = computeObjectFitParams(
      containerW.value,
      containerH.value,
      naturalW.value,
      naturalH.value,
      fitMode.value,
    )

    const ox = Math.max(0, Math.min((cursorX.value - params.offsetX) / params.scale, naturalW.value))
    const oy = Math.max(0, Math.min((cursorY.value - params.offsetY) / params.scale, naturalH.value))
    const scale = Math.max(
      params.scale * zoomFactor.value,
      LENS_SIZE / naturalW.value,
      LENS_SIZE / naturalH.value,
    )
    const backgroundW = naturalW.value * scale
    const backgroundH = naturalH.value * scale

    const half = LENS_SIZE / 2
    const x = Math.min(0, Math.max(LENS_SIZE - backgroundW, half - ox * scale))
    const y = Math.min(0, Math.max(LENS_SIZE - backgroundH, half - oy * scale))

    return `${x}px ${y}px`
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
