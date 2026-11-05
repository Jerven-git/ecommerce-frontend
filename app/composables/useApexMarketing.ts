import { isApexHostname } from '~/utils/storefrontHost'

export function useApexMarketing() {
  const { siteConfig } = useSiteConfig()
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const requestUrl = useRequestURL()
  const configuredBaseDomain = String(runtimeConfig.public.storefrontBaseDomain || 'localhost')
  const resolvedFromApexHost = isApexHostname(requestUrl.hostname, configuredBaseDomain)

  return computed(() => route.path === '/'
    && (resolvedFromApexHost || siteConfig.value?.is_storefront_host === false))
}
