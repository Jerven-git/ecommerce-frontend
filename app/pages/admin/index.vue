<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="text-gray-600 hover:text-gray-900">View Store</NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div class="card lg:col-span-2">
            <h2 class="text-xl font-bold mb-4">Quick Actions</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <NuxtLink to="/admin/products" class="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <div>
                    <h3 class="font-semibold">Manage Products</h3>
                    <p class="text-sm text-gray-600">Add, edit, or remove products</p>
                  </div>
                </div>
              </NuxtLink>

              <NuxtLink to="/admin/orders" class="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <h3 class="font-semibold">View Orders</h3>
                    <p class="text-sm text-gray-600">Manage customer orders</p>
                  </div>
                </div>
              </NuxtLink>

              <NuxtLink to="/admin/settings" class="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h3 class="font-semibold">Site Settings</h3>
                    <p class="text-sm text-gray-600">Customize your store appearance</p>
                  </div>
                </div>
              </NuxtLink>

              <NuxtLink to="/admin/discounts" class="block p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h3 class="font-semibold">Discount Codes</h3>
                    <p class="text-sm text-gray-600">Manage discount codes</p>
                  </div>
                </div>
              </NuxtLink>

              <NuxtLink to="/admin/shipping" class="block p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  <div>
                    <h3 class="font-semibold">Shipping Settings</h3>
                    <p class="text-sm text-gray-600">Configure shipping zones and rates</p>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <div class="card lg:col-span-1">
            <h2 class="text-xl font-bold mb-4">Account</h2>
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-600">Logged in as</p>
                  <p class="font-semibold">{{ authStore.user?.name || 'Admin' }}</p>
                  <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
                </div>
              </div>

              <div class="pt-4 border-t space-y-2">
                <button @click="handleLogout" class="w-full p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span class="font-medium text-red-700">Logout</span>
                  </div>
                </button>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
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
const authStore = useAuthStore()

const loading = ref(true)

const stats = ref({
  totalProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  totalRevenue: 0
})

const recentOrders = ref<Order[]>([])

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/')
}

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

    // Calculate stats
    stats.value.totalProducts = productsRes?.data?.length || 0
    stats.value.totalOrders = allOrdersRes?.data?.length || 0
    stats.value.pendingOrders = pendingOrdersRes?.data?.length || 0
    
    // Calculate total revenue
    stats.value.totalRevenue = allOrdersRes?.data?.reduce((sum, order) => {
      return sum + parseFloat(String(order.total_amount))
    }, 0) || 0

    // Get recent orders (limit to 5)
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