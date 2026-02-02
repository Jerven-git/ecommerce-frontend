export default defineNuxtPlugin(({ $pinia }) => {
  // Simple cart persistence using localStorage
  if (process.client) {
    const CART_KEY = 'cart-storage'
    
    // Load cart from localStorage on init
    const cartStore = useCartStore($pinia as any)
    const stored = localStorage.getItem(CART_KEY)
    
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.items) {
          cartStore.$patch(data)
        }
      } catch (e) {
        console.error('Failed to load cart from storage:', e)
      }
    }
    
    // Save cart to localStorage on changes
    cartStore.$subscribe((mutation, state) => {
      localStorage.setItem(CART_KEY, JSON.stringify({
        items: state.items,
        shippingOptions: state.shippingOptions
      }))
    })
  }
})