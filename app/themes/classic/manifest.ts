import type { ThemeManifest } from '~/themes/contracts'
import { PUBLIC_PAGE_KINDS, WEBSITE_BLOCK_TYPES } from '~/themes/contracts'

export const classicThemeManifest = {
  id: 'classic',
  version: '1.0.0',
  name: 'Classic',
  description: 'The existing SSU storefront, preserved without an intentional visual redesign.',
  category: 'general',
  available: true,
  compatibleProfiles: ['ecommerce', 'services', 'informational', 'hybrid'],
  recommendedModules: [],
  supportedPages: PUBLIC_PAGE_KINDS,
  allowedBlocks: WEBSITE_BLOCK_TYPES,
  settingsSchemaVersion: 1,
  defaultSettings: {},
  previewAssets: null,
} as const satisfies ThemeManifest

