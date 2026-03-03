<template>
  <footer class="bg-white border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <NuxtLink to="/" class="inline-block mb-4">
            <img v-if="siteConfig?.logo_url" :src="siteConfig.logo_url" :alt="siteConfig.site_name" class="h-32 w-auto object-contain" />
            <span v-else class="text-2xl font-bold tracking-tight" :style="{ color: siteConfig?.primary_color || '#6898ED' }">
              {{ siteConfig?.site_name || 'Store' }}
            </span>
          </NuxtLink>
          <p class="text-sm text-gray-500">Your trusted online shopping destination</p>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li><NuxtLink to="/shop" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">Shop</NuxtLink></li>
            <li><NuxtLink to="/about" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">About Us</NuxtLink></li>
            <li><NuxtLink to="/contact" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contact Info</h4>
          <ul class="space-y-2">
            <li class="text-sm text-gray-500">{{ siteConfig?.contact_email || 'contact@store.com' }}</li>
            <li class="text-sm text-gray-500">{{ siteConfig?.contact_phone || '+1234567890' }}</li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-100 mt-8 pt-8 text-center">
        <p class="text-sm text-gray-400">&copy; {{ new Date().getFullYear() }} {{ siteConfig?.site_name || 'Store' }}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { siteConfig } = useSiteConfig()
</script>