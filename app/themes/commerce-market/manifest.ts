import type { ThemeManifest } from '~/themes/contracts'
import { PUBLIC_PAGE_KINDS, WEBSITE_BLOCK_TYPES } from '~/themes/contracts'

export const commerceMarketThemeManifest = {
  id: 'commerce-market',
  version: '1.0.0',
  name: 'Commerce Market',
  description: 'A merchandising-first storefront for product discovery, comparison, cart, and checkout.',
  category: 'ecommerce',
  available: true,
  compatibleProfiles: ['ecommerce', 'hybrid'],
  recommendedModules: ['shop', 'gift_cards', 'blog'],
  supportedPages: PUBLIC_PAGE_KINDS,
  allowedBlocks: WEBSITE_BLOCK_TYPES,
  settingsSchemaVersion: 1,
  defaultSettings: {},
  previewAssets: null,
} as const satisfies ThemeManifest
