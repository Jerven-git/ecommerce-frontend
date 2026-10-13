<template>
  <fieldset class="space-y-3 rounded-xl border border-admin-border p-3">
    <legend class="px-1 text-xs font-semibold text-admin-text">{{ label }}</legend>
    <input :value="header.label" maxlength="100" placeholder="Label" :aria-label="`${label} label`" class="editor-input" @input="update('label', inputValue($event))" />
    <input :value="header.heading" maxlength="255" placeholder="Heading" :aria-label="`${label} heading`" class="editor-input" @input="update('heading', inputValue($event))" />
    <textarea :value="header.subtitle" maxlength="500" rows="3" placeholder="Supporting text" :aria-label="`${label} supporting text`" class="editor-input min-h-24 resize-y" @input="update('subtitle', inputValue($event))" />
  </fieldset>
</template>

<script setup lang="ts">
const props = defineProps<{ label: string; header: { label: string; heading: string; subtitle: string } }>()
const emit = defineEmits<{ update: [value: { label: string; heading: string; subtitle: string }] }>()
const inputValue = (event: Event) => (event.target as HTMLInputElement | HTMLTextAreaElement).value
function update(field: 'label' | 'heading' | 'subtitle', value: string) {
  emit('update', { ...props.header, [field]: value })
}
</script>

<style scoped>
.editor-input { min-height: 44px; width: 100%; border-radius: .75rem; border: 1px solid var(--admin-border); background: var(--admin-surface); padding: .625rem .75rem; color: var(--admin-text); font-size: .75rem; line-height: 1.25rem; }
.editor-input:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
</style>
