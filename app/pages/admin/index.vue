<template>
  <div>
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Total Products</p>
              <p class="text-3xl font-bold mt-1">{{ stats.totalProducts }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Total Orders</p>
              <p class="text-3xl font-bold mt-1">{{ stats.totalOrders }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Pending Orders</p>
              <p class="text-3xl font-bold mt-1">{{ stats.pendingOrders }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Total Revenue</p>
              <p class="text-3xl font-bold mt-1">${{ stats.totalRevenue.toFixed(2) }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-xl font-bold mb-4">Recent Orders</h2>
        <div v-if="recentOrders.length === 0" class="text-gray-500 text-center py-8">
          No orders yet
        </div>
        <div v-else class="space-y-3">
          <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="font-semibold">{{ order.customer_name }}</p>
              <p class="text-sm text-gray-600">${{ parseFloat(String(order.total_amount)).toFixed(2) }}</p>
            </div>
            <span class="px-3 py-1 text-xs rounded-full" :class="{
              'bg-yellow-100 text-yellow-800': order.status === 'pending',
              'bg-blue-100 text-blue-800': order.status === 'processing',
              'bg-green-100 text-green-800': order.status === 'delivered'
            }">
              {{ order.status }}
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

interface ProductsResponse {
  data: any[]
}

interface OrdersResponse {
  data: Order[]
}

const { $apiFetch } = useNuxtApp()

const loading = ref(true)

const stats = ref({
  totalProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  totalRevenue: 0
})

const recentOrders = ref<Order[]>([])

const loadDashboardData = async () => {
  loading.value = true

  try {
    const [productsRes, allOrdersRes, pendingOrdersRes, recentOrdersRes] = await Promise.all([
      $apiFetch<ProductsResponse>('/products', { method: 'GET' }),
      $apiFetch<OrdersResponse>('/orders', { method: 'GET' }),
      $apiFetch<OrdersResponse>('/orders', {
        method: 'GET',
        query: { status: 'pending' }
      }),
      $apiFetch<OrdersResponse>('/orders', {
        method: 'GET',
        query: {
          sort: 'created_at',
          order: 'desc'
        }
      })
    ])

    stats.value.totalProducts = productsRes?.data?.length || 0
    stats.value.totalOrders = allOrdersRes?.data?.length || 0
    stats.value.pendingOrders = pendingOrdersRes?.data?.length || 0

    stats.value.totalRevenue =
      allOrdersRes?.data?.reduce((sum, order) => sum + parseFloat(String(order.total_amount)), 0) || 0

    if (recentOrdersRes?.data) {
      recentOrders.value = recentOrdersRes.data.slice(0, 5)
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
