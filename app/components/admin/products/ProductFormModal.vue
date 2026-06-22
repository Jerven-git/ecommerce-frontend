<template>
  <BaseModal :open="showModal" size="3xl" body-class="px-6 py-5" @close="$emit('close')">
    <template #header>
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="editingProduct ? 'bg-primary-50' : 'bg-green-50'">
          <svg class="w-4 h-4" :class="editingProduct ? 'text-primary-600' : 'text-green-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="editingProduct" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div class="min-w-0">
          <h2 class="text-sm font-semibold text-gray-900 truncate">{{ editingProduct ? 'Edit Product' : 'New Product' }}</h2>
          <p class="text-xs text-gray-400 truncate">{{ editingProduct ? 'Update product details' : 'Fill in the details below' }}</p>
        </div>
      </div>
    </template>

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
                      <label class="block text-xs font-medium text-gray-600 mb-1">Material</label>
                      <input v-model="form.material" type="text" maxlength="255" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-all" placeholder="e.g. Solid oak" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Dimensions</label>
                      <input v-model="form.dimensions" type="text" maxlength="100" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-all" placeholder="e.g. 180 × 90 × 75 cm" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Price <span class="text-red-400">*</span></label>
                      <div class="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-primary-400 focus-within:border-primary-400 transition-all">
                        <span class="px-2.5 flex items-center bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
                        <input v-model.number="form.price" type="number" step="0.01" min="0" required class="flex-1 px-2.5 py-2 text-sm outline-none w-0" placeholder="0.00" />
                      </div>
                    </div>
                    <div v-if="variantOptions.length === 0">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Stock <span class="text-red-400">*</span></label>
                      <input v-model.number="form.stock" type="number" min="0" required class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-all" placeholder="0" />
                    </div>
                    <div v-else class="flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                      <svg class="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p class="text-xs text-blue-600">Stock is managed per variant below.</p>
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
                      <button v-if="form.category_ids.length" type="button" @click="$emit('clearCategory')" class="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear</button>
                    </div>
                    <div class="max-h-48 overflow-y-auto py-1">
                      <template v-for="cat in allCategories" :key="cat.id">
                        <CategoryTreeItem
                          :category="cat"
                          :depth="0"
                          :selected-ids="selectedCategoryIds"
                          :expanded-ids="catPickerExpanded"
                          @toggle-category="$emit('toggleCategory', $event)"
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

                  <!-- Product Images (unified gallery for both new and existing products) -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Product Images</label>

                    <!-- Image tiles: saved + staged -->
                    <div v-if="galleryImages.length || stagedPreviews.length" class="flex flex-wrap gap-2 mb-3">
                      <div v-for="img in galleryImages" :key="`saved-${img.id}`" class="relative flex flex-col gap-1">
                        <div class="relative">
                          <img :src="img.url" :alt="img.alt_text || 'Product image'" class="h-20 w-20 rounded-lg object-cover border border-gray-200" />
                          <button
                            type="button"
                            @click="$emit('deleteGalleryImage', img.id)"
                            class="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md ring-2 ring-white transition-colors"
                            title="Remove image"
                            aria-label="Remove image"
                          >
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <AdminMediaAltEditor
                          v-if="!img.legacy"
                          :media-id="img.id"
                          :model-value="img.alt_text"
                          @update:model-value="img.alt_text = $event"
                        />
                      </div>
                      <div v-for="(preview, i) in stagedPreviews" :key="`staged-${preview.key}`" class="relative">
                        <img
                          :src="preview.url"
                          :alt="preview.name"
                          class="h-20 w-20 rounded-lg object-cover"
                          :class="preview.oversized
                            ? 'border-2 border-red-400 opacity-60'
                            : 'border border-dashed border-primary-300 opacity-90'"
                        />
                        <span
                          class="absolute bottom-1 left-1 right-1 text-[9px] font-semibold text-white rounded px-1 py-0.5 text-center truncate"
                          :class="preview.oversized ? 'bg-red-500/90' : 'bg-primary-600/80'"
                        >
                          {{ preview.oversized ? 'Too large' : 'Pending' }}
                        </span>
                        <button
                          type="button"
                          @click="$emit('removeStagedFile', i)"
                          class="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md ring-2 ring-white transition-colors"
                          title="Remove staged file"
                          aria-label="Remove staged file"
                        >
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p v-else-if="editingProduct" class="text-xs text-gray-400 mb-2">No images uploaded yet.</p>
                    <p v-else class="text-xs text-gray-400 mb-2">Pick one or more images — they'll upload when you save the product.</p>

                    <div class="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        @change="$emit('gallerySelected', $event)"
                        class="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                      />
                    </div>
                    <p class="text-[11px] text-gray-400 mt-1">Max 2 MB per image. Files over the limit are highlighted and will be skipped on save.</p>
                  </div>

                  <!-- Secondary hover image -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Hover image <span class="text-gray-400 font-normal">· revealed on hover</span></label>
                    <div class="flex items-center gap-3">
                      <div class="relative shrink-0">
                        <img
                          v-if="hoverImageUrl"
                          :src="hoverImageUrl"
                          alt="Hover image preview"
                          class="h-20 w-28 rounded-lg object-cover border border-gray-200"
                        />
                        <div v-else class="h-20 w-28 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300">
                          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <button
                          v-if="hoverImageUrl"
                          type="button"
                          @click="$emit('removeHoverImage')"
                          class="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md ring-2 ring-white transition-colors"
                          title="Remove hover image"
                          aria-label="Remove hover image"
                        >
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        @change="$emit('hoverImageSelected', $event)"
                        class="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                      />
                    </div>
                    <p class="text-[11px] text-gray-400 mt-1">Max 2 MB. Uploads when you save.</p>
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

                  <!-- Image Hover Zoom toggle -->
                  <div class="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="text-sm font-medium text-gray-700">Enable Image Hover Zoom</p>
                      <p class="text-xs text-gray-400">Show magnified preview on desktop hover</p>
                    </div>
                    <button
                      type="button"
                      @click="form.hover_zoom_enabled = !form.hover_zoom_enabled"
                      class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      :class="form.hover_zoom_enabled ? 'bg-primary-600' : 'bg-gray-300'"
                    >
                      <span
                        class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                        :class="form.hover_zoom_enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'"
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

                <AdminSeoFields
                  v-model:seo-title="form.seo_title"
                  v-model:seo-description="form.seo_description"
                  v-model:og-image-url="form.og_image_url"
                  v-model:noindex="form.noindex"
                  title-placeholder="Defaults to product name"
                  description-placeholder="Defaults to product description"
                />

                <!-- Section: Variants -->
                <fieldset class="space-y-3">
                  <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Product Variants</legend>
                  <div v-if="!editingProduct" class="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">
                    Save the product first, then re-open it to add variants.
                  </div>
                  <AdminProductsProductVariantEditor
                    v-else
                    :variant-options="variantOptions"
                    :variant-drafts="variantDrafts"
                    :variants-error="variantsError"
                    :base-price="form.price"
                    :product-id="editingProduct?.id ?? null"
                    @add-option="$emit('addOption')"
                    @remove-option="(i) => $emit('removeOption', i)"
                    @add-option-value="(i) => $emit('addOptionValue', i)"
                    @remove-option-value="(i, j) => $emit('removeOptionValue', i, j)"
                    @remove-variant="(i) => $emit('removeVariant', i)"
                    @upload-variant-image="(idx, file) => $emit('uploadVariantImage', idx, file)"
                    @delete-variant-image="(idx) => $emit('deleteVariantImage', idx)"
                  />
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

    <template #footer>
      <div class="flex items-center justify-end gap-3">
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
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useProducts'
import type { ProductFormData, OptionDraft, VariantDraft } from '~/composables/useProductForm'
import type { Category } from '~/composables/useProductCategories'

const props = defineProps<{
  showModal: boolean
  submitting: boolean
  formError: string | null
  editingProduct: Product | null
  form: ProductFormData
  computedVolumeCbm: number
  galleryImages: { id: number; url: string; alt_text?: string | null; legacy?: boolean }[]
  galleryFilesCount: number
  stagedPreviews: { key: string; url: string; name: string; oversized: boolean }[]
  hoverImageUrl: string | null
  allCategories: Category[]
  selectedCategoryIds: Set<number>
  catPickerExpanded: Set<number>
  categoryBreadcrumb: string
  variantOptions: OptionDraft[]
  variantDrafts: VariantDraft[]
  variantsError: string | null
}>()

defineEmits<{
  close: []
  save: []
  gallerySelected: [event: Event]
  removeStagedFile: [index: number]
  deleteGalleryImage: [mediaId: number]
  hoverImageSelected: [event: Event]
  removeHoverImage: []
  toggleCategory: [id: number]
  toggleCatExpand: [id: number]
  clearCategory: []
  addOption: []
  removeOption: [optIdx: number]
  addOptionValue: [optIdx: number]
  removeOptionValue: [optIdx: number, valIdx: number]
  removeVariant: [dIdx: number]
  uploadVariantImage: [variantIdx: number, file: File]
  deleteVariantImage: [variantIdx: number]
}>()
</script>
