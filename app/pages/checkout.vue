<template>
  <div class="min-h-screen flex flex-col">

    <!-- Page Header -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Almost there</p>
        <h1 class="text-3xl font-bold text-gray-900">Checkout</h1>
        <p class="text-sm text-gray-500 mt-1">Complete your order below</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 section-accent">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Left: Form -->
          <div class="lg:col-span-2 space-y-5">
            <CheckoutCustomerInfo
              v-model:customer-name="form.customer_name"
              v-model:customer-email="form.customer_email"
              v-model:customer-phone="form.customer_phone"
              :store-country="storeCountry"
              :submitted="formSubmitted"
              @update:dial-code="phoneDialCode = $event"
            />

            <CheckoutDeliveryMethod v-model="deliveryMethod" />

            <CheckoutShippingAddress
              v-if="deliveryMethod === 'delivery'"
              v-model:address="form.shipping_address"
              v-model:country="form.country"
              v-model:state="form.state"
              v-model:city="form.city"
              v-model:postcode="form.postcode"
              :state-options="checkoutStateOptions"
              :city-options="checkoutCityOptions"
              :submitted="formSubmitted"
            />

            <!-- Billing Region for Pickup (needed for tax determination, only when regional tax rules exist) -->
            <div v-if="deliveryMethod === 'pickup' && cartStore.hasRegionalTaxRules" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 class="text-sm font-bold text-gray-900 mb-1">Your Location</h3>
              <p class="text-xs text-gray-400 mb-4">Required to determine applicable tax for your order</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Country *</label>
                  <CountrySelect
                    v-model="form.country"
                    placeholder="Select country"
                    required
                    @update:model-value="pickupTouched.country = true"
                  />
                  <p v-if="(pickupTouched.country || formSubmitted) && !form.country" class="mt-1 text-xs text-red-600">Country is required.</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">State / Region *</label>
                  <select
                    v-model="form.state"
                    :class="['input-field', (pickupTouched.state || formSubmitted) && !form.state ? '!border-red-300 focus:!ring-red-200' : '']"
                    required
                    :disabled="!form.country"
                    @blur="pickupTouched.state = true"
                  >
                    <option value="">Select state</option>
                    <option v-for="s in checkoutStateOptions" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <p v-if="(pickupTouched.state || formSubmitted) && !form.state" class="mt-1 text-xs text-red-600">State / region is required.</p>
                </div>
              </div>
            </div>

            <!-- Remember details toggle -->
            <div class="flex items-center gap-3 px-1">
              <input
                id="remember-details"
                type="checkbox"
                v-model="rememberDetails"
                class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label for="remember-details" class="text-sm text-gray-600 cursor-pointer">
                Remember my details for faster checkout
              </label>
            </div>

            <!-- Inline shipping error near address -->
            <div v-if="deliveryMethod === 'delivery' && cartStore.shippingError" class="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-sm font-semibold text-red-800">Shipping unavailable to this address</p>
                <p class="text-xs text-red-600 mt-0.5">{{ cartStore.shippingError }}</p>
              </div>
            </div>

            <CheckoutShippingOptions
              v-if="deliveryMethod === 'delivery'"
              :methods="shippingMethods"
              :add-ons="shippingAddOns"
              :selected-method="selectedShippingMethod"
              :selected-add-ons="selectedShippingAddOns"
              @update:selected-method="selectedShippingMethod = $event; updateShippingMethod()"
              @update:selected-add-ons="selectedShippingAddOns = $event; updateShippingAddOns()"
            />

            <CheckoutPaymentSection
              :payment-methods="paymentMethods"
              :selected-method="selectedPaymentMethod"
              :loading-methods="loadingPaymentMethods"
              :all-deferred-backorder="allDeferredBackorder"
              :can-show-payment-u-i="canShowPaymentUI"
              :is-form-valid="isFormValid"
              :submitting="submitting"
              :error="error"
              :created-order-id="createdOrderId"
              :final-total="finalTotal"
              :stripe-publishable-key="getPaymentConfig('stripe')?.publishable_key ?? null"
              :customer-email="form.customer_email"
              @update:selected-method="selectedPaymentMethod = $event"
              @create-order="attemptOrder(createOrderOnly)"
              @place-redirect="attemptOrder(placeOrderAndRedirect)"
              @place-cash="attemptOrder(placeCashOrder)"
              @place-deferred-backorder="attemptOrder(placeDeferredBackorder)"
              @stripe-success="handleStripeSuccess"
              @payment-error="handlePaymentError"
            />
          </div>

          <!-- Right: Order Summary -->
          <CheckoutOrderSummary
            :items="cartStore.items"
            :has-backorder-items="cartStore.hasBackorderItems"
            :raw-subtotal="cartStore.rawSubtotal"
            :subtotal="cartStore.subtotal"
            :tax-info="cartStore.taxInfo"
            :tax-amount="cartStore.taxAmount"
            :shipping-calculation="cartStore.shippingCalculation"
            :shipping-cost="cartStore.shippingCost"
            :shipping-error="cartStore.shippingError"
            :delivery-method="deliveryMethod"
            v-model:discount-code="discountCode"
            :applied-discount="appliedDiscount"
            :applying-discount="applyingDiscount"
            :discount-error="discountError"
            :discount-amount="discountAmount"
            :final-total="finalTotal"
            @apply-discount="applyDiscount"
            @remove-discount="removeDiscount"
          />

        </div>
      </div>
    </div>

    <!-- Busy / Queue Overlay -->
    <Transition name="fade">
      <div v-if="busyQueue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
          <div class="flex justify-center mb-5">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 rounded-full border-4 border-primary-100"></div>
              <div class="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
              <div class="absolute inset-3 rounded-full border-4 border-primary-300 border-b-transparent animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
            </div>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Just a moment...</h3>
          <p class="text-sm text-gray-500 leading-relaxed">{{ busyMessage }}</p>
          <div class="mt-4 flex justify-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style="animation-delay: 0s;"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style="animation-delay: 0.15s;"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style="animation-delay: 0.3s;"></span>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()

const pickupTouched = reactive({ country: false, state: false })
const formSubmitted = ref(false)

function attemptOrder(fn: () => void | Promise<void>) {
  formSubmitted.value = true
  fn()
}

const {
  form, deliveryMethod, storeCountry, phoneDialCode, rememberDetails,
  checkoutStateOptions, checkoutCityOptions, loadStoreCountry, saveDetailsToStorage
} = useCheckoutForm()

const {
  shippingMethods, shippingAddOns,
  selectedShippingMethod, selectedShippingAddOns,
  updateShippingMethod, updateShippingAddOns,
  loadShippingOptions
} = useCheckoutShipping(form, deliveryMethod)

const {
  discountCode, appliedDiscount, applyingDiscount,
  discountError, discountAmount, applyDiscount, removeDiscount
} = useCheckoutDiscount()

const {
  paymentMethods, selectedPaymentMethod, loadingPaymentMethods,
  submitting, error, busyQueue, busyMessage, createdOrderId,
  allDeferredBackorder, isFormValid, canShowPaymentUI, finalTotal,
  getPaymentConfig, loadPaymentMethods,
  createOrderOnly, placeOrderAndRedirect,
  handleStripeSuccess, handlePaymentError,
  placeDeferredBackorder, placeCashOrder
} = useCheckoutOrder({
  form, deliveryMethod, phoneDialCode,
  selectedShippingMethod, selectedShippingAddOns,
  appliedDiscount, discountAmount,
  saveDetailsToStorage
})

onMounted(() => {
  if (cartStore.items.length === 0) {
    navigateTo('/cart')
    return
  }

  loadStoreCountry()
  loadShippingOptions()
  loadPaymentMethods()
  cartStore.calculateTax()
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
