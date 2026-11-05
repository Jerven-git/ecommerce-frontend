import type { ThemeLayoutReference, WebsiteNavigationItem, WebsiteProfileId } from '~/composables/useSiteConfig'

export type WebsiteThemeCategory = 'general' | 'services' | 'informational' | 'ecommerce'

export interface WebsiteCompatibilityIssue {
  code: string
  message: string
  module?: string
  settings_path?: string
}

export interface WebsiteThemeCompatibility {
  compatible: boolean
  errors: WebsiteCompatibilityIssue[]
  warnings: WebsiteCompatibilityIssue[]
}

export interface WebsiteThemeCatalogueItem {
  id: string
  name: string
  description: string
  category: WebsiteThemeCategory
  best_for: string[]
  version: string
  available: boolean
  status: 'available' | 'planned'
  compatible_profiles: WebsiteProfileId[]
  supported_pages: string[]
  recommended_modules: string[]
  allowed_sections: Array<{ id: string; visible: boolean }>
  preview_assets: { desktop: string | null; mobile: string | null }
  is_live: boolean
  is_draft: boolean
  compatibility: Partial<Record<WebsiteProfileId, WebsiteThemeCompatibility>>
}

export interface WebsiteProfileCatalogueItem {
  id: WebsiteProfileId
  name: string
  description: string
  required_modules: string[]
  recommended_modules: string[]
  navigation: WebsiteNavigationItem[]
}

export interface WebsiteBlueprintProposal {
  proposal_token: string
  draft_version: number | null
  website_profile: WebsiteProfileId
  theme_layout: ThemeLayoutReference
  navigation: WebsiteNavigationItem[]
  module_proposal: {
    changes: Array<{ module: string; label: string; priority: 'required' | 'recommended'; settings_path: string }>
    automatic_changes: false
  }
  compatibility: WebsiteThemeCompatibility
  applied: boolean
}

export function useWebsiteThemes() {
  const { $apiFetch } = useNuxtApp()

  const fetchThemes = () => $apiFetch<{
    data: WebsiteThemeCatalogueItem[]
    current: { website_profile: WebsiteProfileId; theme_layout: ThemeLayoutReference; draft_version: number | null }
  }>('/website-themes')

  const fetchProfiles = () => $apiFetch<{ data: WebsiteProfileCatalogueItem[] }>('/admin/website-profiles')

  const proposeBlueprint = (input: {
    website_profile: WebsiteProfileId
    theme_id: string
    theme_version: string
    draft_version: number | null
  }) => $apiFetch<{ data: WebsiteBlueprintProposal; message: string }>('/site-config/draft/blueprint', {
    method: 'POST',
    body: input,
  })

  const applyBlueprint = (proposal: WebsiteBlueprintProposal) => $apiFetch<{ data: WebsiteBlueprintProposal; message: string }>('/site-config/draft/blueprint/apply', {
    method: 'POST',
    body: {
      proposal_token: proposal.proposal_token,
      website_profile: proposal.website_profile,
      theme_id: proposal.theme_layout.id,
      theme_version: proposal.theme_layout.version,
      draft_version: proposal.draft_version,
    },
  })

  return { fetchThemes, fetchProfiles, proposeBlueprint, applyBlueprint }
}
