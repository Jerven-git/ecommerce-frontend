---
name: SSU Service Studio Theme
description: A services-first storefront with the quiet authority and factual wayfinding of a contemporary exhibition guide.
colors:
  mineral-paper: "#f3f0e7"
  raised-paper: "#fbfaf6"
  deep-ink: "#17201d"
  muted-ink: "#59655f"
  hairline-rule: "#c9cec7"
  wayfinding-accent: "var(--color-primary-700, #355f55)"
  on-ink: "#ffffff"
typography:
  display:
    fontFamily: "var(--font-heading)"
    fontWeight: 600
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "var(--font-heading)"
    fontWeight: 600
    letterSpacing: "-0.025em"
  body:
    fontFamily: "var(--font-body)"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  longform:
    fontFamily: "var(--font-body)"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "var(--font-body)"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.14em"
rounded:
  control: "0.75rem"
  surface: "0.875rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section-rule: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.deep-ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.25rem"
    height: "2.75rem"
  card:
    backgroundColor: "{colors.raised-paper}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.surface}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "{colors.raised-paper}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1rem"
---

# Design System: SSU Service Studio Theme

## Overview

**Creative North Star: "The Contemporary Exhibition Guide"**

Service Studio is a storefront world within SSU, not a replacement for the Calm Control Room admin system or the Classic storefront. It gives service providers quiet authority through warm material surfaces, editorial pacing, factual wayfinding, and disciplined hierarchy. Merchant content and appearance tokens remain the evidence and identity; the theme supplies composition, not claims.

The system is restrained and legible rather than ornamental. Deep ink establishes strong arrival moments, mineral paper supports reading, hairline rules organize the journey, and the merchant's primary color appears as a controlled navigation and focus accent. Long-form material receives generous measure and leading, while services and contact actions remain easy to find.

**Key Characteristics:**

- Warm paper surfaces with deep-ink anchors.
- Hairline rules and spacing create structure without shadow.
- Merchant typography and primary color remain authoritative.
- Editorial measures support service details and supporting material.
- Honest empty and missing-media states never fabricate evidence.

## Colors

The palette behaves like printed matter: warm neutral grounds, dark readable ink, quiet dividers, and one merchant-controlled wayfinding accent.

### Primary

- **Merchant Wayfinding Accent:** Used sparingly for active navigation, keyboard focus, selection, and caret states; its value follows the tenant's published appearance.

### Neutral

- **Mineral Paper:** The principal storefront canvas.
- **Raised Paper:** Cards, fields, and selected surfaces that need tonal separation.
- **Deep Ink:** Primary text, strong actions, service introductions, and the footer.
- **Muted Ink:** Supporting copy and subdued wayfinding.
- **Hairline Rule:** Dividers and service-row structure.
- **On Ink:** Text placed on deep-ink controls and surfaces.

### Named Rules

**The Merchant Accent Rule.** The theme may guide where the tenant's primary color appears, but it must not replace that color with a theme-owned brand accent.

**The Evidence Rule.** Missing media or proof becomes structured space or an honest empty state, never invented photography, logos, metrics, or testimonials.

## Typography

**Display Font:** The merchant's heading font, with the storefront's configured fallback.
**Body Font:** The merchant's body font, with the storefront's configured fallback.

**Character:** Hierarchy comes from editorial scale, confident medium weight, compact display tracking, readable measure, and generous long-form leading. The theme does not impose a separate typeface identity over the merchant's appearance settings.

### Hierarchy

- **Display** (600 weight, tight tracking): Short propositions and service introductions, generally limited to roughly 12–13 characters of measure per line.
- **Headline** (600 weight, tight tracking): Section titles and service names.
- **Body** (400 weight, standard reading rhythm): Navigation explanations, descriptions, and general content.
- **Long-form** (400 weight, 1.85 line height): Service details and editorial reading, constrained to about 72 characters.
- **Label** (700 weight, wide tracking, uppercase): Compact route and navigation wayfinding.

### Named Rules

**The Merchant Type Rule.** Preserve the configured heading and body families; theme hierarchy is created with weight, spacing, scale, and measure.

## Layout

The shell adds a slim route marker between storefront navigation and page content. Large arrival sections use deep ink or merchant media, followed by warm paper sections separated with hairline rules. Services read as an ordered editorial sequence rather than floating dashboard cards.

The desktop content ceiling is 80rem. Service articles narrow to 72 characters for sustained reading. On smaller viewports, hero height remains substantial, service-row gaps tighten, and the same content order and enquiry path are preserved. All public page kinds pass through the shared frame so the layout language extends beyond the services routes without duplicating controllers.

## Elevation & Depth

Service Studio is flat by design. It removes inherited small through extra-large shadows and creates depth with tonal paper changes, dark anchor sections, image contrast, hairline rules, and spacing.

### Named Rules

**The Flat Exhibition Rule.** Persistent surfaces do not float; separate them through tone, rule, or space rather than box shadow.

## Shapes

Controls use gently rounded 0.75rem corners, while cards and large inherited surfaces normalize to 0.875rem. One-pixel borders and rules remain crisp. The shape vocabulary is restrained so content, media, and hierarchy carry the identity.

## Components

### Buttons

- **Shape:** Gently curved control corners with a minimum 2.75rem height.
- **Primary:** Deep-ink fill, white text, and compact horizontal padding.
- **Focus:** A two-pixel merchant-accent outline with a three-pixel offset.
- **Disabled:** Lower opacity with a waiting cursor when an operation is pending.

### Cards / Containers

- **Corner Style:** Gently curved surface corners.
- **Background:** Raised paper where separation is necessary; transparent paper for editorial service rows.
- **Shadow Strategy:** No persistent shadow.
- **Border:** Hairline rules organize rows and section boundaries.

### Inputs / Fields

- **Style:** Raised-paper fill, deep-ink text, hairline border, and merchant-accent caret.
- **Focus:** The same visible accent outline used for buttons and links.

### Navigation

The theme reuses the shared tenant-aware header and mobile navigation. Labels use compact uppercase wayfinding, active links adopt the merchant accent, and the route marker shows the tenant name and current top-level route. The mobile drawer inherits paper and ink colors without changing navigation behavior.

### Service Sequence

Service listings use top rules, editorial spacing, direct labels, and restrained media treatment. Service details use a narrow reading column and generous vertical padding. The component never manufactures credibility content to fill sparse tenant data.

## Do's and Don'ts

### Do:

- **Do** preserve real tenant content, appearance tokens, module gates, and shared storefront behavior.
- **Do** use hairline rules, tonal surfaces, and spacing to organize long service journeys.
- **Do** keep service discovery and a contact action obvious at desktop and mobile sizes.
- **Do** honor visible focus and reduced-motion preferences.

### Don't:

- **Don't** introduce persistent card shadows into Service Studio.
- **Don't** override the merchant's configured type families or primary color with a fixed theme identity.
- **Don't** fabricate photography, testimonials, statistics, clients, credentials, services, discounts, or urgency.
- **Don't** move API, tenant, cart, checkout, form, SEO, localization, or module logic into the theme renderer.
