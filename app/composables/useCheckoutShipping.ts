import type { CheckoutFormData } from './useCheckoutForm'

export function useCheckoutShipping(
  form: Ref<CheckoutFormData>,
  deliveryMethod: Ref<'delivery' | 'pickup'>
) {
  const { $apiFetch } = useNuxtApp()
  const cartStore = useCartStore()

  const shippingOptions = ref<any[]>([])
  const selectedShippingOptions = ref<string[]>([])

  let shippingDebounceTimer: ReturnType<typeof setTimeout>

  const debouncedShippingUpdate = () => {
    clearTimeout(shippingDebounceTimer)
    shippingDebounceTimer = setTimeout(async () => {
      if (deliveryMethod.value === 'pickup') {
        cartStore.shippingCalculation = null
        return
      }
      if (form.value.country && form.value.state && form.value.city) {
        await cartStore.calculateShipping({
          country: form.value.country,
          state: form.value.state,
          city: form.value.city,
          postcode: form.value.postcode
        })
      }
    }, 500)
  }

  // Watch address fields for changes
  watch(
    () => [form.value.city, form.value.state, form.value.country, form.value.postcode],
    () => {
      if (deliveryMethod.value === 'delivery') {
        debouncedShippingUpdate()
      }
    }
  )

  // Reset shipping when switching to pickup
  watch(deliveryMethod, (newMethod) => {
    if (newMethod === 'pickup') {
      cartStore.shippingCalculation = null
      selectedShippingOptions.value = []
      cartStore.setShippingOptions([])
    } else {
      debouncedShippingUpdate()
    }
  })

  const updateShippingOptions = () => {
    if (deliveryMethod.value === 'delivery') {
      cartStore.setShippingOptions(selectedShippingOptions.value)
    }
  }

  const loadShippingOptions = async () => {
    try {
      const response = await $apiFetch<any>('/shipping/options', { method: 'GET' })
      if (response?.data) shippingOptions.value = response.data
    } catch (err) {
      console.error('Error loading shipping options:', err)
    }
  }

  return {
    shippingOptions,
    selectedShippingOptions,
    updateShippingOptions,
    loadShippingOptions,
  }
}
