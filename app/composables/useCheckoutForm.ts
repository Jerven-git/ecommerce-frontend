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

const SAVED_DETAILS_KEY = 'checkout_saved_details'

export function useCheckoutForm() {
  const { $apiFetch } = useNuxtApp()
  const { getStates, getCities } = useRegions()

  const deliveryMethod = ref<'delivery' | 'pickup'>('delivery')
  const storeCountry = ref('')
  const phoneDialCode = ref('')
  const rememberDetails = ref(false)

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

  // Load saved details from localStorage
  if (import.meta.client) {
    try {
      const saved = localStorage.getItem(SAVED_DETAILS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        form.value = { ...form.value, ...parsed }
        rememberDetails.value = true
      }
    } catch { /* ignore */ }
  }

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

  const saveDetailsToStorage = () => {
    if (!import.meta.client) return
    if (rememberDetails.value) {
      const toSave: Partial<CheckoutFormData> = {
        customer_name: form.value.customer_name,
        customer_email: form.value.customer_email,
        customer_phone: form.value.customer_phone,
        country: form.value.country,
        state: form.value.state,
        city: form.value.city,
      }
      localStorage.setItem(SAVED_DETAILS_KEY, JSON.stringify(toSave))
    } else {
      localStorage.removeItem(SAVED_DETAILS_KEY)
    }
  }

  return {
    form,
    deliveryMethod,
    storeCountry,
    phoneDialCode,
    rememberDetails,
    checkoutStateOptions,
    checkoutCityOptions,
    loadStoreCountry,
    saveDetailsToStorage,
  }
}
