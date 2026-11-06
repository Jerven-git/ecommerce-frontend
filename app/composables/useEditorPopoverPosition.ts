import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

export function useEditorPopoverPosition(anchorRef: Ref<HTMLElement | null>, isOpen: () => boolean, preferredWidth: () => number) {
const popoverStyle = ref<Record<string, string>>({})

function positionPopover() {
  if (!anchorRef.value) return
  const anchor = anchorRef.value.getBoundingClientRect()
  const viewport = window.visualViewport
  const viewportLeft = viewport?.offsetLeft ?? 0
  const viewportTop = viewport?.offsetTop ?? 0
  const viewportWidth = viewport?.width ?? window.innerWidth
  const viewportHeight = viewport?.height ?? window.innerHeight
  const gutter = 12
  const width = Math.min(preferredWidth(), viewportWidth - gutter * 2)
  const left = Math.max(viewportLeft + gutter, Math.min(anchor.left, viewportLeft + viewportWidth - width - gutter))
  const top = Math.max(viewportTop + gutter, Math.min(anchor.bottom + 8, viewportTop + viewportHeight - 120))
  popoverStyle.value = {
    left: `${left}px`, top: `${top}px`, width: `${width}px`,
    maxHeight: `${Math.max(0, Math.min(512, viewportTop + viewportHeight - top - gutter))}px`,
  }
}

function repositionOpenPopover() { if (isOpen()) positionPopover() }

  onMounted(() => {
  window.addEventListener('resize', repositionOpenPopover)
  window.addEventListener('scroll', repositionOpenPopover, true)
  window.visualViewport?.addEventListener('resize', repositionOpenPopover)
  window.visualViewport?.addEventListener('scroll', repositionOpenPopover)
  })
  onBeforeUnmount(() => {
  window.removeEventListener('resize', repositionOpenPopover)
  window.removeEventListener('scroll', repositionOpenPopover, true)
  window.visualViewport?.removeEventListener('resize', repositionOpenPopover)
  window.visualViewport?.removeEventListener('scroll', repositionOpenPopover)
  })
  return { popoverStyle, positionPopover }
}
