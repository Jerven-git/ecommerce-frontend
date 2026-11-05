import type { ThemeManifest } from '~/themes/contracts'
import { PUBLIC_PAGE_KINDS, WEBSITE_BLOCK_TYPES } from '~/themes/contracts'

export const serviceStudioThemeManifest = {
  id: 'service-studio',
  version: '1.0.0',
  name: 'Service Studio',
  description: 'A services-first website for expertise, process, supporting evidence, and direct enquiries.',
  category: 'services',
  available: true,
  compatibleProfiles: ['services', 'informational', 'hybrid'],
  recommendedModules: ['services', 'contact', 'about', 'blog', 'commissions'],
  supportedPages: PUBLIC_PAGE_KINDS,
  allowedBlocks: WEBSITE_BLOCK_TYPES,
  settingsSchemaVersion: 1,
  defaultSettings: {},
  previewAssets: null,
} as const satisfies ThemeManifest
