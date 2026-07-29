<template>
  <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="min-w-0">
      <slot name="breadcrumb" />
      <h1 class="truncate text-2xl font-semibold tracking-tight text-admin-text">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 max-w-3xl text-sm text-admin-muted">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Shared page header for admin surfaces: a settled title/subtitle block with an
// optional breadcrumb slot above and an actions slot (buttons) on the right.
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
