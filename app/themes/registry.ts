import { defineAsyncComponent } from 'vue'
import type { ThemeLayoutReference } from '~/composables/useSiteConfig'
import { classicThemeManifest } from '~/themes/classic/manifest'
import { commerceMarketThemeManifest } from '~/themes/commerce-market/manifest'
import { informationalEditorialThemeManifest } from '~/themes/informational-editorial/manifest'
import { serviceStudioThemeManifest } from '~/themes/service-studio/manifest'
import type {
  ResolvedThemeRegistration,
  ThemeFallbackReason,
  ThemeId,
  ThemeRegistration,
} from '~/themes/contracts'

export const DEFAULT_THEME_REFERENCE = Object.freeze({
  id: 'classic',
  version: '1.0.0',
}) satisfies ThemeLayoutReference

const classicRenderer = {
  shell: defineAsyncComponent(() => import('~/themes/classic/ClassicShell.vue')),
  pageFrame: defineAsyncComponent(() => import('~/themes/classic/ClassicPageFrame.vue')),
}

const serviceStudioRenderer = {
  shell: defineAsyncComponent(() => import('~/themes/service-studio/ServiceStudioShell.vue')),
  pageFrame: defineAsyncComponent(() => import('~/themes/service-studio/ServiceStudioPageFrame.vue')),
}

const informationalEditorialRenderer = {
  shell: defineAsyncComponent(() => import('~/themes/informational-editorial/InformationalEditorialShell.vue')),
  pageFrame: defineAsyncComponent(() => import('~/themes/informational-editorial/InformationalEditorialPageFrame.vue')),
}

const commerceMarketRenderer = {
  shell: defineAsyncComponent(() => import('~/themes/commerce-market/CommerceMarketShell.vue')),
  pageFrame: defineAsyncComponent(() => import('~/themes/commerce-market/CommerceMarketPageFrame.vue')),
}

export const themeRegistry = {
  classic: {
    manifest: classicThemeManifest,
    renderer: classicRenderer,
  },
  'service-studio': {
    manifest: serviceStudioThemeManifest,
    renderer: serviceStudioRenderer,
  },
  'informational-editorial': {
    manifest: informationalEditorialThemeManifest,
    renderer: informationalEditorialRenderer,
  },
  'commerce-market': {
    manifest: commerceMarketThemeManifest,
    renderer: commerceMarketRenderer,
  },
} as const satisfies Record<ThemeId, ThemeRegistration>

export const frontendThemeManifests = Object.values(themeRegistry).map(registration => registration.manifest)

function requestedThemeReference(reference?: ThemeLayoutReference | null): ThemeLayoutReference {
  if (!reference) return DEFAULT_THEME_REFERENCE

  return {
    id: typeof reference.id === 'string' ? reference.id : '',
    version: typeof reference.version === 'string' ? reference.version : '',
  }
}

export function resolveThemeRegistration(reference?: ThemeLayoutReference | null): ResolvedThemeRegistration {
  const requested = requestedThemeReference(reference)
  const candidate = themeRegistry[requested.id as ThemeId] as ThemeRegistration | undefined
  let fallbackReason: ThemeFallbackReason | null = null

  if (!candidate) fallbackReason = 'unknown-theme'
  else if (candidate.manifest.version !== requested.version) fallbackReason = 'unsupported-version'
  else if (!candidate.manifest.available) fallbackReason = 'unavailable-theme'
  else if (!candidate.renderer) fallbackReason = 'missing-renderer'

  return {
    registration: fallbackReason ? themeRegistry.classic : candidate!,
    requested,
    fallbackReason,
  }
}

const reportedFallbacks = new Set<string>()

export function reportThemeFallback(resolution: ResolvedThemeRegistration): void {
  if (!resolution.fallbackReason) return

  const warningKey = `${resolution.requested.id}@${resolution.requested.version}:${resolution.fallbackReason}`
  if (reportedFallbacks.has(warningKey)) return
  reportedFallbacks.add(warningKey)

  console.warn('[storefront-theme] Falling back to classic.', {
    requestedThemeId: resolution.requested.id,
    requestedThemeVersion: resolution.requested.version,
    reason: resolution.fallbackReason,
  })
}

export function themeShellComponent(registration: ThemeRegistration) {
  return registration.renderer?.shell ?? themeRegistry.classic.renderer.shell
}

export function themePageFrameComponent(registration: ThemeRegistration) {
  return registration.renderer?.pageFrame ?? themeRegistry.classic.renderer.pageFrame
}

export function resetReportedThemeFallbacksForTesting(): void {
  reportedFallbacks.clear()
}

