<template>
  <div class="space-y-7">

    <!-- Options Section -->
    <div>
      <div class="flex items-center justify-between mb-3.5">
        <div class="flex items-center gap-2">
          <span class="block w-[3px] h-3.5 rounded-full bg-gradient-to-b from-primary-500 to-primary-400 shrink-0"></span>
          <h3 class="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-stone-600">Options</h3>
        </div>
        <button
          type="button"
          @click="$emit('add-option')"
          class="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-primary-600 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-full cursor-pointer transition-all hover:bg-primary-100 hover:border-primary-300 hover:-translate-y-px active:translate-y-0"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Option
        </button>
      </div>

      <div v-if="variantOptions.length === 0" class="text-center py-5 px-4 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50 text-stone-400 text-[0.72rem] leading-relaxed">
        <svg class="w-5 h-5 text-stone-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <p>No options yet. Add one above — e.g. Color, Size, Storage.</p>
      </div>

      <div class="space-y-3">
        <div
          v-for="(opt, optIdx) in variantOptions"
          :key="optIdx"
          class="border border-stone-200 rounded-2xl p-4 bg-gradient-to-br from-stone-50 to-stone-100/60 shadow-sm transition-shadow duration-200 hover:shadow-md hover:border-stone-300"
        >
          <div class="flex items-center gap-3 mb-3">
            <input
              v-model="opt.name"
              type="text"
              placeholder="Option name (e.g. Color)"
              class="flex-1 px-3 py-2 text-sm border-[1.5px] border-stone-200 rounded-lg bg-white text-stone-900 outline-none transition-all placeholder:text-stone-300 hover:border-stone-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <button
              type="button"
              @click="$emit('remove-option', optIdx)"
              class="inline-flex items-center justify-center w-7 h-7 rounded-md text-stone-400 cursor-pointer transition-all shrink-0 hover:bg-red-50 hover:text-red-500 hover:scale-110 active:scale-95"
              title="Remove option"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-2 mb-3 pl-1">
            <div
              v-for="(val, valIdx) in opt.values"
              :key="valIdx"
              class="flex items-center gap-2"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0"></span>
              <input
                v-model="val.label"
                type="text"
                placeholder="Value (e.g. Red)"
                class="flex-1 px-2.5 py-1.5 text-xs border-[1.5px] border-stone-200 rounded-lg bg-white text-stone-900 outline-none transition-all placeholder:text-stone-300 hover:border-stone-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
              <button
                type="button"
                @click="$emit('remove-option-value', optIdx, valIdx)"
                class="inline-flex items-center justify-center w-6 h-6 rounded-md text-stone-400 cursor-pointer transition-all shrink-0 hover:bg-red-50 hover:text-red-500 hover:scale-110 active:scale-95"
                title="Remove value"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="$emit('add-option-value', optIdx)"
            class="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-primary-500 bg-transparent border-none p-0 cursor-pointer transition-colors hover:text-primary-700"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Value
          </button>
        </div>
      </div>
    </div>

    <!-- Variant count hint -->
    <div v-if="variantOptions.length > 0 && variantDrafts.length > 0" class="flex items-center gap-2 text-[0.7rem] text-stone-400 tracking-wide">
      <span class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary-100 text-primary-600 text-[0.65rem] font-bold">
        {{ variantDrafts.length }}
      </span>
      <span>variant{{ variantDrafts.length === 1 ? '' : 's' }} — saved with product</span>
    </div>

    <!-- Variant List -->
    <div v-if="variantDrafts.length > 0">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="block w-[3px] h-3.5 rounded-full bg-gradient-to-b from-primary-500 to-primary-400 shrink-0"></span>
          <h3 class="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-stone-600">Variants</h3>
        </div>
      </div>

      <div class="border border-stone-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-stone-50 to-stone-100/70 border-b border-stone-200">
              <th class="px-3.5 py-2.5 text-left text-[0.6rem] font-bold tracking-[0.1em] uppercase text-stone-500">Combination</th>
              <th class="px-3.5 py-2.5 text-left text-[0.6rem] font-bold tracking-[0.1em] uppercase text-stone-500">SKU</th>
              <th class="px-3.5 py-2.5 text-left text-[0.6rem] font-bold tracking-[0.1em] uppercase text-stone-500">Price Override</th>
              <th class="px-3.5 py-2.5 text-left text-[0.6rem] font-bold tracking-[0.1em] uppercase text-stone-500">Stock</th>
              <th class="px-3.5 py-2.5 text-center text-[0.6rem] font-bold tracking-[0.1em] uppercase text-stone-500">Image</th>
              <th class="px-3.5 py-2.5 text-center text-[0.6rem] font-bold tracking-[0.1em] uppercase text-stone-500">Active</th>
              <th class="px-3.5 py-2.5"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr v-for="(draft, dIdx) in variantDrafts" :key="dIdx" class="bg-white transition-colors hover:bg-stone-50/70">
              <td class="px-3.5 py-2.5 align-middle">
                <span class="inline-flex items-center text-xs font-semibold text-stone-800 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full whitespace-nowrap tracking-wide">
                  {{ computeLabel(draft) }}
                </span>
              </td>
              <td class="px-3.5 py-2.5 align-middle">
                <input
                  v-model="draft.sku"
                  type="text"
                  placeholder="Optional"
                  class="w-24 px-2 py-1 text-xs border border-stone-200 rounded-md bg-white outline-none transition-all placeholder:text-stone-300 focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                />
              </td>
              <td class="px-3.5 py-2.5 align-middle">
                <div class="relative inline-flex items-center">
                  <span class="absolute left-2 text-[0.65rem] text-stone-400 pointer-events-none font-semibold">₱</span>
                  <input
                    v-model.number="draft.price"
                    type="number"
                    min="0"
                    step="0.01"
                    :placeholder="basePrice !== null ? String(basePrice) : '0.00'"
                    class="w-24 pl-5 pr-2 py-1 text-xs border border-stone-200 rounded-md bg-white outline-none transition-all placeholder:text-stone-300 focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                  />
                </div>
              </td>
              <td class="px-3.5 py-2.5 align-middle">
                <input
                  v-model.number="draft.stock"
                  type="number"
                  min="0"
                  class="w-20 px-2 py-1 text-xs border border-stone-200 rounded-md bg-white outline-none transition-all focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                />
              </td>
              <td class="px-3.5 py-2.5 align-middle text-center">
                <div class="flex items-center justify-center">
                  <template v-if="draft.id && productId">
                    <div v-if="draft.image_url" class="relative group w-9 h-9">
                      <img :src="draft.image_url" class="w-9 h-9 rounded-lg object-cover border border-stone-200 shadow-sm" />
                      <button
                        type="button"
                        @click="emit('delete-variant-image', dIdx)"
                        class="absolute -top-1 -right-1 hidden group-hover:flex w-4 h-4 rounded-full bg-red-500 text-white items-center justify-center shadow"
                        title="Remove image"
                      >
                        <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        @click="fileInputRefs[dIdx]?.click()"
                        class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-black/40 flex items-center justify-center transition-opacity"
                        title="Replace image"
                      >
                        <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <button
                      v-else
                      type="button"
                      @click="fileInputRefs[dIdx]?.click()"
                      class="w-9 h-9 rounded-lg border-[1.5px] border-dashed border-stone-300 bg-stone-50 text-stone-400 flex items-center justify-center cursor-pointer transition-all hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50"
                      title="Upload image"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
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
                  <span v-else class="text-stone-200 inline-flex" title="Save product first to add image">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
              </td>
              <td class="px-3.5 py-2.5 align-middle text-center">
                <input type="checkbox" v-model="draft.is_active" class="w-4 h-4 rounded accent-primary-600 cursor-pointer" />
              </td>
              <td class="px-3.5 py-2.5 align-middle text-right">
                <button
                  type="button"
                  @click="$emit('remove-variant', dIdx)"
                  class="inline-flex items-center justify-center w-7 h-7 rounded-md text-stone-400 cursor-pointer transition-all hover:bg-red-50 hover:text-red-500 hover:scale-110 active:scale-95"
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
    <div v-if="variantsError" class="flex overflow-hidden rounded-xl border border-rose-100">
      <div class="w-1 shrink-0 bg-rose-500"></div>
      <div class="flex items-start gap-2 px-3 py-2.5 bg-rose-50 text-rose-700 text-xs leading-relaxed w-full">
        <svg class="w-3.5 h-3.5 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span>{{ variantsError }}</span>
      </div>
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