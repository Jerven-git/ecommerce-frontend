<template>
  <div class="border-t border-admin-border pt-4">
    <div class="mb-4 px-1">
      <h3 class="text-sm font-semibold text-admin-text">{{ title }}</h3>
      <p class="mt-1 text-xs leading-5 text-admin-muted">{{ description }}</p>
    </div>

    <div v-if="sectionErrors.length" class="mb-4 rounded-xl border border-admin-danger/20 bg-admin-danger-soft px-3 py-2.5 text-admin-danger" role="alert">
      <p class="text-xs font-semibold">Fix this section before saving</p>
      <ul class="mt-1 list-disc space-y-1 pl-4 text-[11px] leading-5">
        <li v-for="(message, index) in sectionErrors" :key="`${index}-${message}`">{{ message }}</li>
      </ul>
    </div>

    <div v-if="section === 'hero'" class="space-y-4">
      <AdminEditorField label="Heading" :error="errorFor('hero_title')">
        <input :value="modelValue.hero_title" maxlength="255" class="editor-input" @input="setRoot('hero_title', inputValue($event))" />
      </AdminEditorField>
      <AdminEditorField label="Supporting text" :error="errorFor('hero_subtitle')">
        <textarea :value="modelValue.hero_subtitle" maxlength="255" rows="3" class="editor-input min-h-24 resize-y" @input="setRoot('hero_subtitle', inputValue($event))" />
      </AdminEditorField>
      <div class="grid grid-cols-2 gap-3">
        <AdminEditorField label="Overlay">
          <input :value="modelValue.hero_overlay_color" type="color" class="editor-color" @input="setRoot('hero_overlay_color', inputValue($event))" />
        </AdminEditorField>
        <AdminEditorField label="Opacity">
          <input :value="modelValue.hero_overlay_opacity" type="number" min="0" max="100" class="editor-input" @input="setRoot('hero_overlay_opacity', numberValue($event))" />
        </AdminEditorField>
      </div>
      <label class="flex min-h-11 items-center gap-3 rounded-xl border border-admin-border px-3 text-xs font-medium text-admin-text">
        <input :checked="modelValue.hero_full_bleed" type="checkbox" class="h-4 w-4 accent-admin-accent" @change="setRoot('hero_full_bleed', checkedValue($event))" />
        Full-height hero
      </label>
      <div class="grid grid-cols-2 gap-3">
        <AdminEditorField label="Focus X">
          <input :value="modelValue.hero_focal_x" type="number" min="0" max="100" class="editor-input" @input="setRoot('hero_focal_x', numberValue($event))" />
        </AdminEditorField>
        <AdminEditorField label="Focus Y">
          <input :value="modelValue.hero_focal_y" type="number" min="0" max="100" class="editor-input" @input="setRoot('hero_focal_y', numberValue($event))" />
        </AdminEditorField>
      </div>
      <p class="text-[11px] leading-5 text-admin-muted">Hero media stays in Site Settings during this phase.</p>
    </div>

    <div v-else-if="section === 'how-it-works'" class="space-y-4">
      <AdminEditorField label="Label"><input :value="modelValue.homepage_steps.label" maxlength="100" class="editor-input" @input="setNested('homepage_steps', 'label', inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Heading"><input :value="modelValue.homepage_steps.heading" maxlength="100" class="editor-input" @input="setNested('homepage_steps', 'heading', inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Supporting text"><textarea :value="modelValue.homepage_steps.subtitle" maxlength="255" rows="3" class="editor-input min-h-24 resize-y" @input="setNested('homepage_steps', 'subtitle', inputValue($event))" /></AdminEditorField>
      <AdminEditorRepeater title="Steps" add-label="Add step" :can-add="modelValue.homepage_steps.items.length < 12" @add="addItem('homepage_steps', { icon: 'heroicons:check-circle', title: '', description: '' })">
        <AdminEditorRepeaterItem v-for="(item, index) in modelValue.homepage_steps.items" :key="index" :label="`Step ${index + 1}`" @remove="removeItem('homepage_steps', index)">
          <input :value="item.title" maxlength="100" placeholder="Title" aria-label="Step title" class="editor-input" @input="setItem('homepage_steps', index, 'title', inputValue($event))" />
          <textarea :value="item.description" maxlength="255" rows="2" placeholder="Description" aria-label="Step description" class="editor-input min-h-20 resize-y" @input="setItem('homepage_steps', index, 'description', inputValue($event))" />
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>
    </div>

    <div v-else-if="section === 'features'" class="space-y-4">
      <AdminEditorRepeater title="Features" add-label="Add feature" :can-add="modelValue.homepage_features.items.length < 12" @add="addItem('homepage_features', { icon: 'heroicons:sparkles', title: '', description: '' })">
        <AdminEditorRepeaterItem v-for="(item, index) in modelValue.homepage_features.items" :key="index" :label="`Feature ${index + 1}`" @remove="removeItem('homepage_features', index)">
          <input :value="item.title" maxlength="100" placeholder="Title" aria-label="Feature title" class="editor-input" @input="setItem('homepage_features', index, 'title', inputValue($event))" />
          <textarea :value="item.description" maxlength="255" rows="2" placeholder="Description" aria-label="Feature description" class="editor-input min-h-20 resize-y" @input="setItem('homepage_features', index, 'description', inputValue($event))" />
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>
    </div>

    <div v-else-if="section === 'stats'" class="space-y-4">
      <AdminEditorRepeater title="Statistics" add-label="Add statistic" :can-add="modelValue.homepage_stats.items.length < 8" @add="addItem('homepage_stats', { value: '', label: '' })">
        <AdminEditorRepeaterItem v-for="(item, index) in modelValue.homepage_stats.items" :key="index" :label="`Statistic ${index + 1}`" @remove="removeItem('homepage_stats', index)">
          <div class="grid grid-cols-2 gap-2">
            <input :value="item.value" maxlength="50" placeholder="Value" aria-label="Statistic value" class="editor-input" @input="setItem('homepage_stats', index, 'value', inputValue($event))" />
            <input :value="item.label" maxlength="100" placeholder="Label" aria-label="Statistic label" class="editor-input" @input="setItem('homepage_stats', index, 'label', inputValue($event))" />
          </div>
        </AdminEditorRepeaterItem>
      </AdminEditorRepeater>
    </div>

    <div v-else-if="section === 'statement'" class="space-y-4">
      <label class="flex min-h-11 items-center gap-3 rounded-xl border border-admin-border px-3 text-xs font-medium text-admin-text">
        <input :checked="modelValue.homepage_statement.enabled" type="checkbox" class="h-4 w-4 accent-admin-accent" @change="setNested('homepage_statement', 'enabled', checkedValue($event))" />
        Show statement
      </label>
      <AdminEditorField label="Label"><input :value="modelValue.homepage_statement.eyebrow" maxlength="100" class="editor-input" @input="setNested('homepage_statement', 'eyebrow', inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Statement"><textarea :value="modelValue.homepage_statement.quote" maxlength="1000" rows="5" class="editor-input min-h-32 resize-y" @input="setNested('homepage_statement', 'quote', inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Attribution"><input :value="modelValue.homepage_statement.attribution" maxlength="100" class="editor-input" @input="setNested('homepage_statement', 'attribution', inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Role"><input :value="modelValue.homepage_statement.role" maxlength="100" class="editor-input" @input="setNested('homepage_statement', 'role', inputValue($event))" /></AdminEditorField>
      <div class="grid grid-cols-2 gap-2">
        <AdminEditorField label="Button label"><input :value="modelValue.homepage_statement.cta_label" maxlength="50" class="editor-input" @input="setNested('homepage_statement', 'cta_label', inputValue($event))" /></AdminEditorField>
        <AdminEditorField label="Button link"><input :value="modelValue.homepage_statement.cta_link" maxlength="500" class="editor-input" @input="setNested('homepage_statement', 'cta_link', inputValue($event))" /></AdminEditorField>
      </div>
    </div>

    <div v-else-if="section === 'newsletter'" class="space-y-4">
      <AdminEditorField label="Label"><input :value="modelValue.homepage_newsletter.label" maxlength="100" class="editor-input" @input="setNested('homepage_newsletter', 'label', inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Heading"><input :value="modelValue.homepage_newsletter.heading" maxlength="100" class="editor-input" @input="setNested('homepage_newsletter', 'heading', inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Supporting text"><textarea :value="modelValue.homepage_newsletter.subtitle" maxlength="255" rows="3" class="editor-input min-h-24 resize-y" @input="setNested('homepage_newsletter', 'subtitle', inputValue($event))" /></AdminEditorField>
      <AdminEditorField label="Disclaimer"><input :value="modelValue.homepage_newsletter.disclaimer" maxlength="255" class="editor-input" @input="setNested('homepage_newsletter', 'disclaimer', inputValue($event))" /></AdminEditorField>
    </div>

    <div v-else class="rounded-xl bg-admin-soft p-4 text-xs leading-5 text-admin-muted">
      Product-driven sections keep their advanced controls in Site Settings for now.
      <NuxtLink to="/admin/settings?tab=pages&sub=homepage" class="mt-3 inline-flex min-h-11 items-center font-semibold text-admin-accent-strong underline underline-offset-4">Open Site Settings</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'

const props = defineProps<{
  modelValue: WebsiteEditorDraftPayload
  section: string
  errors?: Record<string, string[]>
}>()
const emit = defineEmits<{ 'update:modelValue': [value: WebsiteEditorDraftPayload] }>()

const details: Record<string, { title: string; description: string }> = {
  hero: { title: 'Hero', description: 'Set the first message visitors see and tune how the current media is framed.' },
  'featured-products': { title: 'Featured products', description: 'This section uses your active product catalogue.' },
  showcase: { title: 'Showcase', description: 'This section combines product assignments with video media.' },
  'watch-shop': { title: 'Watch & Shop', description: 'This section combines uploaded media with linked products.' },
  'best-sellers': { title: 'Best sellers', description: 'This section uses order history and curated fallback products.' },
  'how-it-works': { title: 'How it works', description: 'Explain the store journey in a short sequence.' },
  features: { title: 'Features', description: 'Highlight the qualities that help customers choose your store.' },
  stats: { title: 'Stats', description: 'Use only figures you can support and keep each label concise.' },
  statement: { title: 'Statement', description: 'Add an optional editorial quote or brand promise.' },
  newsletter: { title: 'Newsletter', description: 'Set the invitation shown above the subscription form.' },
}
const title = computed(() => details[props.section]?.title ?? 'Section')
const description = computed(() => details[props.section]?.description ?? '')
const sectionPrefixes: Record<string, string[]> = {
  hero: ['payload.hero_'],
  'how-it-works': ['payload.homepage_steps'],
  features: ['payload.homepage_features'],
  stats: ['payload.homepage_stats'],
  statement: ['payload.homepage_statement'],
  newsletter: ['payload.homepage_newsletter'],
}
const sectionErrors = computed(() => {
  const prefixes = sectionPrefixes[props.section] ?? []
  return Object.entries(props.errors ?? {})
    .filter(([field]) => prefixes.some(prefix => field.startsWith(prefix)))
    .flatMap(([, messages]) => messages)
})
const clone = () => JSON.parse(JSON.stringify(props.modelValue)) as WebsiteEditorDraftPayload
const inputValue = (event: Event) => (event.target as HTMLInputElement | HTMLTextAreaElement).value
const numberValue = (event: Event) => Number((event.target as HTMLInputElement).value)
const checkedValue = (event: Event) => (event.target as HTMLInputElement).checked
const errorFor = (field: string) => props.errors?.[`payload.${field}`]?.[0]

function setRoot(field: keyof WebsiteEditorDraftPayload, value: unknown) {
  const next = clone()
  ;(next as unknown as Record<string, unknown>)[field] = value
  emit('update:modelValue', next)
}

function setNested(section: 'homepage_steps' | 'homepage_statement' | 'homepage_newsletter', field: string, value: unknown) {
  const next = clone()
  ;(next[section] as unknown as Record<string, unknown>)[field] = value
  emit('update:modelValue', next)
}

function setItem(section: 'homepage_steps' | 'homepage_features' | 'homepage_stats', index: number, field: string, value: string) {
  const next = clone()
  const item = next[section].items[index] as unknown as Record<string, string>
  item[field] = value
  emit('update:modelValue', next)
}

function addItem(section: 'homepage_steps' | 'homepage_features' | 'homepage_stats', item: Record<string, string>) {
  const next = clone()
  ;(next[section].items as unknown as Array<Record<string, string>>).push(item)
  emit('update:modelValue', next)
}

function removeItem(section: 'homepage_steps' | 'homepage_features' | 'homepage_stats', index: number) {
  const next = clone()
  next[section].items.splice(index, 1)
  emit('update:modelValue', next)
}
</script>

<style scoped>
.editor-input {
  min-height: 44px;
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--admin-border);
  background: var(--admin-surface);
  padding: 0.625rem 0.75rem;
  color: var(--admin-text);
  font-size: 0.75rem;
  line-height: 1.25rem;
}
.editor-input:focus-visible,
.editor-color:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 2px;
}
.editor-color {
  min-height: 44px;
  width: 100%;
  cursor: pointer;
  border-radius: 0.75rem;
  border: 1px solid var(--admin-border);
  background: var(--admin-surface);
  padding: 0.25rem;
}
</style>
