import { expect, test, type Page } from '@playwright/test'

const hasAuthenticatedState = Boolean(process.env.SSU_E2E_STORAGE_STATE)
const allowPublish = process.env.SSU_E2E_ALLOW_PUBLISH === 'true'

async function waitForAppReady(page: Page) {
  const entryLoader = page.locator('[data-apex-entry-loader]')
  if (await entryLoader.count()) await entryLoader.waitFor({ state: 'hidden', timeout: 60_000 })
}

async function openEditor(page: Page) {
  const previewCloneErrors: string[] = []
  page.on('pageerror', (error) => {
    if (error.name === 'DataCloneError' || error.message.includes('could not be cloned')) previewCloneErrors.push(error.message)
  })

  await page.goto('/admin/website-editor')
  await waitForAppReady(page)
  await expect(page.getByRole('heading', { name: 'Website Editor' })).toBeVisible()
  await expect(page.locator('[data-admin-immersive-shell]')).toBeVisible()
  await expect(page.locator('[data-admin-standard-shell]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /(?:Open|Show) help/ })).toHaveCount(0)
  const preview = page.getByTitle(/Private storefront .* preview/)
  await expect(preview).toBeVisible()
  await expect(preview).toHaveAttribute('src', /\/admin\/storefront-preview\?version=/)
  await expect(page.frameLocator('iframe[title^="Private storefront"]').locator('[data-preview-ready="true"]')).toBeAttached({ timeout: 45_000 })
  await expect(page.getByText('Preview did not load')).toBeHidden()
  await expect(page.getByText(/Private draft preview|Historical version/)).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Website editor controls' })).toBeHidden()
  await expect(page.getByRole('button', { name: 'Discard changes' })).toHaveAttribute('title', 'Discard changes')
  await expect(page.getByRole('button', { name: 'Save draft' })).toHaveAttribute('title', 'Save draft')
  await expect(page.getByRole('button', { name: 'Publish' })).toHaveAttribute('title', 'Publish')
  await expect(page.getByRole('link', { name: 'Open live store' })).toHaveAttribute('title', 'Open live store')
  expect(previewCloneErrors).toEqual([])
}

async function openEditorControls(page: Page) {
  const isDocked = (page.viewportSize()?.width ?? 0) >= 1280
  const controlsButton = page.getByRole('button', {
    name: isDocked ? 'Show editor sidebar' : 'Open sections panel',
  })
  await expect(controlsButton).toBeVisible({ timeout: 30_000 })
  await controlsButton.click()
  await expect(page.getByRole('complementary', { name: 'Website editor controls' })).toBeVisible()
}

test.describe('Store Admin website editor', () => {
  test.skip(!hasAuthenticatedState, 'Set SSU_E2E_STORAGE_STATE to an authenticated disposable Store Admin session.')

  test('switches real storefront pages without losing local edits', async ({ page }) => {
    await openEditor(page)
    await openEditorControls(page)

    const heading = page.getByLabel('Heading').first()
    const original = await heading.inputValue()
    await heading.fill(`${original} preview check`)
    await expect(page.getByText('Unsaved preview changes')).toBeVisible()

    const closePanel = page.getByRole('button', { name: 'Close sections panel' })
    if (await closePanel.isVisible()) await closePanel.click()

    const pagePicker = page.getByRole('button', { name: /Preview page:/ })
    await pagePicker.click()
    await page.getByRole('option', { name: /^About(?: Disabled on storefront)?$/ }).click()
    await expect(page.getByTitle('Private storefront about preview')).toBeVisible()
    await pagePicker.click()
    await page.getByRole('option', { name: 'Home page', exact: true }).click()
    await expect(heading).toHaveValue(`${original} preview check`)

    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z')
    await expect(heading).toHaveValue(original)
  })

  test('supports desktop, tablet, and mobile preview controls', async ({ page }) => {
    await openEditor(page)

    const frame = page.getByTitle(/Private storefront .* preview/)
    const workspace = page.getByRole('region', { name: 'Storefront preview workspace' })
    const sidebar = page.getByRole('complementary', { name: 'Website editor controls' })
    if ((page.viewportSize()?.width ?? 0) >= 1280) {
      const widthBeforeOpen = (await workspace.boundingBox())!.width
      await page.getByRole('button', { name: 'Show editor sidebar' }).click()
      await expect(sidebar).toBeVisible()
      await expect.poll(async () => (await workspace.boundingBox())!.width).toBeLessThan(widthBeforeOpen)
      await page.getByRole('button', { name: 'Hide editor sidebar' }).first().click()
      await expect(sidebar).toBeHidden()
      await expect.poll(async () => (await workspace.boundingBox())!.width).toBeGreaterThanOrEqual(widthBeforeOpen)
    } else {
      await page.getByRole('button', { name: 'Open sections panel' }).click()
      await expect(sidebar).toBeVisible()
      await page.getByRole('button', { name: 'Close sections panel' }).click()
    }

    await page.getByRole('button', { name: 'Mobile preview' }).click()
    await expect(page.getByRole('button', { name: 'Mobile preview' })).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => frame.evaluate(element => element.parentElement!.style.width)).toBe('390px')

    await page.getByRole('button', { name: 'Tablet preview' }).click()
    await expect.poll(() => frame.evaluate(element => element.parentElement!.style.width)).toBe('768px')

    await page.getByRole('button', { name: 'Desktop preview' }).click()
    await expect(page.getByRole('button', { name: 'Desktop preview' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('survives a hard refresh without leaving viewport dead space', async ({ page }) => {
    await openEditor(page)
    await page.reload()
    await waitForAppReady(page)

    await expect(page.getByRole('heading', { name: 'Website Editor' })).toBeVisible()
    await expect(page.frameLocator('iframe[title^="Private storefront"]').locator('[data-preview-ready="true"]')).toBeAttached({ timeout: 45_000 })
    await expect(page.getByText('Preview did not load')).toBeHidden()

    await openEditorControls(page)

    const viewportFit = await page.locator('[data-website-editor-shell]').evaluate((element) => {
      const editorBounds = element.getBoundingClientRect()
      const immersiveBounds = element.closest<HTMLElement>('[data-admin-immersive-shell]')!.getBoundingClientRect()
      return {
        editorTop: editorBounds.top,
        editorBottomGap: immersiveBounds.bottom - editorBounds.bottom,
        shellBottomGap: window.innerHeight - immersiveBounds.bottom,
        documentOverflow: document.documentElement.scrollHeight - window.innerHeight,
      }
    })

    expect(viewportFit.editorTop).toBeGreaterThanOrEqual(0)
    expect(Math.abs(viewportFit.editorBottomGap)).toBeLessThanOrEqual(1)
    expect(Math.abs(viewportFit.shellBottomGap)).toBeLessThanOrEqual(1)
    expect(viewportFit.documentOverflow).toBeLessThanOrEqual(1)
  })

  test('keeps visual page content in Website Editor instead of Site Settings', async ({ page }) => {
    await page.goto('/admin/settings?tab=pages&sub=about')
    await waitForAppReady(page)
    await expect(page.getByRole('heading', { name: 'Site Settings' })).toBeVisible()
    await expect(page.locator('#editorAboutImageInput')).toHaveCount(0)

    const editorLink = page.locator('a[href*="/admin/website-editor"][href*="section=about-content"]')
    await expect(editorLink).toBeVisible()
    if ((page.viewportSize()?.width ?? 0) < 1024) {
      const collapseNavigation = page.getByRole('button', { name: 'Collapse sidebar' })
      if (await collapseNavigation.isVisible()) await collapseNavigation.click()
    }
    await editorLink.click()

    await expect(page).toHaveURL(/\/admin\/website-editor\?.*page=about.*section=about-content/)
    await expect(page.getByRole('heading', { name: 'Website Editor' })).toBeVisible()
    await openEditorControls(page)
    await expect(page.getByText('About cover image', { exact: true })).toBeVisible()
  })

  test('preloads the private draft from Site Settings and paints an editor loading screen', async ({ page }) => {
    let draftRequested = false
    await page.route('**/site-config/draft', async (route) => {
      if (route.request().method() !== 'GET') return route.continue()
      draftRequested = true
      await new Promise(resolve => setTimeout(resolve, 3000))
      await route.continue()
    })

    await page.goto('/admin/settings?tab=general')
    await waitForAppReady(page)
    const editorEntry = page.locator('[data-website-editor-entry]').first()
    await expect(editorEntry).toBeVisible()
    await editorEntry.hover()
    await expect.poll(() => draftRequested).toBe(true)
    await editorEntry.click()

    await expect(page.getByRole('status', { name: 'Preparing website editor' })).toBeVisible()
    await expect(page.getByText('Preparing your private preview')).toBeVisible()
    await expect(page.getByTitle(/Private storefront .* preview/)).toBeVisible({ timeout: 45_000 })
  })

  test('recovers when the private draft request fails', async ({ page }) => {
    let failDraftRequest = true
    await page.route('**/site-config/draft', async (route) => {
      if (failDraftRequest) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Temporary editor outage.' }),
        })
        return
      }
      await route.continue()
    })

    await page.goto('/admin/website-editor')
    await waitForAppReady(page)
    await expect(page.getByRole('alert').filter({ hasText: 'Temporary editor outage.' })).toBeVisible({ timeout: 45_000 })
    failDraftRequest = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByTitle(/Private storefront .* preview/)).toBeVisible()
  })

  test('warns before navigation would discard unsaved work', async ({ page }) => {
    await openEditor(page)
    await openEditorControls(page)
    const heading = page.getByLabel('Heading').first()
    await heading.fill(`${await heading.inputValue()} unsaved`)

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('lose your unsaved changes')
      await dialog.dismiss()
    })
    await page.getByRole('link', { name: 'Dashboard' }).first().click()
    await expect(page).toHaveURL(/\/admin\/website-editor/)
  })

  test('saves and discards a private draft without publishing', async ({ page }) => {
    await openEditor(page)
    await openEditorControls(page)
    const heading = page.getByLabel('Heading').first()
    const original = await heading.inputValue()
    await heading.fill(`${original} private e2e draft`)
    await page.getByRole('button', { name: /^Save(?: draft)?$/ }).click()
    await expect(page.getByText('Private draft saved')).toBeVisible()

    page.once('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: 'Discard' }).click()
    await expect(page.getByText('Published website loaded')).toBeVisible()
    await expect(heading).toHaveValue(original)
  })

  test('publishes and restores the disposable test store', async ({ page }) => {
    test.skip(!allowPublish, 'Set SSU_E2E_ALLOW_PUBLISH=true only for a disposable test tenant.')
    await openEditor(page)
    await openEditorControls(page)
    const heading = page.getByLabel('Heading').first()
    const original = await heading.inputValue()
    const temporary = `${original} publish e2e ${Date.now()}`

    await heading.fill(temporary)
    await page.getByRole('button', { name: /^Save(?: draft)?$/ }).click()
    await expect(page.getByText('Private draft saved')).toBeVisible()
    page.once('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: 'Publish' }).click()
    await expect(page.getByText('Published website loaded')).toBeVisible()

    await heading.fill(original)
    await page.getByRole('button', { name: /^Save(?: draft)?$/ }).click()
    await expect(page.getByText('Private draft saved')).toBeVisible()
    page.once('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: 'Publish' }).click()
    await expect(page.getByText('Published website loaded')).toBeVisible()
  })
})
