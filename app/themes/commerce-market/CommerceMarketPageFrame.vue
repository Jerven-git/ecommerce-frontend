<template>
  <div class="commerce-market-page" :data-page-kind="viewModel.kind">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { StorefrontPageViewModel } from '~/themes/contracts'

defineProps<{
  viewModel: StorefrontPageViewModel
}>()
</script>

<style scoped>
.commerce-market-page {
  --market-paper: #f2ede3;
  --market-sheet: #fffdf8;
  --market-ink: #202820;
  --market-muted: #5b6258;
  --market-rule: #aaa99d;
  --market-register: #a33d2e;
  --market-action: var(--color-primary-700, #315f6b);
  --market-on-action: var(--on-primary, #ffffff);
  min-height: 60vh;
  background: var(--market-paper);
  color: var(--market-ink);
  scrollbar-color: var(--market-action) var(--market-paper);
}

.commerce-market-page :deep(h1),
.commerce-market-page :deep(h2),
.commerce-market-page :deep(h3) {
  color: var(--market-ink);
  letter-spacing: -0.025em;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.commerce-market-page :deep(p) {
  overflow-wrap: anywhere;
  text-wrap: pretty;
}

.commerce-market-page :deep(a:focus-visible),
.commerce-market-page :deep(button:focus-visible),
.commerce-market-page :deep(input:focus-visible),
.commerce-market-page :deep(textarea:focus-visible),
.commerce-market-page :deep(select:focus-visible),
.commerce-market-page :deep(summary:focus-visible) {
  outline: 2px solid var(--market-action) !important;
  outline-offset: 3px !important;
}

.commerce-market-page :deep(.bg-gray-50),
.commerce-market-page :deep(.bg-gray-50\/40),
.commerce-market-page :deep(.section-accent) {
  background: var(--market-paper) !important;
}

.commerce-market-page :deep(.bg-white) {
  background: var(--market-sheet) !important;
}

.commerce-market-page :deep(.text-gray-800),
.commerce-market-page :deep(.text-gray-900),
.commerce-market-page :deep(.text-gray-950) {
  color: var(--market-ink) !important;
}

.commerce-market-page :deep(.text-gray-400),
.commerce-market-page :deep(.text-gray-500),
.commerce-market-page :deep(.text-gray-600),
.commerce-market-page :deep(.text-gray-700) {
  color: var(--market-muted) !important;
}

.commerce-market-page :deep(.border-gray-100),
.commerce-market-page :deep(.border-gray-200),
.commerce-market-page :deep(.border-gray-300) {
  border-color: var(--market-rule) !important;
}

.commerce-market-page :deep(.shadow-sm),
.commerce-market-page :deep(.shadow-md),
.commerce-market-page :deep(.shadow-lg),
.commerce-market-page :deep(.shadow-xl),
.commerce-market-page :deep(.shadow-2xl) {
  box-shadow: none !important;
}

.commerce-market-page :deep(.rounded-lg),
.commerce-market-page :deep(.rounded-xl),
.commerce-market-page :deep(.rounded-2xl),
.commerce-market-page :deep(.rounded-3xl) {
  border-radius: 0.125rem !important;
}

.commerce-market-page :deep(.btn-primary),
.commerce-market-page :deep(.hero-cta-primary) {
  border: 1px solid var(--market-action) !important;
  border-radius: 0.125rem !important;
  background: var(--market-action) !important;
  color: var(--market-on-action) !important;
  box-shadow: none !important;
}

.commerce-market-page :deep(.btn-secondary),
.commerce-market-page :deep(.hero-cta-ghost) {
  border: 1px solid currentColor !important;
  border-radius: 0.125rem !important;
  box-shadow: none !important;
}

.commerce-market-page :deep(.btn-primary:hover),
.commerce-market-page :deep(.hero-cta-primary:hover) {
  filter: brightness(0.9);
  transform: none !important;
}

.commerce-market-page :deep(input),
.commerce-market-page :deep(textarea),
.commerce-market-page :deep(select) {
  border-color: var(--market-rule) !important;
  border-radius: 0.125rem !important;
  background: var(--market-sheet) !important;
  color: var(--market-ink) !important;
  caret-color: var(--market-action);
}

.commerce-market-page :deep(input::placeholder),
.commerce-market-page :deep(textarea::placeholder) {
  color: var(--market-muted) !important;
  opacity: 0.78;
}

/* Homepage: the real offer and product row share the opening sequence. */
.commerce-market-page[data-page-kind='home'] :deep([data-storefront-section]) {
  border-bottom: 1px solid var(--market-rule);
}

.commerce-market-page[data-page-kind='home'] :deep(.hero) {
  min-height: min(42rem, 68svh) !important;
  border-bottom: 0.5rem solid var(--market-register);
}

.commerce-market-page[data-page-kind='home'] :deep(.hero-grain) {
  display: none !important;
}

.commerce-market-page[data-page-kind='home'] :deep(.hero > .bg-gradient-to-r) {
  background: linear-gradient(90deg, rgba(25, 31, 25, 0.84), rgba(25, 31, 25, 0.24) 72%, transparent) !important;
}

.commerce-market-page[data-page-kind='home'] :deep(.hero h1) {
  max-width: 12ch;
  font-weight: 700;
}

.commerce-market-page[data-page-kind='home'] :deep(.hero-scroll) {
  display: none !important;
}

.commerce-market-page[data-page-kind='home'] :deep(#featured) {
  background: var(--market-sheet) !important;
  padding-block: clamp(3rem, 7vw, 6rem) !important;
}

.commerce-market-page[data-page-kind='home'] :deep(#featured > div > div:first-child) {
  border-bottom-color: var(--market-ink) !important;
}

.commerce-market-page[data-page-kind='home'] :deep(#featured .grid > div) {
  border-top: 1px solid var(--market-rule);
  padding-top: 0.75rem;
}

.commerce-market-page[data-page-kind='home'] :deep(.section-accent) {
  background: var(--market-paper) !important;
}

/* Product lists: ruled buying-book rows with untinted media and factual captions. */
.commerce-market-page[data-page-kind='shop'] :deep(.min-h-screen > .bg-white:first-child),
.commerce-market-page[data-page-kind='collection'] :deep(.min-h-screen > .bg-white:first-child),
.commerce-market-page[data-page-kind='favorites'] :deep(.min-h-screen > .bg-white:first-child) {
  background: var(--market-sheet) !important;
}

.commerce-market-page[data-page-kind='collection'] :deep(.min-h-screen > section:first-child p:first-child),
.commerce-market-page[data-page-kind='collection'] :deep(.min-h-screen > .bg-white:first-child p:first-child),
.commerce-market-page[data-page-kind='favorites'] :deep(.min-h-screen > .bg-white:first-child p:first-child),
.commerce-market-page[data-page-kind='cart'] :deep(.min-h-screen > .bg-white:first-child p:first-child),
.commerce-market-page[data-page-kind='checkout'] :deep(.min-h-screen > .bg-white:first-child p:first-child),
.commerce-market-page[data-page-kind='gift-cards'] :deep(section:first-child p:first-child) {
  display: none !important;
}

.commerce-market-page[data-page-kind='shop'] :deep(.min-h-screen > .bg-white:first-child > div),
.commerce-market-page[data-page-kind='collection'] :deep(.min-h-screen > .bg-white:first-child > div),
.commerce-market-page[data-page-kind='favorites'] :deep(.min-h-screen > .bg-white:first-child > div) {
  padding-block: clamp(2.5rem, 6vw, 5rem) !important;
}

.commerce-market-page[data-page-kind='shop'] :deep(h1),
.commerce-market-page[data-page-kind='collection'] :deep(h1),
.commerce-market-page[data-page-kind='favorites'] :deep(h1) {
  max-width: 14ch;
  font-size: clamp(2.5rem, 7vw, 5rem) !important;
  line-height: 0.96;
}

.commerce-market-page[data-page-kind='shop'] :deep(.category-slider button),
.commerce-market-page[data-page-kind='collection'] :deep(.category-slider button) {
  min-height: 2.75rem;
  border-radius: 0.125rem !important;
  box-shadow: none !important;
  transform: none !important;
}

.commerce-market-page[data-page-kind='shop'] :deep(.bg-gradient-to-b),
.commerce-market-page[data-page-kind='collection'] :deep(.bg-gradient-to-b) {
  background: var(--market-paper) !important;
}

.commerce-market-page[data-page-kind='shop'] :deep(.bg-gradient-to-r),
.commerce-market-page[data-page-kind='collection'] :deep(.bg-gradient-to-r) {
  background: var(--market-rule) !important;
}

.commerce-market-page[data-page-kind='shop'] :deep(.section-accent .grid > .card-stagger),
.commerce-market-page[data-page-kind='collection'] :deep(.section-accent .grid > .card-stagger),
.commerce-market-page[data-page-kind='favorites'] :deep(.grid > .card-stagger) {
  border-top: 1px solid var(--market-rule);
  padding-top: 0.75rem;
}

.commerce-market-page[data-page-kind='shop'] :deep(a.group > div:first-child),
.commerce-market-page[data-page-kind='collection'] :deep(a.group > div:first-child),
.commerce-market-page[data-page-kind='favorites'] :deep(a.group > div:first-child),
.commerce-market-page[data-page-kind='home'] :deep(a.group > div:first-child) {
  border-radius: 0 !important;
  background: color-mix(in srgb, var(--market-rule) 18%, var(--market-paper)) !important;
}

.commerce-market-page[data-page-kind='shop'] :deep(a.group > div:last-child),
.commerce-market-page[data-page-kind='collection'] :deep(a.group > div:last-child),
.commerce-market-page[data-page-kind='favorites'] :deep(a.group > div:last-child),
.commerce-market-page[data-page-kind='home'] :deep(a.group > div:last-child) {
  text-align: left !important;
}

.commerce-market-page[data-page-kind='shop'] :deep(a.group > div:last-child > p:last-child),
.commerce-market-page[data-page-kind='collection'] :deep(a.group > div:last-child > p:last-child),
.commerce-market-page[data-page-kind='favorites'] :deep(a.group > div:last-child > p:last-child),
.commerce-market-page[data-page-kind='home'] :deep(a.group > div:last-child > p:last-child) {
  color: var(--market-register) !important;
  font-size: 0.875rem !important;
  font-variant-numeric: tabular-nums;
  font-weight: 750;
}

/* Product detail: image plate beside a ruled order sheet. */
.commerce-market-page[data-page-kind='product'] :deep(.min-h-screen) {
  background: var(--market-paper) !important;
}

.commerce-market-page[data-page-kind='product'] :deep(.min-h-screen > .max-w-7xl:first-child) {
  border-bottom: 1px solid var(--market-rule);
}

.commerce-market-page[data-page-kind='product'] :deep(.aspect-square) {
  border: 1px solid var(--market-rule);
  border-radius: 0 !important;
  background: var(--market-sheet) !important;
}

.commerce-market-page[data-page-kind='product'] :deep(.grid.grid-cols-1.lg\:grid-cols-2 > div:last-child) {
  border-top: 1px solid var(--market-ink);
  background: var(--market-sheet);
  padding: clamp(1.5rem, 4vw, 3rem) !important;
}

.commerce-market-page[data-page-kind='product'] :deep(h1) {
  max-width: 16ch;
  font-size: clamp(2.25rem, 5vw, 4.5rem) !important;
  line-height: 0.98 !important;
}

.commerce-market-page[data-page-kind='product'] :deep(dl) {
  border-color: var(--market-rule) !important;
}

.commerce-market-page[data-page-kind='product'] :deep(dl > div) {
  border-bottom: 1px solid var(--market-rule);
  padding-block: 0.625rem;
}

.commerce-market-page[data-page-kind='product'] :deep(button.rounded-full),
.commerce-market-page[data-page-kind='product'] :deep(button.rounded-lg) {
  border-radius: 0.125rem !important;
}

/* Cart and checkout preserve all calculations while reading as order documents. */
.commerce-market-page[data-page-kind='cart'] :deep(.min-h-screen > .bg-white:first-child),
.commerce-market-page[data-page-kind='checkout'] :deep(.min-h-screen > .bg-white:first-child) {
  border-bottom: 1px solid var(--market-ink) !important;
  background: var(--market-sheet) !important;
}

.commerce-market-page[data-page-kind='cart'] :deep(.min-h-screen > .bg-white:first-child h1),
.commerce-market-page[data-page-kind='checkout'] :deep(.min-h-screen > .bg-white:first-child h1) {
  font-size: clamp(2.5rem, 6vw, 4.75rem) !important;
  line-height: 0.98;
}

.commerce-market-page[data-page-kind='cart'] :deep(.card-stagger),
.commerce-market-page[data-page-kind='cart'] :deep(.sticky),
.commerce-market-page[data-page-kind='checkout'] :deep(.bg-white.rounded-2xl),
.commerce-market-page[data-page-kind='gift-cards'] :deep(.bg-white.rounded-2xl) {
  border: 1px solid var(--market-rule) !important;
  border-radius: 0.125rem !important;
  background: var(--market-sheet) !important;
  box-shadow: none !important;
}

.commerce-market-page[data-page-kind='cart'] :deep(.card-stagger) {
  border-inline: 0 !important;
  border-bottom: 0 !important;
}

.commerce-market-page[data-page-kind='cart'] :deep(.card-stagger > div > div:first-child) {
  border-radius: 0 !important;
}

.commerce-market-page[data-page-kind='cart'] :deep(.sticky),
.commerce-market-page[data-page-kind='checkout'] :deep(.sticky) {
  border-top: 0.375rem solid var(--market-register) !important;
}

.commerce-market-page[data-page-kind='cart'] :deep(.tabular-nums),
.commerce-market-page[data-page-kind='checkout'] :deep(.tabular-nums) {
  font-variant-numeric: tabular-nums;
}

.commerce-market-page[data-page-kind='checkout'] :deep(.fixed.inset-0 > .bg-white) {
  border: 1px solid var(--market-ink) !important;
  border-radius: 0.125rem !important;
}

/* Gift cards and secondary routes stay in the same transaction language. */
.commerce-market-page[data-page-kind='gift-cards'] :deep(section:first-child) {
  min-height: min(34rem, 54svh) !important;
  border-bottom: 0.5rem solid var(--market-register);
}

.commerce-market-page[data-page-kind='gift-cards'] :deep(.hero-media-grain) {
  display: none !important;
}

.commerce-market-page[data-page-kind='gift-cards'] :deep(.max-w-3xl > .bg-white) {
  border-top-color: var(--market-ink) !important;
}

.commerce-market-page[data-page-kind='tracking'] :deep(.bg-white),
.commerce-market-page[data-page-kind='payment-complete'] :deep(.bg-white),
.commerce-market-page[data-page-kind='backorder-payment'] :deep(.bg-white) {
  border-color: var(--market-rule) !important;
  border-radius: 0.125rem !important;
  box-shadow: none !important;
}

@media (max-width: 767px) {
  .commerce-market-page[data-page-kind='home'] :deep(.hero) {
    min-height: 62svh !important;
  }

  .commerce-market-page[data-page-kind='shop'] :deep(h1),
  .commerce-market-page[data-page-kind='collection'] :deep(h1),
  .commerce-market-page[data-page-kind='favorites'] :deep(h1) {
    font-size: clamp(2.5rem, 14vw, 4rem) !important;
  }

  .commerce-market-page[data-page-kind='cart'] :deep(.card-stagger > div) {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .commerce-market-page[data-page-kind='cart'] :deep(.card-stagger > div > div:nth-child(2)) {
    min-width: calc(100% - 6rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .commerce-market-page :deep(.hero-stagger),
  .commerce-market-page :deep(.card-stagger),
  .commerce-market-page :deep(.category-stagger),
  .commerce-market-page :deep(.reveal),
  .commerce-market-page :deep(.reveal-from-left),
  .commerce-market-page :deep(.reveal-from-right),
  .commerce-market-page :deep(.featured-card) {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}

@media (max-width: 640px) {
  .commerce-market-page :deep(input),
  .commerce-market-page :deep(textarea),
  .commerce-market-page :deep(select) {
    font-size: 1rem !important;
  }
}
</style>
