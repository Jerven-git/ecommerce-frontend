<template>
  <fieldset class="space-y-3 rounded-xl border border-admin-border p-3">
    <legend class="px-1 text-xs font-semibold text-admin-text">{{ label }}</legend>
    <input :value="section.heading" maxlength="150" placeholder="Heading" :aria-label="`${label} heading`" class="editor-input" @input="update('heading', inputValue($event))" />
    <textarea :value="section.body" maxlength="2000" rows="5" placeholder="Body" :aria-label="`${label} body`" class="editor-input min-h-32 resize-y" @input="update('body', inputValue($event))" />
    <div class="grid grid-cols-2 gap-2">
      <input :value="section.cta_label" maxlength="50" placeholder="Button label" :aria-label="`${label} button label`" class="editor-input" @input="update('cta_label', inputValue($event))" />
      <input :value="section.cta_link" maxlength="500" placeholder="Button link" :aria-label="`${label} button link`" class="editor-input" @input="update('cta_link', inputValue($event))" />
    </div>
    <label class="block text-[11px] font-semibold text-admin-muted">Image position
      <select :value="section.image_position" class="editor-input mt-1" @change="update('image_position', inputValue($event))">
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>
    </label>
  </fieldset>
</template>

<script setup lang="ts">
import type { StoryPageSection } from '~/composables/useSiteConfig'

const props = defineProps<{ label: string; section: StoryPageSection }>()
const emit = defineEmits<{ update: [value: StoryPageSection] }>()
const inputValue = (event: Event) => (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value
function update(field: keyof StoryPageSection, value: string) {
  emit('update', { ...props.section, [field]: value })
}
</script>

<style scoped>
.editor-input { min-height: 44px; width: 100%; border-radius: .75rem; border: 1px solid var(--admin-border); background: var(--admin-surface); padding: .625rem .75rem; color: var(--admin-text); font-size: .75rem; line-height: 1.25rem; }
.editor-input:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
</style>
