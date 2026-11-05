<template>
  <div class="service-studio-page" :data-page-kind="viewModel.kind">
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
.service-studio-page {
  --studio-paper: #f3f0e7;
  --studio-paper-raised: #fbfaf6;
  --studio-ink: #17201d;
  --studio-muted: #59655f;
  --studio-rule: #c9cec7;
  --studio-accent: var(--color-primary-700, #355f55);
  min-height: 60vh;
  background: var(--studio-paper);
  color: var(--studio-ink);
  scrollbar-color: var(--studio-muted) var(--studio-paper);
}

.service-studio-page :deep(h1),
.service-studio-page :deep(h2),
.service-studio-page :deep(h3) {
  color: var(--studio-ink);
  letter-spacing: -0.025em;
  overflow-wrap: anywhere;
}

.service-studio-page :deep(p) {
  overflow-wrap: anywhere;
  text-wrap: pretty;
}

.service-studio-page :deep(a:focus-visible),
.service-studio-page :deep(button:focus-visible),
.service-studio-page :deep(input:focus-visible),
.service-studio-page :deep(textarea:focus-visible),
.service-studio-page :deep(select:focus-visible) {
  outline: 2px solid var(--studio-accent) !important;
  outline-offset: 3px !important;
}

.service-studio-page :deep(.bg-gray-50),
.service-studio-page :deep(.section-accent) {
  background: var(--studio-paper) !important;
}

.service-studio-page :deep(.bg-white) {
  background: var(--studio-paper-raised) !important;
}

.service-studio-page :deep(.text-gray-900),
.service-studio-page :deep(.text-gray-950) {
  color: var(--studio-ink) !important;
}

.service-studio-page :deep(.text-gray-400),
.service-studio-page :deep(.text-gray-500),
.service-studio-page :deep(.text-gray-600),
.service-studio-page :deep(.text-gray-700) {
  color: var(--studio-muted) !important;
}

.service-studio-page :deep(.border-gray-100),
.service-studio-page :deep(.border-gray-200),
.service-studio-page :deep(.border-gray-300) {
  border-color: var(--studio-rule) !important;
}

.service-studio-page :deep(.shadow-sm),
.service-studio-page :deep(.shadow-md),
.service-studio-page :deep(.shadow-lg),
.service-studio-page :deep(.shadow-xl),
.service-studio-page :deep(.shadow-2xl) {
  box-shadow: none !important;
}

.service-studio-page :deep(.rounded-2xl),
.service-studio-page :deep(.rounded-3xl) {
  border-radius: 0.875rem !important;
}

.service-studio-page :deep(.btn-primary),
.service-studio-page :deep(.hero-cta-primary),
.service-studio-page :deep(.svc-cta-primary) {
  border-radius: 0.75rem !important;
  background: var(--studio-ink) !important;
  color: #fff !important;
  box-shadow: none !important;
}

.service-studio-page[data-page-kind='home'] :deep([data-storefront-section]) {
  border-bottom: 1px solid var(--studio-rule);
}

.service-studio-page[data-page-kind='home'] :deep(.hero) {
  min-height: min(50rem, 84svh) !important;
}

.service-studio-page[data-page-kind='home'] :deep(.hero > .bg-gradient-to-r) {
  background: linear-gradient(90deg, rgba(10, 18, 15, 0.82), rgba(10, 18, 15, 0.24) 72%, transparent) !important;
}

.service-studio-page[data-page-kind='home'] :deep(.hero h1) {
  max-width: 12ch;
  font-weight: 600;
}

.service-studio-page[data-page-kind='home'] :deep(.hero-scroll) {
  display: none !important;
}

.service-studio-page[data-page-kind='services-index'] :deep(.min-h-screen > section:first-child),
.service-studio-page[data-page-kind='service-detail'] :deep(.min-h-screen > section:first-of-type) {
  background: var(--studio-ink) !important;
}

.service-studio-page[data-page-kind='services-index'] :deep(.min-h-screen > section:first-child) {
  min-height: min(44rem, 72svh) !important;
}

.service-studio-page[data-page-kind='services-index'] :deep(.svc-hero-grain) {
  display: none;
}

.service-studio-page[data-page-kind='services-index'] :deep(.min-h-screen > section:first-child h1),
.service-studio-page[data-page-kind='service-detail'] :deep(.min-h-screen > section:first-of-type h1) {
  max-width: 13ch;
  color: #fff;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.service-studio-page[data-page-kind='services-index'] :deep(.min-h-screen > section:nth-child(2)) {
  border-bottom: 1px solid var(--studio-rule);
  background: var(--studio-paper) !important;
}

.service-studio-page[data-page-kind='services-index'] :deep(.min-h-screen > section:nth-child(2) > div > div > div) {
  border-top-color: var(--studio-ink) !important;
}

.service-studio-page[data-page-kind='services-index'] :deep(.min-h-screen > section[class*='border-b'] > div) {
  max-width: 80rem;
}

.service-studio-page[data-page-kind='services-index'] :deep(a.group) {
  border-top: 1px solid var(--studio-rule);
  padding-top: 2.5rem;
}

.service-studio-page[data-page-kind='services-index'] :deep(a.group h3) {
  font-weight: 600;
}

.service-studio-page[data-page-kind='services-index'] :deep(a.group img) {
  filter: saturate(0.78) contrast(1.04);
}

.service-studio-page[data-page-kind='services-index'] :deep(.bg-secondary-900) {
  background: var(--studio-ink) !important;
}

.service-studio-page[data-page-kind='service-detail'] :deep(article) {
  max-width: 72ch;
  padding-block: clamp(3rem, 8vw, 7rem);
}

.service-studio-page[data-page-kind='service-detail'] :deep(.post-prose) {
  color: var(--studio-muted);
  font-size: 1.0625rem;
  line-height: 1.85;
}

.service-studio-page[data-page-kind='service-detail'] :deep(.post-prose h2),
.service-studio-page[data-page-kind='service-detail'] :deep(.post-prose h3) {
  color: var(--studio-ink);
  font-weight: 600;
}

.service-studio-page[data-page-kind='service-detail'] :deep(.grid > a.group) {
  border-top: 1px solid var(--studio-rule);
  background: transparent !important;
}

.service-studio-page :deep(input),
.service-studio-page :deep(textarea),
.service-studio-page :deep(select) {
  border-color: var(--studio-rule) !important;
  background: var(--studio-paper-raised) !important;
  color: var(--studio-ink) !important;
  caret-color: var(--studio-accent);
}

@media (max-width: 767px) {
  .service-studio-page[data-page-kind='home'] :deep(.hero) {
    min-height: 76svh !important;
  }

  .service-studio-page[data-page-kind='services-index'] :deep(a.group) {
    gap: 1.5rem;
    padding-top: 2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .service-studio-page :deep(.hero-stagger),
  .service-studio-page :deep(.reveal),
  .service-studio-page :deep(.reveal-from-left),
  .service-studio-page :deep(.reveal-from-right) {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}

@media (max-width: 640px) {
  .service-studio-page :deep(input),
  .service-studio-page :deep(textarea),
  .service-studio-page :deep(select) {
    font-size: 1rem !important;
  }
}
</style>
