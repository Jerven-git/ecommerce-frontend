<template>
  <div role="alert" class="px-5 py-10 text-center">
    <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-admin-danger-soft text-admin-danger">
      <Icon name="heroicons:exclamation-triangle" class="h-5 w-5" aria-hidden="true" />
    </div>
    <p class="mt-3 text-sm font-semibold text-admin-danger">{{ title }}</p>
    <p class="mx-auto mt-1 max-w-md text-sm leading-relaxed text-admin-muted">{{ message }}</p>
    <button type="button" class="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-admin-border bg-admin-surface px-3 text-xs font-medium text-admin-text hover:bg-admin-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent" aria-label="Retry loading" title="Retry loading" @click="$emit('retry')">
      <Icon name="heroicons:arrow-path" class="h-4 w-4" aria-hidden="true" />
      Try again
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  message: string
}>(), {
  title: 'Couldn’t load this view',
})

defineEmits<{ retry: [] }>()
</script>
