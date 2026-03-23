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
    const base = cartStore.subtotal
    if (appliedDiscount.value.type === 'percentage') {
      return Math.min(base * (appliedDiscount.value.value / 100), base)
    }
    return Math.min(appliedDiscount.value.value, base)
  })

  const applyDiscount = async () => {
    const code = discountCode.value.trim().toUpperCase()
    if (!code) return

    applyingDiscount.value = true
    discountError.value = null

    try {
      const res = await $apiFetch<any>('/discounts/validate', {
        method: 'POST',
        body: { code, order_amount: cartStore.subtotal }
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
