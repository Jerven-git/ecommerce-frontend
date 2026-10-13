# Store Admin Website Editor

The Website Editor is delivered one independently usable phase at a time. Each phase must be validated and approved before work starts on the next phase.

## Product boundary

- The editor belongs to Store Admin and always resolves the authenticated administrator's store.
- The first editable surface is the storefront homepage.
- Products, orders, checkout, payments, tenant routing, subscription gates, and Super Admin remain unchanged.
- Draft content must never appear on the public storefront before an explicit publish action.
- The editor reuses the real storefront components and configured data. It does not maintain a mocked copy of the website.

## Phase 1: Published preview foundation

**Effort: Medium**

**Status: Implemented**

### Purpose

Give store administrators one reliable place to inspect the real homepage from inside Store Admin before editing is introduced.

### Implementation

- Add a Website Editor destination to Store Admin navigation and a dashboard entry point.
- Add a focused editor workspace with a homepage section navigator.
- Render the real storefront header, homepage components, footer banner, and footer in an authenticated same-origin preview document.
- Add desktop, tablet, and mobile viewport controls.
- Add section navigation, preview refresh, loading, and failure recovery.
- Keep the preview read-only and label it as the currently published storefront.

### Recommended usage

Use this phase to review the current storefront, verify tenant content, and identify which homepage section needs work. Continue using Site Settings for changes until Phase 2 is released.

### Acceptance criteria

- Only the authenticated store is rendered.
- No preview action changes storefront data.
- Preview links, forms, cart actions, and checkout actions cannot execute.
- Section navigation and all viewport controls work with keyboard and pointer input.
- Desktop and mobile layouts do not overflow the Store Admin shell.
- Existing View Store behavior still opens the tenant's canonical storefront.

## Phase 2: Safe visual editing and publishing

**Effort: High**

**Status: Implemented in code; deployment verification pending**

### Purpose

Deliver the first complete Shopify-style workflow: edit homepage content against a live preview, save privately, and publish explicitly.

### Implementation

- Add tenant-scoped draft storage separate from the published `SiteConfig`.
- Add authenticated draft read, save, discard, publish, and preview endpoints.
- Refactor storefront sections that read global configuration so the preview can receive a draft configuration safely.
- Connect the homepage's structured copy and existing hero presentation controls to the editor workspace.
- Keep image selection and product merchandising in their existing settings and product screens until those asset workflows receive editor-specific draft handling.
- Update the preview immediately from unsaved editor state.
- Add Save draft, Discard changes, Publish, dirty-state, saving, validation, and publish-success feedback.
- Add an `updated_at` or version check to prevent one administrator overwriting another administrator's newer changes.

### Recommended usage

Make homepage copy and hero-presentation changes in the Website Editor. Save a draft when work is incomplete, inspect all three viewport sizes, then publish only when the preview is correct. Continue using Site Settings for images and operational configuration, and Products for merchandising assignments.

### Acceptance criteria

- Saving a draft never changes the public storefront.
- Refreshing or signing in again restores the store's saved draft.
- Publishing updates only the authenticated tenant and refreshes its public storefront.
- Validation identifies the exact section and field requiring correction.
- Simultaneous editing cannot silently overwrite newer content.
- Published content can be verified on both the store subdomain and a verified custom domain.

## Phase 3: Homepage composition and recovery

**Effort: High**

**Status: Implemented in code; deployment verification pending**

### Purpose

Let administrators shape the homepage safely without turning SSU into an unrestricted page builder.

### Implementation

- Add controlled section visibility and ordering.
- Add keyboard-accessible move up/down controls; pointer drag-and-drop is an enhancement, not the only control.
- Add undo and redo for the current editing session.
- Add published-version history and one-step rollback.
- Add clearer empty states for sections that need products, media, or copy before they can render.
- Add preview-only section labels and selection outlines without leaking editor chrome into the public storefront.

### Recommended usage

Arrange existing SSU sections, hide sections that are not ready, and restore a previous published version when a release is incorrect. Do not use this phase for arbitrary HTML, scripts, or free-form layout construction.

### Acceptance criteria

- Section order is identical in preview and on the published storefront.
- Hidden sections produce no empty space publicly.
- Reordering works with keyboard, pointer, and touch input.
- Undo and redo never affect already-published content.
- A previous published version can be previewed before rollback.

## Phase 4: Additional storefront pages

**Effort: High**

**Status: Implemented in code; deployment verification pending**

### Purpose

Extend the proven homepage workflow to other tenant-controlled website surfaces.

### Implementation order

1. Header and footer
2. About and Story
3. Contact
4. Shop presentation
5. Blog landing page
6. Services landing page
7. Popup and announcement surfaces

Each page reuses the Phase 2 draft/publish contract and receives its own page selector, section list, validation, and preview state.

### Recommended usage

Choose a page from the editor toolbar, make a focused change, verify responsive layouts, and publish the shared draft as one consistent website update.

### Acceptance criteria

- Page selection never loses unsaved work.
- Module-disabled pages are clearly identified and cannot be published into an invalid navigation state.
- Header and footer changes are visible across every previewed page.
- Page-specific SEO fields remain available without cluttering the visual editing path.

## Phase 5: Production hardening and release

**Effort: Medium after Phases 2–4, but mandatory before broad release**

**Status: Implemented in code; runtime dependency gate passed, release still pending staging browser certification and deployment verification**

### Purpose

Prove the complete editor is safe for daily multi-tenant production use.

### Implementation

- Add authorization, tenant-isolation, validation, publish-transaction, conflict, media-cleanup, and rollback tests.
- Add browser coverage for editing, saving, publishing, discarding, navigation guards, responsive preview, keyboard operation, and reduced motion.
- Add audit records for draft saves, publishing, and rollback.
- Add operational monitoring for failed publishes and abandoned media processing.
- Move visual image selection into the editor only after private draft uploads, cleanup, and publish promotion are covered by tests.
- Document migration, deployment, and rollback procedures.

### Recommended usage

Release to a small set of stores first, monitor draft and publish behavior, then enable the editor for all stores after production verification.

### Acceptance criteria

- Cross-tenant access tests fail closed.
- Publishing is atomic and recoverable.
- The existing storefront, checkout, and Store Admin regression suites pass.
- Production migrations and tenant configuration are verified after deployment.
- A release rollback does not discard already-published storefront data.

