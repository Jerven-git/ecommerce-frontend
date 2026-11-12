<template>
  <fieldset class="space-y-4">
    <legend class="text-xs font-semibold text-admin-text">Text size</legend>
    <p class="text-xs leading-5 text-admin-muted">Adjust the Contact page text in pixels. Changes appear immediately in the preview.</p>
    <div v-for="field in CONTACT_TEXT_FIELDS" :key="field.key" class="space-y-2">
      <label :for="`contact-size-${field.key}`" class="block text-xs font-semibold text-admin-text">{{ field.label }}</label>
      <div class="flex items-center gap-3">
        <input :id="`contact-size-${field.key}`" type="range" :aria-label="field.label" :min="field.min" :max="field.max" step="1" :value="sizes[field.key] ?? field.default" class="min-h-11 min-w-0 flex-1 accent-admin-accent" @input="setSize(field.key, $event)" />
        <input type="number" :aria-label="`${field.label} in pixels`" :min="field.min" :max="field.max" :value="sizes[field.key] ?? field.default" class="min-h-11 w-20 rounded-lg border border-admin-border bg-admin-surface px-2 text-sm text-admin-text" @change="setSize(field.key, $event)" />
        <span class="text-xs text-admin-muted">px</span>
      </div>
    </div>
    <p class="text-xs leading-5 text-admin-muted">Form text stays at least 16px on phones for readability and to prevent zooming while typing.</p>
    <button v-if="Object.keys(sizes).length" type="button" class="admin-focus min-h-11 text-xs font-semibold text-admin-muted hover:text-admin-text" @click="emit('change', {})">Reset text sizes</button>
  </fieldset>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { CONTACT_TEXT_FIELDS, normalizeContactTypography, type ContactTypography, type ContactTextKey } from '~/utils/contactTypography'
const props = defineProps<{ modelValue?: ContactTypography }>()
const emit = defineEmits<{ change: [value: ContactTypography] }>()
const sizes = computed(() => normalizeContactTypography(props.modelValue))
function setSize(key: ContactTextKey, event: Event) {
  const raw = (event.target as HTMLInputElement).value
  if (!raw || !Number.isFinite(Number(raw))) return
  emit('change', normalizeContactTypography({ ...sizes.value, [key]: Number(raw) }))
}
</script>
