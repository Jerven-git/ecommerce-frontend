<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @mousedown.self="backdropMouseDown = true"
        @mouseup.self="if (backdropMouseDown) $emit('close'); backdropMouseDown = false"
        @mouseup.capture="backdropMouseDown = false"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div v-if="showModal" class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <!-- Modal header -->
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="editingProduct ? 'bg-primary-50' : 'bg-green-50'">
                  <svg class="w-4 h-4" :class="editingProduct ? 'text-primary-600' : 'text-green-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path v-if="editingProduct" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-sm font-semibold text-gray-900">{{ editingProduct ? 'Edit Product' : 'New Product' }}</h2>
                  <p class="text-xs text-gray-400">{{ editingProduct ? 'Update product details' : 'Fill in the details below' }}</p>
                </div>
              </div>
              <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal body (scrollable) -->
            <div class="overflow-y-auto flex-1 px-6 py-5">
              <form id="productForm" @submit.prevent="$emit('save')" class="space-y-5">

                <!-- Section: Basic Info -->
                <fieldset class="space-y-3">
                  <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Basic Info</legend>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Product Name <span class="text-red-400">*</span></label>
                      <input v-model="form.name" type="text" required class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-all" placeholder="e.g. Wireless Headphones" />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <textarea
                        v-model="form.description"
                        rows="2"
                        class="w-full h-[200px] px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-all resize-none leading-relaxed overflow-y-auto"
                        placeholder="Brief product description..."
                      ></textarea>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Price <span class="text-red-400">*</span></label>
                      <div class="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-primary-400 focus-within:border-primary-400 transition-all">
                        <span class="px-2.5 flex items-center bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
                        <input v-model.number="form.price" type="number" step="0.01" min="0" required class="flex-1 px-2.5 py-2 text-sm outline-none w-0" placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Stock <span class="text-red-400">*</span></label>
                      <input v-model.number="form.stock" type="number" min="0" required class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-all" placeholder="0" />
                    </div>
                  </div>
                </fieldset>

                <div class="border-t border-gray-100"></div>

                <!-- Section: Shipping -->
                <fieldset class="space-y-3">
                  <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Shipping</legend>
                  <div class="flex items-center gap-2">
                    <div class="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                      <button
                        type="button"
                        @click="form.shipping_calc_type = 'weight'"
                        class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150"
                        :class="form.shipping_calc_type === 'weight' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                      >
                        By Weight
                      </button>
                      <button
                        type="button"
                        @click="form.shipping_calc_type = 'dimensions'"
                        class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150"
                        :class="form.shipping_calc_type === 'dimensions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                      >
                        By Dimensions
                      </button>
                    </div>
                  </div>

                  <Transition
                    enter-active-class="transition-all duration-200 ease-out"
                    leave-active-class="transition-all duration-150 ease-in"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                    mode="out-in"
                  >
                    <!-- Weight -->
                    <div v-if="form.shipping_calc_type === 'weight'" key="weight">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Weight</label>
                      <div class="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-primary-400 focus-within:border-primary-400 transition-all max-w-[200px]">
                        <input v-model.number="form.weight" type="number" step="0.01" min="0" class="flex-1 px-2.5 py-2 text-sm outline-none w-0" placeholder="0.00" />
                        <span class="px-2.5 flex items-center bg-gray-50 text-gray-400 text-xs border-l border-gray-200 select-none">kg</span>
                      </div>
                    </div>

                    <!-- Dimensions -->
                    <div v-else key="dimensions" class="space-y-2">
                      <div class="grid grid-cols-3 gap-2">
                        <div>
                          <label class="block text-xs font-medium text-gray-600 mb-1">Length</label>
                          <div class="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-primary-400 focus-within:border-primary-400 transition-all">
                            <input v-model.number="form.length_cm" type="number" step="0.01" min="0" class="flex-1 px-2 py-2 text-sm outline-none w-0" placeholder="0" />
                            <span class="px-1.5 flex items-center bg-gray-50 text-gray-400 text-xs border-l border-gray-200 select-none">cm</span>
                          </div>
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-600 mb-1">Width</label>
                          <div class="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-primary-400 focus-within:border-primary-400 transition-all">
                            <input v-model.number="form.width_cm" type="number" step="0.01" min="0" class="flex-1 px-2 py-2 text-sm outline-none w-0" placeholder="0" />
                            <span class="px-1.5 flex items-center bg-gray-50 text-gray-400 text-xs border-l border-gray-200 select-none">cm</span>
                          </div>
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-600 mb-1">Height</label>
                          <div class="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-primary-400 focus-within:border-primary-400 transition-all">
                            <input v-model.number="form.height_cm" type="number" step="0.01" min="0" class="flex-1 px-2 py-2 text-sm outline-none w-0" placeholder="0" />
                            <span class="px-1.5 flex items-center bg-gray-50 text-gray-400 text-xs border-l border-gray-200 select-none">cm</span>
                          </div>
                        </div>
                      </div>
                      <Transition
                        enter-active-class="transition-all duration-200"
                        enter-from-class="opacity-0 scale-95"
                        enter-to-class="opacity-100 scale-100"
                        leave-active-class="transition-all duration-150"
                        leave-from-class="opacity-100 scale-100"
                        leave-to-class="opacity-0 scale-95"
                      >
                        <div v-if="computedVolumeCbm > 0" class="flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-lg">
                          <svg class="w-3.5 h-3.5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span class="text-xs text-primary-700 font-medium">
                            Volume: {{ computedVolumeCbm.toFixed(6) }} m&sup3; ({{ (computedVolumeCbm * 1000).toFixed(3) }} L)
                          </span>
                        </div>
                      </Transition>
                    </div>
                  </Transition>
                </fieldset>

                <div class="border-t border-gray-100"></div>

                <!-- Section: Category -->
                <fieldset class="space-y-2">
                  <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Category</legend>
                  <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <div class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                      <p v-if="categoryBreadcrumb" class="text-xs text-gray-600 flex items-center gap-1.5">
                        <svg class="w-3 h-3 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        {{ categoryBreadcrumb }}
                      </p>
                      <p v-else class="text-xs text-gray-400">No category selected</p>
                      <button v-if="form.category_id" type="button" @click="$emit('clearCategory')" class="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear</button>
                    </div>
                    <div class="max-h-48 overflow-y-auto py-1">
                      <template v-for="cat in allCategories" :key="cat.id">
                        <CategoryTreeItem
                          :category="cat"
                          :depth="0"
                          :selected-id="form.category_id"
                          :expanded-ids="catPickerExpanded"
                          @select="$emit('selectCategory', $event)"
                          @toggle="$emit('toggleCatExpand', $event)"
                        />
                      </template>
                      <p v-if="!allCategories.length" class="text-xs text-gray-400 text-center py-3">No categories available</p>
                    </div>
                  </div>
                </fieldset>

                <div class="border-t border-gray-100"></div>

                <!-- Section: Media & Status -->
                <fieldset class="space-y-3">
                  <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Media & Status</legend>

                  <!-- Main Image (for new products) -->
                  <div v-if="!editingProduct">
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Image</label>
                    <div v-if="imagePreview" class="mb-2 flex items-center gap-3">
                      <img :src="imagePreview" alt="Preview" class="h-14 w-14 rounded-lg object-cover border border-gray-200" />
                      <button type="button" @click="$emit('removeImage')" class="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors">
                        Remove
                      </button>
                    </div>
                    <input
                      ref="imageInputRef"
                      type="file"
                      accept="image/*"
                      @change="$emit('imageSelected', $event)"
                      class="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                    />
                  </div>

                  <!-- Gallery Images (for editing existing products) -->
                  <div v-if="editingProduct">
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Product Images</label>
                    <div v-if="galleryImages.length" class="flex flex-wrap gap-2 mb-3">
                      <div v-for="img in galleryImages" :key="img.id" class="relative group">
                        <img :src="img.url" alt="Product image" class="h-20 w-20 rounded-lg object-cover border border-gray-200" />
                        <button
                          type="button"
                          @click="$emit('deleteGalleryImage', img.id)"
                          class="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Remove image"
                        >
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p v-else class="text-xs text-gray-400 mb-2">No images uploaded yet.</p>

                    <div class="flex items-center gap-3">
                      <input
                        ref="galleryInputRef"
                        type="file"
                        accept="image/*"
                        multiple
                        @change="$emit('gallerySelected', $event)"
                        class="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                      />
                      <button
                        v-if="galleryFilesCount > 0"
                        type="button"
                        @click="$emit('uploadGallery')"
                        :disabled="uploadingGallery"
                        class="shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {{ uploadingGallery ? 'Uploading...' : `Upload (${galleryFilesCount})` }}
                      </button>
                    </div>
                  </div>

                  <!-- Active toggle -->
                  <div class="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="text-sm font-medium text-gray-700">Active</p>
                      <p class="text-xs text-gray-400">Visible to customers</p>
                    </div>
                    <button
                      type="button"
                      @click="form.is_active = !form.is_active"
                      class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      :class="form.is_active ? 'bg-primary-600' : 'bg-gray-300'"
                    >
                      <span
                        class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                        :class="form.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'"
                      />
                    </button>
                  </div>

                  <!-- Backorder toggle -->
                  <div class="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="text-sm font-medium text-gray-700">Allow Backorder</p>
                      <p class="text-xs text-gray-400">Accept orders for this product when out of stock</p>
                      <p class="text-[11px] text-amber-600 mt-0.5">Requires the global backorder setting to also be enabled in Backorders &rarr; Settings</p>
                    </div>
                    <button
                      type="button"
                      @click="form.allow_backorder = !form.allow_backorder"
                      class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      :class="form.allow_backorder ? 'bg-primary-600' : 'bg-gray-300'"
                    >
                      <span
                        class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                        :class="form.allow_backorder ? 'translate-x-[18px]' : 'translate-x-[3px]'"
                      />
                    </button>
                  </div>

                  <!-- Backorder charge policy -->
                  <div v-if="form.allow_backorder" class="px-3">
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Charge Policy</label>
                    <select
                      v-model="form.backorder_charge_policy"
                      class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="charged_now">Charged at checkout</option>
                      <option value="charged_later">Charged when available</option>
                    </select>
                    <p class="text-xs text-gray-400 mt-1">When to charge the customer for backordered items</p>
                  </div>
                </fieldset>

                <!-- Form error -->
                <Transition
                  enter-active-class="transition-all duration-200"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition-all duration-150"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <div v-if="formError" class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                    <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formError }}
                  </div>
                </Transition>
              </form>
            </div>

            <!-- Modal footer -->
            <div class="px-6 py-3.5 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                @click="$emit('close')"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="productForm"
                class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                :disabled="submitting"
              >
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ submitting ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Add Product') }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useProducts'
import type { ProductFormData } from '~/composables/useProductForm'
import type { Category } from '~/composables/useProductCategories'

const backdropMouseDown = ref(false)

defineProps<{
  showModal: boolean
  submitting: boolean
  formError: string | null
  editingProduct: Product | null
  form: ProductFormData
  computedVolumeCbm: number
  imagePreview: string | null
  galleryImages: { id: number; url: string }[]
  galleryFilesCount: number
  uploadingGallery: boolean
  allCategories: Category[]
  catPickerExpanded: Set<number>
  categoryBreadcrumb: string
}>()

defineEmits<{
  close: []
  save: []
  imageSelected: [event: Event]
  removeImage: []
  gallerySelected: [event: Event]
  uploadGallery: []
  deleteGalleryImage: [mediaId: number]
  selectCategory: [id: number]
  toggleCatExpand: [id: number]
  clearCategory: []
}>()
</script>
