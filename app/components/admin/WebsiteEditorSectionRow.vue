<template>
  <div
    class="flex items-center gap-1 rounded-xl p-1 transition-colors"
    :class="selected ? 'bg-admin-accent-soft' : 'hover:bg-admin-soft'"
  >
    <button
      type="button"
      class="editor-row-focus flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-2 text-left"
      :class="selected ? 'text-admin-accent-strong' : 'text-admin-muted'"
      :aria-pressed="selected"
      @click="$emit('select')"
    >
      <Icon :name="icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
      <span class="min-w-0 flex-1">
        <span class="block truncate text-xs font-semibold">{{ label }}</span>
        <span class="mt-0.5 block text-xs font-medium" :class="statusClass">{{ status }}</span>
      </span>
    </button>

    <div v-if="composable" class="flex shrink-0 items-center" role="group" :aria-label="`${label} composition controls`">
      <button
        type="button"
        class="editor-row-focus flex min-h-11 min-w-11 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-surface hover:text-admin-text disabled:cursor-not-allowed disabled:opacity-30"
        :disabled="disabled || first"
        :aria-label="`Move ${label} up`"
        :title="`Move ${label} up`"
        @click="$emit('move', -1)"
      >
        <Icon name="heroicons:arrow-up" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-row-focus flex min-h-11 min-w-11 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-surface hover:text-admin-text disabled:cursor-not-allowed disabled:opacity-30"
        :disabled="disabled || last"
        :aria-label="`Move ${label} down`"
        :title="`Move ${label} down`"
        @click="$emit('move', 1)"
      >
        <Icon name="heroicons:arrow-down" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-row-focus flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-admin-surface disabled:cursor-not-allowed disabled:opacity-30"
        :class="visible ? 'text-admin-success' : 'text-admin-muted'"
        :disabled="disabled"
        :aria-label="visible ? `Hide ${label}` : `Show ${label}`"
        :aria-pressed="visible"
        :title="visible ? `Hide ${label}` : `Show ${label}`"
        @click="$emit('toggle')"
      >
        <Icon :name="visible ? 'heroicons:eye' : 'heroicons:eye-slash'" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  icon: string
  selected: boolean
  visible: boolean
  editable: boolean
  hasContent: boolean
  first: boolean
  last: boolean
  disabled?: boolean
  composable?: boolean
}>(), {
  disabled: false,
  composable: true,
})

defineEmits<{
  select: []
  move: [direction: -1 | 1]
  toggle: []
}>()

const status = computed(() => {
  if (!props.visible) return 'Hidden'
  if (!props.hasContent) return 'Needs content'
  return props.editable ? 'Visible' : 'Visible · advanced'
})
const statusClass = computed(() => {
  if (!props.visible) return 'text-admin-muted'
  if (!props.hasContent) return 'text-admin-warning'
  return 'text-admin-success'
})
</script>

<style scoped>
.editor-row-focus:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 1px;
}
</style>
