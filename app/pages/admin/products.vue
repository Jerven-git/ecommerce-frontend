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
        @click="openAddModal"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shrink-0"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Add Product
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading products…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-800 mb-1">Failed to load products</p>
      <p class="text-sm text-red-500 mb-6">{{ error }}</p>
      <button @click="loadProducts" class="btn-primary">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="products.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
      <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <p class="font-semibold text-gray-700 mb-1">No products yet</p>
      <p class="text-sm text-gray-400 mb-6">Add your first product to get started</p>
      <button @click="openAddModal" class="btn-primary">Add Product</button>
    </div>

    <!-- Products table -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Weight</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.name"
                    class="h-10 w-10 rounded-lg object-cover shrink-0 border border-gray-100"
                  />
                  <div v-else class="h-10 w-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ product.name }}</p>
                    <p class="text-xs text-gray-400 truncate max-w-xs">{{ product.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                ${{ parseFloat(String(product.price)).toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="text-sm font-medium"
                  :class="product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-amber-600' : 'text-gray-800'"
                >
                  {{ product.stock }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ parseFloat(String(product.weight || 0)).toFixed(2) }} kg
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {{ product.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  :class="product.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="product.is_active ? 'bg-green-500' : 'bg-gray-400'" />
                  {{ product.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="inline-flex items-center gap-1">
                  <button
                    @click="editProduct(product)"
                    class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteProduct(product.id)"
                    class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :open="showDeleteModal"
      title="Delete Product"
      message="Are you sure you want to delete this product? This action cannot be undone."
      :deleting="deleting"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Add / Edit Modal -->
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
          @click.self="closeModal"
        >
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-2"
          >
            <div v-if="showModal" class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
              <!-- Modal header -->
              <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="editingProduct ? 'bg-blue-50' : 'bg-green-50'">
                    <svg class="w-4 h-4" :class="editingProduct ? 'text-blue-600' : 'text-green-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path v-if="editingProduct" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-sm font-semibold text-gray-900">{{ editingProduct ? 'Edit Product' : 'New Product' }}</h2>
                    <p class="text-xs text-gray-400">{{ editingProduct ? 'Update product details' : 'Fill in the details below' }}</p>
                  </div>
                </div>
                <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Modal body (scrollable) -->
              <div class="overflow-y-auto flex-1 px-6 py-5">
                <form id="productForm" @submit.prevent="saveProduct" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Product Name <span class="text-red-400">*</span></label>
                    <input v-model="form.name" type="text" required class="input-field" placeholder="e.g. Wireless Headphones" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea v-model="form.description" rows="3" class="input-field resize-none leading-relaxed" placeholder="Brief product description…"></textarea>
                  </div>

                  <div class="grid grid-cols-3 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Price <span class="text-red-400">*</span></label>
                      <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                        <span class="px-2.5 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                        <input v-model.number="form.price" type="number" step="0.01" min="0" required class="flex-1 px-2.5 py-2 text-sm outline-none w-0" placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Stock <span class="text-red-400">*</span></label>
                      <input v-model.number="form.stock" type="number" min="0" required class="input-field" placeholder="0" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Weight <span class="text-red-400">*</span></label>
                      <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                        <input v-model.number="form.weight" type="number" step="0.01" min="0" required class="flex-1 px-2.5 py-2 text-sm outline-none w-0" placeholder="0.00" />
                        <span class="px-2.5 flex items-center bg-gray-50 text-gray-500 text-xs border-l border-gray-300 select-none">kg</span>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                      <select v-model="selectedParentCategoryId" @change="onParentCategoryChange" class="input-field">
                        <option :value="null">None</option>
                        <option v-for="cat in parentCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Subcategory</label>
                      <select v-model="selectedSubcategoryId" @change="onSubcategoryChange" class="input-field" :disabled="!subcategories.length">
                        <option :value="null">{{ subcategories.length ? 'None' : 'No subcategories' }}</option>
                        <option v-for="sub in subcategories" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                    <input v-model="form.image_url" type="url" class="input-field" placeholder="https://example.com/image.jpg" />
                  </div>

                  <!-- Active toggle -->
                  <div class="flex items-center justify-between py-1">
                    <div>
                      <p class="text-sm font-medium text-gray-700">Active</p>
                      <p class="text-xs text-gray-400">Visible to customers in the store</p>
                    </div>
                    <button
                      type="button"
                      @click="form.is_active = !form.is_active"
                      class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      :class="form.is_active ? 'bg-blue-600' : 'bg-gray-200'"
                    >
                      <span
                        class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                        :class="form.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'"
                      />
                    </button>
                  </div>

                  <!-- Form error -->
                  <div v-if="formError" class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                    <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formError }}
                  </div>
                </form>
              </div>

              <!-- Modal footer -->
              <div class="px-6 py-4 border-t border-gray-100 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="productForm"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="submitting"
                >
                  <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {{ submitting ? 'Saving…' : (editingProduct ? 'Save Changes' : 'Add Product') }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Category {
  id: number
  name: string
  parent_id: number | null
  children?: Category[]
}

interface Product {
  id: number
  name: string
  description: string
  price: number | string
  stock: number
  weight: number | string
  category: string
  category_id: number | null
  image_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ProductsResponse {
  data: Product[]
}

const { $apiFetch } = useNuxtApp()

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)
const editingProduct = ref<Product | null>(null)
const showDeleteModal = ref(false)
const deletingId = ref<number | null>(null)
const deleting = ref(false)

// Categories
const allCategories = ref<Category[]>([])
const selectedParentCategoryId = ref<number | null>(null)
const selectedSubcategoryId = ref<number | null>(null)

const parentCategories = computed(() => allCategories.value)
const subcategories = computed(() => {
  if (!selectedParentCategoryId.value) return []
  const parent = allCategories.value.find(c => c.id === selectedParentCategoryId.value)
  return parent?.children || []
})

const form = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  weight: 0,
  category: 'general',
  category_id: null as number | null,
  image_url: '',
  is_active: true
})

const fetchCategories = async () => {
  try {
    const res = await $apiFetch<{ data: Category[] }>('/categories', { method: 'GET' })
    allCategories.value = res.data || []
  } catch (err) {
    console.warn('Failed to load categories:', err)
  }
}

const onParentCategoryChange = () => {
  selectedSubcategoryId.value = null
  // Set category_id to parent if no subcategories, otherwise wait for sub selection
  form.value.category_id = selectedParentCategoryId.value
  // Set the category name string for backward compat
  const parent = allCategories.value.find(c => c.id === selectedParentCategoryId.value)
  form.value.category = parent?.name || 'general'
}

const onSubcategoryChange = () => {
  if (selectedSubcategoryId.value) {
    form.value.category_id = selectedSubcategoryId.value
    const parent = allCategories.value.find(c => c.id === selectedParentCategoryId.value)
    const sub = parent?.children?.find(c => c.id === selectedSubcategoryId.value)
    form.value.category = sub?.name || parent?.name || 'general'
  } else {
    form.value.category_id = selectedParentCategoryId.value
    const parent = allCategories.value.find(c => c.id === selectedParentCategoryId.value)
    form.value.category = parent?.name || 'general'
  }
}

const loadProducts = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<ProductsResponse>('/products', {
      method: 'GET',
      query: {
        sort: 'created_at',
        order: 'desc'
      }
    })

    if (response?.data) {
      products.value = response.data
    }
  } catch (err: any) {
    console.error('Error loading products:', err)
    error.value = err?.data?.message || 'Failed to load products'
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  editingProduct.value = null
  form.value = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    weight: 0,
    category: 'general',
    category_id: null,
    image_url: '',
    is_active: true
  }
  selectedParentCategoryId.value = null
  selectedSubcategoryId.value = null
  formError.value = null
  showModal.value = true
}

const editProduct = (product: Product) => {
  editingProduct.value = product
  form.value = {
    name: product.name,
    description: product.description,
    price: parseFloat(product.price as string),
    stock: product.stock,
    weight: parseFloat(String(product.weight || 0)),
    category: product.category,
    category_id: product.category_id,
    image_url: product.image_url,
    is_active: product.is_active
  }

  // Resolve category_id to parent/sub selections
  selectedParentCategoryId.value = null
  selectedSubcategoryId.value = null
  if (product.category_id) {
    // Check if it's a parent category
    const asParent = allCategories.value.find(c => c.id === product.category_id)
    if (asParent) {
      selectedParentCategoryId.value = asParent.id
    } else {
      // It's a subcategory — find its parent
      for (const parent of allCategories.value) {
        const sub = parent.children?.find(c => c.id === product.category_id)
        if (sub) {
          selectedParentCategoryId.value = parent.id
          selectedSubcategoryId.value = sub.id
          break
        }
      }
    }
  }

  formError.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
  formError.value = null
}

const saveProduct = async () => {
  submitting.value = true
  formError.value = null

  try {
    if (editingProduct.value) {
      // Update existing product
      await $apiFetch(`/products/${editingProduct.value.id}`, {
        method: 'PATCH',
        body: form.value
      })
    } else {
      // Create new product
      await $apiFetch('/products', {
        method: 'POST',
        body: form.value
      })
    }

    await loadProducts()
    closeModal()
  } catch (err: any) {
    console.error('Error saving product:', err)
    formError.value = err?.data?.message || 'Failed to save product'
  } finally {
    submitting.value = false
  }
}

const deleteProduct = (id: number) => {
  deletingId.value = id
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deletingId.value) return
  deleting.value = true

  try {
    await $apiFetch(`/products/${deletingId.value}`, { method: 'DELETE' })
    await loadProducts()
    showDeleteModal.value = false
    deletingId.value = null
  } catch (err: any) {
    console.error('Error deleting product:', err)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadProducts()
  fetchCategories()
})
</script>