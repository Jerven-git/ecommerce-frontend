<template>
  <fieldset class="grid grid-cols-1 gap-2 rounded-xl border border-admin-border p-3 sm:grid-cols-2">
    <legend class="px-1 text-xs font-semibold text-admin-text">{{ label }}</legend>
    <input :value="cta.label" maxlength="100" placeholder="Button label" :aria-label="`${label} label`" class="editor-input" @input="update('label', inputValue($event))" />
    <input :value="cta.link" maxlength="500" placeholder="Button link" :aria-label="`${label} link`" class="editor-input" @input="update('link', inputValue($event))" />
  </fieldset>
</template>

<script setup lang="ts">
import type { ServicesPageCtaLink } from '~/composables/useSiteConfig'

const props = defineProps<{ label: string; cta: ServicesPageCtaLink }>()
const emit = defineEmits<{ update: [value: ServicesPageCtaLink] }>()
const inputValue = (event: Event) => (event.target as HTMLInputElement).value
function update(field: keyof ServicesPageCtaLink, value: string) {
  emit('update', { ...props.cta, [field]: value })
}
</script>

<style scoped>
.editor-input { min-height: 44px; width: 100%; border-radius: .75rem; border: 1px solid var(--admin-border); background: var(--admin-surface); padding: .625rem .75rem; color: var(--admin-text); font-size: .75rem; line-height: 1.25rem; }
.editor-input:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
</style>
