---
name: SSU Commerce Market Theme
description: A merchandising-first storefront shaped as a working merchant buying book.
colors:
  stock-paper: "#f2ede3"
  order-sheet: "#fffdf8"
  merchant-ink: "#202820"
  supporting-ink: "#5b6258"
  ledger-rule: "#aaa99d"
  registration-mark: "#a33d2e"
  merchant-action: "var(--color-primary-700, #315f6b)"
  on-action: "var(--on-primary, #ffffff)"
typography:
  display:
    fontFamily: "var(--font-heading)"
    fontSize: "clamp(2.5rem, 7vw, 5rem)"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "var(--font-heading)"
    fontWeight: 700
    letterSpacing: "-0.025em"
  body:
    fontFamily: "var(--font-body)"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  catalogue-label:
    fontFamily: "var(--font-body)"
    fontSize: "0.8125rem"
    fontWeight: 700
  register:
    fontFamily: "var(--font-body)"
    fontSize: "0.6875rem"
    fontWeight: 750
    letterSpacing: "0.13em"
  price:
    fontFamily: "var(--font-body)"
    fontSize: "0.875rem"
    fontWeight: 750
rounded:
  precise: "0.125rem"
spacing:
  compact: "0.5rem"
  control: "0.75rem"
  standard: "1rem"
  content: "1.5rem"
  section: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.merchant-action}"
    textColor: "{colors.on-action}"
    typography: "{typography.body}"
    rounded: "{rounded.precise}"
    padding: "0.75rem 1.25rem"
    height: "2.75rem"
  catalogue-link:
    backgroundColor: "{colors.order-sheet}"
    textColor: "{colors.merchant-ink}"
    typography: "{typography.catalogue-label}"
    rounded: "{rounded.precise}"
    padding: "0.75rem 1.125rem"
    height: "3.25rem"
  input:
    backgroundColor: "{colors.order-sheet}"
    textColor: "{colors.merchant-ink}"
    rounded: "{rounded.precise}"
    padding: "0.75rem 1rem"
---

# Design System: SSU Commerce Market Theme

## Overview

**Creative North Star: "The Merchant Buying Book"**

Commerce Market is a distinct SSU storefront world for product-led tenants. It turns discovery, comparison, ordering, and payment into one continuous merchant document: real product imagery sits beside factual names, prices, variants, stock states, and actions rather than inside promotional card chrome.

The system feels practical, tactile, and exact. Warm paper and ruled order sheets make dense catalogue information approachable; dark merchant ink anchors decisions; a vermilion registration mark identifies position; and the tenant's primary colour remains authoritative for actions and keyboard focus. Product photography stays untinted and transaction rules stay untouched.

**Key Characteristics:**

- Warm stock paper and clean order sheets.
- Ruled product rows with square, untinted image wells.
- Tabular prices and compact catalogue labels.
- Vermilion registration marks paired with semantic active states.
- Flat transaction documents without persistent shadows or decorative gradients.

## Colors

The palette borrows from printed buying books while retaining one tenant-controlled action colour.

### Primary

- **Merchant Action:** The tenant's published primary colour controls primary actions, active interactive surfaces, keyboard focus, carets, and selection.

### Secondary

- **Registration Mark:** Vermilion identifies the current catalogue position and important structural boundaries. It always accompanies text, route state, or placement.

### Neutral

- **Stock Paper:** The principal storefront and transaction ground.
- **Order Sheet:** Product lists, fields, summaries, and surfaces that need quiet separation.
- **Merchant Ink:** Headings, strong type, footer anchors, and recovery actions.
- **Supporting Ink:** Secondary descriptions, metadata, and inactive labels.
- **Ledger Rule:** One-pixel dividers, image wells, input borders, and transaction rows.
- **On Action:** Tenant-computed legible text on the merchant action colour.

### Named Rules

**The Price Is Factual Rule.** Price, inventory, tax, discount, shipping, and payment states come from the existing commerce system; the theme never decorates them into a different meaning.

**The Registration Has Two Signals Rule.** Vermilion may reinforce the current destination, but route semantics, text, or structure must communicate the same state independently.

## Typography

**Display Font:** The merchant's configured heading family with its storefront fallback.
**Body Font:** The merchant's configured body family with its storefront fallback.

**Character:** Typography behaves like a well-set order document. Large arrivals are compact and decisive; prices and counts use tabular numerals; labels are small, exact, and secondary to product names and actions.

### Hierarchy

- **Display** (700 weight, compact tracking, 0.96 line height): Shop, collection, favourites, cart, checkout, and product arrivals.
- **Headline** (700 weight, compact tracking): Merchandising groups and transaction summaries.
- **Body** (400 weight): Product descriptions, form help, delivery information, and general content.
- **Catalogue label** (700 weight): Tenant navigation and product-index destinations.
- **Register** (750 weight, wide tracking, uppercase): Tenant and current-route context.
- **Price** (750 weight, tabular numerals): Product prices, totals, and order values.

### Named Rules

**The Merchant Type Rule.** Preserve configured heading and body families; the buying-book identity comes from hierarchy, rules, alignment, and numerals rather than a fixed theme font.

## Layout

The shared header is followed by a compact three-part catalogue register and a horizontally resilient tenant-navigation index. Both align to the established 80rem storefront frame. The homepage reduces the hero to a maximum of 68svh so real merchandise enters the opening sequence quickly.

Product grids behave as ruled buying-book rows: each item begins with a one-pixel top rule, square media, a left-aligned caption, and a factual price. Product detail uses an image plate beside a bordered order sheet. Cart and checkout retain their existing responsive grids, but items and summaries become flat transaction documents with a vermilion registration band on the primary summary.

At mobile widths, the register collapses from three columns to two, the catalogue index remains horizontally scrollable, large headings scale fluidly, and cart rows wrap without changing transaction order or controls.

## Elevation & Depth

The system is flat. Persistent inherited shadows are removed. Depth comes from the difference between stock paper and order sheets, product media, one-pixel rules, the dark footer anchor, and the registration band.

### Named Rules

**The Document Before Card Rule.** Persistent commerce information uses a rule, paper tone, or spacing change instead of a floating card shadow.

## Shapes

Controls, fields, image wells, filter choices, and transaction surfaces normalize to precise 0.125rem corners. Product images may remain square. One-pixel borders create the order-document frame; small status indicators may retain their functional compact shape when that shape communicates an existing state.

## Components

### Buttons

- **Shape:** Precise corners and a minimum 2.75rem action height.
- **Primary:** Tenant action fill with computed on-action text and a matching one-pixel border.
- **Hover / Focus:** A slight brightness shift on hover; a two-pixel tenant-action outline with a three-pixel offset for keyboard focus.
- **Secondary:** A flat outlined action with no persistent shadow.

### Chips

- **Style:** Category and variant choices use precise corners, one-pixel rules, and compact labels.
- **State:** Selected choices use the existing semantic state plus action colour; disabled variants preserve the established unavailable state and interaction rules.

### Cards / Containers

- **Corner Style:** Precise or square.
- **Background:** Stock paper or order sheet according to hierarchy.
- **Shadow Strategy:** None at rest.
- **Border:** One-pixel ledger rules; product rows use a top rule.
- **Internal Padding:** Transaction documents use the existing content spacing while normalizing surface treatment.

### Inputs / Fields

- **Style:** Order-sheet fill, merchant ink, precise corners, and a ledger-rule border.
- **Focus:** Tenant-action outline and caret.
- **Error / Disabled:** Existing commerce validation, disabled behavior, and semantic colours remain authoritative.

### Navigation

The shared storefront header keeps its established behavior. Commerce Market adds a catalogue register and horizontally scrollable index sourced only from visible tenant navigation links. Active destinations use a filled registration mark plus `aria-current`; the mobile drawer uses the same paper and ink palette.

### Product Row

Product imagery remains untinted inside a square well. Name, optional merchant-supplied material, and price form a left-aligned factual caption. Hover media may crossfade using the existing product component, but availability and action never depend on hover.

### Transaction Document

Cart, checkout, gift-card, payment, and tracking surfaces retain existing logic and form order. The theme changes paper, rules, corners, and emphasis only; calculations, provider behavior, validation, and recovery remain shared.

## Do's and Don'ts

### Do:

- **Do** place real product imagery, name, price, availability, and actions early in the shopping journey.
- **Do** preserve the existing product, variant, favourite, cart, tax, shipping, discount, gift-card, checkout, payment, and tracking contracts.
- **Do** use tenant-provided navigation, merchandising content, media, and appearance tokens.
- **Do** preserve keyboard focus, reduced motion, localization, honest empty states, and mobile task parity.

### Don't:

- **Don't** fabricate discounts, urgency, reviews, best-seller status, inventory, delivery promises, product claims, or promotions.
- **Don't** tint product photography or let decorative media delay product discovery.
- **Don't** move API, tenant, cart, checkout, payment, SEO, localization, or module logic into the theme renderer.
- **Don't** use floating soft cards, ornamental gradients, or persistent shadows as the commerce structure.
