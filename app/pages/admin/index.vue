<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 text-sm mt-1">Overview of your store's performance</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading dashboard…</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Total Products -->
        <NuxtLink
          to="/admin/products"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-100 transition-all group"
        >
          <div class="flex items-start justify-between mb-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Products</p>
            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
              <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.totalProducts }}</p>
        </NuxtLink>

        <!-- Total Orders -->
        <NuxtLink
          to="/admin/orders"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-green-100 transition-all group"
        >
          <div class="flex items-start justify-between mb-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Orders</p>
            <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
              <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900 truncate">{{ formatCompact(stats.totalOrders) }}</p>
          <p class="text-xs text-gray-400 mt-1 truncate">{{ stats.totalOrders.toLocaleString() }} orders</p>
        </NuxtLink>

        <!-- Pending Orders -->
        <NuxtLink
          to="/admin/orders"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-amber-100 transition-all group"
        >
          <div class="flex items-start justify-between mb-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Orders</p>
            <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
              <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900 truncate">{{ formatCompact(stats.pendingOrders) }}</p>
          <p v-if="stats.pendingOrders > 0" class="text-xs text-amber-500 font-medium mt-1">{{ stats.pendingOrders.toLocaleString() }} needs attention</p>
        </NuxtLink>

        <!-- Total Revenue -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-start justify-between mb-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</p>
            <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900 truncate">{{ formatCurrency(stats.totalRevenue) }}</p>
          <p class="text-xs text-gray-400 mt-1 truncate">${{ stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
        </div>

        <!-- Pending Revenue -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-start justify-between mb-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Revenue</p>
            <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900 truncate">{{ formatCurrency(stats.pendingRevenue) }}</p>
          <p v-if="stats.pendingRevenue > 0" class="text-xs text-orange-500 font-medium mt-1">${{ stats.pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">Recent Orders</p>
              <p class="text-xs text-gray-400">Latest 5 orders</p>
            </div>
          </div>
          <NuxtLink
            to="/admin/orders"
            class="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors shrink-0"
          >
            View all →
          </NuxtLink>
        </div>

        <!-- Empty -->
        <div v-if="recentOrders.length === 0" class="px-6 py-12 text-center">
          <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-sm text-gray-400">No orders yet</p>
        </div>

        <!-- List -->
        <div v-else class="divide-y divide-gray-50">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <span class="text-xs font-bold text-gray-500">#</span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ order.customer_name }}</p>
                <p class="text-xs text-gray-400">Order #{{ order.id }} · ${{ parseFloat(String(order.total_amount)).toFixed(2) }}</p>
              </div>
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
              :class="{
                'bg-amber-50 text-amber-700': order.status === 'pending',
                'bg-blue-50 text-blue-700': order.status === 'processing',
                'bg-purple-50 text-purple-700': order.status === 'shipped',
                'bg-green-50 text-green-700': order.status === 'delivered',
                'bg-gray-100 text-gray-500': order.status === 'cancelled',
              }"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="{
                  'bg-amber-400': order.status === 'pending',
                  'bg-blue-500': order.status === 'processing',
                  'bg-purple-500': order.status === 'shipped',
                  'bg-green-500': order.status === 'delivered',
                  'bg-gray-400': order.status === 'cancelled',
                }"
              ></span>
              {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

interface Order {
  id: number
  customer_name: string
  total_amount: string | number
  status: string
  created_at: string
}

const { $apiFetch } = useNuxtApp()

const loading = ref(true)

const stats = ref({
  totalProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  totalRevenue: 0,
  pendingRevenue: 0,
})

const recentOrders = ref<Order[]>([])

const formatCompact = (num: number): string => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return num.toLocaleString()
}

const formatCurrency = (num: number): string => {
  if (num >= 1_000_000) return '$' + (num / 1_000_000).toFixed(2) + 'M'
  if (num >= 1_000) return '$' + (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return '$' + num.toFixed(2)
}

const loadDashboardData = async () => {
  loading.value = true

  try {
    const res = await $apiFetch<any>('/dashboard/stats', { method: 'GET' })
    const data = res?.data

    if (data?.stats) {
      stats.value.totalProducts = data.stats.total_products ?? 0
      stats.value.totalOrders = data.stats.total_orders ?? 0
      stats.value.pendingOrders = data.stats.pending_orders ?? 0
      stats.value.totalRevenue = data.stats.total_revenue ?? 0
      stats.value.pendingRevenue = data.stats.pending_revenue ?? 0
    }

    if (data?.recent_orders) {
      recentOrders.value = data.recent_orders
    }
  } catch (err: any) {
    console.error('Error loading dashboard data:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>
