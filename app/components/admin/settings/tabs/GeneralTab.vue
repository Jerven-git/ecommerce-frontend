<template>
  <div class="space-y-5">
    <AdminSettingsGeneral
      :model-value="{ site_name: form.site_name, logo_url: form.logo_url, favicon_url: form.favicon_url, cart_icon_url: form.cart_icon_url, logo_size: form.logo_size }"
      :media-uploading="mediaUploading"
      @update:model-value="Object.assign(form, $event)"
      @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
      @media-remove="(c: MediaCollection) => emit('media-remove', c)"
    />

    <AdminSettingsFeatures
      :favorites-enabled="form.favorites_enabled"
      :show-stock-quantity="form.show_stock_quantity"
      @update:favorites-enabled="form.favorites_enabled = $event"
      @update:show-stock-quantity="form.show_stock_quantity = $event"
    />

    <AdminSeoFields
      v-model:seo-title="form.default_seo_title"
      v-model:seo-description="form.default_seo_description"
      v-model:og-image-url="form.default_og_image_url"
      title-placeholder="Defaults to site name"
      description-placeholder="Used on pages without their own description"
      hide-noindex
    />

    <!-- Social media links -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-900">Social media links</p>
          <p class="text-xs text-gray-400">Shown as icons in the site footer. Pick a platform, paste the full URL.</p>
        </div>
        <button
          type="button"
          class="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100"
          @click="addSocialLink"
        >
          <Icon name="heroicons:plus" class="w-4 h-4" />
          Add link
        </button>
      </div>

      <p v-if="!form.social_links?.length" class="text-xs text-gray-400 italic">No social links yet. Click "Add link" to add one.</p>

      <div v-else class="space-y-2">
        <div
          v-for="(link, idx) in form.social_links"
          :key="idx"
          class="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-2 items-start"
        >
          <select
            v-model="link.platform"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
          >
            <option value="" disabled>Platform…</option>
            <option v-for="opt in SOCIAL_PLATFORMS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <input
            v-model="link.url"
            type="url"
            placeholder="https://…"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
          <button
            type="button"
            class="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
            :aria-label="`Remove ${link.platform || 'social link'}`"
            @click="removeSocialLink(Number(idx))"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Shop currency -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div>
        <p class="text-sm font-semibold text-gray-900">Shop currency</p>
        <p class="text-xs text-gray-400">All product prices, cart totals, and orders use this currency. Customers cannot change it.</p>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Currency</label>
        <select
          v-model="form.currency_code"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
        >
          <option v-for="c in catalog" :key="c.code" :value="c.code">
            {{ gatewaySupport(c.code).length === 0 ? '⚠️ ' : '' }}{{ c.code }} — {{ c.name }} ({{ c.symbol }})
            {{ gatewaySupport(c.code).length > 0 && gatewaySupport(c.code).length < 3
              ? ` — ${gatewayLabels(c.code)} only`
              : '' }}
          </option>
        </select>
        <div
          v-if="selectedGateways.length === 0"
          class="mt-2 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
          </svg>
          <div class="text-xs text-amber-800 leading-relaxed">
            <p class="font-semibold">No bundled payment gateway supports {{ form.currency_code }}.</p>
            <p class="mt-0.5">PayPal, Square, and Stripe cannot process this currency. You'll need a regional provider before going live.</p>
          </div>
        </div>
        <p
          v-else-if="selectedGateways.length < 3"
          class="text-[11px] text-amber-700 mt-1"
        >
          ⚠️ Only {{ gatewayLabels(form.currency_code) }} supports {{ form.currency_code }}. Make sure your account is set up.
        </p>
        <p v-else class="text-[11px] text-gray-400 mt-1">
          Supported by PayPal, Square, and Stripe.
        </p>
      </div>
    </div>

    <!-- Header call-to-action button -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-900">Header call-to-action</p>
          <p class="text-xs text-gray-400">A single button shown top-right in the site header on every page.</p>
        </div>
        <label class="inline-flex items-center gap-2 cursor-pointer">
          <input
            v-model="form.header_cta.enabled"
            type="checkbox"
            class="sr-only peer"
          />
          <span class="relative w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-primary-500 transition-colors">
            <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </span>
          <span class="text-xs font-semibold text-gray-700">{{ form.header_cta.enabled ? 'On' : 'Off' }}</span>
        </label>
      </div>
      <div v-if="form.header_cta.enabled" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Button label</label>
          <input
            v-model="form.header_cta.label"
            type="text"
            maxlength="30"
            placeholder="e.g. Shop Now"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-2">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Destination type</label>
            <select
              v-model="ctaLinkMode"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
            >
              <option value="page">Site page</option>
              <option value="custom">Custom URL</option>
            </select>
          </div>
          <div v-if="ctaLinkMode === 'page'">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Page</label>
            <select
              v-model="form.header_cta.link"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
            >
              <option value="" disabled>Choose a page…</option>
              <option v-for="opt in pageOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div v-else>
            <label class="block text-xs font-semibold text-gray-700 mb-1">URL</label>
            <input
              v-model="form.header_cta.link"
              type="text"
              maxlength="500"
              placeholder="https://example.com/page"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Above-footer promotional banner -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-900">Above-footer banner</p>
          <p class="text-xs text-gray-400">A promotional strip shown just above the footer on every page.</p>
        </div>
        <label class="inline-flex items-center gap-2 cursor-pointer">
          <input
            v-model="form.footer_banner.enabled"
            type="checkbox"
            class="sr-only peer"
          />
          <span class="relative w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-primary-500 transition-colors">
            <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </span>
          <span class="text-xs font-semibold text-gray-700">{{ form.footer_banner.enabled ? 'On' : 'Off' }}</span>
        </label>
      </div>
      <div v-if="form.footer_banner.enabled" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Heading</label>
          <input
            v-model="form.footer_banner.heading"
            type="text"
            maxlength="150"
            placeholder="e.g. Summer sale on now"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Subtitle (optional)</label>
          <input
            v-model="form.footer_banner.subtitle"
            type="text"
            maxlength="255"
            placeholder="Short supporting line"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Button label</label>
            <input
              v-model="form.footer_banner.button_label"
              type="text"
              maxlength="30"
              placeholder="e.g. Shop"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
          </div>
          <div class="grid grid-cols-[140px_1fr] gap-2">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Destination</label>
              <select
                v-model="bannerLinkMode"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
              >
                <option value="page">Site page</option>
                <option value="custom">Custom URL</option>
              </select>
            </div>
            <div v-if="bannerLinkMode === 'page'">
              <label class="block text-xs font-semibold text-gray-700 mb-1">Page</label>
              <select
                v-model="form.footer_banner.button_link"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
              >
                <option value="" disabled>Choose…</option>
                <option v-for="opt in pageOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div v-else>
              <label class="block text-xs font-semibold text-gray-700 mb-1">URL</label>
              <input
                v-model="form.footer_banner.button_link"
                type="text"
                maxlength="500"
                placeholder="https://example.com/page"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Background color (from)</label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.footer_banner.background_color"
                type="color"
                class="h-10 w-12 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                v-model="form.footer_banner.background_color"
                type="text"
                maxlength="7"
                class="flex-1 px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Background color (to) <span class="font-normal text-gray-400">— gradient end</span></label>
            <div class="flex items-center gap-2">
              <input
                v-model="bannerColorTo"
                type="color"
                class="h-10 w-12 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                v-model="form.footer_banner.background_color_to"
                type="text"
                maxlength="7"
                placeholder="same as from"
                class="flex-1 px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Text color</label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.footer_banner.text_color"
                type="color"
                class="h-10 w-12 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                v-model="form.footer_banner.text_color"
                type="text"
                maxlength="7"
                class="flex-1 px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <AdminSettingsFooter
      :footer="form.footer"
      :footer-logo-url="form.footer_logo_url"
      :header-logo-url="form.logo_url"
      :footer-logo-size="form.footer_logo_size"
      :media-uploading="mediaUploading"
      @update:footer="form.footer = $event"
      @update:footer-logo-size="form.footer_logo_size = $event"
      @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
      @media-remove="(c: MediaCollection) => emit('media-remove', c)"
    />

    <!-- Canonical base URL + logo alt text -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div>
        <p class="text-sm font-semibold text-gray-900">Site URL &amp; logo accessibility</p>
        <p class="text-xs text-gray-400">Set once per environment. Used to emit canonical URLs and to label your logo.</p>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Canonical base URL</label>
        <input
          v-model="form.canonical_base_url"
          type="url"
          placeholder="https://shopsystemunited.com"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <p class="text-[11px] text-gray-400 mt-1">No trailing slash. Used for &lt;link rel="canonical"&gt; and og:url so duplicate URLs (utm params, staging) consolidate to one.</p>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Logo alt text</label>
        <input
          v-model="form.logo_alt_text"
          type="text"
          maxlength="255"
          :placeholder="`Defaults to site name${form.site_name ? ` — “${form.site_name}”` : ''}`"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'
import type { ModuleKey } from '~/composables/useSiteConfig'

const props = defineProps<{
  form: Record<string, any>
  mediaUploading: Record<string, boolean>
}>()

const emit = defineEmits<{
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

const { catalog, fetchCatalog, gatewaySupport } = useCurrency()
onMounted(() => { fetchCatalog() })

const GATEWAY_DISPLAY: Record<string, string> = {
  paypal: 'PayPal',
  square: 'Square',
  stripe: 'Stripe',
}

function gatewayLabels(code: string): string {
  return gatewaySupport(code).map(g => GATEWAY_DISPLAY[g] ?? g).join(' / ')
}

const selectedGateways = computed(() => gatewaySupport(props.form.currency_code ?? 'USD'))

const bannerColorTo = computed({
  get: (): string => props.form.footer_banner?.background_color_to || props.form.footer_banner?.background_color || '#111827',
  set: (val: string) => { props.form.footer_banner.background_color_to = val },
})

const ALL_PAGE_OPTIONS: Array<{ value: string; label: string; module: ModuleKey | null }> = [
  { value: '/', label: 'Home', module: null },
  { value: '/shop', label: 'Shop', module: 'shop' },
  { value: '/commissions', label: 'Commissions', module: 'commissions' },
  { value: '/gift-cards', label: 'Gift Cards', module: 'gift_cards' },
  { value: '/services', label: 'Services', module: 'services' },
  { value: '/blog', label: 'Blog', module: 'blog' },
  { value: '/about', label: 'About', module: 'about' },
  { value: '/contact', label: 'Contact', module: 'contact' },
  { value: '/favorites', label: 'Favorites', module: null },
  { value: '/cart', label: 'Cart', module: 'shop' },
]

const pageOptions = computed(() => {
  const modules = props.form.modules_enabled ?? {}
  return ALL_PAGE_OPTIONS.filter(o => o.module === null || modules[o.module] !== false)
})

const ctaLinkMode = ref<'page' | 'custom'>(
  isKnownPagePath(props.form.header_cta?.link ?? '') ? 'page' : 'custom'
)

const bannerLinkMode = ref<'page' | 'custom'>(
  isKnownPagePath(props.form.footer_banner?.button_link ?? '') ? 'page' : 'custom'
)

function isKnownPagePath(link: string): boolean {
  if (!link) {
    return true
  }
  return ALL_PAGE_OPTIONS.some(o => o.value === link)
}

watch(
  () => props.form.header_cta?.link,
  link => {
    if (ctaLinkMode.value === 'page' && !isKnownPagePath(link ?? '')) {
      ctaLinkMode.value = 'custom'
    }
  },
)

watch(ctaLinkMode, mode => {
  if (mode === 'page' && !isKnownPagePath(props.form.header_cta.link)) {
    props.form.header_cta.link = ''
  }
})

watch(
  () => props.form.footer_banner?.button_link,
  link => {
    if (bannerLinkMode.value === 'page' && !isKnownPagePath(link ?? '')) {
      bannerLinkMode.value = 'custom'
    }
  },
)

watch(bannerLinkMode, mode => {
  if (mode === 'page' && !isKnownPagePath(props.form.footer_banner.button_link)) {
    props.form.footer_banner.button_link = ''
  }
})

const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'threads', label: 'Threads' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'discord', label: 'Discord' },
  { value: 'github', label: 'GitHub' },
  { value: 'website', label: 'Website / Other' },
]

function addSocialLink(): void {
  if (!Array.isArray(props.form.social_links)) {
    props.form.social_links = []
  }
  props.form.social_links.push({ platform: '', url: '', label: '' })
}

function removeSocialLink(idx: number): void {
  props.form.social_links.splice(idx, 1)
}
</script>
