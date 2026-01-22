import { defineStore } from 'pinia'

interface CartItem {
  id: string
  name: string
  price: number
  image_url: string
  quantity: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[]
  }),

  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  },

  actions: {
    addToCart(product: any) {
      const existingItem = this.items.find(item => item.id === product.id)

      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1
        })
      }

      if (process.client) {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },

    removeFromCart(productId: string) {
      const index = this.items.findIndex(item => item.id === productId)
      if (index > -1) {
        this.items.splice(index, 1)
      }

      if (process.client) {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },

    updateQuantity(productId: string, quantity: number) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else {
          item.quantity = quantity
        }
      }

      if (process.client) {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },

    clearCart() {
      this.items = []
      if (process.client) {
        localStorage.removeItem('cart')
      }
    },

    loadCart() {
      if (process.client) {
        const saved = localStorage.getItem('cart')
        if (saved) {
          this.items = JSON.parse(saved)
        }
      }
    }
  }
})
