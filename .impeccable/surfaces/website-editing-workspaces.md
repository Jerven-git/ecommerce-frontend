# Dedicated website editing workspaces

Mode: Operate. Targets: Website Pages detail and Website Editor. The user explicitly requested both, with Shopify's dedicated editor as the structural reference.

## Direction contract

THESIS: Editing takes over the viewport. Admin navigation yields to page structure, focused tools, and the real preview.

OWN-WORLD: Preserve Calm Control Room operator tokens, system UI typography, semantic statuses, restrained borders, compact rectangular controls and the established accent. Public content retains its own appearance.

STORY: Choose a page or section, edit its fields, inspect the result, save privately, then review publication. Existing tenant and publish boundaries stay authoritative.

FIRST VIEWPORT: A 64px toolbar holds exit, identity, draft status and named save actions. Desktop has a 320px tool panel and a flexible inset preview. Sections, page settings and search appearance are separate tool views. Selecting a section opens a focused inspector with a back control. On mobile, tools and preview are explicit views, with save always reachable.

FORM: User-pinned Shopify-inspired editor structure, extended within the existing admin world; code-led implementation. No concept seed needed for the specified structure.

SIGNATURE: Section list to focused inspector, with desktop/mobile viewport switching in a real isolated preview. Motion is limited to short state and viewport transitions, respecting reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation notes

This surface extends the incumbent [Calm Control Room admin system](../../../docs/product/DESIGN.md). The frontend `DESIGN.md` documents the Service Studio public theme and is not the visual authority for these operator controls. Both existing design documents remain unchanged.

- The admin layout gives `/admin/website-editor` and `/admin/website-pages/:uuid` the viewport without the admin navigation, guide, or assistant. Subscription gating, shared admin appearance, and the impersonation banner remain in the layout. The Website Pages directory retains the standard admin shell.
- Shared workspace styles use existing admin colors, semantic states, focus accents, and quiet shadows. The toolbar has a 64px minimum height, controls have 44px minimum targets and 8px corners, and the tool rail is 320px wide. These are local editing-workspace decisions rather than new global tokens.
- Website Pages separates Sections, Page settings, and Search appearance. Section selection opens its inspector. Phones switch explicitly between editing tools and preview; the toolbar retains Save draft, and the tool footer provides Review publication.
- Website Editor separates its section list and focused inspector, with History as a distinct tool view. It retains its existing collapsible desktop panel and narrow-screen drawer, plus draft saving, publication review, locale selection, theme tools, and version actions.
- Both previews use actual document viewports with desktop, tablet, and mobile sizing. Website Pages mounts the shared page renderer into a sandboxed iframe with application styles for an isolated non-submitting preview; Website Editor retains its private storefront preview. Save and publication remain distinct actions.

## Verification status

Local verification on 2026-11-03:

- Five focused unit-test files passed: 21 tests covering shell shortcuts, section navigation, page localization, the page renderer, and admin source contracts.
- Type checking passed after the workspace and keyboard-focus changes; whitespace checks passed.
- Chromium checks used intercepted fixture APIs and real rendering components. They verified page metadata/draft save requests, section creation and editing, Search appearance access, a real 390px preview viewport, main-editor History, and mobile tools/preview access.
- Screenshots cover both workspaces at desktop and phone widths, plus the supplied 1920px width for Website Pages. Dark captures cover both desktop editors and the main mobile editor. Captures live in `.impeccable/review/` and use clearly labeled local fixture content.
- Keyboard checks confirmed section-to-inspector focus, return to the selected section, mobile drawer initial focus, and Escape returning focus to its trigger.
- The independent finish reviewer returned `ship` for the reviewed UI scope after the focus fix, width-animation removal, and dark captures. This is not a production-readiness verdict.

The local dev environment emitted Docker-specific HMR WebSocket errors and font-cache warnings; successful browser checks reported no editor application exceptions. Live tenant persistence, publication, and deployment were not exercised. No tenant data was changed.

No new raster assets were introduced for this surface.

## Sections overflow correction

A long section inspector with an image uploader exposed an absolutely positioned screen-reader-only file input whose containing block was outside the scroll panel. This extended the outer document below the editor. Both tool scroll containers now establish a relative positioning context. On the local fixture reproduction, the outer document shrank from 1379px to the 704px viewport, remained at scroll offset zero after wheel input, and preserved the panel's independent scrolling. Responsive checks also cover the 390px phone viewport and the main Website Editor.

## Visual section builder direction

THESIS: Website Pages is a composed page, with designed sections chosen visually instead of an empty block dropdown.
OWN-WORLD: Extend the existing admin palette and compact workspace; real storefront layouts stay authoritative inside isolated previews.
STORY: Browse or search sections, compare layout thumbnails and a real rendered example, add editable starter content, select the result on the canvas, and customize its content and design.
FIRST VIEWPORT: Add section opens a searchable library with a section catalog at left and a complete layout preview at right. Phones stack the catalog above the preview. Add remains in a fixed dialog footer. The inspector keeps content visible and puts appearance overrides behind Section design.
FORM: User-pinned Shopify section-library reference inside the existing operator world, code-led extension; no concept roll. The user explicitly selected editable starter content.
SIGNATURE: The library shows the actual shared renderer, scaled from a desktop document so every layout can be compared before adding. Saved appearance uses the same renderer on public pages.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

The section library covers the existing 13 block types and 36 layout variants. New sections receive generic editing prompts, with blank merchant statistics and unassigned media. Only the library uses labeled example connected records. Existing pages receive no automatic starter text. Section background, text color, alignment, width, spacing, and radius are optional validated settings; missing settings retain the incumbent layout. All content remains private until the existing publish review.

### Builder implementation

- `WebsitePageSectionLibrary.vue` provides search, categories, layout selection, and a persistent Add section footer. Desktop places the catalog beside the preview; phones stack them. The native dialog focuses search on open and restores the trigger on close, including Escape.
- `WebsitePageLayoutPicker.vue` supplies compact layout sketches in both the library and inspector. `WebsitePagePreview.vue` renders the shared storefront component as an isolated non-submitting preview in a sandboxed iframe; the library scales an 1100px desktop document for comparison. Clicking a section in the editing canvas opens its inspector and outlines the selected section. Event capture disables link and form actions, with an additional renderer guard for preview form submission.
- The page detail route applies editable starter text only when adding a section. Duplicate copies section content, settings, and any existing translations into a new block ID. Layout and design controls belong to default content and remain shared across locales; the existing 50-section limit applies to adding and duplicating.
- `WebsitePageDesignInspector.vue` keeps appearance in the collapsed Section design disclosure, with per-setting defaults and a full reset. `websitePageDesign.ts` applies optional overrides through the shared `WebsitePageRenderer.vue`, so editor and public rendering use the same rules. Colors accept six-digit hex values; spacing is bounded to 0–160px and corner radius to 0–48px. Width and alignment use explicit choices.
- The backend block registry validates the optional nested `settings.design` object and its allowed keys for every block type. This extends the existing document contract without a database migration. Release the backend contract and frontend controls together; existing pages retain their saved content and default appearance until edited.
- `websitePageStarters.ts` keeps merchant figures blank and media unassigned. Image prompts and the empty-statistic cue are preview-only; library connected-record examples do not become saved store records. No new raster assets or global design system were introduced. The public Service Studio and admin Calm Control Room design documents remain authoritative for their respective surfaces.

### Builder verification status

Local verification on 2026-11-03, scoped to this extension:

- Browser checks used intercepted fixture APIs and the actual renderer. They covered all 36 variants across 13 section types, adding and editing starter content, layout changes, canvas selection, duplication, and design values retained in fixture PATCH/PUT requests. Escape/reopen focus behavior passed, with no editor application exceptions reported.
- The `builder-*` screenshots in `.impeccable/review/` cover desktop and phone library views in light and dark appearance, the layout preview, desktop design controls, and mobile inspector/canvas views.
- Backend checks passed the 13 prior tests and two added design-validation tests. The final frontend run passed four focused test files (10 tests), and Vue type checking exited successfully with no diagnostics.
- The independent builder review identified one rich-text color omission. Targeted scoped CSS now applies the saved text color to the rich-text body. A browser check confirmed white body text against the saved `#17201d` background, retained the saved color, and reported no editor application exceptions; `builder-rich-text-contrast.png` records the result. The independent verdict pass returned `ship` with that finding resolved; the earlier visual review stands. This verdict covers the reviewed builder UI and the scored correction.

These checks establish local fixture behavior. Live tenant persistence, public publication, deployment, and production behavior have not been verified for the builder extension.

## Compact section menus

The user-pinned Shopify screenshot refines the section menus within the existing Calm Control Room workspace: compact rows, disclosure chevrons, indented blocks, inline Add section/Add block actions, and eye controls for section visibility. `WebsiteSectionMenuRow.vue` supplies the shared row; `WebsiteEditorSectionRow.vue` adapts the main editor to it. Reordering sits behind a secondary row action. Website Pages expands supported repeater sections into their actual items, with selection opening the corresponding inspector fields and Add block using the existing item operation and limits. Structural additions remain restricted to default content; draft, publication, and locale contracts are retained.

This is a local menu refinement, with no new global design tokens, raster assets, or changes to either `DESIGN.md` or the design sidecar. Loading existing page sections also clones catalog defaults through JSON serialization to support reactive catalog values.

Local verification for this refinement on 2026-11-03: the final Vue type check exited successfully with no diagnostics, four focused tests passed, the whitespace check was clean, and the layout detector reported no findings. Populated Website Pages fixture checks passed section expansion, item-field focus, Add block, visibility, reordering, saved-payload inspection, and a mobile viewport without outer-document overflow. Desktop and mobile captures are `.impeccable/review/section-menu-desktop.png` and `section-menu-mobile.png`. Subsequent main-editor navigation returned HTTP 500 when the isolated Nuxt worker reached its heap memory limit; that editor has source review but no completed runtime verification for this change. Known isolated-preview HMR WebSocket warnings are separate from the fixture application checks. The reviewer's touch-target finding was corrected, and a coarse-pointer Chromium harness using the component's exact CSS confirmed every control measured at least 44×44px. The disclosure chevron now rotates 90 degrees when expanded; that source correction followed the original captures. The independent reviewer scored the sole touch-target correction resolved and returned `ship` at that scope; main-editor runtime remains unverified. Earlier workspace and builder verdicts do not cover this menu change. No deployment was performed.

## Header navigation

This feature extends the existing Calm Control Room workspace. Website Pages provides a Header navigation shortcut to `/admin/website-editor?page=global&section=header`. In the header inspector, Add menu link offers published store pages and enabled built-in destinations missing from the menu. Choose a destination, select Add to header, then edit its label, show or hide it, move it up or down, or remove it. Save draft and Publish website remain separate steps. Creating or publishing a page does not automatically add it to the header.

The picker loads the tenant's paginated page listing. Custom-page entries store stable UUID references (`kind: page`) in the existing private website draft and save API. Public `SiteConfigPresenter` resolves these against the same store's immutable current `WebsiteReleasePage` paths, omitting private, foreign, and unresolved references. Preview resolves UUIDs using tenant page options. The shared desktop and mobile Header consumes navigation alongside existing module and category controls; the Apex branch is retained. Release the frontend and backend together. No schema changes, migrations, raster assets, global design tokens, or changes to either `DESIGN.md` or the design sidecar accompany this feature.

Local verification began on 2026-11-03: 15 focused frontend tests passed across `WebsiteNavigationEditor`, `useWebsiteEditorContentModel`, `useWebsiteEditorSession`, and `WebsitePagesLinks`, plus four `websiteEditorPublishing` tests, for 19 frontend tests. The backend passed 20 tests with 190 assertions across `PublicWebsitePageApiTest` and `WebsiteProfileBlueprintApiTest`. A lightweight Vite fixture harness using the actual editor and Header SFCs confirmed adding a link to the rendered header, renaming, hiding/showing, and mobile menu Escape behavior, with no application errors reported. Whitespace checks were clean. Final Vue type-check revalidation on 2026-11-04 exited successfully with no diagnostics.

The independent component review found one responsive issue: many long labels could overflow the desktop header. `Header.vue` now uses `ResizeObserver` to measure available space and collapse navigation into the existing drawer button when the links do not fit. The measured row remains hidden, inert, and clipped while collapsed, preserving measurement without horizontal overflow or hidden focus targets. Final fixture checks on 2026-11-04 at 1024px and 1440px confirmed no outer-document horizontal overflow, access to the last link through the drawer, and Escape closing the menu.

The three original captures were refreshed: `.impeccable/review/header-navigation-desktop.png`, `header-navigation-editor-mobile.png`, and `header-navigation-mobile-menu.png`. Additional captures `header-navigation-overflow-1024.png` and `header-navigation-overflow-1440.png` record the responsive correction. On 2026-11-04, the independent verdict pass scored the sole responsive finding resolved and returned `ship` at the correction scope; the earlier full component review stands. Full Nuxt integration, live tenant persistence/publication, and deployment remain unverified. This verdict covers the reviewed local component behavior, not production readiness.

## Section inspector refinement

On 2026-11-04, the supplied screenshot identified oversized layout cards and spacing that pushed editing fields below the fold. Website Pages now extends the existing Calm Control Room with `WebsitePageSectionInspector.vue`: a compact sticky title and action row, back/duplicate/remove controls, an accessible visibility switch, and Content and Design views. Opening a section starts in Content, containing its existing fields, media, items, and actions. Design contains the compact layout picker, appearance controls, and settings. Translations expose Content only; existing locale guards, limits, draft saving, and publication contracts remain intact.

`WebsitePageLayoutPicker.vue` opts into compact presentation only for this inspector; its default and the section library remain unchanged. `WebsitePageDesignInspector.vue` retains its collapsed default and opens within this Design view. Form text uses normal weight. The localization utility now JSON-clones documents to support Vue reactive values, with plain and reactive document coverage. This refinement introduces no backend, schema, global token, raster asset, or design-authority changes; both `DESIGN.md` files and the design sidecar remain unchanged.

Local verification passed eight focused tests across `websitePageDesign`, `useWebsitePageBlockCatalog`, and `websitePageLocalization`. A Vite fixture using the actual full page SFC and child components verified Content-first opening, Design edits, the sticky header, keyboard visibility control, duplication/removal, saved payloads, locale guards, and bounds at 393×887px, with no application exceptions. The layout detector reported no findings and the whitespace check was clean. Captures in `.impeccable/review/` are `section-inspector-content-desktop.png`, `section-inspector-design-desktop.png`, `section-inspector-content-mobile.png`, and `section-inspector-design-mobile.png`. Final Vue type-check revalidation exited successfully with no diagnostics. Independent review returned `ship` with no material fixes for the reviewed source and fixture captures. Full Nuxt integration, live publication, and deployment remain unverified.

The requested section-list refinement adds an always-visible 44px trash control to each Website Pages section row in the default locale; the shared row's removal control is opt-in, preserving the main editor's existing behavior. List and inspector removal share `removeBlock`, which cleans locale overrides, keeps the section list open, and focuses the next row or Add section. An actual page-SFC fixture verified keyboard access, visibility without hover, saved-payload cleanup, translation guards, and empty-list focus without live data; `.impeccable/review/section-list-trash-mobile.png` records the mobile result, Vue type checking exited successfully, and the whitespace check was clean. Independent review returned `ship` with no fixes for this narrow change.

## Main Website Editor density refinement

On 2026-11-04, the main Website Editor was refined toward the supplied Shopify reference within Calm Control Room. The toolbar now has a 52px minimum height, desktop pointer controls use a 32px rhythm, section rows use 34px, and inspector fields use compact padding with normal-weight text. Sections/History use understated underline tabs. The duplicated preview identity and full-width status strip were removed; current draft state is announced in the preview footer. Canvas insets are 12px on desktop. Touch controls retain larger targets and narrow-screen text inputs use 16px. Styles are scoped to this editor; shared page-editor controls and publication behavior are preserved.

Vue type checking and seven focused section-navigation/feedback tests passed, the layout detector returned no findings, and the whitespace check passed. An isolated Vite fixture of the current template/styles and real section row, page picker, language picker, inspector and field components checked bounds at 1440, 1024 and 393px, section navigation and fixture save-state rendering without exceptions. Captures are `website-editor-compact-1440.png`, `website-editor-compact-1024.png`, `website-editor-compact-393.png`, and `website-editor-compact-inspector.png` under `.impeccable/review/`. The fixture uses simulated state and an empty preview; it does not validate the real session composables, API writes or publication. Independent finish review returned ship without blocking issues. The local application server was unavailable, so full Nuxt integration and live storefront preview remain unverified. No backend, schema, global design tokens or design-authority files changed.

## Unified editor — Phase 1

The four-phase plan is recorded in `docs/roadmaps/UNIFIED-WEBSITE-EDITOR.md` at the infrastructure root. Phase 1 adds unified page discovery to the existing page picker: search matches built-in titles and custom titles/paths; custom pages show private, live, or live-with-unpublished-changes status. Loading and retry states reuse the existing authenticated paginated page list. Create page links to the existing page-management route with `create=1`, opening its private-draft form without writing data. Custom links still open the existing editor and preserve the main editor's unsaved-change route guard. Phase 2 embedding, Phase 3 save/publication unification, and Phase 4 navigation/entry-point cleanup remain unstarted.

The chooser uses a nonmodal dialog with a searchable built-in listbox and ordinary custom-page links. Tab reaches built-in choices, Create page, then custom links; arrow keys select built-ins and Escape restores trigger focus. Its viewport height allowance reserves room for wrapped phone tools and the preview footer. Eight focused picker/page-link tests and Vue type checking passed. The layout detector returned no findings and diff whitespace checks passed. The isolated template/component fixture verified search, custom UUID routes, keyboard order, Escape, desktop bounds and a scrollable chooser at 393×667, including the final management link above the clipping boundary. Captures are `unified-pages-phase1-desktop.png` and `unified-pages-phase1-mobile.png`. Independent review found no material routing, tenant-data, publication-state or unsaved-change regressions; its short-phone sizing condition was resolved by the final browser check. This evidence does not establish full Nuxt integration, live saves, publication or deployment.


## Unified editor — Phase 2

The unified route now selects `WebsiteBuiltinEditorWorkspace.vue` or `WebsitePageEditorWorkspace.vue`, extracted from the existing page implementations. Custom-page URLs use `?customPage=<uuid>` and legacy UUID routes forward there. The custom workspace retains its section tree, Content/Design inspector, Page/Search tools, language picker, section library and isolated preview; its header identifies Website Editor and includes the shared searchable page picker. Both workspaces use the authenticated page directory. No new visual system, schema, backend API, publishing contract or design-authority change was introduced.

The route distinguishes a shared built-in document from individually keyed custom UUID documents. Query-only document switches invoke the active workspace's unsaved-change guard; full route exits retain child guards. Arrival focuses the heading. Back/forward updates built-in selection while preserving the in-memory draft. Incoming locale and section values are validated against the working document, including default languages other than English. Existing custom save/publication controls remain for Phase 3.

Twenty-seven focused tests and Vue type checking passed. The actual route and custom SFC were exercised in an isolated browser/API fixture for editing/saving, cancelled dirty navigation, UUID switching, Back, reload, missing-page errors and phone bounds; captures are `unified-pages-phase2-desktop.png` and `unified-pages-phase2-mobile.png`. The fixture uses a stub built-in workspace and simulated data, so full authenticated Nuxt, live publication and deployment remain unverified. Independent review returned ship after the route-validation regression was fixed. Phase 2 is complete locally; Phases 3 and 4 are unstarted.


## Unified editor — Phase 3

Shared `WebsiteEditorDocumentActions.vue` now provides Save draft and Publish for built-in and custom workspaces. The custom workspace opens `WebsiteEditorPagePublication.vue` in place, reusing the existing website session, readiness calculations and publication modal. The current changed page alone is preselected; saved website changes and other eligible custom drafts remain visible for explicit review. Publish and scheduling retain UUID/version snapshots. Desktop uses compact controls and mobile retains 44px targets. The footer review shortcut also opens in place, and reviewing the current custom page closes the modal correctly.

`useWebsitePageDraftSession.ts` preserves metadata/content versions across partial saves, maintains a correct saved baseline, retains newer edits during saves, and provides copy/reload plus per-user/store/page browser recovery. Built-in save/discard/publication/workflow guards prevent competing operations. Publication conflict recovery is separate from the built-in editor's browser recovery key. No backend/schema/public navigation changes or visual-authority changes were introduced.

Validation passed: 26 focused frontend tests, 24 backend tests (230 assertions, forced in-memory SQLite), Vue type checking, whitespace and layout scans. The actual custom workspace/actions/publication/review modal ran in a simulated-API browser fixture at desktop and 393×667 phone size. It verified dirty guards, versioned save, current-only preselection, modal close on current-page Review, in-place mobile review and exact coordinated publish payload. Captures are `unified-pages-phase3-review-desktop.png` and `unified-pages-phase3-review-mobile.png`. Independent review returned ship after its four findings were resolved. This does not establish authenticated full Nuxt or live publication readiness; nothing was deployed. Phase 3 is complete; see the Phase 4 record below for subsequent progress.


## Unified editor — Phase 4

Completed locally on 2026-11-04 within the existing Calm Control Room workspace. Page settings exposes a published-only Header navigation handoff, guarded against dirty or busy exits. The global Header inspector preselects the requested eligible page without writing a draft; explicit Add to header, Save draft and Publish remain necessary. Status text explains existing links, unavailable destinations and limits. Existing hidden/nested links and manual links to a published path are recognized without automatic visibility changes. The admin sidebar opens Website Editor, and Manage pages retains the management list with canonical create/edit links and compatible legacy routes.

Omitted locale now selects the store default on Header entry. Published-page links use an additive backend `published_path` field, retaining the live URL during draft renames. Public navigation also excludes soft-deleted page references. No new design tokens, raster assets, schema migrations or changes to either DESIGN.md or its sidecar were introduced.

Validation passed: 31 focused frontend tests, 20 backend tests (187 assertions, in-memory SQLite), Vue type checking, whitespace checks and the scoped layout detector. A browser fixture using both real workspaces, route/session composables, navigation controls and publication review verified private guards, page publication, default-language handoff, explicit keyboard addition, website saving/publication and mobile controls at 393×667. APIs and the preview were simulated; inactive ancillary components were stubbed. Captures are `.impeccable/review/unified-pages-phase4-page-desktop.png`, `unified-pages-phase4-header-desktop.png` and `unified-pages-phase4-header-mobile.png`. Independent review returned ship after default-language and immutable-published-path fixes. All four phases are implemented locally; full authenticated Nuxt, live tenant/storefront behavior, production build and deployment remain unverified. The infrastructure roadmap records release ordering, and `docs/product/WEBSITE-EDITOR.md` documents the merchant workflow.

## Preview link navigation

On 2026-11-05, the built-in storefront preview now forwards link activation to its editor through the existing origin/source-checked message channel. Known built-in paths select the corresponding editor page while retaining the shared draft; known tenant custom-page paths (including immutable published paths) open that page through the existing guarded editor route. External destinations, unknown pages, account/cart/admin paths and fragment-only links do not navigate. Preview forms and other actions retain their existing protection. No visual styles or design authority changed.

Seventeen focused tests passed for destination resolution, message-source protection, workspace guards and section navigation. Live authenticated browser behavior remains unverified for this change.


## Global settings organization

On 2026-11-05, Global sections gained a dedicated Social media item for social profile URLs and labels. Store details is now labelled Store & contact and retains its existing route ID. Brand assets, header navigation, announcement banner and footer remain grouped by purpose. Footer keeps the social visibility toggle, with reciprocal guidance identifying where profiles and display settings belong. Existing draft fields, platform options, limits and publication APIs are unchanged.

Social validation errors, changed-area review, translation fields/progress and content indicators now target the dedicated section. Selecting it highlights the preview footer. Thirty focused tests passed for publication, localization, validation and section/route navigation. The shared controls and visual system were retained; live browser verification remains pending.

## Preview configuration isolation

On 2026-11-05, a read-only local diagnosis confirmed that Information was published and its saved menu entry was visible. The preview wrote resolved page links into the shared admin configuration cache; background app refreshes could replace that cache with UUID-based private navigation, which the storefront header does not render directly. The preview now provides a subtree-scoped configuration ref consumed by useSiteConfig. Background requests retain their normal cache without replacing the editor preview. No saved navigation or page records were modified.

Twenty-eight focused tests passed, including a mounted regression proving that Information remains linked after shared-cache replacement and invalidation. The regression was also rerun after adding render-flush assertions. Authenticated full-browser confirmation remains pending.

## Page picker viewport bounds

On 2026-11-05, fixed the shared page chooser opening beyond the left edge when its trigger sits near the left of the custom-page toolbar. Replaced right-aligned absolute positioning with trigger-anchored fixed positioning clamped to viewport gutters. Available height is bounded below the trigger, with updates on scrolling, resizing and visual viewport changes. Search, keyboard selection, focus restoration and existing page links are retained.

Five picker tests, Vue type checking and whitespace checks passed. A browser fixture using the actual picker and application CSS verified 743px, 393px and 1440px widths, left/right anchors, a short resized viewport, access to the final management link and Escape focus restoration. The phone capture was inspected; fixture icons were stubbed. Captures are `/tmp/ssu-picker-review/picker-{743,393,1440}.png`. No live data changed.

The language selector and language settings panel now share the page picker's viewport positioning through `useEditorPopoverPosition`, fixing the same left-edge clipping when the section sidebar is closed. Browser checks of the actual picker components passed at 1917px, 743px and 393px: all three panels remain within viewport bounds, and Escape restores language-trigger focus. The phone capture was inspected. Five page-picker regression tests passed; no settings data changed.
