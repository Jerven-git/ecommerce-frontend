export interface CheckoutFormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  city: string
  state: string
  country: string
  postcode: string
}

export function useCheckoutForm() {
  const { $apiFetch } = useNuxtApp()
  const { getStates, getCities } = useRegions()

  const deliveryMethod = ref<'delivery' | 'pickup'>('delivery')
  const storeCountry = ref('')
  const phoneDialCode = ref('')

  const form = ref<CheckoutFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    city: '',
    state: '',
    country: '',
    postcode: ''
  })

  const checkoutStateOptions = computed(() => getStates(form.value.country))
  const checkoutCityOptions = computed(() => getCities(form.value.country, form.value.state))

  // Clear dependent fields when parent changes
  watch(() => form.value.country, () => {
    form.value.state = ''
    form.value.city = ''
  })
  watch(() => form.value.state, () => {
    form.value.city = ''
  })

  const loadStoreCountry = async () => {
    try {
      const res = await $apiFetch<any>('/shipping-settings', { method: 'GET' })
      if (res?.data?.store_country) {
        storeCountry.value = res.data.store_country
      }
    } catch { /* non-critical */ }
  }

  return {
    form,
    deliveryMethod,
    storeCountry,
    phoneDialCode,
    checkoutStateOptions,
    checkoutCityOptions,
    loadStoreCountry,
  }
}
