import { describe, expect, it } from 'vitest'
import type { SiteConfig } from '~/composables/useSiteConfig'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'
import {
  websiteEditorChangedAreas,
  websiteEditorReadinessWarnings,
} from '~/utils/websiteEditorPublishing'

const baseDraft = () => normalizeWebsiteEditorDraft({
  default_locale: 'en',
  supported_locales: ['en'],
  localized_content: {},
  site_name: 'Contract Store',
  hero_title: 'Welcome',
  logo_url: '/logo.svg',
  logo_alt_text: 'Contract Store',
  header_cta: { enabled: false, label: '', link: '' },
  footer_banner: {
    enabled: false,
    heading: '',
    subtitle: '',
    button_label: '',
    button_link: '',
    background_color: '#111827',
    background_color_to: '',
    text_color: '#ffffff',
  },
  footer: {
    tagline: '',
    copyright_text: '',
    show_tagline: true,
    show_quick_links: true,
    show_contact_info: true,
    show_social_links: true,
  },
  homepage_steps: { label: '', heading: '', subtitle: '', items: [{ title: 'Choose', description: 'Choose a product' }] },
  homepage_features: { items: [{ title: 'Quality', description: 'Built well' }] },
  homepage_stats: { items: [{ value: '24/7', label: 'Support' }] },
} as SiteConfig)

describe('Website Editor publication contracts', () => {
  it('reports only the areas whose persisted fields changed', () => {
    const published = baseDraft()
    const draft = structuredClone(published)
    draft.site_name = 'Renamed Store'
    draft.hero_title = 'A new introduction'

    expect(websiteEditorChangedAreas(published, draft).map(area => area.id)).toEqual([
      'store-details',
      'home-hero',
    ])
  })

  it('warns about visible empty sections and incomplete enabled controls', () => {
    const draft = baseDraft()
    draft.hero_title = ''
    draft.header_cta = { enabled: true, label: 'Shop', link: '' }
    draft.logo_alt_text = ''

    expect(websiteEditorReadinessWarnings(draft).map(warning => warning.id)).toEqual(
      expect.arrayContaining(['hero-heading', 'header-cta', 'logo-alt']),
    )
  })

  it('does not warn about empty content in a hidden homepage section', () => {
    const draft = baseDraft()
    draft.homepage_features.items = []
    const feature = draft.homepage_sections.find(section => section.id === 'features')!
    feature.visible = false

    expect(websiteEditorReadinessWarnings(draft).some(warning => warning.id === 'features-empty')).toBe(false)
  })
})
