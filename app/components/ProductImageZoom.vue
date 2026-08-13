<template>
  <div
    v-if="enabled"
    ref="containerRef"
    class="relative block"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @mousemove="move"
  >
    <slot />

    <Teleport to="body">
      <div
        v-show="show"
        class="fixed z-[70] pointer-events-none overflow-hidden rounded-2xl border-2 border-white shadow-2xl bg-white"
        :style="{
          ...lensPosition,
          width: '400px',
          height: '400px',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: bgSize,
          backgroundPosition: bgPosition,
          backgroundRepeat: 'no-repeat',
        }"
      />
    </Teleport>
  </div>
  <div v-else class="relative block">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useProductHoverZoom } from '~/composables/useProductHoverZoom'

const props = withDefaults(defineProps<{
  imageUrl?: string
  zoomFactor?: number
  enabled?: boolean
  fitMode?: 'cover' | 'contain'
}>(), {
  imageUrl: '',
  zoomFactor: 2.5,
  enabled: false,
  fitMode: 'cover',
})

const {
  containerRef,
  imageUrl,
  show,
  zoomFactor,
  fitMode,
  lensPosition,
  bgSize,
  bgPosition,
  onMouseEnter,
  onMouseLeave,
  move,
  setImage,
} = useProductHoverZoom()

watch(() => props.imageUrl, (url) => {
  if (url) setImage(url)
}, { immediate: true })

watch(() => props.zoomFactor, (z) => {
  if (z && z > 0) zoomFactor.value = z
}, { immediate: true })

watch(() => props.fitMode, (m) => {
  fitMode.value = m
}, { immediate: true })
</script>
