<template>
  <div class="w-full h-full flex items-center justify-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :class="iconClass"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" :stroke-width="strokeWidth" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const iconClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-12 h-12 text-gray-300'
    case 'lg': return 'w-20 h-20 text-gray-300'
    default: return 'w-16 h-16 text-gray-400'
  }
})

const strokeWidth = computed(() => props.size === 'sm' || props.size === 'lg' ? 1.5 : 2)
</script>
