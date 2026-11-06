import type { InjectionKey, Ref } from 'vue'
import type { SiteConfig } from '~/composables/useSiteConfig'

// Scoped to the preview subtree; background requests still own the normal cache.
export const SITE_CONFIG_PREVIEW: InjectionKey<Ref<SiteConfig | null>> = Symbol('site-config-preview')
