export interface Currency {
  id: number
  code: string
  name: string
  symbol: string
  symbol_position: 'before' | 'after'
  decimal_places: number
}

interface CurrencyCatalogResponse {
  data: Currency[]
}

export type PaymentGateway = 'paypal' | 'square' | 'stripe'

/**
 * Hardcoded currency support by the bundled payment gateways. Used by the
 * admin currency picker to flag combinations that won't work at checkout.
 * Update this when adding/removing gateways or when their currency support
 * changes upstream.
 */
const GATEWAY_SUPPORT: Record<string, PaymentGateway[]> = {
  USD: ['paypal', 'square', 'stripe'],
  AUD: ['paypal', 'square', 'stripe'],
  EUR: ['paypal', 'square', 'stripe'],
  GBP: ['paypal', 'square', 'stripe'],
  CAD: ['paypal', 'square', 'stripe'],
  JPY: ['paypal', 'square', 'stripe'],
  NZD: ['paypal', 'stripe'],
  PHP: [],
}

const FALLBACK: Currency = {
  id: 0,
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  symbol_position: 'before',
  decimal_places: 2,
}

/**
 * Single-currency regional shop model. The shop's currency is set by the
 * admin in SiteConfig — customers never pick. This composable reads the
 * configured currency and provides a formatter that applies the right
 * symbol, position, and decimal places.
 */
export function useCurrency() {
  const catalog = useState<Currency[]>('currencyCatalog', () => [])
  const fetched = useState<boolean>('currencyCatalogFetched', () => false)
  const pending = useState<boolean>('currencyCatalogPending', () => false)

  const { siteConfig } = useSiteConfig()

  async function fetchCatalog(force = false): Promise<void> {
    if ((!force && fetched.value) || pending.value) {
      return
    }
    pending.value = true
    try {
      const { $apiFetch } = useNuxtApp()
      const res = await $apiFetch<CurrencyCatalogResponse>('/currencies')
      catalog.value = res.data ?? []
      fetched.value = true
    } catch {
      catalog.value = [FALLBACK]
    } finally {
      pending.value = false
    }
  }

  /**
   * The shop's configured currency, looked up from the catalog by the code
   * stored in SiteConfig. Falls back to USD/FALLBACK if catalog is empty
   * or the configured code is unknown.
   */
  const shopCurrency = computed<Currency>(() => {
    const code = siteConfig.value?.currency_code ?? 'USD'
    return catalog.value.find(c => c.code === code) ?? FALLBACK
  })

  /**
   * Format an amount in the shop's currency. No conversion is performed —
   * the merchant entered prices in their currency, customers see the same.
   */
  function format(amount: number): string {
    return formatIn(amount, shopCurrency.value.code)
  }

  /**
   * Format an amount in a specific currency by code. Used for historical
   * records (e.g. orders) where the stored currency may differ from the
   * shop's current currency. Falls back to the shop currency if unknown.
   */
  function formatIn(amount: number, code: string | null | undefined): string {
    const c = (code && catalog.value.find(x => x.code === code))
      || shopCurrency.value
    const formatted = amount.toLocaleString(undefined, {
      minimumFractionDigits: c.decimal_places,
      maximumFractionDigits: c.decimal_places,
    })
    return c.symbol_position === 'after'
      ? `${formatted} ${c.symbol}`
      : `${c.symbol}${formatted}`
  }

  /**
   * Which of the bundled payment gateways support this currency.
   * Returns an empty array for currencies with no supported gateway —
   * the admin will need to integrate a regional provider.
   */
  function gatewaySupport(code: string): PaymentGateway[] {
    return GATEWAY_SUPPORT[code.toUpperCase()] ?? []
  }

  return {
    catalog,
    shopCurrency,
    pending,
    fetchCatalog,
    format,
    formatIn,
    gatewaySupport,
  }
}
