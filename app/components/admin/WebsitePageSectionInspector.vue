<template>
  <section class="page-section-inspector" :aria-label="`${label} section settings`">
    <header class="inspector-header">
      <div class="inspector-title-row">
        <button ref="backButton" type="button" class="inspector-icon" aria-label="All sections" title="All sections" @click="$emit('back')"><Icon name="heroicons:arrow-left" class="h-4 w-4" aria-hidden="true" /></button>
        <h2>{{ label }}</h2>
        <div v-if="editable" class="inspector-actions" role="group" aria-label="Section actions">
          <button type="button" class="inspector-icon" :disabled="!canDuplicate" aria-label="Duplicate section" title="Duplicate section" @click="$emit('duplicate')"><Icon name="heroicons:document-duplicate" class="h-4 w-4" aria-hidden="true" /></button>
          <button type="button" class="inspector-icon inspector-remove" aria-label="Remove section" title="Remove section" @click="$emit('remove')"><Icon name="heroicons:trash" class="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </div>
      <div v-if="editable" class="inspector-visibility">
        <span><Icon :name="visible ? 'heroicons:eye' : 'heroicons:eye-slash'" class="h-4 w-4" aria-hidden="true" />{{ visible ? 'Visible on page' : 'Hidden on page' }}</span>
        <button type="button" class="inspector-switch" role="switch" aria-label="Show this section" :aria-checked="visible" @click="$emit('toggle-visible')"><span aria-hidden="true" /></button>
      </div>
      <nav v-if="editable" class="inspector-tabs" aria-label="Section settings">
        <button type="button" :aria-pressed="panel === 'content'" @click="$emit('update:panel', 'content')">Content</button>
        <span class="inspector-tab-divider" aria-hidden="true" />
        <button type="button" :aria-pressed="panel === 'design'" @click="$emit('update:panel', 'design')">Design</button>
      </nav>
    </header>
    <div v-show="!editable || panel === 'content'" class="inspector-fields"><slot name="content" /></div>
    <div v-show="editable && panel === 'design'" class="inspector-fields"><slot name="design" /></div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  visible: boolean
  editable: boolean
  canDuplicate: boolean
  panel?: 'content' | 'design'
}>(), { panel: 'content' })
defineEmits<{
  back: []; duplicate: []; remove: []; 'toggle-visible': []
  'update:panel': [value: 'content' | 'design']
}>()
const backButton = ref<HTMLButtonElement | null>(null)
defineExpose({ focus: () => backButton.value?.focus() })
</script>

<style scoped>
.page-section-inspector { min-width: 0; }
.inspector-header { position: sticky; top: 0; z-index: 2; border-bottom: 1px solid var(--admin-border); background: var(--admin-surface); }
.inspector-title-row { display: flex; align-items: center; gap: .25rem; padding: .5rem .5rem 0; }
.inspector-title-row h2 { flex: 1; min-width: 0; padding: .5rem 0; color: var(--admin-text); font-size: .875rem; font-weight: 600; line-height: 1.25rem; overflow-wrap: anywhere; }
.inspector-actions { display: flex; flex-shrink: 0; }
.inspector-icon { display: inline-flex; flex-shrink: 0; align-items: center; justify-content: center; width: 2.75rem; height: 2.75rem; border-radius: .375rem; color: var(--admin-muted); }
.inspector-icon:hover { background: var(--admin-soft); color: var(--admin-text); }
.inspector-remove:hover { background: var(--admin-danger-soft); color: var(--admin-danger); }
.inspector-icon:disabled { opacity: .35; cursor: not-allowed; }
.inspector-visibility { display: flex; align-items: center; justify-content: space-between; min-height: 2.75rem; gap: .75rem; padding: 0 1rem; }
.inspector-visibility > span { display: flex; align-items: center; gap: .5rem; color: var(--admin-muted); font-size: .75rem; }
.inspector-switch { display: flex; align-items: center; justify-content: center; width: 2.75rem; min-height: 2.75rem; flex-shrink: 0; }
.inspector-switch > span { display: block; position: relative; width: 2.25rem; height: 1.25rem; border-radius: 1rem; background: var(--admin-muted); }
.inspector-switch > span::after { content: ''; position: absolute; top: 2px; left: 2px; width: 1rem; height: 1rem; border-radius: 50%; background: var(--admin-surface); }
.inspector-switch[aria-checked="true"] > span { background: var(--admin-accent-strong); }
.inspector-switch[aria-checked="true"] > span::after { transform: translateX(1rem); background: var(--admin-on-accent, #fff); }
.inspector-tabs { display: flex; gap: 1rem; padding: 0 1rem; }
.inspector-tab-divider { flex: 0 0 1px; align-self: center; height: 1rem; background: var(--admin-border); }
.inspector-tabs button { position: relative; display: flex; align-items: center; min-height: 2.75rem; padding: .5rem .25rem; color: var(--admin-muted); font-size: .8125rem; font-weight: 600; }
.inspector-tabs button[aria-pressed="true"] { color: var(--admin-text); }
.inspector-tabs button[aria-pressed="true"]::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: var(--admin-accent-strong); }
.inspector-tabs button:hover { color: var(--admin-text); }
.inspector-fields { display: flex; flex-direction: column; gap: 1.25rem; min-width: 0; padding: 1rem; }
.inspector-fields :deep(input:not([type="checkbox"]):not([type="color"])), .inspector-fields :deep(textarea), .inspector-fields :deep(select) { font-size: .8125rem; font-weight: 400; line-height: 1.5; }
@media (max-width: 767px) { .inspector-fields :deep(input:not([type="checkbox"]):not([type="color"])), .inspector-fields :deep(textarea), .inspector-fields :deep(select) { font-size: 1rem; } }
button:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: -2px; }
</style>
