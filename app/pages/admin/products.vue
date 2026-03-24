<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 font-medium">Products</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Products</h1>
        <p class="text-gray-500 text-sm mt-1">Manage your store's product catalogue</p>
      </div>
      <button
        data-guide="add-product-btn"
        @click="productForm.openAddModal(); categories.initCategoryForProduct(null)"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shrink-0"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Add Product
      </button>
    </div>

    <!-- Filters -->
    <AdminProductsProductFilters
      data-guide="product-filters"
      :search-query="products.searchQuery.value"
      :selected-status="products.selectedStatus.value"
      :status-filters="products.statusFilters"
      @update:search-query="products.searchQuery.value = $event"
      @update:selected-status="products.selectedStatus.value = $event"
    />

    <!-- Loading -->
    <div v-if="products.loading.value" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading products…</p>
    </div>

    <!-- Error -->
    <div v-else-if="products.error.value" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-800 mb-1">Failed to load products</p>
      <p class="text-sm text-red-500 mb-6">{{ products.error.value }}</p>
      <button @click="products.loadProducts" class="btn-primary">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="products.products.value.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
      <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <p class="font-semibold text-gray-700 mb-1">No products yet</p>
      <p class="text-sm text-gray-400 mb-6">Add your first product to get started</p>
      <button @click="productForm.openAddModal(); categories.initCategoryForProduct(null)" class="btn-primary">Add Product</button>
    </div>

    <!-- Products table -->
    <AdminProductsProductTable
      v-else
      data-guide="product-table"
      :products="products.products.value"
      @edit="handleEdit"
      @delete="products.deleteProduct"
    />

    <!-- Pagination -->
    <AdminProductsProductPagination
      v-if="!products.loading.value && !products.error.value && products.totalPages.value > 1"
      :current-page="products.currentPage.value"
      :total-pages="products.totalPages.value"
      :total-items="products.totalItems.value"
      :per-page="products.perPage"
      :visible-pages="products.visiblePages.value"
      @go-to-page="products.goToPage"
    />

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
      :image-preview="productForm.imagePreview.value"
      :gallery-images="productForm.galleryImages.value"
      :gallery-files-count="productForm.galleryFiles.value.length"
      :uploading-gallery="productForm.uploadingGallery.value"
      :all-categories="categories.allCategories.value"
      :cat-picker-expanded="categories.catPickerExpanded.value"
      :category-breadcrumb="categories.categoryBreadcrumb.value"
      @close="productForm.closeModal"
      @save="productForm.saveProduct(products.loadProducts)"
      @image-selected="productForm.onImageSelected"
      @remove-image="productForm.removeImage"
      @gallery-selected="productForm.onGallerySelected"
      @upload-gallery="productForm.uploadGalleryImages(products.loadProducts)"
      @delete-gallery-image="(id: number) => productForm.deleteGalleryImage(id, products.loadProducts)"
      @select-category="(id: number) => categories.selectCategory(id, productForm.form.value)"
      @toggle-cat-expand="categories.toggleCatPickerExpand"
      @clear-category="categories.clearCategorySelection(productForm.form.value)"
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

const handleEdit = async (product: Product) => {
  await productForm.openEditModal(product)
  categories.initCategoryForProduct(product.category_id ? Number(product.category_id) : null)
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
