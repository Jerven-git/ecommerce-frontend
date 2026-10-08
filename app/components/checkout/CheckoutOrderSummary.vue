<template>
  <div class="lg:col-span-1">
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4">
      <h2 class="text-base font-bold text-gray-900 mb-5">Order Summary</h2>

      <!-- Item list -->
      <div class="space-y-2.5 pb-4 border-b border-gray-100 max-h-60 overflow-y-auto">
        <div v-for="item in items" :key="item.id">
          <div class="flex justify-between items-start gap-2">
            <span class="text-sm text-gray-600 leading-snug">{{ item.name }} <span class="text-gray-400">&times;{{ item.quantity }}</span></span>
            <span class="text-sm font-medium text-gray-900 shrink-0">{{ format(item.price * item.quantity) }}</span>
          </div>
          <div v-if="item.quantity > item.stock && item.can_backorder" class="mt-1">
            <span class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {{ item.stock > 0 ? `${item.quantity - item.stock} backordered` : 'Backorder' }}
              &middot; {{ chargePolicyLabel(item.backorder_charge_policy) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Backorder notice -->
      <div v-if="hasBackorderItems" class="py-3 border-b border-gray-100">
        <div class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <Icon name="heroicons:clock" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p class="text-xs text-amber-800 leading-relaxed">
            Some items are out of stock and will be placed on backorder. You'll be notified when they're available.
          </p>
        </div>
      </div>

      <!-- Discount Code -->
      <div class="py-4 border-b border-gray-100">
        <div v-if="!appliedDiscount" class="flex gap-2">
          <input
            :value="discountCode"
            @input="$emit('update:discountCode', ($event.target as HTMLInputElement).value)"
            type="text"
            class="input-field flex-1 uppercase font-mono tracking-widest text-sm"
            placeholder="DISCOUNT CODE"
            :disabled="applyingDiscount"
            @keydown.enter.prevent="$emit('applyDiscount')"
          />
          <button
            type="button"
            @click="$emit('applyDiscount')"
            :disabled="applyingDiscount || !discountCode.trim()"
            class="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg transition-colors shrink-0"
          >
            <span v-if="applyingDiscount" class="flex items-center gap-1.5">
              <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            </span>
            <span v-else>Apply</span>
          </button>
        </div>
        <div v-else class="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
          <div class="flex items-center gap-2">
            <Icon name="heroicons:check" class="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
            <div>
              <p class="text-xs font-bold text-green-700 font-mono tracking-wider">{{ appliedDiscount.code }}</p>
              <p class="text-xs text-green-600">
                {{ appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}% off` : `${format(parseFloat(String(appliedDiscount.value)))} off` }}
              </p>
            </div>
          </div>
          <button type="button" @click="$emit('removeDiscount')" class="text-gray-400 hover:text-red-500 transition-colors">
            <Icon name="heroicons:x-mark" class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <p v-if="discountError" class="mt-1.5 text-xs text-red-600">{{ discountError }}</p>
      </div>

      <!-- Gift Card Code -->
      <div class="py-4 border-b border-gray-100">
        <div v-if="!appliedGiftCard" class="flex gap-2">
          <input
            :value="giftCardCode"
            @input="$emit('update:giftCardCode', ($event.target as HTMLInputElement).value)"
            type="text"
            class="input-field flex-1 uppercase font-mono tracking-widest text-sm"
            placeholder="GIFT CARD CODE"
            :disabled="validatingGiftCard"
            @keydown.enter.prevent="$emit('validateGiftCard')"
          />
          <button
            type="button"
            @click="$emit('validateGiftCard')"
            :disabled="validatingGiftCard || !giftCardCode.trim()"
            class="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg transition-colors shrink-0"
          >
            <span v-if="validatingGiftCard" class="flex items-center gap-1.5">
              <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            </span>
            <span v-else>Apply</span>
          </button>
        </div>
        <div v-else class="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
          <div class="flex items-center gap-2">
            <Icon name="heroicons:check" class="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
            <div>
              <p class="text-xs font-bold text-green-700 font-mono tracking-wider">{{ appliedGiftCard.code }}</p>
              <p class="text-xs text-green-600">Balance: {{ format(appliedGiftCard.balance) }}</p>
            </div>
          </div>
          <button type="button" @click="$emit('removeGiftCard')" class="text-gray-400 hover:text-red-500 transition-colors">
            <Icon name="heroicons:x-mark" class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <p v-if="giftCardError" class="mt-1.5 text-xs text-red-600">{{ giftCardError }}</p>
      </div>

      <!-- Totals -->
      <div class="space-y-2.5 py-4 border-b border-gray-100">
        <!-- Subtotal with tax info -->
        <div class="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span class="font-medium text-gray-900">{{ format(rawSubtotal) }}</span>
        </div>

        <template v-if="taxInfo.enabled">
          <div class="bg-gray-50 rounded-lg px-3 py-2.5 space-y-1.5">
            <div v-if="taxInfo.mode === 'inclusive'" class="flex justify-between text-xs text-gray-500">
              <span>Excluding tax</span>
              <span class="font-medium text-gray-700">{{ format(subtotal) }}</span>
            </div>
            <div v-else class="flex justify-between text-xs text-gray-500">
              <span>Including tax</span>
              <span class="font-medium text-gray-700">{{ format(subtotal + taxAmount) }}</span>
            </div>
            <p v-if="taxInfo.mode === 'inclusive'" class="text-[10px] text-gray-400 pt-0.5">
              Prices include tax — tax is calculated on the ex-tax amount
            </p>
            <p v-else class="text-[10px] text-gray-400 pt-0.5">
              Prices exclude tax: tax is added at checkout
            </p>
          </div>
        </template>

        <!-- Discount (applied before tax) -->
        <div v-if="appliedDiscount" class="flex justify-between text-sm text-green-700">
          <span>Discount ({{ appliedDiscount.code }})</span>
          <span class="font-semibold">-{{ format(discountAmount) }}</span>
        </div>

        <!-- Gift Card -->
        <div v-if="appliedGiftCard && giftCardAmount > 0" class="flex justify-between text-sm text-green-700">
          <span>Gift Card ({{ appliedGiftCard.code }})</span>
          <span class="font-semibold">-{{ format(giftCardAmount) }}</span>
        </div>

        <!-- Shipping -->
        <div v-if="deliveryMethod === 'pickup'" class="flex justify-between text-sm">
          <span class="text-gray-600">Shipping (Pickup)</span>
          <span class="font-semibold text-green-600">FREE</span>
        </div>
        <div v-else-if="shippingError" class="space-y-2">
          <div class="flex justify-between text-sm text-red-500">
            <span>Shipping</span>
            <span class="font-medium">Unavailable</span>
          </div>
          <div class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
            <p class="text-xs text-amber-800 leading-relaxed">
              We don't currently ship to this location. Please try a different address or contact us for assistance.
            </p>
          </div>
        </div>
        <div v-else-if="!shippingCalculation" class="flex justify-between text-sm text-gray-400">
          <span>Shipping</span>
          <span class="italic">Enter address</span>
        </div>
        <div v-else class="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span v-if="shippingCalculation.free_shipping" class="font-semibold text-green-600">FREE</span>
          <span v-else class="font-medium text-gray-900">{{ format(shippingCost) }}</span>
        </div>

        <!-- Tax line -->
        <div v-if="taxInfo.enabled" class="flex justify-between text-sm text-gray-600">
          <span>{{ taxInfo.name }} ({{ taxInfo.rate }}%)</span>
          <span class="font-medium text-gray-900">+ {{ format(taxAmount) }}</span>
        </div>
      </div>

      <div class="flex justify-between items-center pt-4">
        <span class="font-bold text-gray-900">Total</span>
        <span class="text-xl font-bold text-gray-900">{{ format(finalTotal) }}</span>
      </div>

      <NuxtLink to="/cart" class="btn-secondary w-full block text-center mt-5">
        Back to Cart
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppliedDiscount } from '~/composables/useCheckoutDiscount'
import type { AppliedGiftCard } from '~/composables/useGiftCard'

const { format } = useCurrency()

defineProps<{
  items: any[]
  hasBackorderItems: boolean
  rawSubtotal: number
  subtotal: number
  taxInfo: { enabled: boolean; rate: number; name: string; mode: string }
  taxAmount: number
  shippingCalculation: any | null
  shippingCost: number
  shippingError: string | null
  deliveryMethod: string
  discountCode: string
  appliedDiscount: AppliedDiscount | null
  applyingDiscount: boolean
  discountError: string | null
  discountAmount: number
  giftCardCode: string
  appliedGiftCard: AppliedGiftCard | null
  validatingGiftCard: boolean
  giftCardError: string | null
  giftCardAmount: number
  finalTotal: number
}>()

defineEmits<{
  'update:discountCode': [value: string]
  'applyDiscount': []
  'removeDiscount': []
  'update:giftCardCode': [value: string]
  'validateGiftCard': []
  'removeGiftCard': []
}>()

const chargePolicyLabel = (policy?: string) => {
  const labels: Record<string, string> = {
    charged_now: 'Charged now',
    charged_later: 'Charged when available',
  }
  return labels[policy || ''] || 'Charged when available'
}
</script>
