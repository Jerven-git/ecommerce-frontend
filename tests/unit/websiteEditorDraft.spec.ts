import { describe, expect, it } from 'vitest'
import type { SiteConfig } from '~/composables/useSiteConfig'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'

function minimalSiteConfig(overrides: Partial<SiteConfig> = {}): SiteConfig {
  return {
    default_locale: 'en',
    supported_locales: ['en'],
    localized_content: {},
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
    ...overrides,
  } as SiteConfig
}

describe('normalizeWebsiteEditorDraft', () => {
  it('creates the complete editable shape from a sparse SiteConfig', () => {
    const draft = normalizeWebsiteEditorDraft(minimalSiteConfig())

    expect(draft.site_name).toBe('Contract Store')
    expect(draft.homepage_steps.items).toEqual([])
    expect(draft.homepage_sections).toHaveLength(10)
    expect(draft.story_page.section_a.cta_link).toBe('/shop')
    expect(draft.services_page.header.primary_cta).toBeNull()
  })

  it('preserves explicit nulls used to clear media and SEO fields', () => {
    const config = minimalSiteConfig({
      hero_image_url: '/media/old-hero.jpg',
      default_seo_title: 'Old title',
    })

    const draft = normalizeWebsiteEditorDraft(config, {
      hero_image_url: null,
      default_seo_title: null,
    })

    expect(draft.hero_image_url).toBeNull()
    expect(draft.default_seo_title).toBeNull()
  })

  it('normalizes nullable contact data into editable strings', () => {
    const draft = normalizeWebsiteEditorDraft(minimalSiteConfig({
      contact_entries: [{ label: 'Support', email: null, phone: null }],
      social_links: [{ platform: 'instagram', url: '/store', label: null }],
    }))

    expect(draft.contact_entries).toEqual([
      { label: 'Support', email: '', phone: '' },
    ])
    expect(draft.social_links).toEqual([
      { platform: 'instagram', url: '/store', label: '' },
    ])
  })

  it('deep-clones nested API data before it becomes an editor draft', () => {
    const config = minimalSiteConfig({
      homepage_steps: {
        label: 'Process',
        heading: 'How it works',
        subtitle: '',
        items: [{ title: 'One', description: 'First step' }],
      },
    })
    const draft = normalizeWebsiteEditorDraft(config)

    draft.homepage_steps.items[0]!.title = 'Changed locally'

    expect(config.homepage_steps?.items[0]!.title).toBe('One')
  })
})
