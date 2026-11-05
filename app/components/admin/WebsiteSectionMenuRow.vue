<template>
  <div class="section-menu-entry" :class="{ 'is-selected': selected, 'is-hidden': !visible }">
    <div class="section-menu-row">
      <button v-if="expandable" type="button" class="section-menu-disclosure" :aria-label="`${expanded ? 'Collapse' : 'Expand'} ${label}`" :aria-expanded="expanded" @click="expanded = !expanded">
        <Icon name="heroicons:chevron-right" class="h-3.5 w-3.5" :class="{ 'rotate-90': expanded }" aria-hidden="true" />
      </button>
      <button type="button" class="section-menu-select" :aria-pressed="selected" :title="status ? `${label} · ${status}` : label" @click="$emit('select')">
        <Icon v-if="!expandable" name="heroicons:chevron-right" class="h-3.5 w-3.5 shrink-0 text-admin-muted" aria-hidden="true" />
        <Icon :name="icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
        <span class="truncate">{{ label }}</span>
        <Icon v-if="warning" name="heroicons:exclamation-circle" class="h-3.5 w-3.5 shrink-0 text-admin-warning" :title="status" />
        <span v-if="status" class="sr-only">{{ status }}</span>
      </button>
      <button v-if="composable" type="button" class="section-menu-action section-menu-visibility" :class="{ 'is-visible': !visible }" :disabled="disabled" :aria-label="`${visible ? 'Hide' : 'Show'} ${label}`" :aria-pressed="visible" :title="`${visible ? 'Hide' : 'Show'} ${label}`" @click="$emit('toggle')">
        <Icon :name="visible ? 'heroicons:eye' : 'heroicons:eye-slash'" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button v-if="composable" type="button" class="section-menu-action section-menu-more" :class="{ 'is-visible': actionsOpen }" :disabled="disabled" :aria-label="`Reorder ${label}`" :aria-expanded="actionsOpen" @click="actionsOpen = !actionsOpen">
        <Icon name="heroicons:ellipsis-horizontal" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button v-if="removable && composable" type="button" class="section-menu-action section-menu-remove is-visible" :disabled="disabled" :aria-label="`Remove ${label}`" :title="`Remove ${label}`" @click="$emit('remove')">
        <Icon name="heroicons:trash" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
    <div v-if="actionsOpen && composable" class="section-menu-reorder" role="group" :aria-label="`Reorder ${label}`" @keydown.esc.stop="actionsOpen = false">
      <button type="button" :disabled="disabled || first" @click="$emit('move', -1)"><Icon name="heroicons:arrow-up" class="h-3.5 w-3.5" aria-hidden="true" />Move up</button>
      <button type="button" :disabled="disabled || last" @click="$emit('move', 1)"><Icon name="heroicons:arrow-down" class="h-3.5 w-3.5" aria-hidden="true" />Move down</button>
    </div>
    <div v-if="expandable && expanded" class="section-menu-children"><slot /></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  icon: string
  selected?: boolean
  visible?: boolean
  composable?: boolean
  disabled?: boolean
  first?: boolean
  last?: boolean
  expandable?: boolean
  removable?: boolean
  status?: string
  warning?: boolean
}>(), { visible: true, composable: true, status: '' })
defineEmits<{ select: []; toggle: []; remove: []; move: [direction: -1 | 1] }>()
const expanded = ref(false)
const actionsOpen = ref(false)
</script>

<style scoped>
.section-menu-entry { min-width: 0; }
.section-menu-row { display: flex; align-items: center; border-radius: .375rem; min-height: 2.5rem; }
.section-menu-row:hover, .section-menu-row:focus-within { background: var(--admin-soft); }
.is-selected > .section-menu-row { background: var(--admin-accent-soft); }
.section-menu-select { display: flex; align-items: center; gap: .5rem; flex: 1; min-width: 0; min-height: 2.5rem; padding: .375rem .5rem; text-align: left; color: var(--admin-text); font-size: .8125rem; }
.is-hidden .section-menu-select { color: var(--admin-muted); }
.is-selected .section-menu-select { color: var(--admin-accent-strong); }
.section-menu-disclosure, .section-menu-action { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 1.75rem; min-height: 2.5rem; color: var(--admin-muted); border-radius: .25rem; }
.section-menu-disclosure + .section-menu-select { padding-left: 0; }
.section-menu-action:hover { color: var(--admin-text); background: var(--admin-surface); }
.section-menu-remove { width: 2.75rem; min-height: 2.75rem; }
.section-menu-remove:hover { color: var(--admin-danger); background: var(--admin-danger-soft); }
button:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: -2px; }
button:disabled { opacity: .35; cursor: not-allowed; }
.section-menu-children { margin-left: 1.75rem; padding-bottom: .5rem; }
.section-menu-reorder { display: flex; gap: .25rem; padding: .25rem .5rem .5rem 1.75rem; }
.section-menu-reorder button { display: flex; align-items: center; gap: .375rem; min-height: 2.5rem; padding: .25rem .5rem; border-radius: .25rem; color: var(--admin-muted); font-size: .75rem; }
.section-menu-reorder button:hover:not(:disabled) { background: var(--admin-soft); color: var(--admin-text); }
@media (hover: hover) and (pointer: fine) {
  .section-menu-action { opacity: 0; }
  .section-menu-row:hover .section-menu-action, .section-menu-row:focus-within .section-menu-action, .section-menu-action.is-visible { opacity: 1; }
}
@media (pointer: coarse) {
  .section-menu-row, .section-menu-select, .section-menu-disclosure, .section-menu-action, .section-menu-reorder button { min-height: 2.75rem; }
  .section-menu-disclosure, .section-menu-action { width: 2.75rem; }
}
</style>
