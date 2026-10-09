<template>
  <div class="px-6 py-14 text-center">
    <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-soft">
      <Icon :name="icon" class="h-6 w-6 text-admin-muted" aria-hidden="true" />
    </div>
    <p class="text-sm font-semibold text-admin-text">{{ title }}</p>
    <p v-if="description" class="mx-auto mt-1 max-w-md text-sm text-admin-muted">{{ description }}</p>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Empty states that teach the interface rather than showing blank space.
withDefaults(defineProps<{
  title: string
  description?: string
  /** Heroicons name used for the empty-state glyph. */
  icon?: string
}>(), {
  icon: 'heroicons:document-text',
})
</script>
