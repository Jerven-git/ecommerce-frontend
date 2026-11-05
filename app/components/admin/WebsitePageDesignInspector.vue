<template>
  <details class="section-design" :open="expanded">
    <summary class="flex min-h-11 cursor-pointer items-center justify-between gap-2 text-sm font-semibold text-admin-text">Section design<Icon name="heroicons:adjustments-horizontal" class="h-4 w-4 text-admin-muted" aria-hidden="true" /></summary>
    <div class="space-y-4 pt-3">
      <p class="text-xs leading-5 text-admin-muted">Style this section. Leave a setting at default to use its original design.</p>
      <div v-for="field in colorFields" :key="field.key" class="space-y-2">
        <label :for="`${block.id}-${field.key}`" class="text-xs font-semibold text-admin-text">{{ field.label }}</label>
        <div class="flex items-center gap-2">
          <input :id="`${block.id}-${field.key}`" type="color" :value="design[field.key] || field.fallback" class="h-11 w-12 rounded-lg border border-admin-border bg-admin-surface p-1" @input="set(field.key, ($event.target as HTMLInputElement).value)" />
          <span class="flex-1 text-xs text-admin-muted">{{ design[field.key] || 'Default' }}</span>
          <button v-if="design[field.key]" type="button" class="min-h-11 px-2 text-xs font-semibold text-admin-muted hover:text-admin-text" :aria-label="`Reset ${field.label.toLowerCase()}`" @click="set(field.key, undefined)">Reset</button>
        </div>
      </div>
      <label class="block text-xs font-semibold text-admin-text">Content width<select aria-label="Content width" :value="design.width || ''" class="design-input" @change="set('width', ($event.target as HTMLSelectElement).value || undefined)"><option value="">Default</option><option value="narrow">Narrow</option><option value="standard">Standard</option><option value="wide">Wide</option><option value="full">Full width</option></select></label>
      <label class="block text-xs font-semibold text-admin-text">Alignment<select aria-label="Alignment" :value="design.alignment || ''" class="design-input" @change="set('alignment', ($event.target as HTMLSelectElement).value || undefined)"><option value="">Default</option><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
      <div class="grid grid-cols-2 gap-3">
        <label v-for="field in spacingFields" :key="field.key" class="text-xs font-semibold text-admin-text">{{ field.label }}<input :aria-label="field.label" type="number" min="0" :max="field.max" step="4" :value="design[field.key] ?? ''" placeholder="Default" class="design-input" @input="setNumber(field.key, $event, field.max)" /><span class="mt-1 block text-[11px] font-normal text-admin-muted">Pixels</span></label>
      </div>
      <button v-if="Object.keys(design).length" type="button" class="min-h-11 text-xs font-semibold text-admin-muted hover:text-admin-text" @click="clear">Reset section design</button>
    </div>
  </details>
</template>

<script setup lang="ts">
import type { WebsitePageBlock } from '~/types/websitePage'
import type { WebsitePageSectionDesign } from '~/utils/websitePageDesign'
const props = withDefaults(defineProps<{ block: WebsitePageBlock; expanded?: boolean }>(), { expanded: false })
const emit = defineEmits<{ change: [design: WebsitePageSectionDesign] }>()
const design = computed<WebsitePageSectionDesign>(() => props.block.settings.design ?? {})
const colorFields = [{ key: 'background' as const, label: 'Background color', fallback: '#ffffff' }, { key: 'text_color' as const, label: 'Text color', fallback: '#111827' }]
const spacingFields = [{ key: 'padding_top' as const, label: 'Top spacing', max: 160 }, { key: 'padding_bottom' as const, label: 'Bottom spacing', max: 160 }, { key: 'corner_radius' as const, label: 'Corner radius', max: 48 }]
function set(key: string, value: unknown) {
  const next = { ...design.value } as Record<string, unknown>
  if (value === undefined) delete next[key]
  else next[key] = value
  emit('change', next)
}
function setNumber(key: string, event: Event, max: number) {
  const value = (event.target as HTMLInputElement).value
  if (value === '') set(key, undefined)
  else if (Number.isFinite(Number(value))) set(key, Math.round(Math.min(max, Math.max(0, Number(value)))))
}
function clear() { emit('change', {}) }
</script>

<style scoped>
.section-design { border-top: 1px solid var(--admin-border); padding-top: .75rem; }
.design-input { display: block; width: 100%; min-height: 2.75rem; margin-top: .5rem; padding: .5rem .75rem; border: 1px solid var(--admin-border); border-radius: .5rem; background: var(--admin-surface); color: var(--admin-text); font-size: .8125rem; font-weight: 400; }
:is(input, select, button, summary):focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
@media (max-width: 767px) { .design-input { font-size: 1rem; } }
</style>
