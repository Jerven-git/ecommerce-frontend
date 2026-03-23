<template>
  <div class="min-h-screen bg-gray-50 py-16 px-4">
    <div class="max-w-lg mx-auto">

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Track Your Order</h1>
        <p class="text-sm text-gray-500 mt-1">Enter your tracking number to see shipment status</p>
      </div>

      <!-- Search form -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <form @submit.prevent="trackShipment" class="flex gap-3">
          <input
            v-model="trackingInput"
            type="text"
            placeholder="e.g. SSU-20260310-ABC123"
            class="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
          />
          <button
            type="submit"
            :disabled="!trackingInput.trim() || loading"
            class="px-5 py-2.5 text-sm font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {{ loading ? 'Searching…' : 'Track' }}
          </button>
        </form>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
        <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p class="font-semibold text-gray-800 mb-1">Tracking not found</p>
        <p class="text-sm text-gray-500">Please check your tracking number and try again.</p>
      </div>

      <!-- Result -->
      <div v-if="shipment" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <!-- Tracking number + barcode -->
        <div class="px-6 py-5 border-b border-gray-100">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tracking Number</p>
          <p class="text-lg font-mono font-bold text-gray-900 mb-4">{{ shipment.tracking_number }}</p>

          <div class="flex justify-center bg-gray-50 rounded-xl p-4 border border-gray-100">
            <img
              :src="barcodeUrl(shipment.tracking_number)"
              :alt="`Barcode for ${shipment.tracking_number}`"
              class="h-20"
            />
          </div>
        </div>

        <!-- Status timeline -->
        <div class="px-6 py-5 border-b border-gray-100">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Status</p>
          <div class="space-y-3">
            <div
              v-for="step in statusSteps"
              :key="step.value"
              class="flex items-center gap-3"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
                :class="isStepReached(step.value) ? step.activeClass : 'bg-gray-100 text-gray-300'"
              >
                <svg v-if="isStepReached(step.value)" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <div v-else class="w-2 h-2 rounded-full bg-gray-300"></div>
              </div>
              <div>
                <p class="text-sm font-medium" :class="isStepReached(step.value) ? 'text-gray-900' : 'text-gray-400'">
                  {{ step.label }}
                </p>
                <p v-if="step.value === 'label_created' && shipment.shipped_at" class="text-xs text-gray-400">
                  {{ formatDate(shipment.shipped_at) }}
                </p>
                <p v-if="step.value === 'delivered' && shipment.delivered_at" class="text-xs text-gray-400">
                  {{ formatDate(shipment.delivered_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order info -->
        <div v-if="shipment.order" class="px-6 py-5 bg-gray-50/50">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Details</p>
          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Order #</span>
              <span class="font-medium text-gray-900">{{ shipment.order.id }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Customer</span>
              <span class="font-medium text-gray-900">{{ shipment.order.customer_name }}</span>
            </div>
            <div v-if="shipment.carrier" class="flex justify-between text-sm">
              <span class="text-gray-500">Carrier</span>
              <span class="font-medium text-gray-900">{{ shipment.carrier }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
interface TrackingOrder {
  id: number
  customer_name: string
  status: string
  created_at: string
}

interface TrackingShipment {
  id: number
  tracking_number: string
  carrier: string | null
  status: 'label_created' | 'in_transit' | 'delivered' | 'returned'
  shipped_at: string
  delivered_at: string | null
  order: TrackingOrder | null
}

const { $apiFetch } = useNuxtApp()
const config = useRuntimeConfig()
const route = useRoute()

const trackingInput = ref((route.query.number as string) || '')
const shipment = ref<TrackingShipment | null>(null)
const loading = ref(false)
const error = ref(false)

const statusSteps = [
  { value: 'label_created', label: 'Label Created', activeClass: 'bg-gray-700 text-white' },
  { value: 'in_transit', label: 'In Transit', activeClass: 'bg-primary-600 text-white' },
  { value: 'delivered', label: 'Delivered', activeClass: 'bg-green-600 text-white' },
]

const statusOrder = ['label_created', 'in_transit', 'delivered']

const isStepReached = (step: string) => {
  if (!shipment.value) return false
  if (shipment.value.status === 'returned') return step === 'label_created'
  const currentIdx = statusOrder.indexOf(shipment.value.status)
  const stepIdx = statusOrder.indexOf(step)
  return stepIdx <= currentIdx
}

const barcodeUrl = (trackingNumber: string) =>
  `${config.public.apiBase}${config.public.apiPath}/tracking/${trackingNumber}/barcode`

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const trackShipment = async () => {
  const number = trackingInput.value.trim()
  if (!number) return

  loading.value = true
  error.value = false
  shipment.value = null

  try {
    const response = await $apiFetch<{ data: TrackingShipment }>(`/tracking/${number}`)
    shipment.value = response.data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (trackingInput.value) {
    trackShipment()
  }
})
</script>
