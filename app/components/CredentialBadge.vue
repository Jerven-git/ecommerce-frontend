<template>
  <span
    v-if="configured"
    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold"
  >
    <Icon name="mdi:check-circle" class="w-3 h-3" />
    Configured
  </span>
  <span
    v-else
    class="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[10px] font-medium"
  >
    Not set
  </span>
</template>

<script setup lang="ts">
defineProps<{
  configured: boolean
}>()
</script>
