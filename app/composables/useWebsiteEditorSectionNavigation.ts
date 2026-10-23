import { nextTick, type Ref } from 'vue'
import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'
import {
  WEBSITE_EDITOR_STATIC_SECTIONS,
  type WebsiteEditorNavigationItem,
  type WebsiteEditorPageId,
} from '~/utils/websiteEditorPages'

interface WebsiteEditorSectionNavigationOptions {
  draft: Ref<WebsiteEditorDraftPayload | null>
  workingDraft: Readonly<Ref<WebsiteEditorDraftPayload | null>>
  selectedVersionId: Readonly<Ref<number | null>>
  localeIsDefault: Readonly<Ref<boolean>>
  activePage: Readonly<Ref<WebsiteEditorPageId>>
  selectedSection: Ref<string>
  selectRouteSection: (section: string) => void
  selectRoutePage: (page: WebsiteEditorPageId, section: string) => void
  selectPreviewPage: (page: WebsiteEditorPageId) => void
  selectPreviewSection: (section: string) => void
}

export function useWebsiteEditorSectionNavigation(options: WebsiteEditorSectionNavigationOptions) {
  function canComposeHomepage() {
    return Boolean(
      options.draft.value
      && !options.selectedVersionId.value
      && options.localeIsDefault.value
      && options.activePage.value === 'home',
    )
  }

  function selectSection(section: string) {
    options.selectRouteSection(section)
    options.selectPreviewSection(section)
  }

  function moveSection(index: number, direction: -1 | 1) {
    if (!canComposeHomepage() || !options.draft.value) return
    const destination = index + direction
    if (destination < 0 || destination >= options.draft.value.homepage_sections.length) return

    const next = [...options.draft.value.homepage_sections]
    const [moved] = next.splice(index, 1)
    if (!moved) return

    next.splice(destination, 0, moved)
    options.draft.value = { ...options.draft.value, homepage_sections: next }
    nextTick(() => selectSection(moved.id))
  }

  function toggleSection(index: number) {
    if (!canComposeHomepage() || !options.draft.value) return
    const next = options.draft.value.homepage_sections.map((section, sectionIndex) => sectionIndex === index
      ? { ...section, visible: !section.visible }
      : section)

    options.draft.value = { ...options.draft.value, homepage_sections: next }
    const changed = next[index]
    if (changed) nextTick(() => selectSection(changed.id))
  }

  function ensureSelectedSection(payload: WebsiteEditorDraftPayload) {
    if (options.activePage.value === 'home') {
      const sectionExists = payload.homepage_sections.some(section => section.id === options.selectedSection.value)
      if (!sectionExists) options.selectedSection.value = payload.homepage_sections[0]?.id ?? 'hero'
      return
    }

    const availableSections = WEBSITE_EDITOR_STATIC_SECTIONS[options.activePage.value]
    const sectionExists = availableSections.some(section => section.id === options.selectedSection.value)
    if (!sectionExists) options.selectedSection.value = availableSections[0]?.id ?? 'header'
  }

  function switchPage(page: WebsiteEditorPageId, section?: string) {
    const firstSection = page === 'home'
      ? options.workingDraft.value?.homepage_sections[0]?.id ?? 'hero'
      : WEBSITE_EDITOR_STATIC_SECTIONS[page][0]?.id ?? 'header'

    options.selectRoutePage(page, section ?? firstSection)
    options.selectPreviewPage(page)
    nextTick(() => selectSection(options.selectedSection.value))
  }

  function navigateFromNavigator(item: WebsiteEditorNavigationItem) {
    switchPage(item.page, item.section)
  }

  return {
    moveSection,
    toggleSection,
    ensureSelectedSection,
    selectSection,
    switchPage,
    navigateFromNavigator,
  }
}
