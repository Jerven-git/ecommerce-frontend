<template>
  <footer class="bg-white border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <NuxtLink to="/" class="inline-block mb-4">
            <img v-if="siteConfig?.logo_url" :src="siteConfig.logo_url" :alt="siteConfig.site_name" class="h-32 w-auto object-contain" />
            <span v-else class="text-2xl font-bold tracking-tight" :style="{ color: siteConfig?.theme?.primary_color || '#6898ED' }">
              {{ siteConfig?.site_name || 'Store' }}
            </span>
          </NuxtLink>
          <p class="text-sm text-gray-500">Your trusted online shopping destination</p>

          <div v-if="socialLinks.length" class="flex items-center gap-3 mt-5">
            <a
              v-for="link in socialLinks"
              :key="link.platform + link.url"
              :href="link.url"
              :aria-label="link.label || link.platform"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors"
            >
              <Icon :name="link.icon" class="w-4 h-4" />
            </a>
          </div>
        </div>

        <div v-if="quickLinks.length">
          <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="link.to">
              <NuxtLink :to="link.to" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">{{ link.label }}</NuxtLink>
            </li>
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
const { isEnabled } = useModules()

const allQuickLinks = [
  { to: '/shop', label: 'Shop', module: 'shop' as const },
  { to: '/services', label: 'Services', module: 'services' as const },
  { to: '/blog', label: 'Blog', module: 'blog' as const },
  { to: '/about', label: 'About Us', module: 'about' as const },
  { to: '/contact', label: 'Contact', module: 'contact' as const },
]

const quickLinks = computed(() => allQuickLinks.filter(l => isEnabled(l.module)))

const SOCIAL_ICONS: Record<string, string> = {
  facebook: 'mdi:facebook',
  instagram: 'mdi:instagram',
  x: 'simple-icons:x',
  twitter: 'mdi:twitter',
  tiktok: 'simple-icons:tiktok',
  youtube: 'mdi:youtube',
  linkedin: 'mdi:linkedin',
  pinterest: 'mdi:pinterest',
  snapchat: 'mdi:snapchat',
  threads: 'simple-icons:threads',
  whatsapp: 'mdi:whatsapp',
  telegram: 'mdi:telegram',
  discord: 'simple-icons:discord',
  github: 'mdi:github',
  website: 'heroicons:globe-alt',
}

const socialLinks = computed(() =>
  (siteConfig.value?.social_links ?? [])
    .filter(s => s?.platform && s?.url)
    .map(s => ({
      platform: s.platform,
      url: s.url,
      label: s.label || s.platform,
      icon: SOCIAL_ICONS[s.platform.toLowerCase()] || 'heroicons:globe-alt',
    })),
)
</script>