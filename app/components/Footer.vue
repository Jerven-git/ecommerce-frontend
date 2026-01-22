<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <NuxtLink to="/" class="text-2xl font-bold mb-4" :style="{ color: siteConfig?.primary_color || '#2563eb' }">
            {{ siteConfig?.site_name || 'Store' }}
          </NuxtLink>
          <p class="text-gray-400">Your trusted online shopping destination</p>
        </div>

        <div>
          <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li><NuxtLink to="/shop" class="text-gray-400 hover:text-white transition-colors">Shop</NuxtLink></li>
            <li><NuxtLink to="/about" class="text-gray-400 hover:text-white transition-colors">About Us</NuxtLink></li>
            <li><NuxtLink to="/contact" class="text-gray-400 hover:text-white transition-colors">Contact</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold mb-4">Contact Info</h4>
          <ul class="space-y-2 text-gray-400">
            <li>{{ siteConfig?.contact_email || 'contact@store.com' }}</li>
            <li>{{ siteConfig?.contact_phone || '+1234567890' }}</li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; {{ new Date().getFullYear() }} {{ siteConfig?.site_name || 'Store' }}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
interface SiteConfig {
  id: number
  site_name: string
  hero_title: string
  hero_subtitle: string
  primary_color: string
  secondary_color: string
  contact_email: string
  contact_phone: string
}

interface SiteConfigResponse {
  data: SiteConfig
}

const { $apiFetch } = useNuxtApp()

const siteConfig = ref<SiteConfig | null>(null)

onMounted(async () => {
  try {
    const response = await $apiFetch<SiteConfigResponse>('/site-config')
    siteConfig.value = response.data
  } catch (error) {
    console.warn('Failed to load site config:', error)
    siteConfig.value = {
      id: 0,
      site_name: 'Store',
      hero_title: '',
      hero_subtitle: '',
      primary_color: '#2563eb',
      secondary_color: '#10b981',
      contact_email: 'contact@store.com',
      contact_phone: '+1234567890'
    }
  }
})
</script>