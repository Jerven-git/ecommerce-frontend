<template>
  <Teleport to="body">
    <div
      v-show="visible"
      ref="cursorElement"
      class="ssu-cursor"
      aria-hidden="true"
      :class="{ 'is-active': interactive }"
    />
  </Teleport>
</template>

<script setup lang="ts">
const visible = ref(false)
const interactive = ref(false)
const cursorElement = ref<HTMLElement | null>(null)
let pointerQuery: MediaQueryList | undefined
let animationFrame: number | undefined
let nextX = 0
let nextY = 0
let enabled = false

function renderPosition() {
  animationFrame = undefined
  if (!cursorElement.value) return

  cursorElement.value.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) translate(-50%, -50%)`
}

function onPointerMove(event: PointerEvent) {
  nextX = event.clientX
  nextY = event.clientY
  visible.value = true
  if (animationFrame === undefined) animationFrame = window.requestAnimationFrame(renderPosition)
}

function onPointerOver(event: PointerEvent) {
  const isInteractive = event.target instanceof Element
    && Boolean(event.target.closest('a, button, [role="button"], input, select, textarea, label'))
  if (interactive.value !== isInteractive) interactive.value = isInteractive
}

function onPointerLeave() {
  visible.value = false
}

function enableCursor() {
  if (enabled) return
  enabled = true
  document.body.classList.add('ssu-cursor-enabled')
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerover', onPointerOver, { passive: true })
  document.documentElement.addEventListener('pointerleave', onPointerLeave)
}

function disableCursor() {
  if (!enabled) return
  enabled = false
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerover', onPointerOver)
  document.documentElement.removeEventListener('pointerleave', onPointerLeave)
  document.body.classList.remove('ssu-cursor-enabled')
  visible.value = false

  if (animationFrame !== undefined) {
    window.cancelAnimationFrame(animationFrame)
    animationFrame = undefined
  }
}

function syncCursorPreference() {
  if (pointerQuery?.matches) enableCursor()
  else disableCursor()
}

onMounted(() => {
  pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  pointerQuery.addEventListener('change', syncCursorPreference)
  syncCursorPreference()
})

onBeforeUnmount(() => {
  pointerQuery?.removeEventListener('change', syncCursorPreference)
  disableCursor()
})
</script>

<style>
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  body.ssu-cursor-enabled,
  body.ssu-cursor-enabled * {
    cursor: none !important;
  }
}

.ssu-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 30px;
  height: 30px;
  z-index: 10000;
  border-radius: 9999px;
  pointer-events: none;
  will-change: transform;
}

.ssu-cursor::before,
.ssu-cursor::after {
  content: '';
  position: absolute;
  border-radius: inherit;
}

.ssu-cursor::before {
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: #315b9f;
  transform: translate(-50%, -50%);
  transition: background-color 160ms ease;
}

.ssu-cursor::after {
  inset: 0;
  border: 1px solid rgb(49 91 159 / 62%);
  background: rgb(104 152 237 / 7%);
  transition: border-color 160ms ease, background-color 160ms ease;
}

.ssu-cursor.is-active::before {
  background: #6898ed;
}

.ssu-cursor.is-active::after {
  border-color: rgb(104 152 237 / 82%);
  background: rgb(104 152 237 / 12%);
}

@media (prefers-reduced-motion: reduce), (hover: none), (pointer: coarse) {
  .ssu-cursor {
    display: none !important;
  }
}
</style>
