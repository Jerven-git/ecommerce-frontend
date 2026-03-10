import { defineStore } from 'pinia'

const STORAGE_KEY = 'favorites'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    productIds: [] as number[],
  }),

  getters: {
    count: (state) => state.productIds.length,
    isFavorited: (state) => (productId: number) => state.productIds.includes(productId),
  },

  actions: {
    toggle(productId: number) {
      const index = this.productIds.indexOf(productId)
      if (index > -1) {
        this.productIds.splice(index, 1)
      } else {
        this.productIds.push(productId)
      }
      this.persist()
    },

    load() {
      if (import.meta.server) return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          this.productIds = JSON.parse(raw)
        }
      } catch {
        this.productIds = []
      }
    },

    persist() {
      if (import.meta.server) return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.productIds))
    },

    clear() {
      this.productIds = []
      if (import.meta.server) return
      localStorage.removeItem(STORAGE_KEY)
    },

    // TODO: When user auth is ready, call this after login to sync localStorage favorites to the API
    // async syncToUser() {
    //   const { $apiFetch } = useNuxtApp()
    //   await $apiFetch('/favorites/sync', { method: 'POST', body: { product_ids: this.productIds } })
    //   await this.fetchFromApi()
    // },

    // TODO: When user auth is ready, replace load() with this for authenticated users
    // async fetchFromApi() {
    //   const { $apiFetch } = useNuxtApp()
    //   const res = await $apiFetch<{ data: number[] }>('/favorites')
    //   this.productIds = res.data
    // },
  },
})
