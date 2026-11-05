import { ref, watch } from 'vue'
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

type RouteDocument = Pick<WebsiteEditorDraftPayload, 'default_locale' | 'supported_locales' | 'homepage_sections'>

export function resolveWebsiteEditorRoute(query: LocationQuery, document?: RouteDocument | null): WebsiteEditorRouteSelection {
  const requestedPage = typeof query.page === 'string' ? query.page : ''
  const page = WEBSITE_EDITOR_PAGES.some(option => option.id === requestedPage)
    ? requestedPage as WebsiteEditorPageId
    : 'home'
  const requestedSection = typeof query.section === 'string' ? query.section : ''
  let section = requestedSection || (page === 'home'
    ? 'hero'
    : WEBSITE_EDITOR_STATIC_SECTIONS[page][0]?.id ?? 'header')
  const requestedLocale = typeof query.locale === 'string' ? query.locale : ''

  if (document) {
    const available = page === 'home' ? document.homepage_sections : WEBSITE_EDITOR_STATIC_SECTIONS[page]
    if (!available.some(item => item.id === section)) section = available[0]?.id ?? (page === 'home' ? 'hero' : 'header')
  }
  const locale = document
    ? document.supported_locales.includes(requestedLocale) ? requestedLocale : document.default_locale
    : requestedLocale || 'en'
  return { page, section, locale }
}

interface WebsiteEditorRouteOptions {
  document?: () => RouteDocument | null
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

  // Back/forward and external query navigation must update the existing draft
  // workspace instead of remounting (and losing) its in-memory edits.
  watch(() => route.query, query => {
    if (typeof query.customPage === 'string' && query.customPage.trim()) return
    const next = resolveWebsiteEditorRoute(query, options.document?.())
    activePage.value = next.page
    selectedSection.value = next.section
    activeLocale.value = next.locale
  })

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
    activeLocale.value = typeof route.query.locale === 'string' && route.query.locale && payload.supported_locales.includes(activeLocale.value)
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
