import { ref } from 'vue'
import { useRoute, useRouter, type LocationQuery } from 'vue-router'
import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'
import {
  WEBSITE_EDITOR_PAGES,
  WEBSITE_EDITOR_STATIC_SECTIONS,
  type WebsiteEditorPageId,
} from '~/utils/websiteEditorPages'

export interface WebsiteEditorRouteSelection {
  page: WebsiteEditorPageId
  section: string
  locale: string
}

export function resolveWebsiteEditorRoute(query: LocationQuery): WebsiteEditorRouteSelection {
  const requestedPage = typeof query.page === 'string' ? query.page : ''
  const page = WEBSITE_EDITOR_PAGES.some(option => option.id === requestedPage)
    ? requestedPage as WebsiteEditorPageId
    : 'home'
  const requestedSection = typeof query.section === 'string' ? query.section : ''
  const section = requestedSection || (page === 'home'
    ? 'hero'
    : WEBSITE_EDITOR_STATIC_SECTIONS[page][0]?.id ?? 'header')
  const requestedLocale = typeof query.locale === 'string' ? query.locale : ''

  return { page, section, locale: requestedLocale || 'en' }
}

interface WebsiteEditorRouteOptions {
  route?: { query: LocationQuery }
  router?: { replace: (location: { query: LocationQuery }) => unknown }
}

export function useWebsiteEditorRoute(options: WebsiteEditorRouteOptions = {}) {
  const route = options.route ?? useRoute()
  const router = options.router ?? useRouter()
  const initial = resolveWebsiteEditorRoute(route.query)
  const activePage = ref<WebsiteEditorPageId>(initial.page)
  const selectedSection = ref(initial.section)
  const activeLocale = ref(initial.locale)

  function sync() {
    const routePage = typeof route.query.page === 'string' ? route.query.page : ''
    const routeSection = typeof route.query.section === 'string' ? route.query.section : ''
    const routeLocale = typeof route.query.locale === 'string' ? route.query.locale : ''
    if (routePage === activePage.value && routeSection === selectedSection.value && routeLocale === activeLocale.value) return

    void router.replace({
      query: {
        ...route.query,
        page: activePage.value,
        section: selectedSection.value,
        locale: activeLocale.value,
      },
    })
  }

  function selectSection(section: string) {
    selectedSection.value = section
    sync()
  }

  function selectPage(page: WebsiteEditorPageId, section: string) {
    activePage.value = page
    selectedSection.value = section
    sync()
  }

  function ensureActiveLocale(payload: Pick<WebsiteEditorDraftPayload, 'default_locale' | 'supported_locales'>) {
    activeLocale.value = payload.supported_locales.includes(activeLocale.value)
      ? activeLocale.value
      : payload.default_locale
  }

  return {
    activePage,
    selectedSection,
    activeLocale,
    sync,
    selectSection,
    selectPage,
    ensureActiveLocale,
  }
}
