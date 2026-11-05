export function isApexHostname(hostname: string, configuredBaseDomain: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '')
  const baseDomain = configuredBaseDomain.trim().toLowerCase().replace(/\.$/, '')

  if (!host || !baseDomain) return false

  return host === baseDomain || host === `www.${baseDomain}`
}
