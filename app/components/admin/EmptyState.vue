<template>
  <div class="px-6 py-14 text-center">
    <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
      <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          v-for="(d, i) in iconPaths"
          :key="i"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          :d="d"
        />
      </svg>
    </div>
    <p class="text-sm font-semibold text-gray-700">{{ title }}</p>
    <p v-if="description" class="mt-1 text-sm text-gray-500">{{ description }}</p>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Empty states that teach the interface rather than showing blank space.
const props = defineProps<{
  title: string
  description?: string
  /** One or more SVG path `d` strings. */
  icon: string | string[]
}>()

const iconPaths = computed(() => (Array.isArray(props.icon) ? props.icon : [props.icon]))
</script>
