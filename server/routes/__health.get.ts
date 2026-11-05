export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  setResponseHeader(event, 'cache-control', 'no-store')

  return {
    status: 'ok',
    service: 'ssu-frontend',
    renderer: 'nuxt-ssr',
    deployment_mode: String(process.env.SSU_DEPLOYMENT_MODE || config.deploymentMode || 'runtime-ssr'),
    revision: String(process.env.SSU_BUILD_REVISION || config.buildRevision || 'unknown'),
    uptime_seconds: Math.floor(process.uptime()),
  }
})
