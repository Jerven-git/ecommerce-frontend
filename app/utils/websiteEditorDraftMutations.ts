import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'

export function withWebsiteEditorSupportedLocales(
  draft: WebsiteEditorDraftPayload,
  locales: string[],
  limit = 12,
): WebsiteEditorDraftPayload {
  const defaultLocale = draft.default_locale
  const supportedLocales = [defaultLocale, ...locales.filter(locale => locale !== defaultLocale)]
    .filter((locale, index, values) => values.indexOf(locale) === index)
    .slice(0, limit)
  const localizedContent = Object.fromEntries(
    Object.entries(draft.localized_content)
      .filter(([locale]) => supportedLocales.includes(locale) && locale !== defaultLocale),
  )

  return {
    ...draft,
    supported_locales: supportedLocales,
    localized_content: localizedContent,
  }
}
