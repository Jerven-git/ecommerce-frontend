import type { ThemeManifest } from '~/themes/contracts'
import { PUBLIC_PAGE_KINDS, WEBSITE_BLOCK_TYPES } from '~/themes/contracts'

export const informationalEditorialThemeManifest = {
  id: 'informational-editorial',
  version: '1.0.0',
  name: 'Informational Editorial',
  description: 'A reading-first website for organisations, structured information, articles, and clear wayfinding.',
  category: 'informational',
  available: true,
  compatibleProfiles: ['services', 'informational', 'hybrid'],
  recommendedModules: ['about', 'contact', 'blog'],
  supportedPages: PUBLIC_PAGE_KINDS,
  allowedBlocks: WEBSITE_BLOCK_TYPES,
  settingsSchemaVersion: 1,
  defaultSettings: {},
  previewAssets: null,
} as const satisfies ThemeManifest
