<template>
  <label class="block">
    <span class="mb-1.5 block text-xs font-semibold text-admin-text">{{ label }}</span>
    <slot />
    <span v-if="error" class="mt-1.5 block text-xs leading-4 text-admin-danger">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string; error?: string }>()
</script>
