<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
        <span>/</span>
        <span class="text-gray-600 font-medium">Orders</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Orders</h1>
      <p class="text-gray-500 text-sm mt-1">View and manage customer orders</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading orders…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-800 mb-1">Failed to load orders</p>
      <p class="text-sm text-red-500 mb-6">{{ error }}</p>
      <button @click="loadOrders" class="btn-primary">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="orders.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
      <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-700 mb-1">No orders yet</p>
      <p class="text-sm text-gray-400">Orders will appear here once customers start purchasing</p>
    </div>

    <!-- Orders list -->
    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <!-- Card header -->
        <div class="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex items-center gap-3">
            <!-- Status dot -->
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :class="{
                'bg-amber-400': order.status === 'pending',
                'bg-blue-500': order.status === 'processing',
                'bg-purple-500': order.status === 'shipped',
                'bg-green-500': order.status === 'delivered',
                'bg-gray-400': order.status === 'cancelled',
              }"
            />
            <div>
              <p class="text-sm font-semibold text-gray-900">Order #{{ order.id }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(order.created_at) }}</p>
            </div>
          </div>

          <!-- Payment badge + Status selector -->
          <div class="flex items-center gap-2 shrink-0 flex-wrap">
            <!-- Payment badge -->
            <span
              v-if="order.payment"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              :class="{
                'bg-green-50 text-green-700': order.payment.status === 'paid',
                'bg-amber-50 text-amber-700': order.payment.status === 'pending',
                'bg-red-50 text-red-700': order.payment.status === 'failed',
              }"
            >
              {{ order.payment.provider === 'cash' ? 'COD' : order.payment.provider.charAt(0).toUpperCase() + order.payment.provider.slice(1) }}
              &middot;
              {{ order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1) }}
            </span>

            <!-- Confirm Payment button for pending COD -->
            <button
              v-if="order.payment?.provider === 'cash' && order.payment?.status === 'pending'"
              @click="promptConfirmPayment(order.id, order.customer_name)"
              :disabled="confirmingOrderId === order.id"
              class="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {{ confirmingOrderId === order.id ? 'Confirming...' : 'Confirm Payment' }}
            </button>

            <!-- Undo Payment button for paid COD -->
            <button
              v-if="order.payment?.provider === 'cash' && order.payment?.status === 'paid'"
              @click="promptUndoPayment(order.id, order.customer_name)"
              :disabled="undoingOrderId === order.id"
              class="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {{ undoingOrderId === order.id ? 'Reverting...' : 'Undo Payment' }}
            </button>
            <div class="relative">
              <select
                v-model="order.status"
                @change="updateOrderStatus(order.id, order.status)"
                :disabled="updatingOrderId === order.id"
                class="appearance-none text-sm font-medium rounded-lg border px-3 py-1.5 pr-8 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                :class="{
                  'bg-amber-50 border-amber-200 text-amber-800': order.status === 'pending',
                  'bg-blue-50 border-blue-200 text-blue-800': order.status === 'processing',
                  'bg-purple-50 border-purple-200 text-purple-800': order.status === 'shipped',
                  'bg-green-50 border-green-200 text-green-800': order.status === 'delivered',
                  'bg-gray-100 border-gray-200 text-gray-600': order.status === 'cancelled',
                }"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <!-- Custom chevron -->
              <span class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg v-if="updatingOrderId === order.id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <svg v-else class="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <!-- Customer + Shipping grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div class="px-6 py-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Customer</p>
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-900">{{ order.customer_name }}</p>
              <p class="text-sm text-gray-500">{{ order.customer_email }}</p>
              <p v-if="order.customer_phone" class="text-sm text-gray-500">{{ order.customer_phone }}</p>
            </div>
          </div>

          <div class="px-6 py-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Ship To</p>
            <p class="text-sm text-gray-600 leading-relaxed">{{ order.shipping_address }}</p>
          </div>
        </div>

        <!-- Order items -->
        <div class="px-6 py-4 border-t border-gray-100">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Items</p>

          <div v-if="order.items && order.items.length > 0" class="space-y-2">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-xs font-semibold text-gray-400 bg-gray-200 rounded px-1.5 py-0.5 shrink-0">
                  ×{{ item.quantity }}
                </span>
                <span class="text-sm text-gray-700 truncate">{{ item.product_name }}</span>
              </div>
              <span class="text-sm font-semibold text-gray-900 shrink-0 ml-3">
                ${{ (parseFloat(String(item.product_price)) * item.quantity).toFixed(2) }}
              </span>
            </div>
          </div>

          <p v-else class="text-sm text-gray-400 italic">No items recorded</p>
        </div>

        <!-- Card footer: breakdown -->
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-400">Subtotal</span>
            <span class="text-sm text-gray-600">${{ toFixed(order.subtotal) }}</span>
          </div>
          <div v-if="parseFloat(String(order.tax_amount)) > 0" class="flex items-center justify-between">
            <span class="text-xs text-gray-400">Tax</span>
            <span class="text-sm text-gray-600">${{ toFixed(order.tax_amount) }}</span>
          </div>
          <div v-if="parseFloat(String(order.shipping_amount)) > 0" class="flex items-center justify-between">
            <span class="text-xs text-gray-400">Shipping</span>
            <span class="text-sm text-gray-600">${{ toFixed(order.shipping_amount) }}</span>
          </div>
          <div v-if="parseFloat(String(order.discount_amount)) > 0" class="flex items-center justify-between">
            <span class="text-xs text-green-500">Discount <span v-if="order.discount_code" class="font-mono">({{ order.discount_code }})</span></span>
            <span class="text-sm text-green-600">-${{ toFixed(order.discount_amount) }}</span>
          </div>
          <div class="flex items-center justify-between pt-1.5 border-t border-gray-200">
            <span class="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</span>
            <span class="text-lg font-bold text-gray-900">${{ toFixed(order.total_amount) }}</span>
          </div>
        </div>
      </div>
    </div>

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
        <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-lg px-4 py-3 flex items-start gap-3">
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-medium">{{ toast }}</p>
          <button @click="toast = null" class="shrink-0 text-red-400 hover:text-red-600">
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

interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  product_price: number | string
  quantity: number
  subtotal: number | string
}

interface Payment {
  id: number
  provider: string
  status: 'pending' | 'paid' | 'failed'
}

interface Order {
  id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  total_amount: string | number
  subtotal: string | number
  tax_amount: string | number
  shipping_amount: string | number
  discount_code?: string | null
  discount_amount: string | number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  items?: OrderItem[]
  payment?: Payment | null
}

interface OrdersResponse {
  data: Order[]
}

const { $apiFetch } = useNuxtApp()

const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const updatingOrderId = ref<number | null>(null)
const confirmingOrderId = ref<number | null>(null)
const undoingOrderId = ref<number | null>(null)
const toast = ref<string | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const showToast = (message: string) => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = message
  toastTimer = setTimeout(() => { toast.value = null }, 5000)
}

const confirmModal = reactive({
  open: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  loadingText: 'Processing…',
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

const toFixed = (value: string | number) => parseFloat(String(value)).toFixed(2)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadOrders = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<OrdersResponse>('/orders', {
      method: 'GET',
      query: {
        include: 'items,payment',
        sort: 'created_at',
        order: 'desc'
      }
    })

    if (response?.data) {
      orders.value = response.data
    }
  } catch (err: any) {
    console.error('Error loading orders:', err)
    error.value = err?.data?.message || 'Failed to load orders. Please try again.'
  } finally {
    loading.value = false
  }
}

const updateOrderStatus = async (orderId: number, status: string) => {
  updatingOrderId.value = orderId

  try {
    await $apiFetch(`/orders/${orderId}`, {
      method: 'PATCH',
      body: { status }
    })

    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status as Order['status']
    }
  } catch (err: any) {
    console.error('Error updating order status:', err)
    await loadOrders()
    showToast(err?.data?.message || 'Failed to update order status')
  } finally {
    updatingOrderId.value = null
  }
}

const promptConfirmPayment = (orderId: number, customerName: string) => {
  openConfirmModal({
    title: 'Confirm Cash Payment',
    message: `Mark payment as received for order #${orderId} (${customerName})? This will deduct stock.`,
    confirmText: 'Confirm Payment',
    loadingText: 'Confirming…',
    variant: 'success',
    action: async () => {
      confirmingOrderId.value = orderId
      try {
        await $apiFetch(`/orders/${orderId}/confirm-payment`, { method: 'POST' })
        await loadOrders()
      } catch (err: any) {
        console.error('Error confirming payment:', err)
        showToast(err?.data?.message || 'Failed to confirm payment')
      } finally {
        confirmingOrderId.value = null
      }
    },
  })
}

const promptUndoPayment = (orderId: number, customerName: string) => {
  openConfirmModal({
    title: 'Undo Payment',
    message: `Revert payment for order #${orderId} (${customerName}) back to pending? Stock will be restored.`,
    confirmText: 'Undo Payment',
    loadingText: 'Reverting…',
    variant: 'warning',
    action: async () => {
      undoingOrderId.value = orderId
      try {
        await $apiFetch(`/orders/${orderId}/undo-payment`, { method: 'POST' })
        await loadOrders()
      } catch (err: any) {
        console.error('Error undoing payment:', err)
        showToast(err?.data?.message || 'Failed to undo payment')
      } finally {
        undoingOrderId.value = null
      }
    },
  })
}

onMounted(() => {
  loadOrders()
})
</script>