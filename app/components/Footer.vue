<template>
  <footer class="bg-white border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 gap-8" :class="gridColsClass">
        <div>
          <NuxtLink to="/" class="inline-block mb-4">
            <img v-if="footerLogoUrl" :src="footerLogoUrl" :alt="siteConfig?.site_name" :style="{ height: footerLogoHeight + 'px' }" class="w-auto object-contain" />
            <span v-else class="text-2xl font-bold tracking-tight" :style="{ color: siteConfig?.theme?.primary_color || '#6898ED' }">
              {{ siteConfig?.site_name || 'Store' }}
            </span>
          </NuxtLink>
          <p v-if="showTagline && tagline" class="text-sm text-gray-500">{{ tagline }}</p>

          <div v-if="showSocial && socialLinks.length" class="flex items-center gap-3 mt-5">
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

        <div v-if="showQuickLinks && quickLinks.length">
          <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="link.to">
              <NuxtLink :to="link.to" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div v-if="showContact">
          <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contact Info</h4>
          <ul class="space-y-2">
            <template v-if="contactLines.length">
              <li v-for="(line, i) in contactLines" :key="i" class="text-sm text-gray-500">{{ line }}</li>
            </template>
            <template v-else>
              <li class="text-sm text-gray-500">contact@store.com</li>
              <li class="text-sm text-gray-500">+1234567890</li>
            </template>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-100 mt-8 pt-8 text-center">
        <p class="text-sm text-gray-400">{{ copyrightText }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { siteConfig } = useSiteConfig()
const footerLogoUrl = computed(() => siteConfig.value?.footer_logo_url || siteConfig.value?.logo_url || null)
const footerLogoHeight = computed(() => siteConfig.value?.footer_logo_size || 128)
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

const contactLines = computed(() => {
  const lines: string[] = []
  const entries = siteConfig.value?.contact_entries?.filter(e => e.email || e.phone) ?? []
  if (entries.length) {
    for (const e of entries) {
      if (e.email) lines.push(e.email)
      if (e.phone) lines.push(e.phone)
    }
    return lines
  }
  if (siteConfig.value?.contact_email) lines.push(siteConfig.value.contact_email)
  if (siteConfig.value?.contact_phone) lines.push(siteConfig.value.contact_phone)
  return lines
})

const showTagline = computed(() => siteConfig.value?.footer?.show_tagline ?? true)
const showSocial = computed(() => siteConfig.value?.footer?.show_social_links ?? true)
const showQuickLinks = computed(() => siteConfig.value?.footer?.show_quick_links ?? true)
const showContact = computed(() => siteConfig.value?.footer?.show_contact_info ?? true)

const tagline = computed(() =>
  siteConfig.value?.footer?.tagline ?? 'Your trusted online shopping destination',
)

const copyrightText = computed(() => {
  const template = siteConfig.value?.footer?.copyright_text || '© {year} {site_name}. All rights reserved.'
  const year = String(new Date().getFullYear())
  const siteName = siteConfig.value?.site_name || 'Store'
  return template.replace(/\{year\}/g, year).replace(/\{site_name\}/g, siteName)
})

// Visible column count drives the grid (logo column is always visible).
const visibleColumns = computed(() => {
  let n = 1
  if (showQuickLinks.value && quickLinks.value.length) n++
  if (showContact.value) n++
  return n
})

const gridColsClass = computed(() => {
  switch (visibleColumns.value) {
    case 1: return 'md:grid-cols-1'
    case 2: return 'md:grid-cols-2'
    default: return 'md:grid-cols-3'
  }
})
</script>
