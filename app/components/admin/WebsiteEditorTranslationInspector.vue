<template>
  <div class="mt-3 border-t border-admin-border pt-3">
    <div class="flex items-start gap-2.5 px-1">
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-accent-soft text-admin-accent-strong">
        <Icon name="heroicons:language" class="h-4 w-4" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-semibold text-admin-text">{{ localeName }} translation</h3>
        <p class="mt-0.5 text-xs leading-5 text-admin-muted">Empty fields use the {{ defaultName }} content shown beneath each label.</p>
      </div>
    </div>

    <div v-if="fields.length" class="mt-3 grid gap-3">
      <label v-for="field in fields" :key="field.path" class="grid gap-1.5">
        <span class="flex items-center justify-between gap-2 text-xs font-medium text-admin-text">
          <span class="capitalize">{{ field.label }}</span>
          <span v-if="translation(field.path)" class="text-[10px] font-semibold text-admin-success">Translated</span>
        </span>
        <textarea
          v-if="field.multiline"
          :value="translation(field.path)"
          :maxlength="field.maxlength"
          rows="3"
          class="translation-input min-h-24 resize-y rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-xs leading-5 text-admin-text placeholder:text-admin-muted"
          :placeholder="field.fallback || 'No default content'"
          @input="setTranslation(field.path, ($event.target as HTMLTextAreaElement).value)"
        />
        <input
          v-else
          :value="translation(field.path)"
          :maxlength="field.maxlength"
          type="text"
          class="translation-input min-h-11 rounded-xl border border-admin-border bg-admin-surface px-3 text-xs text-admin-text placeholder:text-admin-muted"
          :placeholder="field.fallback || 'No default content'"
          @input="setTranslation(field.path, ($event.target as HTMLInputElement).value)"
        >
        <span v-if="field.fallback" class="line-clamp-2 text-[11px] leading-4 text-admin-muted">Default: {{ field.fallback }}</span>
      </label>
    </div>
    <div v-else class="mt-3 rounded-xl bg-admin-soft px-3 py-3 text-xs leading-5 text-admin-muted">
      This section has no translatable text. Images, links, visibility, and layout stay shared across languages.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'
import type { WebsiteEditorPageId } from '~/utils/websiteEditorPages'
import { websiteEditorLocaleName, websiteEditorTranslationFields } from '~/utils/websiteEditorLocalization'

const props = defineProps<{
  modelValue: WebsiteEditorDraftPayload
  locale: string
  page: WebsiteEditorPageId
  section: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: WebsiteEditorDraftPayload] }>()

const fields = computed(() => websiteEditorTranslationFields(props.modelValue, props.page, props.section))
const localeName = computed(() => websiteEditorLocaleName(props.locale))
const defaultName = computed(() => websiteEditorLocaleName(props.modelValue.default_locale))
const translation = (path: string) => props.modelValue.localized_content[props.locale]?.[path] ?? ''

function setTranslation(path: string, value: string) {
  const translations = { ...(props.modelValue.localized_content[props.locale] ?? {}) }
  if (value.trim()) translations[path] = value
  else delete translations[path]
  emit('update:modelValue', {
    ...props.modelValue,
    localized_content: {
      ...props.modelValue.localized_content,
      [props.locale]: translations,
    },
  })
}
</script>

<style scoped>
.translation-input:focus-visible {
  border-color: var(--admin-accent);
  outline: 2px solid color-mix(in srgb, var(--admin-accent) 22%, transparent);
  outline-offset: 1px;
}
</style>
