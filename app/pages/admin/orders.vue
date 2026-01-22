<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">← Dashboard</NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">Orders</h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="card text-center py-12">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="loadOrders" class="btn-primary">Retry</button>
      </div>

      <div v-else-if="orders.length === 0" class="card text-center py-12">
        <p class="text-gray-500">No orders yet</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="order in orders" :key="order.id" class="card">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold">Order #{{ order.id }}</h3>
              <p class="text-sm text-gray-600">{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="flex items-center space-x-4 mt-3 lg:mt-0">
              <select
                v-model="order.status"
                @change="updateOrderStatus(order.id, order.status)"
                class="input-field py-2 text-sm"
                :disabled="updatingOrderId === order.id"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span v-if="updatingOrderId === order.id" class="text-sm text-gray-500">Updating...</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 class="font-semibold text-sm text-gray-700 mb-2">Customer Information</h4>
              <p class="text-sm"><span class="font-medium">Name:</span> {{ order.customer_name }}</p>
              <p class="text-sm"><span class="font-medium">Email:</span> {{ order.customer_email }}</p>
              <p class="text-sm" v-if="order.customer_phone"><span class="font-medium">Phone:</span> {{ order.customer_phone }}</p>
            </div>

            <div>
              <h4 class="font-semibold text-sm text-gray-700 mb-2">Shipping Address</h4>
              <p class="text-sm">{{ order.shipping_address }}</p>
            </div>
          </div>

          <div>
            <h4 class="font-semibold text-sm text-gray-700 mb-2">Order Items</h4>
            <div v-if="order.items && order.items.length > 0" class="space-y-2">
              <div v-for="item in order.items" :key="item.id" class="flex justify-between text-sm bg-gray-50 p-2 rounded">
                <span>{{ item.product_name }} x{{ item.quantity }}</span>
                <span class="font-medium">${{ (parseFloat(String(item.product_price)) * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">No items</div>
          </div>

          <div class="mt-4 pt-4 border-t flex justify-between items-center">
            <span class="text-lg font-bold">Total: ${{ parseFloat(String(order.total_amount)).toFixed(2) }}</span>
            <span class="px-3 py-1 text-sm rounded-full" :class="{
              'bg-yellow-100 text-yellow-800': order.status === 'pending',
              'bg-blue-100 text-blue-800': order.status === 'processing',
              'bg-purple-100 text-purple-800': order.status === 'shipped',
              'bg-green-100 text-green-800': order.status === 'delivered',
              'bg-red-100 text-red-800': order.status === 'cancelled'
            }">
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

interface Order {
  id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  total_amount: string | number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  items?: OrderItem[]
}

interface OrdersResponse {
  data: Order[]
}

const { $apiFetch } = useNuxtApp()

const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const updatingOrderId = ref<number | null>(null)

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
        include: 'items',
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
    alert(err?.data?.message || 'Failed to update order status')
  } finally {
    updatingOrderId.value = null
  }
}

onMounted(() => {
  loadOrders()
})
</script>