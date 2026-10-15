<template>
  <fieldset class="space-y-3 rounded-xl border border-admin-border p-3">
    <legend class="px-1 text-xs font-semibold text-admin-text">{{ label }}</legend>
    <input :value="cta.heading" maxlength="255" placeholder="Heading" :aria-label="`${label} heading`" class="editor-input" @input="update('heading', inputValue($event))" />
    <textarea :value="cta.subtitle" maxlength="500" rows="3" placeholder="Supporting text" :aria-label="`${label} supporting text`" class="editor-input min-h-24 resize-y" @input="update('subtitle', inputValue($event))" />
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <input :value="cta.button_label" maxlength="100" placeholder="Button label" :aria-label="`${label} button label`" class="editor-input" @input="update('button_label', inputValue($event))" />
      <input :value="cta.button_link" maxlength="500" placeholder="Button link" :aria-label="`${label} button link`" class="editor-input" @input="update('button_link', inputValue($event))" />
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import type { BlogPageCta, ServicesPageCta } from '~/composables/useSiteConfig'

const props = defineProps<{ label: string; cta: BlogPageCta | ServicesPageCta }>()
const emit = defineEmits<{ update: [value: BlogPageCta | ServicesPageCta] }>()
const inputValue = (event: Event) => (event.target as HTMLInputElement | HTMLTextAreaElement).value
function update(field: keyof BlogPageCta, value: string) {
  emit('update', { ...props.cta, [field]: value })
}
</script>

<style scoped>
.editor-input { min-height: 44px; width: 100%; border-radius: .75rem; border: 1px solid var(--admin-border); background: var(--admin-surface); padding: .625rem .75rem; color: var(--admin-text); font-size: .75rem; line-height: 1.25rem; }
.editor-input:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
</style>
