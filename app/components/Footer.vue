<template>
  <footer class="bg-white border-t border-gray-900/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div class="grid grid-cols-2 gap-x-6 gap-y-10" :class="gridColsClass">
        <div class="col-span-2 md:col-span-1">
          <NuxtLink to="/" class="inline-block mb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 rounded-lg">
            <img v-if="footerLogoUrl" :src="footerLogoUrl" :alt="siteConfig?.site_name" :style="{ height: footerLogoHeight + 'px' }" class="w-auto object-contain" />
            <span v-else class="text-2xl font-bold tracking-tight" :style="{ color: siteConfig?.theme?.primary_color || '#6898ED' }">
              {{ siteConfig?.site_name || 'Store' }}
            </span>
          </NuxtLink>
          <p v-if="showTagline && tagline" class="text-sm leading-relaxed text-gray-500 max-w-xs">{{ tagline }}</p>

          <div v-if="showSocial && socialLinks.length" class="flex items-center gap-2 mt-5">
            <a
              v-for="link in socialLinks"
              :key="link.platform + link.url"
              :href="link.url"
              :aria-label="link.label || link.platform"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-900/10 text-gray-500 hover:bg-gray-900 hover:border-gray-900 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <Icon :name="link.icon" class="w-4 h-4" />
            </a>
          </div>
        </div>

        <div v-if="showQuickLinks && quickLinks.length">
          <h4 class="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-4">Explore</h4>
          <ul class="space-y-2.5">
            <li v-for="link in quickLinks" :key="link.to">
              <NuxtLink :to="link.to" class="group inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 rounded">
                <span class="h-px w-0 bg-current transition-all duration-200 group-hover:w-3" aria-hidden="true" />
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div v-if="showContact">
          <h4 class="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-4">Contact</h4>
          <ul class="space-y-2.5">
            <template v-if="contactLines.length">
              <li v-for="(line, i) in contactLines" :key="i" class="text-sm text-gray-500 break-words">{{ line }}</li>
            </template>
            <template v-else>
              <li class="text-sm text-gray-500">contact@store.com</li>
              <li class="text-sm text-gray-500">+1234567890</li>
            </template>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-900/[0.08] mt-10 pt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p class="text-xs text-gray-400 text-center sm:text-left">{{ copyrightText }}</p>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 rounded-lg px-2 py-1"
          aria-label="Back to top"
          @click="scrollToTop"
        >
          Back to top
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
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
    default: return 'md:grid-cols-[1.25fr_1fr_1fr]'
  }
})

function scrollToTop() {
  if (!import.meta.client) return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
