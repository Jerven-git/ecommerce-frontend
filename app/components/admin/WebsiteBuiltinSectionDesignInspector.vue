<template>
  <div v-if="definition" class="space-y-5 p-4">
    <p class="text-xs leading-5 text-admin-muted">Style this built-in section. Changes stay in your private draft until published. Theme default follows the selected storefront theme.</p>
    <AdminWebsitePageLayoutPicker v-if="definition.variants.length > 1" :model-value="setting.layout || 'default'" :variants="definition.variants" :type="definition.type" compact @update:model-value="setLayout" />
    <p v-for="message in designErrors" :key="message" class="text-xs text-admin-danger" role="alert">{{ message }}</p>
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
function setDesign(design: WebsitePageSectionDesign) { update({ ...setting.value, design }) }
</script>
