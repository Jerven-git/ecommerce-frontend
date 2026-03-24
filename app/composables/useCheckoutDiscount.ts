export interface AppliedDiscount {
  code: string
  type: 'percentage' | 'fixed'
  value: number
}

export function useCheckoutDiscount() {
  const { $apiFetch } = useNuxtApp()
  const cartStore = useCartStore()

  const discountCode = ref('')
  const appliedDiscount = ref<AppliedDiscount | null>(null)
  const applyingDiscount = ref(false)
  const discountError = ref<string | null>(null)

  const discountAmount = computed(() => {
    if (!appliedDiscount.value) return 0
    // Use rawSubtotal to match backend's discount calculation basis
    const base = cartStore.rawSubtotal
    if (appliedDiscount.value.type === 'percentage') {
      return Math.round(Math.min(base * (appliedDiscount.value.value / 100), base) * 100) / 100
    }
    return Math.round(Math.min(appliedDiscount.value.value, base) * 100) / 100
  })

  const applyDiscount = async () => {
    const code = discountCode.value.trim().toUpperCase()
    if (!code) return

    applyingDiscount.value = true
    discountError.value = null

    try {
      const res = await $apiFetch<any>('/discounts/validate', {
        method: 'POST',
        body: { code, order_amount: cartStore.rawSubtotal }
      })

      const unwrapped = res?.data ?? res
      const discount = unwrapped?.discount ?? unwrapped
      appliedDiscount.value = {
        code: discount.code ?? code,
        type: discount.type,
        value: parseFloat(String(discount.value ?? 0))
      }
      discountCode.value = ''
    } catch (err: any) {
      discountError.value = err?.data?.message || 'Invalid or expired discount code.'
    } finally {
      applyingDiscount.value = false
    }
  }

  const removeDiscount = () => {
    appliedDiscount.value = null
    discountCode.value = ''
    discountError.value = null
  }

  return {
    discountCode,
    appliedDiscount,
    applyingDiscount,
    discountError,
    discountAmount,
    applyDiscount,
    removeDiscount,
  }
}
