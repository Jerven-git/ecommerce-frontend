<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-8">
          <NuxtLink to="/" class="text-2xl font-bold" :style="{ color: siteConfig?.primary_color || '#2563eb' }">
            {{ siteConfig?.site_name || 'Store' }}
          </NuxtLink>

          <nav class="hidden md:flex space-x-6">
            <NuxtLink to="/" class="text-gray-700 hover:text-blue-600 transition-colors">Home</NuxtLink>
            <NuxtLink to="/shop" class="text-gray-700 hover:text-blue-600 transition-colors">Shop</NuxtLink>
            <NuxtLink to="/about" class="text-gray-700 hover:text-blue-600 transition-colors">About</NuxtLink>
            <NuxtLink to="/contact" class="text-gray-700 hover:text-blue-600 transition-colors">Contact</NuxtLink>
          </nav>
        </div>

        <div class="flex items-center space-x-4">
          <NuxtLink to="/cart" class="relative text-gray-700 hover:text-blue-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span v-if="cartStore.itemCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ cartStore.itemCount }}
            </span>
          </NuxtLink>

          <NuxtLink v-if="authStore.isAdmin" to="/admin" class="text-gray-700 hover:text-blue-600 transition-colors">
            Admin
          </NuxtLink>
        </div>

        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t">
        <nav class="flex flex-col space-y-3">
          <NuxtLink to="/" class="text-gray-700 hover:text-blue-600 transition-colors" @click="mobileMenuOpen = false">Home</NuxtLink>
          <NuxtLink to="/shop" class="text-gray-700 hover:text-blue-600 transition-colors" @click="mobileMenuOpen = false">Shop</NuxtLink>
          <NuxtLink to="/about" class="text-gray-700 hover:text-blue-600 transition-colors" @click="mobileMenuOpen = false">About</NuxtLink>
          <NuxtLink to="/contact" class="text-gray-700 hover:text-blue-600 transition-colors" @click="mobileMenuOpen = false">Contact</NuxtLink>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface SiteConfig {
  id: number
  site_name: string
  hero_title: string
  hero_subtitle: string
  primary_color: string
  secondary_color: string
}

interface SiteConfigResponse {
  data: SiteConfig
}

const cartStore = useCartStore()
const authStore = useAuthStore()
const { $apiFetch } = useNuxtApp()

const mobileMenuOpen = ref(false)
const siteConfig = ref<SiteConfig | null>(null)

onMounted(async () => {
  try {
    const response = await $apiFetch<SiteConfigResponse>('/site-config')
    siteConfig.value = response.data
  } catch (error) {
    console.warn('Failed to load site config:', error)
    // Fallback must match SiteConfig shape
    siteConfig.value = {
      id: 0,
      site_name: 'Store',
      hero_title: '',
      hero_subtitle: '',
      primary_color: '#2563eb',
      secondary_color: '#10b981'
    }
  }
})
</script>
