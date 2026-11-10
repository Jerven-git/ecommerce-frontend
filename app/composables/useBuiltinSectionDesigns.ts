import { inject, type Ref } from 'vue'
import type { SiteConfig } from './useSiteConfig'
import { builtinSectionAttributes } from '~/utils/builtinSectionDesigns'
import { SITE_CONFIG_PREVIEW } from '~/utils/siteConfigPreview'

export function useBuiltinSectionDesigns(page: string, override?: Readonly<Ref<SiteConfig | null>>, editorPreview = false) {
  const source = override ?? useSiteConfig().siteConfig
  const preview = inject(SITE_CONFIG_PREVIEW, null)
  return (section: string) => !editorPreview && !preview && source.value?.is_storefront_host === false
    ? {}
    : builtinSectionAttributes(source.value, page, section)
}
