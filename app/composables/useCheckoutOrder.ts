import type { CheckoutFormData } from './useCheckoutForm'
import type { AppliedDiscount } from './useCheckoutDiscount'

interface UseCheckoutOrderOptions {
  form: Ref<CheckoutFormData>
  deliveryMethod: Ref<'delivery' | 'pickup'>
  phoneDialCode: Ref<string>
  selectedShippingOptions: Ref<string[]>
  appliedDiscount: Ref<AppliedDiscount | null>
  discountAmount: ComputedRef<number>
}

export function useCheckoutOrder(opts: UseCheckoutOrderOptions) {
  const { $apiFetch } = useNuxtApp()
  const cartStore = useCartStore()

  const {
    form, deliveryMethod, phoneDialCode,
    selectedShippingOptions, appliedDiscount, discountAmount
  } = opts

  const paymentMethods = ref<any[]>([])
  const selectedPaymentMethod = ref<string>('')
  const loadingPaymentMethods = ref(true)

  const submitting = ref(false)
  const error = ref<string | null>(null)
  const busyQueue = ref(false)
  const busyMessage = ref('')
  const createdOrderId = ref<number | null>(null)

  const allDeferredBackorder = computed(() => {
    if (cartStore.items.length === 0) return false
    return cartStore.items.every(item => {
      const isFullBackorder = item.stock === 0
      const isDeferred = item.backorder_charge_policy === 'charged_later'
      return item.can_backorder && isFullBackorder && isDeferred
    })
  })

  const isFormValid = computed(() => {
    const basicInfo =
      form.value.customer_name &&
      form.value.customer_email &&
      (selectedPaymentMethod.value || allDeferredBackorder.value)

    if (deliveryMethod.value === 'pickup') return !!basicInfo

    return !!basicInfo &&
      !!form.value.shipping_address &&
      !!form.value.city &&
      !!form.value.state &&
      !!form.value.country &&
      !cartStore.shippingError
  })

  const canShowPaymentUI = computed(() => isFormValid.value)

  const finalTotal = computed(() => {
    // When full order totals are calculated (includes discount + shipping), use directly
    if (cartStore.taxCalculation?.taxable_amount !== undefined) {
      return cartStore.taxCalculation.total
    }

    // Fallback: basic calculation
    const base = (() => {
      if (deliveryMethod.value === 'pickup') {
        return cartStore.subtotal + cartStore.taxAmount
      }
      return cartStore.grandTotal
    })()
    return Math.max(0, base - discountAmount.value)
  })

  const getPaymentConfig = (methodId: string) => {
    const method = paymentMethods.value.find(m => m.id === methodId)
    return method?.config || null
  }

  // Reset order when payment method changes
  watch(selectedPaymentMethod, () => {
    createdOrderId.value = null
  })

  // Recalculate tax when discount or shipping changes
  watch(
    [discountAmount, () => cartStore.shippingCost],
    () => {
      cartStore.calculateTax(discountAmount.value, cartStore.shippingCost)
    },
    { immediate: false }
  )

  // --- API helpers ---

  const fetchWithRetry = async <T = any>(url: string, opts: any, maxRetries = 3): Promise<T> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await $apiFetch<T>(url, opts)
      } catch (err: any) {
        const status = err?.status ?? err?.statusCode ?? err?.response?.status
        if (status === 429 && attempt < maxRetries) {
          const retryAfter = parseInt(err?.response?.headers?.get?.('Retry-After') || err?.data?.retry_after || '5', 10)
          const waitSeconds = Math.min(Math.max(retryAfter, 2), 30)
          busyQueue.value = true
          busyMessage.value = 'We\'re experiencing high demand. Your order will be placed shortly...'
          await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000))
          continue
        }
        throw err
      }
    }
    throw new Error('Server is busy. Please try again in a moment.')
  }

  const buildOrderData = () => {
    const shippingAddress = deliveryMethod.value === 'pickup'
      ? 'Self Pickup'
      : `${form.value.shipping_address}, ${form.value.city}, ${form.value.state}${form.value.postcode ? ' ' + form.value.postcode : ''}, ${form.value.country}`

    return {
      customer_name: form.value.customer_name,
      customer_email: form.value.customer_email,
      customer_phone: form.value.customer_phone
        ? `${phoneDialCode.value} ${form.value.customer_phone}`.trim()
        : '',
      shipping_address: shippingAddress,
      country: form.value.country,
      state: form.value.state,
      city: form.value.city,
      postcode: form.value.postcode,
      delivery_method: deliveryMethod.value,
      payment_method: selectedPaymentMethod.value,
      items: cartStore.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      })),
      shipping_options: deliveryMethod.value === 'delivery'
        ? selectedShippingOptions.value
        : [],
      discount_code: appliedDiscount.value?.code ?? null
    }
  }

  // --- Payment flows ---

  const loadPaymentMethods = async () => {
    loadingPaymentMethods.value = true
    error.value = null

    try {
      const response = await $apiFetch<any>('/payment-settings/methods', { method: 'GET' })
      paymentMethods.value = response?.data ?? []

      if (!selectedPaymentMethod.value && paymentMethods.value.length > 0) {
        selectedPaymentMethod.value = paymentMethods.value[0].id
      }
    } catch (err: any) {
      paymentMethods.value = []
      error.value = err?.data?.message || 'Failed to load payment methods.'
    } finally {
      loadingPaymentMethods.value = false
    }
  }

  const createOrderOnly = async () => {
    if (!isFormValid.value) return

    submitting.value = true
    error.value = null

    try {
      const orderRes = await fetchWithRetry<any>('/orders', {
        method: 'POST',
        body: buildOrderData()
      })

      const orderId = orderRes?.data?.order?.id
      if (!orderId) throw new Error('Order ID missing from /orders response')
      createdOrderId.value = Number(orderId)
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Failed to create order.'
    } finally {
      submitting.value = false
      busyQueue.value = false
    }
  }

  const placeOrderAndRedirect = async () => {
    if (!isFormValid.value) return
    if (!selectedPaymentMethod.value) return
    if (selectedPaymentMethod.value === 'stripe') return

    submitting.value = true
    error.value = null

    try {
      if (!createdOrderId.value) {
        await createOrderOnly()
        if (!createdOrderId.value) return
      }

      const payRes = await fetchWithRetry<any>(`/orders/${createdOrderId.value}/pay`, {
        method: 'POST',
        body: { provider: selectedPaymentMethod.value }
      })

      const payload = payRes?.data ?? payRes
      const paymentId = payload?.payment_id ?? payload?.id ?? null
      const redirectUrl =
        payload?.redirect_url ??
        payload?.approval_url ??
        payload?.checkout_url ??
        payload?.url ??
        null

      if (!redirectUrl) throw new Error('redirect_url missing from /orders/{order}/pay')

      if (paymentId) localStorage.setItem('last_payment_id', String(paymentId))
      window.location.href = redirectUrl
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Failed to start payment.'
    } finally {
      submitting.value = false
      busyQueue.value = false
    }
  }

  const handleStripeSuccess = async (paymentId: string) => {
    localStorage.setItem('last_payment_id', paymentId)
    navigateTo(`/payment/complete?payment_id=${paymentId}`)
  }

  const handlePaymentError = (errorMessage: string) => {
    error.value = errorMessage
  }

  const placeDeferredBackorder = async () => {
    if (!isFormValid.value) return

    submitting.value = true
    error.value = null

    try {
      await fetchWithRetry('/orders', {
        method: 'POST',
        body: buildOrderData()
      })

      cartStore.clearCart()
      sessionStorage.setItem('order_completed', '1')
      navigateTo('/order-success')
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Failed to place order.'
    } finally {
      submitting.value = false
      busyQueue.value = false
    }
  }

  const placeCashOrder = async () => {
    if (!isFormValid.value) return

    submitting.value = true
    error.value = null

    try {
      await fetchWithRetry('/orders', {
        method: 'POST',
        body: buildOrderData()
      })

      cartStore.clearCart()
      sessionStorage.setItem('order_completed', '1')
      navigateTo('/order-success')
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Failed to place order.'
    } finally {
      submitting.value = false
      busyQueue.value = false
    }
  }

  return {
    paymentMethods,
    selectedPaymentMethod,
    loadingPaymentMethods,
    submitting,
    error,
    busyQueue,
    busyMessage,
    createdOrderId,
    allDeferredBackorder,
    isFormValid,
    canShowPaymentUI,
    finalTotal,
    getPaymentConfig,
    loadPaymentMethods,
    createOrderOnly,
    placeOrderAndRedirect,
    handleStripeSuccess,
    handlePaymentError,
    placeDeferredBackorder,
    placeCashOrder,
  }
}
