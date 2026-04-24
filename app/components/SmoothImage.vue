<template>
  <img
    :src="src"
    :alt="alt"
    :loading="loading"
    :fetchpriority="fetchpriority"
    decoding="async"
    :class="[
      'transition-[opacity,filter,transform] duration-700 ease-out',
      loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-[8px]',
    ]"
    @load="loaded = true"
    @error="loaded = true"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    src: string
    alt?: string
    loading?: 'lazy' | 'eager'
    fetchpriority?: 'high' | 'low' | 'auto'
  }>(),
  {
    alt: '',
    loading: 'lazy',
    fetchpriority: 'auto',
  },
)

const loaded = ref(false)
</script>
