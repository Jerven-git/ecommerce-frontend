# Store Admin Website Editor

## Mode

Operate

## Job and audience

Store owners and staff need to inspect and eventually change their tenant storefront without translating disconnected settings fields into a mental picture of the website.

## Outcome

Phase 5 succeeds when the complete multi-page editor remains understandable and recoverable under loading failures, validation errors, concurrent edits, keyboard navigation, responsive previews, and production release checks without weakening its tenant or publishing boundaries.

## Direction

Extend the established Calm Control Room. The preview is the dominant working surface, not a decorative card. A quiet section rail explains the page structure; a compact toolbar controls viewport and recovery. Storefront branding appears only inside the isolated preview document, while editor controls retain the operator vocabulary.

## First viewport

The page header owns draft, discard, and publish state. A section rail doubles as the inspector while a large framed storefront remains the dominant working surface. On narrow screens the inspector moves above the preview without losing any action.

## Signature interaction

Selecting a storefront page changes the real preview without leaving the editor. Selecting a named section reveals its fields, scrolls the preview to that rendered surface, and gives it an operator-colored focus outline and label. Homepage composition controls remain keyboard, pointer, and touch accessible. Undo remains local to the editing session; archived website versions are previewed before an explicit restore-and-publish action.

## Scope and boundaries

- Phase 5 hardens the controlled editor and its release path; it does not introduce arbitrary HTML or a free-form page builder.
- Reuse real tenant configuration and storefront components.
- Save drafts per authenticated tenant and keep them separate from published SiteConfig.
- Preserve homepage composition, session undo/redo, and published-version recovery across the expanded website snapshot.
- Keep image selection and product merchandising in their existing settings and product screens.
- Keep page-specific SEO available in Site Settings and link to it from the editor instead of crowding the visual editing path.
- Identify module-disabled pages in the page selector without changing module or navigation state from the editor.
- Do not alter products, orders, checkout, payments, tenant routing, subscription gates, or Super Admin.
- Do not let preview links, forms, cart actions, or checkout actions execute.

## States

Loading, initial-load failure/retry, unsaved, saving, saved draft, validation failure, publish conflict, publishing, published, discard, iframe failure/retry, page switching, module-disabled page, popup preview, hidden section, desktop/tablet/mobile viewport, keyboard focus, and reduced motion.

## Responsive behavior

Desktop uses a section rail plus flexible preview canvas. Tablet and phone Store Admin layouts stack the section navigator above the preview. The preview itself can still emulate all three device widths and may scroll horizontally only inside its bounded canvas when required.

