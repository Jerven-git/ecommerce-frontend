import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  frontendThemeManifests,
  reportThemeFallback,
  resetReportedThemeFallbacksForTesting,
  resolveThemeRegistration,
  themePageFrameComponent,
  themeRegistry,
  themeShellComponent,
} from '~/themes/registry'
import { PUBLIC_PAGE_KINDS, THEME_IDS } from '~/themes/contracts'

const backendRegistryPath = fileURLToPath(new URL('../../../ssu-backend/app/Support/WebsiteEditor/WebsiteThemeRegistry.php', import.meta.url))
const backendRegistrySource = readFileSync(backendRegistryPath, 'utf8')

function backendDefinitionIds(): string[] {
  return [...backendRegistrySource.matchAll(/^ {12}'([^']+)' => \[$/gm)].map(match => match[1]!)
}

function backendDefinition(themeId: string): string {
  const definitions = [...backendRegistrySource.matchAll(/^ {12}'([^']+)' => \[$/gm)]
  const definitionIndex = definitions.findIndex(match => match[1] === themeId)
  const start = definitions[definitionIndex]?.index ?? -1
  const end = definitions[definitionIndex + 1]?.index

  return start === -1 ? '' : backendRegistrySource.slice(start, end)
}

function backendPublicPageKinds(): string[] {
  const match = backendRegistrySource.match(/private const PUBLIC_PAGE_KINDS = \[([\s\S]*?)\n    \];/)
  return [...(match?.[1] ?? '').matchAll(/'([^']+)'/g)].map(value => value[1]!)
}

afterEach(() => {
  resetReportedThemeFallbacksForTesting()
  vi.restoreAllMocks()
})

describe('storefront theme registry', () => {
  it('keeps frontend IDs, versions, availability, and Classic page coverage synchronized with the backend registry', () => {
    expect(backendDefinitionIds()).toEqual([...THEME_IDS])
    expect(backendRegistrySource).toContain("public const DEFAULT_VERSION = '1.0.0';")

    for (const manifest of frontendThemeManifests) {
      const definition = backendDefinition(manifest.id)
      expect(definition).toContain("'version' => self::DEFAULT_VERSION")
      expect(definition).toContain(`'available' => ${manifest.available ? 'true' : 'false'}`)
    }

    expect(backendPublicPageKinds()).toEqual([...PUBLIC_PAGE_KINDS])
    expect(themeRegistry.classic.manifest.supportedPages).toEqual(PUBLIC_PAGE_KINDS)
    expect(themeRegistry['service-studio'].manifest.supportedPages).toEqual(PUBLIC_PAGE_KINDS)
    expect(themeRegistry['informational-editorial'].manifest.supportedPages).toEqual(PUBLIC_PAGE_KINDS)
    expect(themeRegistry['commerce-market'].manifest.supportedPages).toEqual(PUBLIC_PAGE_KINDS)
  })

  it('resolves the available Classic renderer without a fallback', () => {
    const resolution = resolveThemeRegistration({ id: 'classic', version: '1.0.0' })

    expect(resolution.registration.manifest.id).toBe('classic')
    expect(resolution.registration.renderer).not.toBeNull()
    expect(resolution.fallbackReason).toBeNull()
  })

  it('resolves Service Studio across every public page kind', () => {
    const resolution = resolveThemeRegistration({ id: 'service-studio', version: '1.0.0' })

    expect(resolution.registration.manifest.available).toBe(true)
    expect(resolution.registration.manifest.supportedPages).toEqual(PUBLIC_PAGE_KINDS)
    expect(resolution.registration.renderer).not.toBeNull()
    expect(resolution.fallbackReason).toBeNull()
  })

  it('resolves Informational Editorial across every public page kind', () => {
    const resolution = resolveThemeRegistration({ id: 'informational-editorial', version: '1.0.0' })

    expect(resolution.registration.manifest.available).toBe(true)
    expect(resolution.registration.manifest.supportedPages).toEqual(PUBLIC_PAGE_KINDS)
    expect(resolution.registration.renderer).not.toBeNull()
    expect(resolution.fallbackReason).toBeNull()
  })

  it('resolves Commerce Market across every public page kind', () => {
    const resolution = resolveThemeRegistration({ id: 'commerce-market', version: '1.0.0' })

    expect(resolution.registration.manifest.available).toBe(true)
    expect(resolution.registration.manifest.supportedPages).toEqual(PUBLIC_PAGE_KINDS)
    expect(resolution.registration.renderer).not.toBeNull()
    expect(resolution.fallbackReason).toBeNull()
  })

  it('reuses stable lazy renderer components across reactive draft updates', () => {
    expect(themeShellComponent(themeRegistry.classic)).toBe(themeShellComponent(themeRegistry.classic))
    expect(themePageFrameComponent(themeRegistry.classic)).toBe(themePageFrameComponent(themeRegistry.classic))
  })

  it.each([
    [{ id: 'missing-theme', version: '1.0.0' }, 'unknown-theme'],
    [{ id: 'classic', version: '2.0.0' }, 'unsupported-version'],
  ] as const)('fails safely to Classic for %o', (reference, reason) => {
    const resolution = resolveThemeRegistration(reference)

    expect(resolution.registration.manifest.id).toBe('classic')
    expect(resolution.fallbackReason).toBe(reason)
  })

  it('emits one operational warning per invalid theme reference', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const resolution = resolveThemeRegistration({ id: 'missing-theme', version: '1.0.0' })

    reportThemeFallback(resolution)
    reportThemeFallback(resolution)

    expect(warning).toHaveBeenCalledTimes(1)
    expect(warning).toHaveBeenCalledWith(
      '[storefront-theme] Falling back to classic.',
      expect.objectContaining({
        requestedThemeId: 'missing-theme',
        requestedThemeVersion: '1.0.0',
        reason: 'unknown-theme',
      }),
    )
  })
})

