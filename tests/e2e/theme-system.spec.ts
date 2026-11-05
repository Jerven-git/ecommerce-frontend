import { expect, test, type Locator, type Page } from '@playwright/test'

const hasAuthenticatedState = Boolean(process.env.SSU_E2E_STORAGE_STATE)
const allowThemeDrafts = process.env.SSU_E2E_ALLOW_THEME_DRAFTS === 'true'
const captureThemeVisuals = process.env.SSU_E2E_THEME_VISUALS === 'true'

const themes = [
  { id: 'classic', name: 'Classic' },
  { id: 'service-studio', name: 'Service Studio' },
  { id: 'informational-editorial', name: 'Informational Editorial' },
  { id: 'commerce-market', name: 'Commerce Market' },
] as const

async function waitForAppReady(page: Page) {
  const entryLoader = page.locator('[data-apex-entry-loader]')
  if (await entryLoader.count()) await entryLoader.waitFor({ state: 'hidden', timeout: 60_000 })
}

async function openEditor(page: Page) {
  await page.goto('/admin/website-editor')
  await waitForAppReady(page)
  await expect(page.getByRole('heading', { name: 'Website Editor' })).toBeVisible()
  await expect(page.frameLocator('iframe[title^="Private storefront"]').locator('[data-preview-ready="true"]')).toBeAttached({ timeout: 45_000 })
}

async function openThemeLibrary(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Open Theme Library' }).click()
  const library = page.getByRole('dialog', { name: 'Theme Library' })
  await expect(library).toBeVisible()
  await expect(library.getByRole('button', { name: 'Close Theme Library' })).toBeFocused()
  return library
}

function themeCard(library: Locator, name: string): Locator {
  return library.getByRole('button').filter({ hasText: name }).first()
}

async function previewTheme(page: Page, library: Locator, themeName: string) {
  const card = themeCard(library, themeName)
  await expect(card).toBeVisible()
  await card.click()
  await expect(card).toHaveAttribute('aria-pressed', 'true')
  await library.getByRole('button', { name: 'Preview with my content' }).click()
  await expect(library).toBeHidden()
  await expect(page.getByText(new RegExp(`Previewing .+ with your content`))).toBeVisible()
  await expect(page.frameLocator('iframe[title^="Private storefront"]').locator('[data-preview-ready="true"]')).toBeAttached({ timeout: 45_000 })
}

test.describe('trusted theme system', () => {
  test.skip(!hasAuthenticatedState, 'Set SSU_E2E_STORAGE_STATE to an authenticated disposable Store Admin session.')

  test('supports keyboard focus, filtering, selection, and a no-save preview', async ({ page }) => {
    await openEditor(page)
    let library = await openThemeLibrary(page)

    await library.getByRole('searchbox', { name: 'Search themes' }).fill('commerce')
    await expect(library.getByRole('status')).toContainText('1 theme shown.')
    await expect(themeCard(library, 'Commerce Market')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(library).toBeHidden()
    await expect(page.getByRole('button', { name: 'Open Theme Library' })).toBeFocused()

    library = await openThemeLibrary(page)
    await previewTheme(page, library, 'Commerce Market')
    await page.getByRole('button', { name: 'Exit theme preview' }).click()
    await expect(page.getByText(/Previewing .+ with your content/)).toBeHidden()
  })

  test('can preview Service Studio and then switch back to Classic without saving', async ({ page }) => {
    await openEditor(page)
    let library = await openThemeLibrary(page)
    await previewTheme(page, library, 'Service Studio')

    const preview = page.frameLocator('iframe[title^="Private storefront"]')
    await expect(preview.locator('.service-studio-shell')).toBeVisible()

    await page.getByRole('button', { name: 'Exit theme preview' }).click()
    library = await openThemeLibrary(page)
    await previewTheme(page, library, 'Classic')

    await expect(preview.locator('.service-studio-shell')).toHaveCount(0)
    await expect(preview.locator('header')).toBeVisible()
  })

  test('applies a reviewed blueprint only to the private draft and can discard it', async ({ page }) => {
    test.skip(!allowThemeDrafts, 'Set SSU_E2E_ALLOW_THEME_DRAFTS=true only for a disposable staging tenant.')
    await openEditor(page)
    const library = await openThemeLibrary(page)
    await themeCard(library, 'Commerce Market').click()
    await library.getByRole('button', { name: 'Review before applying' }).click()
    await expect(library.getByRole('heading', { name: 'Review blueprint' })).toBeVisible()
    await expect(library.getByText('Automatic module changes')).toBeVisible()
    await library.getByRole('button', { name: 'Apply to private draft' }).click()

    await expect(page.getByText('Theme blueprint applied to the private draft. Review the website, then publish when ready.')).toBeVisible()
    await page.getByRole('button', { name: 'Discard changes' }).click()
    const discardDialog = page.getByRole('dialog', { name: 'Discard private changes?' })
    await expect(discardDialog).toBeVisible()
    await discardDialog.getByRole('button', { name: 'Discard changes' }).click()
    await expect(page.getByText('Published website loaded')).toBeVisible()
  })

  test('captures approved real-content desktop and mobile baselines for every trusted theme', async ({ page }, testInfo) => {
    test.skip(!captureThemeVisuals, 'Set SSU_E2E_THEME_VISUALS=true only after the tenant content and screenshot review are approved.')
    await openEditor(page)

    for (const theme of themes) {
      const library = await openThemeLibrary(page)
      await previewTheme(page, library, theme.name)
      const frame = page.getByTitle(/Private storefront .* preview/)
      await expect(frame).toHaveScreenshot(`${theme.id}-home-${testInfo.project.name}.png`, {
        animations: 'disabled',
        caret: 'hide',
      })
      await page.getByRole('button', { name: 'Exit theme preview' }).click()
    }
  })
})
