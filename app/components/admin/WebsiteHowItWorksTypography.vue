<template>
  <fieldset class="space-y-4">
    <legend class="text-xs font-semibold text-admin-text">Text size</legend>
    <p class="text-xs leading-5 text-admin-muted">Adjust the text in pixels. The preview updates as you change each size.</p>
    <p v-for="message in validationMessages" :key="message" class="text-xs text-admin-danger" role="alert">{{ message }}</p>
    <div v-for="field in HOW_IT_WORKS_TEXT_FIELDS" :key="field.key" class="space-y-2">
      <label :for="`steps-font-${field.key}`" class="block text-xs font-semibold text-admin-text">{{ field.label }}</label>
      <div class="flex items-center gap-3">
        <input :id="`steps-font-${field.key}`" type="range" :aria-label="field.label" :min="field.min" :max="field.max" step="1" :value="sizes[field.key]" class="min-h-11 min-w-0 flex-1 accent-admin-accent" @input="setSize(field.key, $event)" />
        <input type="number" :aria-label="`${field.label} in pixels`" :min="field.min" :max="field.max" :value="sizes[field.key]" class="min-h-11 w-20 rounded-lg border border-admin-border bg-admin-surface px-2 text-sm text-admin-text" @input="setSize(field.key, $event)" />
        <span class="text-xs text-admin-muted">px</span>
      </div>
    </div>
    <button v-if="modelValue.homepage_steps.typography" type="button" class="admin-focus min-h-11 text-xs font-semibold text-admin-muted hover:text-admin-text" @click="reset">Reset text sizes</button>
  </fieldset>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'
import { HOW_IT_WORKS_TEXT_FIELDS, howItWorksTextSizes, type HowItWorksTextKey } from '~/utils/howItWorks'
const props = defineProps<{ modelValue: WebsiteEditorDraftPayload; errors?: Record<string, string[]> }>()
const emit = defineEmits<{ 'update:modelValue': [value: WebsiteEditorDraftPayload] }>()
const validationMessages = computed(() => Object.entries(props.errors ?? {}).filter(([key]) => key.startsWith('payload.homepage_steps.typography')).flatMap(([, messages]) => messages))
const sizes = computed(() => howItWorksTextSizes(props.modelValue.homepage_steps.typography))
function setSize(key: HowItWorksTextKey, event: Event) {
  const raw = (event.target as HTMLInputElement).value
  if (!raw || !Number.isFinite(Number(raw))) return
  const typography = howItWorksTextSizes({ ...sizes.value, [key]: Number(raw) })
  emit('update:modelValue', { ...props.modelValue, homepage_steps: { ...props.modelValue.homepage_steps, typography } })
}
function reset() {
  const homepage_steps = { ...props.modelValue.homepage_steps }
  delete homepage_steps.typography
  emit('update:modelValue', { ...props.modelValue, homepage_steps })
}
</script>
