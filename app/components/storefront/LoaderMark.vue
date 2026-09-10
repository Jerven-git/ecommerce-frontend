<template>
  <div class="flex h-16 w-28 items-center justify-center">
    <img
      v-if="logoUrl"
      :src="logoUrl"
      alt=""
      class="loader-logo max-h-14 max-w-28 object-contain"
      :class="animationClass"
      loading="eager"
      decoding="sync"
      fetchpriority="high"
    />

    <div v-else class="grid h-11 w-11 grid-cols-2 gap-1.5">
      <span v-for="index in 4" :key="index" class="loader-cell rounded-[5px] bg-primary-600" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoaderLogoAnimation } from '~/composables/useSiteConfig'

const props = withDefaults(defineProps<{
  logoUrl?: string | null
  animation?: LoaderLogoAnimation
}>(), {
  logoUrl: '',
  animation: 'bounce',
})

const animationClass = computed(() => `loader-logo--${props.animation}`)
</script>

<style scoped>
.loader-cell {
  animation: loader-cell 900ms cubic-bezier(0.16, 1, 0.3, 1) infinite;
  transform-origin: center;
}

.loader-cell:nth-child(2) { animation-delay: 90ms; }
.loader-cell:nth-child(4) { animation-delay: 180ms; }
.loader-cell:nth-child(3) { animation-delay: 270ms; }

.loader-logo {
  transform-origin: center;
  will-change: transform;
}

.loader-logo--bounce {
  animation: loader-logo-bounce 900ms cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}

.loader-logo--rotate {
  animation: loader-logo-rotate 1.5s linear infinite;
}

.loader-logo--slide {
  animation: loader-logo-slide 1s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}

@keyframes loader-cell {
  0%, 100% { opacity: 0.24; transform: scale(0.72); }
  42% { opacity: 1; transform: scale(1); }
}

@keyframes loader-logo-bounce {
  from { transform: translateY(5px); }
  to { transform: translateY(-7px); }
}

@keyframes loader-logo-rotate {
  to { transform: rotate(360deg); }
}

@keyframes loader-logo-slide {
  from { transform: translateX(-12px); }
  to { transform: translateX(12px); }
}

@media (prefers-reduced-motion: reduce) {
  .loader-cell,
  .loader-logo {
    animation: none;
    will-change: auto;
  }

  .loader-cell { opacity: 0.72; }
}
</style>
