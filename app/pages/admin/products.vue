<template>
  <div>
    <!-- Page Header -->
    <AdminPageHeader title="Products" subtitle="Manage your store's product catalogue">
      <template #breadcrumb>
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 font-medium">Products</span>
        </div>
      </template>
      <template #actions>
        <button
          data-guide="add-product-btn"
          @click="productForm.openAddModal(); categories.initCategoryForProduct([])"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </template>
    </AdminPageHeader>

    <!-- Filters -->
    <AdminProductsProductFilters
      data-guide="product-filters"
      :search-query="products.searchQuery.value"
      :selected-status="products.selectedStatus.value"
      :selected-category-id="products.selectedCategoryId.value"
      :category-options="categoryFilterOptions"
      :status-filters="products.statusFilters"
      @update:search-query="products.searchQuery.value = $event"
      @update:selected-status="products.selectedStatus.value = $event"
      @update:selected-category-id="products.selectedCategoryId.value = $event"
    />

    <!-- Loading -->
    <AdminSpinner v-if="products.loading.value" label="Loading products…" />

    <!-- Error -->
    <div v-else-if="products.error.value" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-800 mb-1">Failed to load products</p>
      <p class="text-sm text-red-500 mb-6">{{ products.error.value }}</p>
      <button
        @click="products.loadProducts"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Empty state -->
    <AdminCard v-else-if="products.products.value.length === 0">
      <AdminEmptyState
        title="No products yet"
        description="Add your first product to get started"
        :icon="'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'"
      >
        <template #action>
          <button
            @click="productForm.openAddModal(); categories.initCategoryForProduct([])"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Add Product
          </button>
        </template>
      </AdminEmptyState>
    </AdminCard>

    <!-- Products table -->
    <AdminProductsProductTable
      v-else
      data-guide="product-table"
      :products="products.products.value"
      @edit="handleEdit"
      @delete="products.deleteProduct"
    >
      <template v-if="products.totalPages.value > 1" #footer>
        <AdminPagination
          :current-page="products.currentPage.value"
          :total-pages="products.totalPages.value"
          :total-items="products.totalItems.value"
          :per-page="products.perPage"
          item-label="products"
          @go-to-page="products.goToPage"
        />
      </template>
    </AdminProductsProductTable>

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :open="products.showDeleteModal.value"
      title="Delete Product"
      message="Are you sure you want to delete this product? This action cannot be undone."
      :deleting="products.deleting.value"
      @confirm="products.confirmDelete"
      @cancel="products.showDeleteModal.value = false"
    />

    <!-- Add / Edit Modal -->
    <AdminProductsProductFormModal
      :show-modal="productForm.showModal.value"
      :submitting="productForm.submitting.value"
      :form-error="productForm.formError.value"
      :editing-product="productForm.editingProduct.value"
      :form="productForm.form.value"
      :computed-volume-cbm="productForm.computedVolumeCbm.value"
      :gallery-images="productForm.galleryImages.value"
      :gallery-files-count="productForm.galleryFiles.value.length"
      :staged-previews="productForm.stagedPreviews.value"
      :hover-image-url="productForm.hoverDisplayUrl.value"
      :all-categories="categories.allCategories.value"
      :selected-category-ids="categories.selectedCategoryIds.value"
      :cat-picker-expanded="categories.catPickerExpanded.value"
      :category-breadcrumb="categories.categoryBreadcrumb.value"
      :variant-options="productForm.variantOptions.value"
      :variant-drafts="productForm.variantDrafts.value"
      :variants-error="productForm.variantsError.value"
      @close="productForm.closeModal"
      @save="productForm.saveProduct(products.loadProducts)"
      @gallery-selected="productForm.onGallerySelected"
      @remove-staged-file="productForm.removeStagedFile"
      @delete-gallery-image="(id: number) => productForm.deleteGalleryImage(id, products.loadProducts)"
      @hover-image-selected="productForm.onHoverImageSelected"
      @remove-hover-image="productForm.removeHoverImage"
      @toggle-category="(id: number) => categories.toggleCategory(id, productForm.form.value)"
      @toggle-cat-expand="categories.toggleCatPickerExpand"
      @clear-category="categories.clearCategorySelection(productForm.form.value)"
      @add-option="productForm.addOption"
      @remove-option="productForm.removeOption"
      @add-option-value="productForm.addOptionValue"
      @remove-option-value="(i: number, j: number) => productForm.removeOptionValue(i, j)"
      @remove-variant="(i: number) => productForm.variantDrafts.value.splice(i, 1)"
      @upload-variant-image="(idx: number, file: File) => productForm.editingProduct.value && productForm.uploadVariantImage(productForm.editingProduct.value.id, idx, file)"
      @delete-variant-image="(idx: number) => productForm.editingProduct.value && productForm.deleteVariantImage(productForm.editingProduct.value.id, idx)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useProducts'

definePageMeta({
  middleware: 'auth'
})

const products = useProducts()
const productForm = useProductForm()
const categories = useProductCategories()

interface CategoryFilterOption {
  id: number
  label: string
  path: string
  depth: number
}

const categoryFilterOptions = computed<CategoryFilterOption[]>(() => {
  function flatten(items: typeof categories.allCategories.value, depth = 0, ancestors: string[] = []): CategoryFilterOption[] {
    return items.flatMap((category) => {
      const pathParts = [...ancestors, category.name]

      return [
        { id: category.id, label: category.name, path: pathParts.join(' / '), depth },
        ...flatten(category.children || [], depth + 1, pathParts),
      ]
    })
  }

  return flatten(categories.allCategories.value)
})


const handleEdit = async (product: Product) => {
  await productForm.openEditModal(product)
  const ids = product.categories?.map((c: any) => c.id) || (product.category_id ? [Number(product.category_id)] : [])
  categories.initCategoryForProduct(ids)
}

const onEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && productForm.showModal.value) productForm.closeModal()
}

onMounted(() => {
  products.loadProducts()
  categories.fetchCategories()
  window.addEventListener('keydown', onEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEscape)
})
</script>
