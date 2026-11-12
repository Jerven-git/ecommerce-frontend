<template>
  <div v-if="definition" class="space-y-5 p-4">
    <p class="text-xs leading-5 text-admin-muted">Style this built-in section. Changes stay in your private draft until published. Theme default follows the selected storefront theme.</p>
    <AdminWebsiteContactTypography v-if="page === 'contact' && section === 'contact-content'" :model-value="setting.typography" @change="update({ ...setting, typography: $event })" />
    <AdminWebsiteHeroMediaEditor v-if="page === 'home' && section === 'hero'" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" />
    <AdminWebsiteAboutStoryMediaEditor v-if="page === 'about' && section === 'about-content'" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" />
    <AdminWebsitePageLayoutPicker v-if="definition.variants.length > 1" :model-value="setting.layout || 'default'" :variants="definition.variants" :type="definition.type" compact @update:model-value="setLayout" />
    <div v-if="page === 'about' && section === 'about-content' && setting.layout === 'stacked'" class="space-y-2">
      <label for="about-story-image-width" class="flex items-center justify-between text-xs font-semibold text-admin-text">Image width <span>{{ setting.image_width ?? 70 }}%</span></label>
      <input id="about-story-image-width" type="range" min="25" max="100" step="1" :value="setting.image_width ?? 70" aria-label="Image width" aria-describedby="about-story-image-width-help" class="min-h-11 w-full accent-admin-accent" @input="setImageWidth" />
      <p id="about-story-image-width-help" class="text-xs leading-5 text-admin-muted">Resize the stacked image without cropping. The image stays centered.</p>
    </div>
    <p v-for="message in designErrors" :key="message" class="text-xs text-admin-danger" role="alert">{{ message }}</p>
    <AdminWebsiteHowItWorksTypography v-if="page === 'home' && section === 'how-it-works'" :model-value="modelValue" :errors="errors" @update:model-value="emit('update:modelValue', $event)" />
    <AdminWebsitePageDesignInspector :block="block" expanded @change="setDesign" />
  </div>
</template>
<script setup lang="ts">
import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'
import { builtinSectionDefinition, normalizeBuiltinSectionDesigns, type BuiltinSectionDesign } from '~/utils/builtinSectionDesigns'
import type { WebsitePageSectionDesign } from '~/utils/websitePageDesign'
import type { WebsitePageBlock } from '~/types/websitePage'
const props = defineProps<{ modelValue: WebsiteEditorDraftPayload; page: string; section: string; errors?: Record<string, string[]> }>()
const emit = defineEmits<{ 'update:modelValue': [value: WebsiteEditorDraftPayload] }>()
const designErrors = computed(() => Object.entries(props.errors ?? {}).filter(([key]) => key.startsWith(`payload.section_designs.${props.page}.${props.section}`)).flatMap(([, messages]) => messages))
const definition = computed(() => builtinSectionDefinition(props.page, props.section))
const setting = computed(() => props.modelValue.section_designs?.[props.page]?.[props.section] ?? {})
const block = computed<WebsitePageBlock>(() => ({ id: `builtin-${props.page}-${props.section}`, type: definition.value?.type ?? 'rich-text', schema_version: 1, visible: true, variant: setting.value.layout ?? 'default', content: {}, settings: { design: setting.value.design ?? {} } }))
function update(next: BuiltinSectionDesign) {
  const section_designs = normalizeBuiltinSectionDesigns({ ...props.modelValue.section_designs, [props.page]: { ...props.modelValue.section_designs?.[props.page], [props.section]: next } })
  emit('update:modelValue', { ...props.modelValue, section_designs })
}
function setLayout(layout: string) { update({ ...setting.value, layout }) }
function setImageWidth(event: Event) { update({ ...setting.value, image_width: Number((event.target as HTMLInputElement).value) }) }
function setDesign(design: WebsitePageSectionDesign) { update({ ...setting.value, design }) }
</script>
