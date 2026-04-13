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
  stock: number
  can_backorder: boolean
  backorder_charge_policy?: 'charged_now' | 'charged_later'
}

interface TaxCalculation {
  subtotal: number
  tax_amount: number
  total: number
  tax_rate: number
  tax_name: string
  tax_display_mode: 'inclusive' | 'exclusive'
  // Extended fields from calculateOrderTotals
  raw_subtotal?: number
  ex_tax_subtotal?: number
  discounted_subtotal?: number
  shipping?: number
  taxable_amount?: number
  has_regional_rules?: boolean
}

interface ShippingCalculation {
  base_shipping: number
  weight_fee: number
  volume_fee: number
  method_fee: number
  add_ons_fee: number
  total: number
  free_shipping: boolean
  method: string
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    _taxRequestId: 0,
    taxCalculation: null as TaxCalculation | null,
    shippingCalculation: null as ShippingCalculation | null,
    shippingMethod: 'standard' as string,
    shippingOptions: [] as string[],
    shippingAddress: null as { country: string; state: string; city: string; postcode?: string } | null,
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

    hasBackorderItems: (state) => {
      return state.items.some(item => item.quantity > item.stock && item.can_backorder)
    },

    backorderItems: (state) => {
      return state.items.filter(item => item.quantity > item.stock && item.can_backorder)
    },

    exTaxSubtotal(): number {
      if (!this.taxCalculation) return this.rawSubtotal
      return this.taxCalculation.ex_tax_subtotal ?? this.taxCalculation.subtotal
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

      // When full order totals are available (includes shipping + discount), use directly
      if (this.taxCalculation.taxable_amount !== undefined) {
        return this.taxCalculation.total
      }

      // Fallback for basic cart tax (no discount/shipping in calculation)
      return this.taxCalculation.subtotal + this.taxCalculation.tax_amount + this.shippingCost
    },

    hasRegionalTaxRules(): boolean {
      return this.taxCalculation?.has_regional_rules ?? false
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
          image_url: product.image_url,
          stock: parseInt(product.stock || 0),
          can_backorder: !!product.can_backorder,
          backorder_charge_policy: product.backorder_charge_policy || 'charged_later',
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

    async calculateTax(discountAmount?: number, shippingAmount?: number, country?: string, state?: string) {
      if (this.items.length === 0) {
        this.taxCalculation = null
        return
      }

      const requestId = ++this._taxRequestId

      try {
        const { $apiFetch } = useNuxtApp()

        const cartItems = this.items.map(item => ({
          price: item.price,
          quantity: item.quantity
        }))

        const body: Record<string, any> = { items: cartItems }
        if (discountAmount && discountAmount > 0) body.discount_amount = discountAmount
        if (shippingAmount && shippingAmount > 0) body.shipping_amount = shippingAmount
        if (country) body.country = country
        if (state) body.state = state

        const response = await $apiFetch<TaxCalculation>('/tax/calculate-cart', {
          method: 'POST',
          body
        })

        // Ignore stale responses from earlier requests
        if (requestId !== this._taxRequestId) return

        this.taxCalculation = response
      } catch (error) {
        if (requestId !== this._taxRequestId) return
        console.error('Error calculating tax:', error)
        this.taxCalculation = null
      }
    },

    async calculateShipping(address?: { country: string; state: string; city: string; postcode?: string }) {
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
            postcode: addr?.postcode || '',
            weight: this.totalWeight,
            volume_cbm: this.totalVolumeCbm,
            order_amount: this.rawSubtotal,
            method: this.shippingMethod,
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

    setShippingMethod(method: string) {
      this.shippingMethod = method
      this.calculateShipping()
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
      this.shippingMethod = 'standard'
      this.shippingOptions = []
    }
  }
})