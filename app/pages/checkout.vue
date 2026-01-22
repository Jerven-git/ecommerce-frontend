<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-4xl font-bold mb-8">Checkout</h1>

    <div v-if="cartStore.items.length === 0" class="text-center py-16">
      <p class="text-xl text-gray-500 mb-6">Your cart is empty</p>
      <NuxtLink to="/shop" class="btn-primary">
        Continue Shopping
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="card mb-6">
          <h2 class="text-2xl font-bold mb-6">Shipping Information</h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Full Name *</label>
              <input
                v-model="form.customer_name"
                type="text"
                required
                class="input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Email *</label>
              <input
                v-model="form.customer_email"
                type="email"
                required
                class="input-field"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Phone</label>
              <input
                v-model="form.customer_phone"
                type="tel"
                class="input-field"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Shipping Address *</label>
              <textarea
                v-model="form.shipping_address"
                required
                rows="3"
                class="input-field"
                placeholder="123 Main St, City, State, ZIP"
              ></textarea>
            </div>

            <button
              type="submit"
              class="btn-primary w-full"
              :disabled="submitting"
            >
              {{ submitting ? 'Processing...' : 'Place Order' }}
            </button>

            <div v-if="error" class="p-3 bg-red-100 text-red-700 rounded-lg">
              {{ error }}
            </div>
          </form>
        </div>
      </div>

      <div>
        <div class="card sticky top-24">
          <h2 class="text-2xl font-bold mb-6">Order Summary</h2>

          <div class="space-y-3 mb-6 max-h-64 overflow-y-auto">
            <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between text-sm">
              <span>{{ item.name }} x{{ item.quantity }}</span>
              <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <div class="border-t pt-4 space-y-2">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div class="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()

const form = ref({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  shipping_address: ''
})

const submitting = ref(false)
const error = ref('')

const handleSubmit = async () => {
  // if (cartStore.items.length === 0) return

  // submitting.value = true
  // error.value = ''

  // try {
  //   const orderData = {
  //     customer_name: form.value.customer_name,
  //     customer_email: form.value.customer_email,
  //     customer_phone: form.value.customer_phone,
  //     shipping_address: form.value.shipping_address,
  //     total_amount: cartStore.totalPrice,
  //     status: 'pending'
  //   }

  //   const { data: order, error: orderError } = await supabase
  //     .from('orders')
  //     .insert(orderData)
  //     .select()
  //     .single()

  //   if (orderError) throw orderError

  //   const orderItems = cartStore.items.map(item => ({
  //     order_id: order.id,
  //     product_id: item.id,
  //     product_name: item.name,
  //     product_price: item.price,
  //     quantity: item.quantity,
  //     subtotal: item.price * item.quantity
  //   }))

  //   const { error: itemsError } = await supabase
  //     .from('order_items')
  //     .insert(orderItems)

  //   if (itemsError) throw itemsError

  //   cartStore.clearCart()

  //   navigateTo({
  //     path: '/order-success',
  //     query: { orderId: order.id }
  //   })
  // } catch (err: any) {
  //   error.value = err.message || 'An error occurred while placing your order'
  // } finally {
  //   submitting.value = false
  // }
}
</script>
