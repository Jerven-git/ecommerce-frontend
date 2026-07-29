import { isNonIndexablePath, isSeoIndexingEnabled } from '~/utils/seo'

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const path = getRequestURL(event).pathname
  const indexingEnabled = isSeoIndexingEnabled(runtimeConfig.public.seoIndexingEnabled)

  // Any future response cache must separate tenants by the incoming host.
  appendResponseHeader(event, 'vary', 'Host')

  if (!indexingEnabled || isNonIndexablePath(path)) {
    setResponseHeader(event, 'x-robots-tag', 'noindex, nofollow, noarchive')
  }
})
