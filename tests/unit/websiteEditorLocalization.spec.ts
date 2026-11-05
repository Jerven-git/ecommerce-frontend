import { describe, expect, it } from 'vitest'
import type { SiteConfig } from '~/composables/useSiteConfig'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'
import {
  applyWebsiteEditorLocale,
  websiteEditorLocaleProgress,
  websiteEditorTranslationFields,
} from '~/utils/websiteEditorLocalization'

function localizedDraft() {
  return normalizeWebsiteEditorDraft({
    default_locale: 'en',
    supported_locales: ['en', 'fil'],
    localized_content: {
      fil: {
        hero_title: 'Maligayang pagdating',
        'homepage_steps.items.0.title': 'Pumili',
      },
    },
    site_name: 'Contract Store',
    hero_title: 'Welcome',
    hero_subtitle: 'Browse the collection',
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
    homepage_steps: {
      label: '',
      heading: '',
      subtitle: '',
      items: [{ title: 'Choose', description: 'Choose a product' }],
    },
  } as SiteConfig)
}

describe('Website Editor localization contracts', () => {
  it('keeps social label translations in their dedicated section', () => {
    const draft = localizedDraft()
    draft.social_links = [{ platform: 'facebook', url: 'https://facebook.com/store', label: 'Facebook' }]
    const social = websiteEditorTranslationFields(draft, 'global', 'social-media')
    expect(social.map(field => field.path)).toEqual(['social_links.0.label'])
    expect(websiteEditorTranslationFields(draft, 'global', 'store-details').some(field => field.path.startsWith('social_links'))).toBe(false)
  })

  it('applies nested and indexed translations without mutating the default draft', () => {
    const draft = localizedDraft()
    const translated = applyWebsiteEditorLocale(draft, 'fil')

    expect(translated.hero_title).toBe('Maligayang pagdating')
    expect(translated.homepage_steps.items[0]!.title).toBe('Pumili')
    expect(draft.hero_title).toBe('Welcome')
    expect(draft.homepage_steps.items[0]!.title).toBe('Choose')
  })

  it('returns an independent copy for the default locale', () => {
    const draft = localizedDraft()
    const defaultLocale = applyWebsiteEditorLocale(draft, 'en')
    defaultLocale.hero_title = 'Local edit'

    expect(draft.hero_title).toBe('Welcome')
  })

  it('exposes the indexed translation paths used by the API payload', () => {
    const fields = websiteEditorTranslationFields(localizedDraft(), 'home', 'how-it-works')

    expect(fields.map(field => field.path)).toContain('homepage_steps.items.0.title')
    expect(fields.map(field => field.path)).toContain('homepage_steps.items.0.description')
  })

  it('counts only fields with default-language content as required', () => {
    const progress = websiteEditorLocaleProgress(localizedDraft(), 'fil')

    expect(progress.translated).toBe(2)
    expect(progress.total).toBeGreaterThan(progress.translated)
    expect(progress.percent).toBe(Math.round((progress.translated / progress.total) * 100))
  })
})
