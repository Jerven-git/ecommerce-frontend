<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">← Dashboard</NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">Products</h1>
          </div>
          <button @click="openAddModal" class="btn-primary">Add Product</button>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="card text-center py-12">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="loadProducts" class="btn-primary">Retry</button>
      </div>

      <div v-else-if="products.length === 0" class="card text-center py-12">
        <p class="text-gray-500">No products yet. Add your first product!</p>
      </div>

      <div v-else class="card overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img v-if="product.image_url" :src="product.image_url" :alt="product.name" class="h-10 w-10 rounded object-cover mr-3" />
                  <div v-else class="h-10 w-10 rounded bg-gray-200 mr-3"></div>
                  <div>
                    <div class="font-medium text-gray-900">{{ product.name }}</div>
                    <div class="text-sm text-gray-500 max-w-xs truncate">{{ product.description }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">${{ parseFloat(String(product.price)).toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.stock }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ product.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editProduct(product)" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">{{ editingProduct ? 'Edit Product' : 'Add Product' }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveProduct" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Product Name *</label>
            <input v-model="form.name" type="text" required class="input-field" />
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Description</label>
            <textarea v-model="form.description" rows="3" class="input-field"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Price *</label>
              <input v-model.number="form.price" type="number" step="0.01" min="0" required class="input-field" />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Stock *</label>
              <input v-model.number="form.stock" type="number" min="0" required class="input-field" />
            </div>
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Category</label>
            <input v-model="form.category" type="text" class="input-field" />
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Image URL</label>
            <input v-model="form.image_url" type="url" class="input-field" placeholder="https://example.com/image.jpg" />
          </div>

          <div class="flex items-center">
            <input v-model="form.is_active" type="checkbox" id="is_active" class="h-4 w-4 text-blue-600 rounded" />
            <label for="is_active" class="ml-2 text-gray-700">Active (visible to customers)</label>
          </div>

          <div v-if="formError" class="p-3 bg-red-100 text-red-700 rounded">
            {{ formError }}
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="submit" class="btn-primary flex-1" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save Product' }}
            </button>
            <button type="button" @click="closeModal" class="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Product {
  id: number
  name: string
  description: string
  price: number | string
  stock: number
  category: string
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

const form = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: 'general',
  image_url: '',
  is_active: true
})

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
    category: 'general',
    image_url: '',
    is_active: true
  }
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
    category: product.category,
    image_url: product.image_url,
    is_active: product.is_active
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

const deleteProduct = async (id: number) => {
  if (!confirm('Are you sure you want to delete this product?')) return

  try {
    await $apiFetch(`/products/${id}`, {
      method: 'DELETE'
    })

    await loadProducts()
  } catch (err: any) {
    console.error('Error deleting product:', err)
    alert(err?.data?.message || 'Failed to delete product')
  }
}

onMounted(() => {
  loadProducts()
})
</script>