<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
        <span>/</span>
        <span class="text-gray-600 font-medium">Backorders</span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Backorders</h1>
          <p class="text-gray-500 text-sm mt-1">Manage out-of-stock orders awaiting fulfillment</p>
        </div>
        <button data-guide="backorder-settings-btn" @click="showSettings = true" class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shrink-0">
          Settings
        </button>
      </div>
    </div>

    <!-- Order filter banner -->
    <div v-if="filterOrderId" class="mb-4 flex items-center justify-between bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
      <p class="text-sm text-primary-700 font-medium">Showing backorders for Order #{{ filterOrderId }}</p>
      <button @click="clearOrderFilter" class="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors">
        Show All
      </button>
    </div>

    <!-- Filters -->
    <div data-guide="backorder-filters" class="mb-6 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by customer name or email"
          class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
        />
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="status in statusFilters"
          :key="status.value"
          @click="selectedStatus = status.value"
          class="px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all"
          :class="selectedStatus === status.value
            ? status.activeClass
            : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:text-gray-700'"
        >
          {{ status.label }}
          <span
            v-if="status.value !== 'all' && getStatusCount(status.value) > 0"
            class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
            :class="selectedStatus === status.value ? 'bg-white/20' : 'bg-gray-100 text-gray-500'"
          >{{ getStatusCount(status.value) }}</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading backorders...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-800 mb-1">Failed to load backorders</p>
      <p class="text-sm text-red-500 mb-6">{{ error }}</p>
      <button @click="loadBackorders" class="btn-primary">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="backorders.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
      <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-700 mb-1">No backorders</p>
      <p class="text-sm text-gray-400">Backorders will appear here when customers order out-of-stock items</p>
    </div>

    <!-- Backorders list -->
    <div v-else class="space-y-4">
      <div
        v-for="bo in backorders"
        :key="bo.id"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <!-- Card header -->
        <div class="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex items-center gap-3">
            <!-- Status dot -->
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :class="statusDotClass(bo.status)"
            />
            <div>
              <p class="text-sm font-semibold text-gray-900">Backorder #{{ bo.id }} · Order #{{ bo.order_id }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(bo.created_at) }}</p>
            </div>
          </div>

          <!-- Status badge + actions -->
          <div class="flex items-center gap-2 shrink-0 flex-wrap">
            <span
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
              :class="statusBadgeClass(bo.status)"
            >
              {{ statusLabel(bo.status) }}
            </span>

            <!-- Notify button (awaiting_stock or expired) -->
            <button
              v-if="bo.status === 'awaiting_stock' || bo.status === 'expired'"
              @click="promptNotify(bo)"
              :disabled="actionId === bo.id"
              class="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {{ bo.status === 'expired' ? 'Resend Link' : 'Send Payment Link' }}
            </button>

            <!-- Resend button (notified) -->
            <button
              v-if="bo.status === 'notified'"
              @click="promptResend(bo)"
              :disabled="actionId === bo.id"
              class="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              Resend Link
            </button>

            <!-- Mark as Paid button (confirmed backorders) -->
            <button
              v-if="bo.status === 'confirmed'"
              @click="promptMarkAsPaid(bo)"
              :disabled="actionId === bo.id"
              class="text-xs font-medium px-3 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-50 transition-colors"
            >
              Mark as Paid
            </button>

            <!-- Cancel button -->
            <button
              v-if="!['paid', 'cancelled'].includes(bo.status)"
              @click="promptCancel(bo)"
              :disabled="actionId === bo.id"
              class="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Details grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <!-- Customer -->
          <div class="px-6 py-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Customer</p>
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-900">{{ bo.order?.customer_name }}</p>
              <p class="text-sm text-gray-500">{{ bo.order?.customer_email }}</p>
            </div>
          </div>

          <!-- Product -->
          <div class="px-6 py-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Product</p>
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-900">{{ bo.product?.name }}</p>
              <div class="flex items-center gap-3 text-sm text-gray-500">
                <span>Qty: {{ bo.quantity }}</span>
                <span class="text-gray-300">|</span>
                <span>Stock: <span :class="Number(bo.product?.stock) > 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'">{{ bo.product?.stock ?? 0 }}</span></span>
              </div>
            </div>
          </div>

          <!-- Payment info -->
          <div class="px-6 py-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Payment</p>
            <div class="space-y-1">
              <p class="text-sm text-gray-700">
                {{ chargePolicyLabel(bo.charge_policy) }}
              </p>
              <p v-if="bo.token_expires_at && bo.status === 'notified'" class="text-xs text-gray-400">
                Link expires: {{ formatDate(bo.token_expires_at) }}
              </p>
              <p v-if="bo.paid_at" class="text-xs text-green-600 font-medium">
                Paid: {{ formatDate(bo.paid_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && !error && totalPages > 1" class="mt-6 flex items-center justify-between">
      <p class="text-sm text-gray-500">
        Showing {{ ((currentPage - 1) * perPage) + 1 }}-{{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} backorders
      </p>
      <div class="flex items-center gap-1">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Settings Modal -->
    <Transition name="fade">
      <div v-if="showSettings" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="showSettings = false">
        <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
          <h2 class="text-lg font-bold text-gray-900 mb-5">Backorder Settings</h2>

          <div class="space-y-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">Enable Backorders</p>
                <p class="text-xs text-gray-400 mt-0.5">Master switch for all backorder functionality</p>
              </div>
              <button
                @click="settings.backorder_enabled = !settings.backorder_enabled"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.backorder_enabled ? 'bg-primary-600' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                  :class="settings.backorder_enabled ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>

            <!-- Explanation note -->
            <div class="rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-3">
              <p class="text-xs text-amber-800 leading-relaxed">
                <span class="font-semibold">How it works:</span> This enables the backorder feature site-wide. You still need to enable backorder on each product individually via
                <NuxtLink to="/admin/products" class="underline font-medium hover:text-amber-900">Products</NuxtLink>
                &rarr; Edit &rarr; <span class="font-medium">Allow Backorder</span> toggle. Both this global setting and the per-product toggle must be on for a product to accept backorders.
              </p>
            </div>

            <div>
              <div class="flex items-center gap-1.5 mb-1.5">
                <label class="text-sm font-medium text-gray-900">Payment Link Expiry (hours)</label>
                <HelpTip :text="expiryHelpText" />
              </div>
              <input
                v-model.number="settings.backorder_payment_link_expiry_hours"
                type="number"
                min="1"
                max="720"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p class="text-xs text-gray-400 mt-1">How long the payment link stays active after sending</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button @click="showSettings = false" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
            <button
              @click="saveSettings"
              :disabled="savingSettings"
              class="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              {{ savingSettings ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast notification -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="toast" class="fixed top-4 right-4 z-40 max-w-sm">
        <div
          class="border rounded-xl shadow-lg px-4 py-3 flex items-start gap-3"
          :class="toastType === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'"
        >
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="toastType === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-medium">{{ toast }}</p>
          <button @click="toast = null" class="shrink-0 opacity-60 hover:opacity-100">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Confirm Modal -->
    <ConfirmModal
      :open="confirmModal.open"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirm-text="confirmModal.confirmText"
      :loading-text="confirmModal.loadingText"
      :loading="confirmModal.loading"
      :variant="confirmModal.variant"
      @confirm="onModalConfirm"
      @cancel="confirmModal.open = false"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface BackorderData {
  id: number
  order_id: number
  product_id: number
  quantity: number
  status: string
  charge_policy: string
  payment_token: string | null
  token_expires_at: string | null
  notified_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
  order?: {
    id: number
    customer_name: string
    customer_email: string
    customer_phone?: string
  }
  product?: {
    id: number
    name: string
    price: number | string
    stock: number
  }
}

const { $apiFetch } = useNuxtApp()
const route = useRoute()

const backorders = ref<BackorderData[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedStatus = ref('all')
const filterOrderId = ref<number | null>(route.query.order_id ? Number(route.query.order_id) : null)

const clearOrderFilter = () => {
  filterOrderId.value = null
  navigateTo('/admin/backorders', { replace: true })
  loadBackorders()
}
const statusCounts = ref<Record<string, number>>({})
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = 15
const actionId = ref<number | null>(null)

const showSettings = ref(false)
const savingSettings = ref(false)

const expiryHelpText = [
  '1. If you have backorders enabled and a product\'s own backorder toggle is on...',
  '2. A customer adds an out-of-stock item to their cart. Any available quantity completes as a standard purchase — the rest becomes a backorder.',
  '3. If your payment settings allow manual invoice/payment, the backorder can also be placed as an "order" to be paid later.',
  '4. The moment you add stock in the admin, the system finds the longest-waiting buyer for that product.',
  '5. That buyer is emailed a payment link to complete their order.',
  '6. The link stays active for as many hours as set in the field above.',
  '7. If they don\'t pay in time, the link closes, their backorder is deleted, and they\'re notified by email.',
  '8. The system moves to the next buyer in the queue and repeats the process.',
].join('\n')
const settings = ref({
  backorder_enabled: false,
  backorder_payment_link_expiry_hours: 24,
})

const toast = ref<string | null>(null)
const toastType = ref<'success' | 'error'>('success')
let toastTimer: ReturnType<typeof setTimeout> | null = null

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = message
  toastType.value = type
  toastTimer = setTimeout(() => { toast.value = null }, 5000)
}

const confirmModal = reactive({
  open: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  loadingText: 'Processing...',
  loading: false,
  variant: 'success' as 'danger' | 'success' | 'warning',
  action: null as (() => Promise<void>) | null,
})

const openConfirmModal = (opts: {
  title: string
  message: string
  confirmText: string
  loadingText: string
  variant: 'danger' | 'success' | 'warning'
  action: () => Promise<void>
}) => {
  Object.assign(confirmModal, opts, { open: true, loading: false })
}

const onModalConfirm = async () => {
  if (!confirmModal.action) return
  confirmModal.loading = true
  try {
    await confirmModal.action()
  } finally {
    confirmModal.loading = false
    confirmModal.open = false
  }
}

const statusFilters = [
  { value: 'all', label: 'All', activeClass: 'border-primary-500 bg-primary-50 text-primary-700' },
  { value: 'awaiting_stock', label: 'Awaiting Stock', activeClass: 'border-amber-500 bg-amber-50 text-amber-700' },
  { value: 'notified', label: 'Notified', activeClass: 'border-primary-500 bg-primary-50 text-primary-700' },
  { value: 'expired', label: 'Expired', activeClass: 'border-orange-500 bg-orange-50 text-orange-700' },
  { value: 'confirmed', label: 'Confirmed', activeClass: 'border-blue-500 bg-blue-50 text-blue-700' },
  { value: 'paid', label: 'Paid', activeClass: 'border-green-500 bg-green-50 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', activeClass: 'border-gray-500 bg-gray-100 text-gray-700' },
]

const getStatusCount = (status: string) => statusCounts.value[status] ?? 0

const statusDotClass = (status: string) => ({
  'bg-amber-400': status === 'awaiting_stock',
  'bg-primary-500': status === 'notified',
  'bg-orange-400': status === 'expired',
  'bg-blue-500': status === 'confirmed',
  'bg-green-500': status === 'paid',
  'bg-gray-400': status === 'cancelled',
})

const statusBadgeClass = (status: string) => ({
  'bg-amber-50 text-amber-700': status === 'awaiting_stock',
  'bg-primary-50 text-primary-700': status === 'notified',
  'bg-orange-50 text-orange-700': status === 'expired',
  'bg-blue-50 text-blue-700': status === 'confirmed',
  'bg-green-50 text-green-700': status === 'paid',
  'bg-gray-100 text-gray-600': status === 'cancelled',
})

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    awaiting_stock: 'Awaiting Stock',
    notified: 'Notified',
    expired: 'Expired',
    confirmed: 'Confirmed',
    paid: 'Paid',
    cancelled: 'Cancelled',
  }
  return labels[status] ?? status
}

const chargePolicyLabel = (policy: string) => {
  const labels: Record<string, string> = {
    charged_now: 'Charged at checkout',
    charged_later: 'Charged when available',
  }
  return labels[policy] ?? policy
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadBackorders()
}

const loadBackorders = async () => {
  loading.value = true
  error.value = null

  try {
    const query: Record<string, string | number> = {
      page: currentPage.value,
      per_page: perPage,
    }

    if (selectedStatus.value !== 'all') {
      query.status = selectedStatus.value
    }

    const q = searchQuery.value.trim()
    if (q) {
      query.search = q
    }

    if (filterOrderId.value) {
      query.order_id = filterOrderId.value
    }

    const response = await $apiFetch<any>('/backorders', {
      method: 'GET',
      query,
    })

    if (response?.data) {
      backorders.value = response.data
      currentPage.value = response.current_page ?? 1
      totalPages.value = response.last_page ?? 1
      totalItems.value = response.total ?? 0
    }
    if (response?.status_counts) {
      statusCounts.value = response.status_counts
    }
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to load backorders.'
  } finally {
    loading.value = false
  }
}

const loadSettings = async () => {
  try {
    const response = await $apiFetch<any>('/backorder-settings', { method: 'GET' })
    if (response?.data) {
      settings.value = {
        backorder_enabled: response.data.backorder_enabled,
        backorder_payment_link_expiry_hours: response.data.backorder_payment_link_expiry_hours,
      }
    }
  } catch { /* non-critical */ }
}

const saveSettings = async () => {
  savingSettings.value = true
  try {
    await $apiFetch('/backorder-settings', {
      method: 'PATCH',
      body: settings.value,
    })
    showSettings.value = false
    showToast('Backorder settings saved')
  } catch (err: any) {
    showToast(err?.data?.message || 'Failed to save settings', 'error')
  } finally {
    savingSettings.value = false
  }
}

const promptNotify = (bo: BackorderData) => {
  openConfirmModal({
    title: 'Send Payment Link',
    message: `Send a payment link to ${bo.order?.customer_name} (${bo.order?.customer_email}) for "${bo.product?.name}" x${bo.quantity}?`,
    confirmText: 'Send Link',
    loadingText: 'Sending...',
    variant: 'success',
    action: async () => {
      actionId.value = bo.id
      try {
        const endpoint = bo.status === 'expired' ? 'resend' : 'notify'
        await $apiFetch(`/backorders/${bo.id}/${endpoint}`, { method: 'POST' })
        showToast('Payment link sent to customer')
        await loadBackorders()
      } catch (err: any) {
        showToast(err?.data?.message || 'Failed to send payment link', 'error')
      } finally {
        actionId.value = null
      }
    },
  })
}

const promptResend = (bo: BackorderData) => {
  openConfirmModal({
    title: 'Resend Payment Link',
    message: `Resend a new payment link to ${bo.order?.customer_name} for "${bo.product?.name}"? The previous link will be replaced.`,
    confirmText: 'Resend Link',
    loadingText: 'Sending...',
    variant: 'warning',
    action: async () => {
      actionId.value = bo.id
      try {
        await $apiFetch(`/backorders/${bo.id}/resend`, { method: 'POST' })
        showToast('Payment link resent to customer')
        await loadBackorders()
      } catch (err: any) {
        showToast(err?.data?.message || 'Failed to resend link', 'error')
      } finally {
        actionId.value = null
      }
    },
  })
}

const promptCancel = (bo: BackorderData) => {
  openConfirmModal({
    title: 'Cancel Backorder',
    message: `Cancel backorder for "${bo.product?.name}" x${bo.quantity} (${bo.order?.customer_name})? The customer will be notified by email.`,
    confirmText: 'Cancel Backorder',
    loadingText: 'Cancelling...',
    variant: 'danger',
    action: async () => {
      actionId.value = bo.id
      try {
        await $apiFetch(`/backorders/${bo.id}/cancel`, { method: 'POST' })
        showToast('Backorder cancelled')
        await loadBackorders()
      } catch (err: any) {
        showToast(err?.data?.message || 'Failed to cancel backorder', 'error')
      } finally {
        actionId.value = null
      }
    },
  })
}

const promptMarkAsPaid = (bo: BackorderData) => {
  openConfirmModal({
    title: 'Mark as Paid',
    message: `Mark backorder for "${bo.product?.name}" x${bo.quantity} (${bo.order?.customer_name}) as paid? This confirms that manual payment has been received.`,
    confirmText: 'Mark as Paid',
    loadingText: 'Updating...',
    variant: 'success',
    action: async () => {
      actionId.value = bo.id
      try {
        await $apiFetch(`/backorders/${bo.id}/mark-paid`, { method: 'POST' })
        showToast('Backorder marked as paid')
        await loadBackorders()
      } catch (err: any) {
        showToast(err?.data?.message || 'Failed to mark as paid', 'error')
      } finally {
        actionId.value = null
      }
    },
  })
}

watch(selectedStatus, () => {
  currentPage.value = 1
  loadBackorders()
})

let searchTimer: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadBackorders()
  }, 400)
})

onMounted(() => {
  loadBackorders()
  loadSettings()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
