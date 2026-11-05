---
name: SSU Informational Editorial Theme
description: A reading-first storefront shaped as a clear civic reference folio.
colors:
  reading-paper: "#f7f8f4"
  raised-paper: "#ffffff"
  folio-ink: "#12263f"
  reading-ink: "#172431"
  supporting-ink: "#526273"
  index-rule: "#b8c5d0"
  position-marker: "#f2c14e"
  merchant-accent: "var(--color-primary-700, #315f9a)"
  on-ink: "#ffffff"
typography:
  display:
    fontFamily: "var(--font-heading)"
    fontWeight: 650
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "var(--font-heading)"
    fontWeight: 650
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
  index:
    fontFamily: "var(--font-body)"
    fontSize: "0.8125rem"
    fontWeight: 650
  running-head:
    fontFamily: "var(--font-body)"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.11em"
  folio-number:
    fontFamily: "var(--font-body)"
    fontSize: "0.625rem"
    fontWeight: 700
rounded:
  precise: "0.25rem"
spacing:
  compact: "0.5rem"
  control: "0.75rem"
  standard: "1rem"
  reading: "1.5rem"
  section: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.folio-ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.precise}"
    padding: "0.75rem 1.25rem"
    height: "2.75rem"
  index-link:
    backgroundColor: "{colors.raised-paper}"
    textColor: "{colors.folio-ink}"
    typography: "{typography.index}"
    rounded: "{rounded.precise}"
    padding: "0.75rem 1rem"
    height: "3.25rem"
  input:
    backgroundColor: "{colors.raised-paper}"
    textColor: "{colors.reading-ink}"
    rounded: "{rounded.precise}"
    padding: "0.75rem 1rem"
---

# Design System: SSU Informational Editorial Theme

## Overview

**Creative North Star: "The Civic Reference Folio"**

Informational Editorial is a distinct public storefront world within SSU. It makes an organisation's pages, articles, and structured information feel dependable and findable through an ink-blue frame, cool reading paper, indexed navigation, running heads, and calm text measures. The theme supplies visual organisation while the merchant supplies every topic, claim, author, image, and action.

The frame commits strongly without competing with the reading column. Folio markers and saffron position bands help visitors understand where they are, while conventional links, hierarchy, article patterns, tables, and forms remain recognizable. Merchant heading and body families stay authoritative, and the merchant primary color remains the focus and active-state accent.

**Key Characteristics:**

- Ink-blue information frame around cool reading paper.
- Saffron position markers used with text and structure, never alone.
- Indexed wayfinding and tabular folio numbers.
- Reading columns constrained to roughly 72 characters.
- Flat panels separated by rules, tone, and spacing rather than shadows.

## Colors

The palette separates the document frame from the reading field while retaining one tenant-controlled interactive accent.

### Primary

- **Merchant Accent:** Active navigation, keyboard focus, selection, and field carets follow the tenant's published primary color.

### Secondary

- **Position Marker:** A saffron band identifies location and important structural boundaries; accompanying text or placement always carries the same meaning.

### Neutral

- **Reading Paper:** The principal long-form canvas.
- **Raised Paper:** Navigation, fields, and surfaces needing quiet tonal separation.
- **Folio Ink:** Mastheads, strong actions, primary type, and footer anchors.
- **Reading Ink:** Running text and dense informational content.
- **Supporting Ink:** Metadata, secondary descriptions, and inactive folio labels.
- **Index Rule:** One-pixel dividers, table strokes, and navigation boundaries.
- **On Ink:** Text on ink-blue controls and panels.

### Named Rules

**The Position Has Two Signals Rule.** Saffron may reinforce the current location, but a label, underline, route, or structural placement must communicate it independently.

**The Tenant Truth Rule.** Theme color and structure may organize supplied information; they never imply authority, authorship, publication history, or institutional proof the tenant did not provide.

## Typography

**Display Font:** The merchant's heading font with its configured storefront fallback.
**Body Font:** The merchant's body font with its configured storefront fallback.

**Character:** Information hierarchy comes from measure, weight, tabular numerals, and disciplined spacing rather than a theme-owned editorial typeface. Running text stays quiet while mastheads and section openers provide orientation.

### Hierarchy

- **Display** (650 weight, compact tracking): Page and article arrivals, generally limited to about 14–15 characters per line.
- **Headline** (650 weight, compact tracking): Major sections and related-information groups.
- **Body** (400 weight): Navigation explanations, summaries, forms, and general content.
- **Long-form** (400 weight, 1.85 line height): Articles and structured information at a maximum measure of roughly 72 characters.
- **Index** (650 weight): Standard destination labels in the horizontal index.
- **Running head** (700 weight, wide tracking, uppercase): Tenant, folio, and route context.
- **Folio number** (700 weight, tabular numerals): Compact destination numbering.

### Named Rules

**The Reading Column Rule.** World-building belongs to the masthead, navigation, rules, and openers; running text stays at a familiar size, contrast, and measure.

**The Merchant Type Rule.** Preserve configured heading and body families; do not impose a fixed magazine serif or technical monospace identity.

## Layout

The shared tenant header is followed by a three-part running head and a horizontally scrollable destination index. Both are bounded to an 80rem desktop frame. Page heroes and key information arrivals use folio ink with a saffron bottom marker; content returns to cool paper and a narrow reading column.

Long-form articles and narrow custom-page blocks cap at 72 characters. Lists and related material use one-pixel top rules rather than floating cards. At mobile widths, the route label yields to the tenant and folio context, the destination index remains horizontally available, hero height reduces, and article leading tightens without changing reading order.

## Elevation & Depth

The system is flat. Inherited card shadows are removed. Depth is communicated through ink-blue anchor regions, paper tone, media, saffron boundary bands, one-pixel rules, and whitespace.

### Named Rules

**The Flat Reference Rule.** A persistent informational surface uses a rule, tone, or spacing change instead of a box shadow.

## Shapes

Controls and inherited rounded surfaces normalize to precise 0.25rem corners. Editorial rows may remain square. Fine one-pixel borders, dividers, and table strokes create the folio's exact frame without turning every content block into a card.

## Components

### Buttons

- **Shape:** Precise corners and a minimum 2.75rem action height.
- **Primary:** Folio-ink fill with white text and a matching one-pixel border.
- **Focus:** A two-pixel merchant-accent outline with a three-pixel offset.
- **Disabled:** Reduced opacity and a waiting cursor only while an operation is pending.

### Cards / Containers

- **Corner Style:** Precise or square rather than pill-shaped.
- **Background:** Reading paper or raised paper according to hierarchy.
- **Shadow Strategy:** No persistent shadows.
- **Border:** Index-rule dividers; article and related-item rows use a top rule.

### Inputs / Fields

- **Style:** Raised-paper fill, reading ink, precise corners, and an index-rule border.
- **Focus:** Merchant-accent outline and caret.

### Navigation

The shared storefront header retains standard behavior. The theme adds a running head and a horizontally scrollable information index sourced only from visible tenant navigation links. Active destinations use saffron reinforcement plus `aria-current`; the mobile drawer adopts the same paper and ink palette.

### Long-form Article

Articles use familiar headings, links, lists, blockquotes, code, and tables inside the calm reading column. Blockquotes use a one-pixel ink rule and a light marker tint. Table headers use folio ink with white text. Authorship and dates appear only when present in tenant data.

## Do's and Don'ts

### Do:

- **Do** keep the reader's current location and next destinations visible.
- **Do** constrain long-form content to a readable measure and preserve familiar document structures.
- **Do** use real tenant navigation, articles, pages, images, metadata, and contact actions.
- **Do** preserve keyboard focus, reduced motion, localization, and transaction behavior on every route.

### Don't:

- **Don't** turn the reading column into a poster, magazine cover, or decorative interface.
- **Don't** use saffron or the merchant accent as the only indication of state.
- **Don't** fabricate authors, publication dates, topics, statistics, institutional claims, media, or calls to action.
- **Don't** move API, tenant, cart, checkout, form, SEO, localization, or module logic into the theme renderer.
