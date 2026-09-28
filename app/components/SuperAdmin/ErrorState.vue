<template>
  <div role="alert" class="px-5 py-10 text-center">
    <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-admin-danger-soft text-admin-danger">
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
    </div>
    <p class="mt-3 text-sm font-semibold text-admin-danger">{{ title }}</p>
    <p class="mx-auto mt-1 max-w-md text-sm leading-relaxed text-admin-muted">{{ message }}</p>
    <button type="button" class="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-admin-border bg-admin-surface px-4 text-sm font-medium text-admin-text hover:bg-admin-soft" aria-label="Retry loading" title="Retry loading" @click="$emit('retry')">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-14.97-4M4 16a8 8 0 0014.97 4" /></svg>
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
