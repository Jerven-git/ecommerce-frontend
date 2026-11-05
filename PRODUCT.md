# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

SSU merchants configure and publish tenant-specific websites. Service Studio serves consultancies, studios, agencies, and professional-service businesses. Informational Editorial serves organisations, publishers, community projects, and information-led businesses whose visitors need to navigate structured material and read it comfortably. Commerce Market serves product-led merchants whose customers need to discover, compare, save, order, and pay for real catalogue items.

## Product Purpose

SSU lets a merchant operate and publish a complete website from the existing Store Admin. The theme system changes storefront presentation without replacing or modifying the tenant's products, services, pages, media, domains, payments, modules, localization, or publishing workflow.

Service Studio provides a services-first public journey. Informational Editorial provides a reading-first journey through nested pages, articles, organisational information, and optional contact or newsletter actions. Commerce Market provides a merchandising-first journey through collections, products, variants, availability, favourites, cart, checkout, gift cards, payment, and tracking. Success means each visitor can understand the tenant, find the relevant material or product, and complete the appropriate next action confidently on desktop or mobile.

## Positioning

Themes are trusted first-party renderers shipped with SSU. They render the merchant's real tenant data through shared controllers and typed view models; installing a theme applies validated presentation configuration to a private draft rather than executing downloaded third-party code.

## Operating Context

Merchants browse themes in Site Settings → Website Editor → Theme Library, preview with their own content, review a server-generated blueprint, apply it to the private draft, edit supported content, and publish through the existing review, scheduling, version history, and rollback lifecycle.

Public storefronts resolve tenants from verified hosts and domains. Authenticated Store Admin operations use the signed-in user's store identity. Preview reuses real storefront components while disabling cart, checkout, form submission, and navigation side effects.

## Capabilities and Constraints

- Preserve Classic as the safe default and fallback.
- Preserve all tenant content and operational settings when switching themes.
- Use semantic content and curated sections rather than arbitrary HTML, Vue, JavaScript, or freeform coordinates.
- Every trusted theme must support every public route, even when a particular content or transaction journey is its primary emphasis.
- Service Studio strengths include long-form services, service categories and details, process content, optional factual statistics, FAQs, contact and commission actions, honest empty states, and a strong mobile enquiry path.
- Informational Editorial strengths include long-form reading, nested-page wayfinding, blog integration, image/text storytelling, accessible lists and tables, honest empty states, and clear next-topic or contact paths.
- Commerce Market strengths include immediate product discovery, collection continuity, factual price and stock presentation, variants, favourites, cart, checkout, gift cards, payment states, and mobile commerce without duplicated transaction logic.
- Commerce Market must never invent urgency, discounts, reviews, delivery promises, best-seller status, inventory, or promotional claims.
- Never fabricate testimonials, statistics, clients, credentials, discounts, urgency, services, or merchant claims.
- Module requirements remain warnings or publish blockers; applying a theme never enables modules automatically.
- Theme changes remain private until explicitly published.
- Third-party uploads and a public marketplace are outside the current scope.
- Production deployment, migration execution, commits, and pushes remain owner-controlled.

## Brand Commitments

SSU Store Admin uses the established Calm Control Room system. Public themes may have distinct visual identities, but merchant appearance tokens, real content, accessibility, localization, and safe fallbacks remain authoritative.

## Evidence on Hand

- Real tenant SiteConfig, services, service categories, posts, products, media, custom pages, navigation, contact details, and module settings.
- Existing Classic storefront and shared `ThemeHost` implementation.
- Existing private preview, draft, review, schedule, publish, release, history, and rollback contracts.
- No approved theme photography, testimonials, metrics, logos, client marks, authorship, publication claims, or screenshots exist yet; future work must not invent them.

## Product Principles

1. Merchant truth over theme decoration.
2. The theme's primary visitor journey stays obvious at every viewport.
3. Themes change presentation without duplicating business logic.
4. Draft, publish, tenant, and rollback boundaries remain explicit.
5. Empty, disabled, missing-media, and long-content states are first-class designs.

## Accessibility & Inclusion

Public themes require keyboard navigation, visible focus, semantic landmarks and headings, sufficient contrast, reduced-motion support, touch-friendly targets, localized and long-content resilience, and honest alternative states when media or modules are unavailable.
