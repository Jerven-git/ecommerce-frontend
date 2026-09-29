<template>
  <Teleport to="body">
    <div v-show="visible" class="ssu-cursor-dot" aria-hidden="true" :class="{ 'is-active': interactive }" />
    <div v-show="visible" class="ssu-cursor-ring" aria-hidden="true" :class="{ 'is-active': interactive }" />
  </Teleport>
</template>

<script setup lang="ts">
const visible = ref(false)
const interactive = ref(false)
let cleanup: (() => void) | undefined

onBeforeUnmount(() => cleanup?.())

onMounted(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (!finePointer.matches || reducedMotion.matches) return

  const dot = document.querySelector<HTMLElement>('.ssu-cursor-dot')
  const ring = document.querySelector<HTMLElement>('.ssu-cursor-ring')
  if (!dot || !ring) return

  document.body.classList.add('ssu-cursor-enabled')

  const onPointerMove = (event: PointerEvent) => {
    const transform = 'translate3d(' + event.clientX + 'px, ' + event.clientY + 'px, 0) translate(-50%, -50%)'
    dot.style.transform = transform
    ring.style.transform = transform
    visible.value = true
  }
  const onPointerOver = (event: PointerEvent) => {
    interactive.value = event.target instanceof Element
      && Boolean(event.target.closest('a, button, [role="button"], input, select, textarea, label'))
  }
  const onPointerLeave = () => { visible.value = false }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerover', onPointerOver, { passive: true })
  document.documentElement.addEventListener('pointerleave', onPointerLeave)

  cleanup = () => {
    window.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerover', onPointerOver)
    document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    document.body.classList.remove('ssu-cursor-enabled')
  }
})
</script>

<style>
@media (hover: hover) and (pointer: fine) {
  body.ssu-cursor-enabled,
  body.ssu-cursor-enabled * {
    cursor: none !important;
  }
}

.ssu-cursor-dot,
.ssu-cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;
  border-radius: 9999px;
  pointer-events: none;
  will-change: transform;
}

.ssu-cursor-dot::before,
.ssu-cursor-ring::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.ssu-cursor-dot {
  width: 6px;
  height: 6px;
}

.ssu-cursor-ring {
  width: 30px;
  height: 30px;
}

.ssu-cursor-dot::before {
  background: #315b9f;
  transition: background-color 160ms ease;
}

.ssu-cursor-ring::before {
  border: 1px solid rgb(49 91 159 / 62%);
  background: rgb(104 152 237 / 7%);
  transition: border-color 160ms ease, background-color 160ms ease;
}

.ssu-cursor-dot.is-active::before {
  background: #6898ed;
}

.ssu-cursor-ring.is-active::before {
  border-color: rgb(104 152 237 / 82%);
  background: rgb(104 152 237 / 12%);
}

@media (prefers-reduced-motion: reduce), (hover: none), (pointer: coarse) {
  .ssu-cursor-dot,
  .ssu-cursor-ring {
    display: none !important;
  }
}
</style>
