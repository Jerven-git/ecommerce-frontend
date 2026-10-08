<template>
  <div class="w-full h-full flex items-center justify-center">
    <Icon name="heroicons:photo" :class="iconClass" aria-hidden="true" />
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
