import { defineStore } from 'pinia'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  weight: number
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
    loading: false
  }),

  getters: {
    itemCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },

    totalWeight: (state) => {
      return state.items.reduce((total, item) => total + (item.weight * item.quantity), 0)
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
      if (!this.taxCalculation) {
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
          image_url: product.image_url
        })
      }

      this.calculateTax()
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

      try {
        const { $apiFetch } = useNuxtApp()

        const response = await $apiFetch<ShippingCalculation>('/shipping/calculate', {
          method: 'POST',
          body: {
            country: address?.country || '',
            state: address?.state || '',
            city: address?.city || '',
            weight: this.totalWeight,
            order_amount: this.rawSubtotal,
            options: this.shippingOptions
          }
        })

        this.shippingCalculation = response
      } catch (error) {
        console.error('Error calculating shipping:', error)
        this.shippingCalculation = null
      }
    },

    setShippingOptions(options: string[]) {
      this.shippingOptions = options
      this.calculateShipping()
    },

    clearCart() {
      this.items = []
      this.taxCalculation = null
      this.shippingCalculation = null
      this.shippingOptions = []
    }
  }
})