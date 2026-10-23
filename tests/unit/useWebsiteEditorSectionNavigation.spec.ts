import { nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { SiteConfig } from '~/composables/useSiteConfig'
import { normalizeWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'
import { useWebsiteEditorSectionNavigation } from '~/composables/useWebsiteEditorSectionNavigation'
import type { WebsiteEditorPageId } from '~/utils/websiteEditorPages'

function editorDraft() {
  return normalizeWebsiteEditorDraft({
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
  } as SiteConfig)
}

function createNavigation() {
  const draft = ref(editorDraft())
  const activePage = ref<WebsiteEditorPageId>('home')
  const selectedSection = ref('hero')
  const selectedVersionId = ref<number | null>(null)
  const localeIsDefault = ref(true)
  const selectRouteSection = vi.fn((section: string) => { selectedSection.value = section })
  const selectRoutePage = vi.fn((page: WebsiteEditorPageId, section: string) => {
    activePage.value = page
    selectedSection.value = section
  })
  const selectPreviewPage = vi.fn()
  const selectPreviewSection = vi.fn()
  const navigation = useWebsiteEditorSectionNavigation({
    draft,
    workingDraft: draft,
    selectedVersionId,
    localeIsDefault,
    activePage,
    selectedSection,
    selectRouteSection,
    selectRoutePage,
    selectPreviewPage,
    selectPreviewSection,
  })

  return {
    activePage,
    draft,
    localeIsDefault,
    navigation,
    selectedSection,
    selectedVersionId,
    selectPreviewPage,
    selectPreviewSection,
    selectRoutePage,
  }
}

describe('useWebsiteEditorSectionNavigation', () => {
  it('reorders homepage sections immutably and keeps the moved section selected', async () => {
    const { draft, navigation, selectedSection, selectPreviewSection } = createNavigation()
    const originalSections = draft.value.homepage_sections
    const movedId = originalSections[0]!.id

    navigation.moveSection(0, 1)
    await nextTick()

    expect(draft.value.homepage_sections).not.toBe(originalSections)
    expect(draft.value.homepage_sections[1]?.id).toBe(movedId)
    expect(selectedSection.value).toBe(movedId)
    expect(selectPreviewSection).toHaveBeenLastCalledWith(movedId)
  })

  it('toggles homepage visibility without mutating the previous section array', async () => {
    const { draft, navigation } = createNavigation()
    const originalSections = draft.value.homepage_sections
    const originalVisibility = originalSections[0]!.visible

    navigation.toggleSection(0)
    await nextTick()

    expect(draft.value.homepage_sections).not.toBe(originalSections)
    expect(originalSections[0]!.visible).toBe(originalVisibility)
    expect(draft.value.homepage_sections[0]!.visible).toBe(!originalVisibility)
  })

  it('blocks homepage composition for localized and historical previews', () => {
    const { draft, localeIsDefault, navigation, selectedVersionId } = createNavigation()
    const originalSections = draft.value.homepage_sections

    localeIsDefault.value = false
    navigation.moveSection(0, 1)
    expect(draft.value.homepage_sections).toBe(originalSections)

    localeIsDefault.value = true
    selectedVersionId.value = 17
    navigation.toggleSection(0)
    expect(draft.value.homepage_sections).toBe(originalSections)
  })

  it('synchronizes route and private preview when switching pages', async () => {
    const {
      navigation,
      selectedSection,
      selectPreviewPage,
      selectPreviewSection,
      selectRoutePage,
    } = createNavigation()

    navigation.switchPage('blog')
    await nextTick()

    expect(selectRoutePage).toHaveBeenCalledWith('blog', 'blog-content')
    expect(selectPreviewPage).toHaveBeenCalledWith('blog')
    expect(selectedSection.value).toBe('blog-content')
    expect(selectPreviewSection).toHaveBeenLastCalledWith('blog-content')
  })

  it('repairs an unavailable selection using the active page contract', () => {
    const { activePage, navigation, selectedSection } = createNavigation()
    activePage.value = 'story'
    selectedSection.value = 'missing-section'

    navigation.ensureSelectedSection(editorDraft())

    expect(selectedSection.value).toBe('story-content')
  })
})
