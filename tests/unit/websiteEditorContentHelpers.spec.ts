import { describe, expect, it } from 'vitest'
import type { SiteConfig } from '~/composables/useSiteConfig'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'
import { withWebsiteEditorSupportedLocales } from '~/utils/websiteEditorDraftMutations'
import { websiteEditorValidationTarget } from '~/utils/websiteEditorValidation'

function draftWithLocales() {
  return normalizeWebsiteEditorDraft({
    default_locale: 'en',
    supported_locales: ['en', 'fil', 'ja'],
    localized_content: {
      en: { hero_title: 'Default content is not stored here' },
      fil: { hero_title: 'Maligayang pagdating' },
      ja: { hero_title: 'ようこそ' },
    },
    site_name: 'Contract Store',
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
  } as SiteConfig)
}

describe('Website Editor content helpers', () => {
  it('keeps the default locale first, deduplicates selections, and prunes removed translations', () => {
    const original = draftWithLocales()
    const updated = withWebsiteEditorSupportedLocales(original, ['fil', 'en', 'fil', 'fr'])

    expect(updated.supported_locales).toEqual(['en', 'fil', 'fr'])
    expect(updated.localized_content).toEqual({
      fil: { hero_title: 'Maligayang pagdating' },
    })
    expect(original.supported_locales).toEqual(['en', 'fil', 'ja'])
  })

  it('honors the supported-locale limit without dropping the default locale', () => {
    const updated = withWebsiteEditorSupportedLocales(draftWithLocales(), ['fil', 'ja', 'fr'], 3)

    expect(updated.supported_locales).toEqual(['en', 'fil', 'ja'])
  })

  it.each([
    ['payload.logo_url', { page: 'global', section: 'brand-assets' }],
    ['payload.contact_entries.0.email', { page: 'global', section: 'store-details' }],
    ['payload.story_image_a_url', { page: 'story', section: 'story-content' }],
    ['payload.homepage_stats.items.0.value', { page: 'home', section: 'stats' }],
    ['payload.welcome_popup_heading', { page: 'popup', section: 'welcome-popup' }],
  ])('routes %s to its editor section', (field, target) => {
    expect(websiteEditorValidationTarget({ [field]: ['Invalid value'] })).toEqual(target)
  })

  it('uses the first configured homepage section for ordering errors', () => {
    expect(websiteEditorValidationTarget(
      { 'payload.homepage_sections': ['Invalid order'] },
      'newsletter',
    )).toEqual({ page: 'home', section: 'newsletter' })
  })

  it('does not navigate for an unknown backend field', () => {
    expect(websiteEditorValidationTarget({ 'payload.unknown': ['Invalid value'] })).toBeNull()
  })
})
