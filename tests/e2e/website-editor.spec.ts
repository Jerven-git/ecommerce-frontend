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
  await expect(page.getByRole('button', { name: 'Save draft' })).toHaveAttribute('title', 'Save draft (Ctrl or Command + S)')
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
    await expect(page).toHaveURL(/page=about/)
    await expect(page).toHaveURL(/section=about-content/)
    await pagePicker.click()
    await page.getByRole('option', { name: 'Home page', exact: true }).click()
    await expect(heading).toHaveValue(`${original} preview check`)

    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z')
    await expect(heading).toHaveValue(original)
  })

  test('returns to the same page and section after refresh', async ({ page }) => {
    await page.goto('/admin/website-editor?page=about&section=about-content')
    await waitForAppReady(page)
    await expect(page.getByRole('button', { name: 'Preview page: About' })).toBeVisible()
    await page.reload()
    await waitForAppReady(page)
    await expect(page.getByRole('button', { name: 'Preview page: About' })).toBeVisible()
    await expect(page).toHaveURL(/page=about/)
    await expect(page).toHaveURL(/section=about-content/)
  })

  test('edits a localized preview while preserving default content', async ({ page }) => {
    await openEditor(page)

    await page.getByRole('button', { name: 'Manage storefront languages' }).click()
    const spanish = page.getByRole('checkbox', { name: /Español/ })
    if (!(await spanish.isChecked())) await spanish.check()
    await page.getByRole('button', { name: 'Close language settings' }).click()

    await page.getByTitle(/Editing English/).click()
    await page.getByRole('option', { name: /Spanish/ }).click()
    await expect(page).toHaveURL(/locale=es/)

    await openEditorControls(page)
    await expect(page.getByRole('heading', { name: 'Spanish translation' })).toBeVisible()
    const translatedHeading = page.getByLabel('Heading').first()
    await expect(translatedHeading).toHaveAttribute('placeholder', /.+/)
    await translatedHeading.fill('Vista previa localizada')
    await expect(page.getByText('Unsaved preview changes')).toBeVisible()

    await page.getByRole('button', { name: 'Discard changes' }).click()
    await page.getByRole('dialog', { name: 'Discard private changes?' }).getByRole('button', { name: 'Discard changes' }).click()
    await expect(page.getByText('Published website loaded')).toBeVisible()
  })

  test('finds pages and sections from the keyboard navigator', async ({ page }) => {
    await openEditor(page)
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+k' : 'Control+k')

    const navigator = page.getByRole('dialog', { name: 'Find content' })
    await expect(navigator).toBeVisible()
    await navigator.getByRole('searchbox', { name: 'Search pages and sections' }).fill('contact')
    await navigator.getByRole('button', { name: /Contact content/ }).click()

    await expect(page).toHaveURL(/page=contact/)
    await expect(page).toHaveURL(/section=contact-content/)
    await expect(page.getByTitle('Private storefront contact preview')).toBeVisible()
  })

  test('keeps the exact editor location when handing content off to another screen', async ({ page }) => {
    await page.goto('/admin/website-editor?page=shop&section=shop-content')
    await waitForAppReady(page)
    await openEditorControls(page)

    await page.getByRole('link', { name: 'Edit Shop SEO' }).click()
    await expect(page).toHaveURL(/\/admin\/settings\?.*tab=pages.*sub=shop/)
    await expect(page.getByRole('link', { name: 'Back to editor' })).toBeVisible()
    await page.getByRole('link', { name: 'Back to editor' }).click()

    await expect(page).toHaveURL(/page=shop/)
    await expect(page).toHaveURL(/section=shop-content/)
  })

  test('reuses a tenant media-library asset in the private draft', async ({ page }) => {
    let reused = false
    await page.route('**/api/v1/site-config/media-library**', async (route) => {
      if (route.request().method() === 'POST' && route.request().url().includes('/use/hero')) {
        reused = true
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 77,
            collection: 'hero',
            url: '/storage/site-config/reused-cover.jpg',
            mime_type: 'image/jpeg',
          }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{
            id: 42,
            name: 'campaign-cover.jpg',
            url: '/storage/site-config/campaign-cover.jpg',
            mime_type: 'image/jpeg',
            size: 245760,
            alt_text: 'Packed customer orders',
            status: 'archived',
            usage: [],
            can_delete: true,
            created_at: '2026-10-16T04:00:00.000Z',
          }],
          meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
        }),
      })
    })

    await openEditor(page)
    await openEditorControls(page)
    await page.getByRole('button', { name: /media library/i }).first().click()

    const library = page.getByRole('dialog', { name: 'Media library' })
    await expect(library).toBeVisible()
    await expect(library.getByText('campaign-cover.jpg').first()).toBeVisible()
    await library.getByRole('button', { name: 'Review campaign-cover.jpg' }).click()
    await library.getByRole('button', { name: 'Use this asset' }).click()

    await expect(library).toBeHidden()
    expect(reused).toBe(true)
    await expect(page.getByAltText('Hero media')).toHaveAttribute('src', '/storage/site-config/reused-cover.jpg')
    await expect(page.getByText('Unsaved preview changes')).toBeVisible()
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

  test('preserves browser edits when a concurrent draft save conflicts', async ({ page }) => {
    await page.route('**/api/v1/site-config/draft', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ code: 'draft_save_conflict', message: 'The private draft changed in another session.' }),
        })
        return
      }
      await route.continue()
    })

    await openEditor(page)
    await openEditorControls(page)
    const heading = page.getByLabel('Heading').first()
    await heading.fill(`${await heading.inputValue()} conflict copy`)
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+s' : 'Control+s')

    const conflictDialog = page.getByRole('dialog', { name: 'Your draft changed elsewhere' })
    await expect(conflictDialog).toBeVisible()
    await expect(conflictDialog.getByRole('button', { name: 'Review latest' })).toBeVisible()
    await expect(conflictDialog.getByRole('button', { name: 'Copy my changes' })).toBeVisible()
    await conflictDialog.getByRole('button', { name: 'Reload latest' }).click()
    await expect(conflictDialog).toBeHidden()
    await expect(page.getByText('A browser copy of your edits is preserved for recovery.')).toBeVisible()
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

    await page.getByRole('button', { name: 'Publish' }).click()
    const publishReview = page.getByRole('dialog', { name: 'Review website publication' })
    await expect(publishReview.getByRole('heading', { name: 'Changes in this draft' })).toBeVisible()
    await expect(publishReview.getByRole('heading', { name: 'Content readiness' })).toBeVisible()

    await publishReview.getByRole('button', { name: 'Request review', exact: true }).click()
    await expect(publishReview.getByText('Review requested', { exact: true })).toBeVisible()
    await publishReview.getByRole('button', { name: 'Approve draft' }).click()
    await expect(publishReview.getByText('Approved', { exact: true })).toBeVisible()

    const futureSchedule = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    await publishReview.getByLabel('Publish date and time').fill(futureSchedule)
    await publishReview.getByRole('button', { name: 'Schedule', exact: true }).click()
    await expect(publishReview.getByRole('button', { name: 'Cancel schedule' })).toBeVisible()
    await publishReview.getByRole('button', { name: 'Cancel schedule' }).click()
    await expect(publishReview.getByRole('button', { name: 'Schedule', exact: true })).toBeVisible()
    await publishReview.getByRole('button', { name: 'Continue editing' }).click()

    await page.getByRole('button', { name: 'Discard' }).click()
    const discardDialog = page.getByRole('dialog', { name: 'Discard private changes?' })
    await expect(discardDialog).toBeVisible()
    await discardDialog.getByRole('button', { name: 'Discard changes' }).click()
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
    await page.getByRole('button', { name: 'Publish' }).click()
    const firstReview = page.getByRole('dialog', { name: 'Review website publication' })
    await firstReview.getByLabel('Release note').fill('Temporary browser-test publication')
    await firstReview.getByRole('button', { name: /^Publish/ }).click()
    await expect(page.getByText('Published website loaded')).toBeVisible()
    await expect(page.getByText('Website published.')).toBeVisible()

    await heading.fill(original)
    await page.getByRole('button', { name: /^Save(?: draft)?$/ }).click()
    await expect(page.getByText('Private draft saved')).toBeVisible()
    await page.getByRole('button', { name: 'Publish' }).click()
    await page.getByRole('dialog', { name: 'Review website publication' }).getByRole('button', { name: /^Publish/ }).click()
    await expect(page.getByText('Published website loaded')).toBeVisible()
  })
})
