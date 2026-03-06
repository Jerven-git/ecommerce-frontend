import { defineStore } from 'pinia'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  weight: number
  length_cm: number
  width_cm: number
  height_cm: number
  volume_cbm: number
  shipping_calc_type: 'weight' | 'dimensions'
  image_url?: string
}

interface TaxCalculation {
  subtotal: number
  tax_amount: number
  total: number
  tax_rate: number
  tax_name: string
  tax_display_mode: 'inclusive' | 'exclusive'
}

interface ShippingCalculation {
  base_shipping: number
  weight_fee: number
  volume_fee: number
  options_fee: number
  total: number
  free_shipping: boolean
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    taxCalculation: null as TaxCalculation | null,
    shippingCalculation: null as ShippingCalculation | null,
    shippingOptions: [] as string[],
    shippingAddress: null as { country: string; state: string; city: string } | null,
    shippingError: null as string | null,
    loading: false
  }),

  getters: {
    itemCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },

    totalWeight: (state) => {
      return state.items
        .filter(item => item.shipping_calc_type !== 'dimensions')
        .reduce((total, item) => total + (item.weight * item.quantity), 0)
    },

    totalVolumeCbm: (state) => {
      return state.items
        .filter(item => item.shipping_calc_type === 'dimensions')
        .reduce((total, item) => total + (item.volume_cbm * item.quantity), 0)
    },

    rawSubtotal: (state) => {
      return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    },

    subtotal(): number {
      if (!this.taxCalculation) return this.rawSubtotal
      return this.taxCalculation.subtotal
    },

    taxAmount(): number {
      return this.taxCalculation?.tax_amount || 0
    },

    shippingCost(): number {
      return this.shippingCalculation?.total || 0
    },

    grandTotal(): number {
      if (!this.taxCalculation) {
        return this.rawSubtotal + this.shippingCost
      }

      if (this.taxCalculation.tax_display_mode === 'inclusive') {
        return this.taxCalculation.total + this.shippingCost
      } else {
        return this.taxCalculation.subtotal + this.taxCalculation.tax_amount + this.shippingCost
      }
    },

    taxInfo(): { enabled: boolean; rate: number; name: string; mode: string } {
      if (!this.taxCalculation || !this.taxCalculation.tax_rate) {
        return { enabled: false, rate: 0, name: 'Tax', mode: 'exclusive' }
      }
      return {
        enabled: true,
        rate: this.taxCalculation.tax_rate,
        name: this.taxCalculation.tax_name,
        mode: this.taxCalculation.tax_display_mode
      }
    }
  },

  actions: {
    addItem(product: any) {
      const existingItem = this.items.find(item => item.id === product.id)

      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          quantity: 1,
          weight: parseFloat(product.weight || 0),
          length_cm: parseFloat(product.length_cm || 0),
          width_cm: parseFloat(product.width_cm || 0),
          height_cm: parseFloat(product.height_cm || 0),
          volume_cbm: parseFloat(product.volume_cbm || 0),
          shipping_calc_type: product.shipping_calc_type || 'weight',
          image_url: product.image_url
        })
      }

      this.calculateTax()
      this.calculateShipping()
    },

    removeItem(productId: number) {
      const index = this.items.findIndex(item => item.id === productId)
      if (index > -1) {
        this.items.splice(index, 1)
        this.calculateTax()
        this.calculateShipping()
      }
    },

    updateQuantity(productId: number, quantity: number) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId)
        } else {
          item.quantity = quantity
          this.calculateTax()
          this.calculateShipping()
        }
      }
    },

    async calculateTax() {
      if (this.items.length === 0) {
        this.taxCalculation = null
        return
      }

      try {
        const { $apiFetch } = useNuxtApp()

        const cartItems = this.items.map(item => ({
          price: item.price,
          quantity: item.quantity
        }))

        const response = await $apiFetch<TaxCalculation>('/tax/calculate-cart', {
          method: 'POST',
          body: { items: cartItems }
        })

        this.taxCalculation = response
      } catch (error) {
        console.error('Error calculating tax:', error)
        this.taxCalculation = null
      }
    },

    async calculateShipping(address?: { country: string; state: string; city: string }) {
      if (this.items.length === 0) {
        this.shippingCalculation = null
        return
      }

      // Store the address for reuse (e.g. when shipping options change)
      if (address) {
        this.shippingAddress = address
      }

      const addr = address || this.shippingAddress

      if (!addr?.country && !addr?.state && !addr?.city) {
        return
      }

      try {
        const { $apiFetch } = useNuxtApp()

        const response = await $apiFetch<ShippingCalculation>('/shipping/calculate', {
          method: 'POST',
          body: {
            country: addr?.country || '',
            state: addr?.state || '',
            city: addr?.city || '',
            weight: this.totalWeight,
            volume_cbm: this.totalVolumeCbm,
            order_amount: this.rawSubtotal,
            options: this.shippingOptions
          }
        })

        const res = response as any
        if (res?.error) {
          this.shippingCalculation = null
          this.shippingError = res.error
        } else {
          this.shippingCalculation = response
          this.shippingError = null
        }
      } catch (error) {
        console.error('Error calculating shipping:', error)
        this.shippingCalculation = null
        this.shippingError = null
      }
    },

    setShippingOptions(options: string[]) {
      this.shippingOptions = options
      this.calculateShipping()
    },

    clearCart() {
      this.items = []
      this.taxCalculation = null
      this.shippingAddress = null
      this.shippingCalculation = null
      this.shippingError = null
      this.shippingOptions = []
    }
  }
})