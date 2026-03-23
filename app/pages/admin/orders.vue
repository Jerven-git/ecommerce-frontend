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

    <!-- Filters -->
    <div class="mb-6 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, email, or order #"
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

    <!-- No results for filters -->
    <div v-else-if="filteredOrders.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
      <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-700 mb-1">No matching orders</p>
      <p class="text-sm text-gray-400">Try adjusting your search or filter</p>
    </div>

    <!-- Orders list -->
    <div v-else class="space-y-4">
      <div
        v-for="order in filteredOrders"
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
                'bg-primary-500': order.status === 'processing',
                'bg-purple-500': order.status === 'shipped',
                'bg-green-500': order.status === 'delivered',
                'bg-orange-500': order.status === 'backorder_awaiting_stock',
                'bg-yellow-500': order.status === 'backorder_notified',
                'bg-red-400': order.status === 'backorder_expired',
                'bg-red-500': order.status === 'cancelled' || order.status === 'backorder_cancelled',
              }"
            />
            <div>
              <p class="text-sm font-semibold text-gray-900">
                Order #{{ order.id }}
                <span v-if="isBackorderStatus(order.status)" class="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-orange-100 text-orange-700 border border-orange-200">Backorder</span>
              </p>
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
                'bg-orange-50 text-orange-700': order.payment.status === 'refunded',
              }"
            >
              {{ order.payment.provider === 'cash' ? 'COD' : order.payment.provider.charAt(0).toUpperCase() + order.payment.provider.slice(1) }}
              &middot;
              {{ order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1) }}
            </span>

            <!-- Confirm Payment button for pending COD -->
            <button
              v-if="order.payment?.provider === 'cash' && order.payment?.status === 'pending' && order.status !== 'cancelled' && order.status !== 'backorder_cancelled'"
              @click="promptConfirmPayment(order.id, order.customer_name)"
              :disabled="confirmingOrderId === order.id"
              class="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {{ confirmingOrderId === order.id ? 'Confirming...' : 'Confirm Payment' }}
            </button>

            <!-- Undo Payment button for paid COD -->
            <button
              v-if="order.payment?.provider === 'cash' && order.payment?.status === 'paid' && order.status !== 'cancelled' && order.status !== 'backorder_cancelled'"
              @click="promptUndoPayment(order.id, order.customer_name)"
              :disabled="undoingOrderId === order.id"
              class="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {{ undoingOrderId === order.id ? 'Reverting...' : 'Undo Payment' }}
            </button>

            <!-- Cancel & Refund button for paid online orders -->
            <button
              v-if="order.payment?.status === 'paid' && ['processing', 'shipped'].includes(order.status)"
              @click="promptCancelRefund(order.id, order.customer_name, order.payment.provider)"
              :disabled="cancelRefundOrderId === order.id"
              class="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {{ cancelRefundOrderId === order.id ? 'Processing...' : 'Cancel & Refund' }}
            </button>
            <div class="relative">
              <select
                v-model="order.status"
                @change="onOrderStatusChange(order.id, order.status)"
                :disabled="updatingOrderId === order.id || isLockedStatus(order.status)"
                class="appearance-none text-sm font-medium rounded-lg border px-3 py-1.5 pr-8 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                :class="orderStatusClass(order.status)"
              >
                <template v-if="isBackorderStatus(order.status)">
                  <option :value="order.status">{{ backorderStatusLabel(order.status) }}</option>
                  <option v-if="!isLockedBackorderStatus(order.status)" value="__go_to_backorders">→ Manage in Backorders</option>
                </template>
                <template v-else>
                  <option :value="order.status">{{ statusLabel(order.status) }}</option>
                  <option
                    v-for="next in allowedTransitions[order.status] || []"
                    :key="next"
                    :value="next"
                  >{{ statusLabel(next) }}</option>
                </template>
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

        <!-- Shipment / Tracking -->
        <div class="px-6 py-4 border-t border-gray-100">
          <!-- No shipment yet — show Ship button -->
          <div v-if="!order.shipment" class="flex items-center justify-between">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tracking</p>
            <button
              v-if="order.status !== 'cancelled' && order.status !== 'backorder_cancelled' && order.status !== 'backorder_expired'"
              @click="promptShipOrder(order.id, order.customer_name)"
              :disabled="shippingOrderId === order.id"
              class="text-xs font-medium px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {{ shippingOrderId === order.id ? 'Creating…' : 'Ship Order' }}
            </button>
            <span v-else class="text-xs text-gray-400 italic">N/A</span>
          </div>

          <!-- Has shipment — show tracking info + barcode -->
          <div v-else>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tracking</p>
            <div class="bg-gray-50 rounded-xl p-4 space-y-3">
              <!-- Tracking number + carrier -->
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">Tracking Number</p>
                  <p class="text-sm font-mono font-semibold text-gray-900">{{ order.shipment.tracking_number }}</p>
                </div>
                <div v-if="order.shipment.carrier" class="text-right">
                  <p class="text-xs text-gray-400 mb-0.5">Carrier</p>
                  <p class="text-sm font-medium text-gray-700">{{ order.shipment.carrier }}</p>
                </div>
              </div>

              <!-- Barcode -->
              <div class="flex justify-center bg-white rounded-lg p-3 border border-gray-100">
                <img
                  :src="barcodeUrl(order.shipment.tracking_number)"
                  :alt="`Barcode for ${order.shipment.tracking_number}`"
                  class="h-16"
                />
              </div>

              <!-- Shipment status selector -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">Shipped</p>
                  <p class="text-xs text-gray-500">{{ formatDate(order.shipment.shipped_at) }}</p>
                </div>
                <div class="relative">
                  <select
                    v-model="order.shipment.status"
                    @change="updateShipmentStatus(order.shipment!)"
                    :disabled="updatingShipmentId === order.shipment.id"
                    class="appearance-none text-xs font-medium rounded-lg border px-3 py-1.5 pr-7 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 cursor-pointer transition-colors"
                    :class="{
                      'bg-gray-50 border-gray-200 text-gray-700': order.shipment.status === 'label_created',
                      'bg-primary-50 border-primary-200 text-primary-700': order.shipment.status === 'in_transit',
                      'bg-green-50 border-green-200 text-green-700': order.shipment.status === 'delivered',
                      'bg-red-50 border-red-200 text-red-700': order.shipment.status === 'returned',
                    }"
                  >
                    <option value="label_created">Label Created</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="returned">Returned</option>
                  </select>
                  <span class="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
                    <svg class="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
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

    <!-- Pagination -->
    <div v-if="!loading && !error && totalPages > 1" class="mt-6 flex items-center justify-between">
      <p class="text-sm text-gray-500">
        Showing {{ ((currentPage - 1) * perPage) + 1 }}–{{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} orders
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
  status: 'pending' | 'paid' | 'failed' | 'refunded'
}

interface ShipmentData {
  id: number
  tracking_number: string
  carrier: string | null
  status: 'label_created' | 'in_transit' | 'delivered' | 'returned'
  shipped_at: string
  delivered_at: string | null
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'backorder_awaiting_stock' | 'backorder_notified' | 'backorder_expired' | 'backorder_cancelled'
  created_at: string
  items?: OrderItem[]
  payment?: Payment | null
  shipment?: ShipmentData | null
}

interface OrdersResponse {
  data: Order[]
  status_counts?: Record<string, number>
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const { $apiFetch } = useNuxtApp()

const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedStatus = ref('all')
const statusCounts = ref<Record<string, number>>({})
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = 15

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
  loadOrders()
}

const statusFilters = [
  { value: 'all', label: 'All', activeClass: 'border-primary-500 bg-primary-50 text-primary-700' },
  { value: 'pending', label: 'Pending', activeClass: 'border-amber-500 bg-amber-50 text-amber-700' },
  { value: 'processing', label: 'Processing', activeClass: 'border-primary-500 bg-primary-50 text-primary-700' },
  { value: 'shipped', label: 'Shipped', activeClass: 'border-purple-500 bg-purple-50 text-purple-700' },
  { value: 'delivered', label: 'Delivered', activeClass: 'border-green-500 bg-green-50 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', activeClass: 'border-red-500 bg-red-50 text-red-700' },
  { value: 'backorder', label: 'Backorder', activeClass: 'border-orange-500 bg-orange-50 text-orange-700' },
]

const getStatusCount = (status: string) => {
  if (status === 'cancelled') {
    return (statusCounts.value['cancelled'] ?? 0) + (statusCounts.value['backorder_cancelled'] ?? 0)
  }
  if (status === 'backorder') {
    return Object.entries(statusCounts.value)
      .filter(([k]) => k.startsWith('backorder_'))
      .reduce((sum, [, v]) => sum + v, 0)
  }
  return statusCounts.value[status] ?? 0
}

const isBackorderStatus = (status: string) => status.startsWith('backorder_')

const isLockedBackorderStatus = (status: string) => status === 'backorder_cancelled' || status === 'backorder_expired'

const isLockedStatus = (status: string) => isLockedBackorderStatus(status)

const allowedTransitions: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['processing'],
  cancelled: ['pending'],
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return labels[status] ?? status
}

const backorderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    backorder_awaiting_stock: 'Awaiting Stock',
    backorder_notified: 'Notified',
    backorder_expired: 'Expired',
    backorder_cancelled: 'Cancelled',
  }
  return labels[status] ?? status
}

const orderStatusClass = (status: string) => ({
  'bg-amber-50 border-amber-200 text-amber-800': status === 'pending',
  'bg-primary-50 border-primary-200 text-primary-800': status === 'processing',
  'bg-purple-50 border-purple-200 text-purple-800': status === 'shipped',
  'bg-green-50 border-green-200 text-green-800': status === 'delivered',
  'bg-red-50 border-red-200 text-red-700': status === 'cancelled',
  'bg-orange-50 border-orange-200 text-orange-800': status === 'backorder_awaiting_stock',
  'bg-yellow-50 border-yellow-200 text-yellow-800': status === 'backorder_notified',
  'bg-red-50 border-red-200 text-red-800': status === 'backorder_expired',
  'bg-red-100 border-red-300 text-red-700': status === 'backorder_cancelled',
})

// filteredOrders now just returns the server-filtered results directly
const filteredOrders = computed(() => orders.value)
const updatingOrderId = ref<number | null>(null)
const confirmingOrderId = ref<number | null>(null)
const undoingOrderId = ref<number | null>(null)
const cancelRefundOrderId = ref<number | null>(null)
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
    const query: Record<string, string | number> = {
      include: 'items,payment,shipment',
      sort: 'created_at',
      order: 'desc',
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

    const response = await $apiFetch<OrdersResponse>('/orders', {
      method: 'GET',
      query,
    })

    if (response?.data) {
      orders.value = response.data
      currentPage.value = response.current_page ?? 1
      totalPages.value = response.last_page ?? 1
      totalItems.value = response.total ?? 0
      // Track previous statuses for confirm-on-change
      for (const o of response.data) {
        previousStatuses.value[o.id] = o.status
      }
      console.log(orders.value)
    }
    if (response?.status_counts) {
      statusCounts.value = response.status_counts
    }
  } catch (err: any) {
    console.error('Error loading orders:', err)
    error.value = err?.data?.message || 'Failed to load orders. Please try again.'
  } finally {
    loading.value = false
  }
}

// Re-fetch when status filter changes
watch(selectedStatus, () => {
  currentPage.value = 1
  loadOrders()
})

// Debounced re-fetch when search query changes
let searchTimer: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadOrders()
  }, 400)
})

const previousStatuses = ref<Record<number, string>>({})

const onOrderStatusChange = (orderId: number, newStatus: string) => {
  const order = orders.value.find(o => o.id === orderId)
  if (!order) return

  // Redirect to backorders page for managing backorder cancellations
  if (newStatus === '__go_to_backorders') {
    order.status = previousStatuses.value[orderId] as Order['status']
    navigateTo(`/admin/backorders?order_id=${orderId}`)
    return
  }

  const oldStatus = previousStatuses.value[orderId] || order.status

  const needsConfirm = ['shipped', 'cancelled', 'delivered', 'pending', 'processing']
  if (needsConfirm.includes(newStatus)) {
    const labels: Record<string, { title: string; message: string; variant: 'danger' | 'success' | 'warning' }> = {
      shipped: {
        title: 'Mark as Shipped',
        message: `Mark order #${orderId} (${order.customer_name}) as shipped? This status indicates the order has left the warehouse.`,
        variant: 'success',
      },
      delivered: {
        title: 'Mark as Delivered',
        message: `Mark order #${orderId} (${order.customer_name}) as delivered? This confirms the customer has received the order.`,
        variant: 'success',
      },
      cancelled: {
        title: 'Cancel Order',
        message: `Cancel order #${orderId} (${order.customer_name})? This will mark any pending payment as failed.`,
        variant: 'danger',
      },
      pending: {
        title: 'Revert to Pending',
        message: `Revert order #${orderId} (${order.customer_name}) back to pending? Only do this if the cancellation was a mistake.`,
        variant: 'warning',
      },
      processing: {
        title: 'Revert to Processing',
        message: `Move order #${orderId} (${order.customer_name}) back to processing? Only do this if the delivery status was set by mistake.`,
        variant: 'warning',
      },
    }
    const label = labels[newStatus]!

    openConfirmModal({
      title: label.title,
      message: label.message,
      confirmText: label.title,
      loadingText: 'Updating…',
      variant: label.variant,
      action: async () => {
        await doUpdateOrderStatus(orderId, newStatus)
      },
    })

    // Revert the dropdown visually until confirmed
    order.status = oldStatus as Order['status']
  } else {
    doUpdateOrderStatus(orderId, newStatus)
  }
}

const doUpdateOrderStatus = async (orderId: number, status: string) => {
  updatingOrderId.value = orderId

  try {
    await $apiFetch(`/orders/${orderId}`, {
      method: 'PATCH',
      body: { status }
    })

    // Reload to get updated payment status (e.g. pending → failed on cancel)
    await loadOrders()
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

const promptCancelRefund = (orderId: number, customerName: string, provider: string) => {
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1)
  openConfirmModal({
    title: 'Cancel & Refund',
    message: `Cancel order #${orderId} (${customerName}) and mark for refund? Stock will be restored and the customer will be notified. You will need to process the refund manually through ${providerName}.`,
    confirmText: 'Cancel & Refund',
    loadingText: 'Processing…',
    variant: 'danger',
    action: async () => {
      cancelRefundOrderId.value = orderId
      try {
        const res = await $apiFetch<any>(`/orders/${orderId}/cancel-refund`, { method: 'POST' })
        showToast(res?.message || 'Order cancelled — process refund in your payment provider')
        await loadOrders()
      } catch (err: any) {
        showToast(err?.data?.message || 'Failed to cancel order')
      } finally {
        cancelRefundOrderId.value = null
      }
    },
  })
}

const shippingOrderId = ref<number | null>(null)
const shipCarrier = ref('')

const promptShipOrder = (orderId: number, customerName: string) => {
  shipCarrier.value = ''
  openConfirmModal({
    title: 'Ship Order',
    message: `Create shipment for order #${orderId} (${customerName})? This will generate a tracking number and barcode.`,
    confirmText: 'Ship Order',
    loadingText: 'Creating shipment…',
    variant: 'success',
    action: async () => {
      shippingOrderId.value = orderId
      try {
        await $apiFetch(`/orders/${orderId}/ship`, {
          method: 'POST',
          body: { carrier: shipCarrier.value || null },
        })
        await loadOrders()
      } catch (err: any) {
        console.error('Error shipping order:', err)
        showToast(err?.data?.message || 'Failed to create shipment')
      } finally {
        shippingOrderId.value = null
      }
    },
  })
}

const updatingShipmentId = ref<number | null>(null)

const updateShipmentStatus = async (shipment: ShipmentData) => {
  updatingShipmentId.value = shipment.id
  try {
    await $apiFetch(`/shipments/${shipment.id}`, {
      method: 'PATCH',
      body: { status: shipment.status },
    })
    await loadOrders()
  } catch (err: any) {
    console.error('Error updating shipment:', err)
    await loadOrders()
    showToast(err?.data?.message || 'Failed to update shipment status')
  } finally {
    updatingShipmentId.value = null
  }
}

const config = useRuntimeConfig()
const barcodeUrl = (trackingNumber: string) =>
  `${config.public.apiBase}${config.public.apiPath}/tracking/${trackingNumber}/barcode`

onMounted(() => {
  loadOrders()
})
</script>