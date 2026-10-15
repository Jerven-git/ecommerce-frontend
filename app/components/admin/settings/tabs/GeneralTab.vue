<template>
  <div data-guide="settings-general" class="space-y-5">
    <AdminSettingsWebsiteEditorNotice
      description="Store identity, contact channels, social links, logos, icons, shared storefront content, and footer presentation are edited and published from the visual editor. Operational preferences and SEO remain here."
      :editor-to="{ path: '/admin/website-editor', query: { page: 'global', section: 'brand-assets' } }"
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

    <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 class="text-sm font-semibold text-gray-900">Shop currency</h2>
      <p class="mt-1 text-xs leading-5 text-gray-500">All product prices, cart totals, and orders use this currency. Customers cannot change it.</p>
      <div class="mt-4">
        <label class="mb-1 block text-xs font-semibold text-gray-700">Currency</label>
        <select v-model="form.currency_code" class="input-field">
          <option v-for="currency in catalog" :key="currency.code" :value="currency.code">
            {{ gatewaySupport(currency.code).length === 0 ? 'Unsupported - ' : '' }}{{ currency.code }} — {{ currency.name }} ({{ currency.symbol }})
            {{ gatewaySupport(currency.code).length > 0 && gatewaySupport(currency.code).length < 3 ? ` — ${gatewayLabels(currency.code)} only` : '' }}
          </option>
        </select>
        <div v-if="selectedGateways.length === 0" class="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-900">
          <Icon name="heroicons:exclamation-triangle" class="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          <div class="text-xs leading-5">
            <p class="font-semibold">No bundled payment gateway supports {{ form.currency_code }}.</p>
            <p>Configure a regional provider before accepting live orders.</p>
          </div>
        </div>
        <p v-else-if="selectedGateways.length < 3" class="mt-2 text-xs text-amber-800">Only {{ gatewayLabels(form.currency_code) }} supports this currency.</p>
        <p v-else class="mt-2 text-xs text-gray-500">Supported by PayPal, Square, and Stripe.</p>
      </div>
    </section>

    <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 class="text-sm font-semibold text-gray-900">Site URL</h2>
      <p class="mt-1 text-xs leading-5 text-gray-500">Used as the canonical public address for search engines.</p>
      <div class="mt-4 space-y-4">
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-700">Canonical base URL</label>
          <input v-model="form.canonical_base_url" type="url" placeholder="https://shopsystemunited.com" class="input-field" />
          <p class="mt-1 text-xs text-gray-500">Enter the public address without a trailing slash.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  form: Record<string, any>
}>()

const { catalog, fetchCatalog, gatewaySupport } = useCurrency()
onMounted(fetchCatalog)

const GATEWAY_DISPLAY: Record<string, string> = { paypal: 'PayPal', square: 'Square', stripe: 'Stripe' }
const selectedGateways = computed(() => gatewaySupport(props.form.currency_code ?? 'USD'))

function gatewayLabels(code: string): string {
  return gatewaySupport(code).map(gateway => GATEWAY_DISPLAY[gateway] ?? gateway).join(' / ')
}

</script>
