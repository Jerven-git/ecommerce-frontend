import { computed, type Ref } from 'vue'
import { resolveNavigationPages } from '~/utils/websiteNavigation'
import type { HomepageSectionId, SiteConfig } from '~/composables/useSiteConfig'
import { normalizeWebsiteEditorDraft, type WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'
import { HOMEPAGE_SECTION_LABELS } from '~/utils/homepageSections'
import { applyWebsiteEditorLocale, websiteEditorLocaleName, websiteEditorLocaleProgress } from '~/utils/websiteEditorLocalization'
import { websiteEditorChangedAreas, websiteEditorReadinessWarnings, type WebsiteEditorReadinessWarning } from '~/utils/websiteEditorPublishing'
import {
  WEBSITE_EDITOR_PAGES,
  WEBSITE_EDITOR_STATIC_SECTIONS,
  websiteEditorPage,
  type WebsiteEditorNavigationItem,
  type WebsiteEditorPageId,
} from '~/utils/websiteEditorPages'

interface WebsiteEditorContentModelOptions {
  siteConfig: Readonly<Ref<SiteConfig | null>>
  draft: Readonly<Ref<WebsiteEditorDraftPayload | null>>
  versionPreview: Readonly<Ref<WebsiteEditorDraftPayload | null>>
  activeLocale: Readonly<Ref<string>>
  activePage: Readonly<Ref<WebsiteEditorPageId>>
  navigationPages?: Readonly<Ref<readonly { uuid: string; path: string }[]>>
}

const sectionMeta: Record<HomepageSectionId, { icon: string; editable: boolean }> = {
  hero: { icon: 'heroicons:photo', editable: true },
  'featured-products': { icon: 'heroicons:cube', editable: false },
  showcase: { icon: 'heroicons:squares-2x2', editable: false },
  'watch-shop': { icon: 'heroicons:play-circle', editable: false },
  'best-sellers': { icon: 'heroicons:fire', editable: false },
  'how-it-works': { icon: 'heroicons:list-bullet', editable: true },
  features: { icon: 'heroicons:sparkles', editable: true },
  stats: { icon: 'heroicons:chart-bar', editable: true },
  statement: { icon: 'heroicons:chat-bubble-bottom-center-text', editable: true },
  newsletter: { icon: 'heroicons:envelope', editable: true },
}

function hasContent(value: unknown) {
  if (!value || typeof value !== 'object') return false
  return Object.values(value as Record<string, unknown>).some(entry => Array.isArray(entry)
    ? entry.length > 0
    : (typeof entry === 'string' ? entry.trim().length > 0 : Boolean(entry)))
}

export function useWebsiteEditorContentModel(options: WebsiteEditorContentModelOptions) {
  const canonicalWorkingDraft = computed(() => options.versionPreview.value ?? options.draft.value)
  const workingDraft = computed(() => canonicalWorkingDraft.value
    ? applyWebsiteEditorLocale(canonicalWorkingDraft.value, options.activeLocale.value)
    : null)
  const localeIsDefault = computed(() => options.activeLocale.value === canonicalWorkingDraft.value?.default_locale)
  const activeLocaleName = computed(() => websiteEditorLocaleName(options.activeLocale.value))
  const activePageOption = computed(() => websiteEditorPage(options.activePage.value))

  const previewConfig = computed<SiteConfig | null>(() => {
    if (!options.siteConfig.value || !workingDraft.value) return options.siteConfig.value
    return {
      ...options.siteConfig.value,
      ...workingDraft.value,
      navigation: resolveNavigationPages(workingDraft.value.navigation, options.navigationPages?.value ?? []),
      locale: options.activeLocale.value,
      homepage_statement: {
        ...workingDraft.value.homepage_statement,
        image_url: workingDraft.value.homepage_statement_image_url,
      },
      story_page: {
        ...workingDraft.value.story_page,
        section_a: {
          ...workingDraft.value.story_page.section_a,
          image_url: workingDraft.value.story_image_a_url,
        },
        section_b: {
          ...workingDraft.value.story_page.section_b,
          image_url: workingDraft.value.story_image_b_url,
        },
      },
    }
  })

  function isPageDisabled(pageId: WebsiteEditorPageId) {
    const page = websiteEditorPage(pageId)
    if (pageId === 'story') return workingDraft.value?.story_page.enabled !== true
    if (pageId === 'popup') return workingDraft.value?.welcome_popup_enabled !== true
    return page.module ? previewConfig.value?.modules_enabled?.[page.module] === false : false
  }

  const activePageDisabled = computed(() => isPageDisabled(options.activePage.value))
  const pagePickerOptions = computed(() => WEBSITE_EDITOR_PAGES.map(page => ({
    ...page,
    storefrontDisabled: isPageDisabled(page.id),
  })))

  function homepageSectionHasContent(id: HomepageSectionId) {
    const config = previewConfig.value
    if (!config) return false
    if (id === 'hero' || id === 'featured-products') return true
    if (id === 'showcase') return Boolean(config.homepage_showcase?.enabled)
    if (id === 'watch-shop') return Boolean(config.homepage_watch_shop?.enabled && config.homepage_watch_shop.cards?.length)
    if (id === 'best-sellers') return Boolean(config.homepage_best_sellers?.enabled && config.homepage_best_sellers.products?.length)
    if (id === 'how-it-works') return hasContent(workingDraft.value?.homepage_steps)
    if (id === 'features') return hasContent(workingDraft.value?.homepage_features)
    if (id === 'stats') return hasContent(workingDraft.value?.homepage_stats)
    if (id === 'statement') return Boolean(workingDraft.value?.homepage_statement.enabled && workingDraft.value.homepage_statement.quote)
    if (id === 'newsletter') return hasContent(workingDraft.value?.homepage_newsletter)
    return false
  }

  function staticSectionHasContent(section: string) {
    const value = workingDraft.value
    if (!value) return false
    if (section === 'brand-assets') return Boolean(
      value.logo_url
      || value.favicon_url
      || value.cart_icon_url
      || value.footer_logo_url
      || value.logo_alt_text.trim(),
    )
    if (section === 'store-details') return Boolean(
      value.site_name.trim()
      || value.contact_email.trim()
      || value.contact_phone.trim()
      || value.contact_entries.length,
    )
    if (section === 'social-media') return value.social_links.length > 0
    if (section === 'header') return value.navigation.some(item => item.visible) || (value.header_cta.enabled && Boolean(value.header_cta.label))
    if (section === 'footer-banner') return value.footer_banner.enabled && Boolean(value.footer_banner.heading)
    if (section === 'footer') return hasContent(value.footer)
    if (section === 'about-content') return Boolean(value.about_image_url || value.about_content.trim() || value.about_highlights.items.length)
    if (section === 'story-content') return value.story_page.enabled && Boolean(hasContent(value.story_page.hero) || value.story_image_a_url || value.story_image_b_url)
    if (section === 'contact-content') return Boolean(value.contact_image_url || hasContent(value.contact_page))
    if (section === 'shop-content') return hasContent(value.shop_header) || hasContent(value.shop_promo)
    if (section === 'blog-content') return Boolean(value.blog_image_url || hasContent(value.blog_page.header))
    if (section === 'services-content') return Boolean(value.services_image_url || hasContent(value.services_page.header))
    if (section === 'welcome-popup') return value.welcome_popup_enabled && Boolean(value.welcome_popup_heading)
    return false
  }

  const sections = computed(() => {
    if (options.activePage.value === 'home') {
      return (workingDraft.value?.homepage_sections ?? []).map(section => ({
        ...section,
        label: HOMEPAGE_SECTION_LABELS[section.id],
        icon: sectionMeta[section.id].icon,
        editable: sectionMeta[section.id].editable,
        hasContent: homepageSectionHasContent(section.id),
      }))
    }

    return WEBSITE_EDITOR_STATIC_SECTIONS[options.activePage.value].map(section => ({
      ...section,
      visible: !isPageDisabled(options.activePage.value),
      editable: true,
      hasContent: staticSectionHasContent(section.id),
    }))
  })

  const navigationItems = computed<WebsiteEditorNavigationItem[]>(() => WEBSITE_EDITOR_PAGES.flatMap(page => {
    const pageSections = page.id === 'home'
      ? (workingDraft.value?.homepage_sections ?? []).map(section => ({
          id: section.id,
          label: HOMEPAGE_SECTION_LABELS[section.id],
          icon: sectionMeta[section.id].icon,
        }))
      : WEBSITE_EDITOR_STATIC_SECTIONS[page.id]

    return pageSections.map(section => ({
      page: page.id,
      pageLabel: page.label,
      section: section.id,
      sectionLabel: section.label,
      icon: section.icon,
      disabled: isPageDisabled(page.id),
    }))
  }))

  const publishedDraft = computed(() => options.siteConfig.value
    ? normalizeWebsiteEditorDraft(options.siteConfig.value)
    : null)
  const publishChangedAreas = computed(() => publishedDraft.value && options.draft.value
    ? websiteEditorChangedAreas(publishedDraft.value, options.draft.value)
    : [])
  const publishWarnings = computed<WebsiteEditorReadinessWarning[]>(() => {
    if (!options.draft.value) return []
    const warnings = websiteEditorReadinessWarnings(options.draft.value)
    for (const locale of options.draft.value.supported_locales) {
      if (locale === options.draft.value.default_locale) continue
      const progress = websiteEditorLocaleProgress(options.draft.value, locale)
      if (progress.percent < 100) warnings.push({
        id: `locale-${locale}`,
        label: `${websiteEditorLocaleName(locale)} is ${progress.percent}% translated`,
        detail: `${progress.total - progress.translated} text fields will use default-language content.`,
        page: 'global',
        section: 'store-details',
      })
    }
    return warnings
  })

  return {
    workingDraft,
    localeIsDefault,
    activeLocaleName,
    activePageOption,
    activePageDisabled,
    previewConfig,
    pagePickerOptions,
    sections,
    navigationItems,
    publishChangedAreas,
    publishWarnings,
  }
}
