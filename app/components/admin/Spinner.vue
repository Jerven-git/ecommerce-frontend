<template>
  <div class="flex flex-col items-center justify-center py-24 gap-3" role="status" aria-live="polite">
    <div class="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
    <p class="text-sm text-gray-500">{{ label }}</p>
    <span class="sr-only">Loading</span>
  </div>
</template>

<script setup lang="ts">
// Consistent load state for admin pages (replaces the copy-pasted spinner markup).
withDefaults(defineProps<{ label?: string }>(), { label: 'Loading…' })
</script>
