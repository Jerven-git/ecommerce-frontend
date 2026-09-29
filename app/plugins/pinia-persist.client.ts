const CART_KEY = 'cart-storage'

export default defineNuxtPlugin((nuxtApp) => {
  // Restore browser-only state after Vue has hydrated the server HTML. Applying
  // it during plugin setup made the cart badge differ between SSR and hydration.
  nuxtApp.hook('app:mounted', () => {
    const cartStore = useCartStore(nuxtApp.$pinia as any)

    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (Array.isArray(data.items)) {
          cartStore.$patch({
            items: data.items,
            shippingOptions: Array.isArray(data.shippingOptions) ? data.shippingOptions : [],
          })

          if (cartStore.items.length > 0) {
            void cartStore.calculateTax()
          }
        }
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error)
    }

    cartStore.$subscribe((_mutation, state) => {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify({
          items: state.items,
          shippingOptions: state.shippingOptions,
        }))
      } catch (error) {
        console.error('Failed to save cart to storage:', error)
      }
    })
  })
})
