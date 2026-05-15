export interface GiftCardDenomination {
  id: number
  amount: string
  label: string | null
  is_enabled: boolean
  sort_order: number
}

export interface AppliedGiftCard {
  code: string
  balance: number
  currency: string
}

export function useGiftCardCheckout() {
  const { $apiFetch } = useNuxtApp()

  const giftCardCode = ref('')
  const appliedGiftCard = ref<AppliedGiftCard | null>(null)
  const validatingGiftCard = ref(false)
  const giftCardError = ref<string | null>(null)

  const giftCardAmount = computed(() => {
    if (!appliedGiftCard.value) return 0
    return appliedGiftCard.value.balance
  })

  const validateGiftCard = async () => {
    const code = giftCardCode.value.trim().toUpperCase()
    if (!code) return

    validatingGiftCard.value = true
    giftCardError.value = null

    try {
      const res = await $apiFetch<any>('/gift-cards/validate', {
        method: 'POST',
        body: { code },
      })
      const data = res?.data ?? res
      appliedGiftCard.value = {
        code: data.code,
        balance: parseFloat(String(data.balance ?? 0)),
        currency: data.currency,
      }
      giftCardCode.value = ''
    } catch (err: any) {
      giftCardError.value = err?.data?.message || 'Invalid or expired gift card code.'
    } finally {
      validatingGiftCard.value = false
    }
  }

  const removeGiftCard = () => {
    appliedGiftCard.value = null
    giftCardCode.value = ''
    giftCardError.value = null
  }

  return {
    giftCardCode,
    appliedGiftCard,
    validatingGiftCard,
    giftCardError,
    giftCardAmount,
    validateGiftCard,
    removeGiftCard,
  }
}

export function useGiftCardPurchase() {
  const { $apiFetch } = useNuxtApp()

  const denominations = ref<GiftCardDenomination[]>([])
  const loadingDenominations = ref(true)

  const form = ref({
    customer_name: '',
    customer_email: '',
    recipient_email: '',
    recipient_name: '',
    message: '',
    gift_card_denomination_id: null as number | null,
    payment_method: '',
  })

  const submitting = ref(false)
  const error = ref<string | null>(null)
  const createdOrderId = ref<number | null>(null)

  const selectedDenomination = computed(() =>
    denominations.value.find(d => d.id === form.value.gift_card_denomination_id) ?? null
  )

  const isFormValid = computed(() =>
    !!form.value.customer_name &&
    !!form.value.customer_email &&
    !!form.value.recipient_email &&
    !!form.value.gift_card_denomination_id &&
    !!form.value.payment_method
  )

  const loadDenominations = async () => {
    loadingDenominations.value = true
    try {
      const res = await $apiFetch<any>('/gift-card-denominations')
      denominations.value = res?.data ?? []
      if (denominations.value.length > 0 && !form.value.gift_card_denomination_id) {
        form.value.gift_card_denomination_id = denominations.value[0].id
      }
    } finally {
      loadingDenominations.value = false
    }
  }

  const createOrder = async (): Promise<number | null> => {
    submitting.value = true
    error.value = null
    try {
      const res = await $apiFetch<any>('/orders', {
        method: 'POST',
        body: {
          delivery_method: 'gift_card',
          customer_name: form.value.customer_name,
          customer_email: form.value.customer_email,
          customer_phone: '',
          payment_method: form.value.payment_method,
          gift_card_denomination_id: form.value.gift_card_denomination_id,
          gift_card_recipient_email: form.value.recipient_email,
          gift_card_recipient_name: form.value.recipient_name || null,
          gift_card_message: form.value.message || null,
        },
      })
      const orderId = res?.data?.order?.id
      if (!orderId) throw new Error('Order ID missing from response')
      createdOrderId.value = Number(orderId)
      return createdOrderId.value
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Failed to create order.'
      return null
    } finally {
      submitting.value = false
    }
  }

  return {
    denominations,
    loadingDenominations,
    form,
    submitting,
    error,
    createdOrderId,
    selectedDenomination,
    isFormValid,
    loadDenominations,
    createOrder,
  }
}
