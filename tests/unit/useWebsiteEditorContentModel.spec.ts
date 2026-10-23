import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import type { SiteConfig } from '~/composables/useSiteConfig'
import { useWebsiteEditorContentModel } from '~/composables/useWebsiteEditorContentModel'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'
import type { WebsiteEditorPageId } from '~/utils/websiteEditorPages'

function minimalSiteConfig(overrides: Partial<SiteConfig> = {}): SiteConfig {
  return {
    default_locale: 'en',
    supported_locales: ['en'],
    localized_content: {},
    site_name: 'Contract Store',
    modules_enabled: {
      about: true,
      contact: true,
      shop: true,
      blog: false,
      services: true,
    },
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

function createModel(config = minimalSiteConfig()) {
  const draft = ref(normalizeWebsiteEditorDraft(config))
  const activePage = ref<WebsiteEditorPageId>('home')
  const model = useWebsiteEditorContentModel({
    siteConfig: ref(config),
    draft,
    versionPreview: ref(null),
    activeLocale: ref('en'),
    activePage,
  })

  return { activePage, draft, model }
}

describe('useWebsiteEditorContentModel', () => {
  it('assembles draft media fields into the storefront preview contract', () => {
    const { draft, model } = createModel()
    draft.value.homepage_statement_image_url = '/media/statement.jpg'
    draft.value.story_image_a_url = '/media/story-a.jpg'
    draft.value.story_image_b_url = '/media/story-b.jpg'

    expect(model.previewConfig.value?.homepage_statement?.image_url).toBe('/media/statement.jpg')
    expect(model.previewConfig.value?.story_page?.section_a.image_url).toBe('/media/story-a.jpg')
    expect(model.previewConfig.value?.story_page?.section_b.image_url).toBe('/media/story-b.jpg')
  })

  it('derives page availability from module and content controls', () => {
    const { activePage, draft, model } = createModel()
    draft.value.story_page.enabled = false
    draft.value.welcome_popup_enabled = false

    const options = Object.fromEntries(model.pagePickerOptions.value.map(option => [option.id, option]))

    expect(options.blog?.storefrontDisabled).toBe(true)
    expect(options.about?.storefrontDisabled).toBe(false)
    expect(options.story?.storefrontDisabled).toBe(true)
    expect(options.popup?.storefrontDisabled).toBe(true)

    activePage.value = 'blog'
    expect(model.activePageDisabled.value).toBe(true)
    expect(model.sections.value.every(section => section.visible === false)).toBe(true)
  })

  it('builds homepage section metadata and cross-page navigation consistently', () => {
    const { draft, model } = createModel()
    draft.value.homepage_steps.items = [{ title: 'Choose', description: 'Choose a product' }]

    const steps = model.sections.value.find(section => section.id === 'how-it-works')
    const blogNavigation = model.navigationItems.value.find(item => item.page === 'blog')

    expect(steps).toMatchObject({
      label: 'How it works',
      editable: true,
      hasContent: true,
    })
    expect(blogNavigation).toMatchObject({
      section: 'blog-content',
      disabled: true,
    })
  })
})
