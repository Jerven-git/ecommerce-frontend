<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 font-medium">Discounts</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Discounts</h1>
        <p class="text-gray-500 text-sm mt-1">Create and manage promotional discount codes</p>
      </div>
      <button
        data-guide="add-discount-btn"
        @click="openAddModal"
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Discount
      </button>
    </div>

    <!-- Filters -->
    <div data-guide="discount-filters" class="mb-6 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by code or description..."
          class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
        />
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="selectedStatus = filter.value"
          class="px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all"
          :class="selectedStatus === filter.value
            ? filter.activeClass
            : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:text-gray-700'"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading discounts…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-800 mb-1">Failed to load discounts</p>
      <p class="text-sm text-red-500 mb-6">{{ error }}</p>
      <button @click="loadDiscounts" class="btn-primary">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="discounts.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
      <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-700 mb-1">No discounts yet</p>
      <p class="text-sm text-gray-400 mb-6">Create your first discount code to start offering promotions</p>
      <button @click="openAddModal" class="btn-primary">Add Discount</button>
    </div>

    <!-- Discounts table -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Table header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-900">Discount Codes</p>
          <p class="text-xs text-gray-400">{{ totalItems }} code{{ totalItems !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Value</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Valid Until</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Uses</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="discount in discounts"
              :key="discount.id"
              class="hover:bg-gray-50/60 transition-colors"
            >
              <!-- Code + description -->
              <td class="px-6 py-4">
                <p class="text-sm font-semibold text-gray-900 font-mono tracking-wide">{{ discount.code }}</p>
                <p v-if="discount.description" class="text-xs text-gray-400 mt-0.5">{{ discount.description }}</p>
              </td>

              <!-- Type -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="discount.type === 'percentage' ? 'bg-primary-50 text-primary-700' : 'bg-emerald-50 text-emerald-700'"
                >
                  {{ discount.type === 'percentage' ? 'Percentage' : 'Fixed' }}
                </span>
              </td>

              <!-- Value -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-semibold text-gray-900">
                  {{ discount.type === 'percentage' ? `${discount.value}%` : `$${parseFloat(String(discount.value)).toFixed(2)}` }}
                </span>
              </td>

              <!-- Valid until -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ discount.valid_until ? new Date(discount.valid_until).toLocaleDateString() : 'No expiry' }}
              </td>

              <!-- Uses -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-700">{{ discount.used_count || 0 }}</span>
                <span v-if="discount.max_uses" class="text-sm text-gray-400"> / {{ discount.max_uses }}</span>
                <span v-else class="text-xs text-gray-400 ml-1">uses</span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="discount.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="discount.is_active ? 'bg-green-500' : 'bg-gray-400'"></span>
                  {{ discount.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="editDiscount(discount)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    title="Edit discount"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteDiscount(discount.id)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete discount"
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

    <!-- Pagination -->
    <div v-if="!loading && !error && totalPages > 1" class="mt-6 flex items-center justify-between">
      <p class="text-sm text-gray-500">
        Showing {{ ((currentPage - 1) * perPage) + 1 }}–{{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} discounts
      </p>
      <div class="flex items-center gap-1">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="px-2 text-gray-400 text-sm">...</span>
          <button
            v-else
            @click="goToPage(page as number)"
            class="px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
            :class="page === currentPage
              ? 'bg-primary-600 text-white border-primary-600'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
          >
            {{ page }}
          </button>
        </template>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :open="showDeleteModal"
      title="Delete Discount"
      message="Are you sure you want to delete this discount code? This action cannot be undone."
      :deleting="deleting"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Add/Edit Modal -->
    <BaseModal :open="showModal" size="xl" body-class="px-6 py-5" @close="closeModal">
      <template #header>
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div class="min-w-0">
            <h2 class="text-sm font-semibold text-gray-900 truncate">{{ editingDiscount ? 'Edit Discount' : 'New Discount' }}</h2>
            <p class="text-xs text-gray-400 truncate">{{ editingDiscount ? `Editing ${editingDiscount.code}` : 'Create a new promotional code' }}</p>
          </div>
        </div>
      </template>

      <form id="discount-form" @submit.prevent="saveDiscount" class="space-y-5">
                <!-- Code -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Discount Code *</label>
                  <input
                    v-model="form.code"
                    type="text"
                    required
                    class="input-field font-mono tracking-widest uppercase"
                    placeholder="SUMMER2024"
                  />
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    v-model="form.description"
                    class="w-full h-[200px] px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-all leading-relaxed overflow-y-auto input-field resize-none"
                    placeholder="Summer sale discount"
                  ></textarea>
                </div>

                <!-- Type + Value -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Type *</label>
                    <select v-model="form.type" required class="input-field">
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Value *</label>
                    <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                      <span v-if="form.type === 'fixed'" class="px-3 flex items-center bg-gray-50 border-r border-gray-300 text-gray-500 text-sm select-none">$</span>
                      <input
                        v-model.number="form.value"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        class="flex-1 px-3 py-2 text-sm outline-none bg-white"
                        :placeholder="form.type === 'percentage' ? '10' : '5.00'"
                      />
                      <span v-if="form.type === 'percentage'" class="px-3 flex items-center bg-gray-50 border-l border-gray-300 text-gray-500 text-sm select-none">%</span>
                    </div>
                  </div>
                </div>

                <!-- Min Order + Max Uses -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Min. Order Amount</label>
                    <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                      <span class="px-3 flex items-center bg-gray-50 border-r border-gray-300 text-gray-500 text-sm select-none">$</span>
                      <input
                        v-model.number="form.min_order_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        class="flex-1 px-3 py-2 text-sm outline-none bg-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Max Uses</label>
                    <input
                      v-model.number="form.max_uses"
                      type="number"
                      min="1"
                      class="input-field"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <!-- Valid Until -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Valid Until</label>
                  <input v-model="form.valid_until" type="date" class="input-field" />
                </div>

                <!-- Active toggle -->
                <div class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                  <div>
                    <p class="text-sm font-medium text-gray-900">Active</p>
                    <p class="text-xs text-gray-400 mt-0.5">Customers can apply this discount at checkout</p>
                  </div>
                  <button
                    type="button"
                    @click="form.is_active = !form.is_active"
                    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    :class="form.is_active ? 'bg-primary-600' : 'bg-gray-200'"
                    :aria-checked="form.is_active"
                    role="switch"
                  >
                    <span
                      class="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                      :class="form.is_active ? 'translate-x-6' : 'translate-x-1'"
                    ></span>
                  </button>
                </div>

                <!-- Form error -->
                <div v-if="formError" class="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <svg class="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm text-red-700">{{ formError }}</p>
                </div>
      </form>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
          <button
            type="submit"
            form="discount-form"
            :disabled="submitting"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ submitting ? 'Saving…' : 'Save Discount' }}
          </button>
        </div>
      </template>
    </BaseModal>
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

interface PaginatedResponse {
  data: Discount[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const { $apiFetch } = useNuxtApp()

const discounts = ref<Discount[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)
const editingDiscount = ref<Discount | null>(null)
const showDeleteModal = ref(false)
const deletingId = ref<number | null>(null)
const deleting = ref(false)

const searchQuery = ref('')
const selectedStatus = ref('all')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = 15

const statusFilters = [
  { label: 'All', value: 'all', activeClass: 'border-primary-500 bg-primary-50 text-primary-700' },
  { label: 'Active', value: 'active', activeClass: 'bg-green-600 text-white border-green-600' },
  { label: 'Inactive', value: 'inactive', activeClass: 'bg-gray-600 text-white border-gray-600' },
]

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadDiscounts()
}

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
    const query: Record<string, any> = {
      sort: 'created_at',
      order: 'desc',
      page: currentPage.value,
      per_page: perPage,
    }

    if (selectedStatus.value === 'active') query.is_active = 1
    else if (selectedStatus.value === 'inactive') query.is_active = 0

    if (searchQuery.value.trim()) query.search = searchQuery.value.trim()

    const response = await $apiFetch<PaginatedResponse>('/discounts', {
      method: 'GET',
      query,
    })

    if (response?.data) {
      discounts.value = response.data
      currentPage.value = response.current_page
      totalPages.value = response.last_page
      totalItems.value = response.total
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

const onEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (showDeleteModal.value) { showDeleteModal.value = false; return }
    if (showModal.value) closeModal()
  }
}

onMounted(() => window.addEventListener('keydown', onEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', onEscape))

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

const deleteDiscount = (id: number) => {
  deletingId.value = id
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deletingId.value) return
  deleting.value = true

  try {
    await $apiFetch(`/discounts/${deletingId.value}`, { method: 'DELETE' })
    await loadDiscounts()
    showDeleteModal.value = false
    deletingId.value = null
  } catch (err: any) {
    console.error('Error deleting discount:', err)
  } finally {
    deleting.value = false
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadDiscounts()
  }, 400)
})

watch(selectedStatus, () => {
  currentPage.value = 1
  loadDiscounts()
})

onMounted(() => {
  loadDiscounts()
})
</script>