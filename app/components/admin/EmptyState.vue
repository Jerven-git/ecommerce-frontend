<template>
  <div class="px-6 py-14 text-center">
    <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-soft">
      <svg class="h-6 w-6 text-admin-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
    <p class="text-sm font-semibold text-admin-text">{{ title }}</p>
    <p v-if="description" class="mx-auto mt-1 max-w-md text-sm text-admin-muted">{{ description }}</p>
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
  icon?: string | string[]
}>()

const iconPaths = computed(() => {
  const fallback = 'M8 7h8M8 12h8M8 17h5M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2Z'
  if (!props.icon) return [fallback]
  return Array.isArray(props.icon) ? props.icon : [props.icon]
})
</script>
