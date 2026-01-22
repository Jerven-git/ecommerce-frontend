<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">← Dashboard</NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">Discounts</h1>
          </div>
          <button @click="openAddModal" class="btn-primary">Add Discount</button>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="card text-center py-12">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="loadDiscounts" class="btn-primary">Retry</button>
      </div>

      <div v-else-if="discounts.length === 0" class="card text-center py-12">
        <p class="text-gray-500">No discounts yet. Create your first discount!</p>
      </div>

      <div v-else class="card overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uses</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="discount in discounts" :key="discount.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ discount.code }}</div>
                <div class="text-sm text-gray-500">{{ discount.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="capitalize">{{ discount.type }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ discount.type === 'percentage' ? `${discount.value}%` : `$${parseFloat(String(discount.value)).toFixed(2)}` }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ discount.valid_until ? new Date(discount.valid_until).toLocaleDateString() : 'No expiry' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ discount.used_count || 0 }}{{ discount.max_uses ? ` / ${discount.max_uses}` : '' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="discount.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ discount.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editDiscount(discount)" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                <button @click="deleteDiscount(discount.id)" class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">{{ editingDiscount ? 'Edit Discount' : 'Add Discount' }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveDiscount" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Discount Code *</label>
            <input v-model="form.code" type="text" required class="input-field" placeholder="SUMMER2024" />
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Description</label>
            <textarea v-model="form.description" rows="2" class="input-field" placeholder="Summer sale discount"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Discount Type *</label>
              <select v-model="form.type" required class="input-field">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Value *</label>
              <input v-model.number="form.value" type="number" step="0.01" min="0" required class="input-field" :placeholder="form.type === 'percentage' ? '10' : '5.00'" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Minimum Order Amount</label>
              <input v-model.number="form.min_order_amount" type="number" step="0.01" min="0" class="input-field" placeholder="0.00" />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Max Uses (optional)</label>
              <input v-model.number="form.max_uses" type="number" min="1" class="input-field" placeholder="Unlimited" />
            </div>
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Valid Until (optional)</label>
            <input v-model="form.valid_until" type="date" class="input-field" />
          </div>

          <div class="flex items-center">
            <input v-model="form.is_active" type="checkbox" id="is_active" class="h-4 w-4 text-blue-600 rounded" />
            <label for="is_active" class="ml-2 text-gray-700">Active (customers can use this discount)</label>
          </div>

          <div v-if="formError" class="p-3 bg-red-100 text-red-700 rounded">
            {{ formError }}
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="submit" class="btn-primary flex-1" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save Discount' }}
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

interface Discount {
  id: number
  code: string
  description: string
  type: 'percentage' | 'fixed'
  value: number | string
  min_order_amount: number | string
  max_uses: number | null
  used_count: number
  valid_until: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface DiscountsResponse {
  data: Discount[]
}

const { $apiFetch } = useNuxtApp()

const discounts = ref<Discount[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)
const editingDiscount = ref<Discount | null>(null)

const form = ref({
  code: '',
  description: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: 0,
  min_order_amount: 0,
  max_uses: null as number | null,
  valid_until: null as string | null,
  is_active: true
})

const loadDiscounts = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<DiscountsResponse>('/discounts', {
      method: 'GET',
      query: {
        sort: 'created_at',
        order: 'desc'
      }
    })

    if (response?.data) {
      discounts.value = response.data
    }
  } catch (err: any) {
    console.error('Error loading discounts:', err)
    error.value = err?.data?.message || 'Failed to load discounts'
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  editingDiscount.value = null
  form.value = {
    code: '',
    description: '',
    type: 'percentage',
    value: 0,
    min_order_amount: 0,
    max_uses: null,
    valid_until: null,
    is_active: true
  }
  formError.value = null
  showModal.value = true
}

const editDiscount = (discount: Discount) => {
  editingDiscount.value = discount
  form.value = {
    code: discount.code,
    description: discount.description,
    type: discount.type,
    value: parseFloat(String(discount.value)),
    min_order_amount: parseFloat(String(discount.min_order_amount)),
    max_uses: discount.max_uses,
    valid_until: discount.valid_until,
    is_active: discount.is_active
  }
  formError.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingDiscount.value = null
  formError.value = null
}

const saveDiscount = async () => {
  submitting.value = true
  formError.value = null

  try {
    if (editingDiscount.value) {
      await $apiFetch(`/discounts/${editingDiscount.value.id}`, {
        method: 'PATCH',
        body: form.value
      })
    } else {
      await $apiFetch('/discounts', {
        method: 'POST',
        body: form.value
      })
    }

    await loadDiscounts()
    closeModal()
  } catch (err: any) {
    console.error('Error saving discount:', err)
    formError.value = err?.data?.message || 'Failed to save discount'
  } finally {
    submitting.value = false
  }
}

const deleteDiscount = async (id: number) => {
  if (!confirm('Are you sure you want to delete this discount?')) return

  try {
    await $apiFetch(`/discounts/${id}`, {
      method: 'DELETE'
    })

    await loadDiscounts()
  } catch (err: any) {
    console.error('Error deleting discount:', err)
    alert(err?.data?.message || 'Failed to delete discount')
  }
}

onMounted(() => {
  loadDiscounts()
})
</script>