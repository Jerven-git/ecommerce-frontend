<template>
  <div class="space-y-6">

    <!-- Options Section -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-bold text-gray-700 uppercase tracking-widest">Options</h3>
        <button type="button" @click="$emit('add-option')" class="text-xs font-semibold text-primary-600 hover:text-primary-700">
          + Add Option
        </button>
      </div>

      <div v-if="variantOptions.length === 0" class="text-xs text-gray-400 py-2">
        No options yet. Add one above (e.g. Color, Size, Storage).
      </div>

      <div class="space-y-4">
        <div
          v-for="(opt, optIdx) in variantOptions"
          :key="optIdx"
          class="border border-gray-200 rounded-xl p-4 bg-gray-50"
        >
          <div class="flex items-center gap-3 mb-3">
            <input
              v-model="opt.name"
              type="text"
              placeholder="Option name (e.g. Color)"
              class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
            />
            <button
              type="button"
              @click="$emit('remove-option', optIdx)"
              class="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              title="Remove option"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-2 mb-3">
            <div
              v-for="(val, valIdx) in opt.values"
              :key="valIdx"
              class="flex items-center gap-2"
            >
              <input
                v-model="val.label"
                type="text"
                placeholder="Value (e.g. Red)"
                class="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
              />
              <button
                type="button"
                @click="$emit('remove-option-value', optIdx, valIdx)"
                class="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                title="Remove value"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="$emit('add-option-value', optIdx)"
            class="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            + Add Value
          </button>
        </div>
      </div>
    </div>

    <!-- Variant count hint -->
    <p v-if="variantOptions.length > 0 && variantDrafts.length > 0" class="text-xs text-gray-400">
      {{ variantDrafts.length }} variant{{ variantDrafts.length === 1 ? '' : 's' }} — saved with product
    </p>

    <!-- Variant List -->
    <div v-if="variantDrafts.length > 0">
      <h3 class="text-xs font-bold text-gray-700 uppercase tracking-widest mb-3">Variants</h3>

      <div class="overflow-x-auto rounded-xl border border-gray-200">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Combination</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">SKU</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Price Override</th>
              <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Stock</th>
              <th class="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Image</th>
              <th class="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Active</th>
              <th class="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(draft, dIdx) in variantDrafts" :key="dIdx" class="bg-white hover:bg-gray-50/50">
              <td class="px-4 py-2.5 font-medium text-gray-800 text-xs whitespace-nowrap">
                {{ computeLabel(draft) }}
              </td>
              <td class="px-3 py-2.5">
                <input
                  v-model="draft.sku"
                  type="text"
                  placeholder="Optional"
                  class="w-24 px-2 py-1 text-xs border border-gray-200 rounded focus:border-primary-400 focus:ring-1 focus:ring-primary-100 outline-none"
                />
              </td>
              <td class="px-3 py-2.5">
                <input
                  v-model.number="draft.price"
                  type="number"
                  min="0"
                  step="0.01"
                  :placeholder="basePrice !== null ? String(basePrice) : '0.00'"
                  class="w-24 px-2 py-1 text-xs border border-gray-200 rounded focus:border-primary-400 focus:ring-1 focus:ring-primary-100 outline-none"
                />
              </td>
              <td class="px-3 py-2.5">
                <input
                  v-model.number="draft.stock"
                  type="number"
                  min="0"
                  class="w-20 px-2 py-1 text-xs border border-gray-200 rounded focus:border-primary-400 focus:ring-1 focus:ring-primary-100 outline-none"
                />
              </td>
              <td class="px-3 py-2.5 text-center">
                <div class="flex items-center justify-center">
                  <template v-if="draft.id && productId">
                    <!-- Has image: show thumb + delete -->
                    <div v-if="draft.image_url" class="relative group w-8 h-8">
                      <img :src="draft.image_url" class="w-8 h-8 rounded object-cover border border-gray-200" />
                      <button
                        type="button"
                        @click="emit('delete-variant-image', dIdx)"
                        class="absolute -top-1 -right-1 hidden group-hover:flex w-4 h-4 rounded-full bg-red-500 text-white items-center justify-center"
                        title="Remove image"
                      >
                        <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <!-- click thumb to replace -->
                      <button
                        type="button"
                        @click="fileInputRefs[dIdx]?.click()"
                        class="absolute inset-0 rounded opacity-0 group-hover:opacity-100 bg-black/30 flex items-center justify-center"
                        title="Replace image"
                      >
                        <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <!-- No image: upload button -->
                    <button
                      v-else
                      type="button"
                      @click="fileInputRefs[dIdx]?.click()"
                      class="w-8 h-8 rounded border border-dashed border-gray-300 hover:border-primary-400 flex items-center justify-center text-gray-400 hover:text-primary-500 transition-colors"
                      title="Upload image"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <input
                      :ref="el => fileInputRefs[dIdx] = el as HTMLInputElement | null"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="onFileChange(dIdx, $event)"
                    />
                  </template>
                  <!-- Unsaved variant — can't upload yet -->
                  <span v-else class="text-gray-300" title="Save product first to add image">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
              </td>
              <td class="px-3 py-2.5 text-center">
                <input type="checkbox" v-model="draft.is_active" class="accent-primary-600 w-4 h-4" />
              </td>
              <td class="px-3 py-2.5 text-right">
                <button
                  type="button"
                  @click="$emit('remove-variant', dIdx)"
                  class="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove variant"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Error -->
    <div v-if="variantsError" class="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
      {{ variantsError }}
    </div>


  </div>
</template>

<script setup lang="ts">
import type { OptionDraft, VariantDraft } from '~/composables/useProductForm'

const props = defineProps<{
  variantOptions: OptionDraft[]
  variantDrafts: VariantDraft[]
  variantsError: string | null
  basePrice: number | null
  productId: number | null
}>()

const emit = defineEmits<{
  'add-option': []
  'remove-option': [optIdx: number]
  'add-option-value': [optIdx: number]
  'remove-option-value': [optIdx: number, valIdx: number]
  'remove-variant': [dIdx: number]
  'upload-variant-image': [variantIdx: number, file: File]
  'delete-variant-image': [variantIdx: number]
}>()

const fileInputRefs = ref<(HTMLInputElement | null)[]>([])

function onFileChange(variantIdx: number, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) emit('upload-variant-image', variantIdx, file)
  // reset so same file can be re-selected
  const input = fileInputRefs.value[variantIdx]
  if (input) input.value = ''
}

function computeLabel(draft: VariantDraft): string {
  return props.variantOptions.map((opt, i) => {
    const valIdx = draft.selectedValueIds[i]
    return valIdx !== undefined ? (opt.values[valIdx]?.label ?? '—') : '—'
  }).join(' / ')
}
</script>
