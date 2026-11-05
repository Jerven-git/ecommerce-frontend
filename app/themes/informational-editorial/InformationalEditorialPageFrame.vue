<template>
  <div class="informational-editorial-page" :data-page-kind="viewModel.kind">
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
.informational-editorial-page {
  --editorial-paper: #f7f8f4;
  --editorial-paper-raised: #ffffff;
  --editorial-ink: #12263f;
  --editorial-text: #172431;
  --editorial-muted: #526273;
  --editorial-rule: #b8c5d0;
  --editorial-marker: #f2c14e;
  --editorial-accent: var(--color-primary-700, #315f9a);
  min-height: 60vh;
  background: var(--editorial-paper);
  color: var(--editorial-text);
  scrollbar-color: var(--editorial-accent) var(--editorial-paper);
}

.informational-editorial-page :deep(h1),
.informational-editorial-page :deep(h2),
.informational-editorial-page :deep(h3) {
  color: var(--editorial-ink);
  letter-spacing: -0.025em;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.informational-editorial-page :deep(p) {
  overflow-wrap: anywhere;
  text-wrap: pretty;
}

.informational-editorial-page :deep(a:focus-visible),
.informational-editorial-page :deep(button:focus-visible),
.informational-editorial-page :deep(input:focus-visible),
.informational-editorial-page :deep(textarea:focus-visible),
.informational-editorial-page :deep(select:focus-visible),
.informational-editorial-page :deep(summary:focus-visible) {
  outline: 2px solid var(--editorial-accent) !important;
  outline-offset: 3px !important;
}

.informational-editorial-page :deep(.bg-gray-50),
.informational-editorial-page :deep(.section-accent) {
  background: var(--editorial-paper) !important;
}

.informational-editorial-page :deep(.bg-white) {
  background: var(--editorial-paper-raised) !important;
}

.informational-editorial-page :deep(.text-gray-900),
.informational-editorial-page :deep(.text-gray-950) {
  color: var(--editorial-ink) !important;
}

.informational-editorial-page :deep(.text-gray-400),
.informational-editorial-page :deep(.text-gray-500),
.informational-editorial-page :deep(.text-gray-600),
.informational-editorial-page :deep(.text-gray-700) {
  color: var(--editorial-muted) !important;
}

.informational-editorial-page :deep(.border-gray-100),
.informational-editorial-page :deep(.border-gray-200),
.informational-editorial-page :deep(.border-gray-300) {
  border-color: var(--editorial-rule) !important;
}

.informational-editorial-page :deep(.shadow-sm),
.informational-editorial-page :deep(.shadow-md),
.informational-editorial-page :deep(.shadow-lg),
.informational-editorial-page :deep(.shadow-xl),
.informational-editorial-page :deep(.shadow-2xl) {
  box-shadow: none !important;
}

.informational-editorial-page :deep(.rounded-xl),
.informational-editorial-page :deep(.rounded-2xl),
.informational-editorial-page :deep(.rounded-3xl) {
  border-radius: 0.25rem !important;
}

.informational-editorial-page :deep(.btn-primary),
.informational-editorial-page :deep(.hero-cta-primary),
.informational-editorial-page :deep(.about-cta-primary),
.informational-editorial-page :deep(.svc-cta-primary) {
  border: 1px solid var(--editorial-ink) !important;
  border-radius: 0.25rem !important;
  background: var(--editorial-ink) !important;
  color: white !important;
  box-shadow: none !important;
}

.informational-editorial-page :deep(.hero-cta-ghost),
.informational-editorial-page :deep(.about-cta-ghost),
.informational-editorial-page :deep(.svc-cta-ghost) {
  border-radius: 0.25rem !important;
  box-shadow: none !important;
}

.informational-editorial-page[data-page-kind='home'] :deep([data-storefront-section]) {
  border-bottom: 1px solid var(--editorial-rule);
}

.informational-editorial-page[data-page-kind='home'] :deep(.hero) {
  min-height: min(44rem, 72svh) !important;
  border-bottom: 0.75rem solid var(--editorial-marker);
}

.informational-editorial-page[data-page-kind='home'] :deep(.hero-grain),
.informational-editorial-page[data-page-kind='blog-index'] :deep(.hero-media-grain) {
  display: none !important;
}

.informational-editorial-page[data-page-kind='home'] :deep(.hero > .bg-gradient-to-t) {
  background: linear-gradient(90deg, rgba(7, 25, 48, 0.92), rgba(7, 25, 48, 0.58) 62%, rgba(7, 25, 48, 0.22)) !important;
}

.informational-editorial-page[data-page-kind='home'] :deep(.hero > .bg-gradient-to-r) {
  display: none !important;
}

.informational-editorial-page[data-page-kind='home'] :deep(.hero h1) {
  max-width: 14ch;
  font-weight: 650;
}

.informational-editorial-page[data-page-kind='home'] :deep(.hero-scroll) {
  display: none !important;
}

.informational-editorial-page[data-page-kind='blog-index'] :deep(.min-h-screen > section:first-child),
.informational-editorial-page[data-page-kind='blog-detail'] :deep(.min-h-screen > section:first-of-type),
.informational-editorial-page[data-page-kind='about'] :deep(section:first-child),
.informational-editorial-page[data-page-kind='story'] :deep(section:first-child),
.informational-editorial-page[data-page-kind='custom-page'] :deep(.custom-page > section:first-child) {
  border-bottom: 0.75rem solid var(--editorial-marker);
  background-color: var(--editorial-ink) !important;
}

.informational-editorial-page[data-page-kind='blog-index'] :deep(.min-h-screen > section:first-child) {
  min-height: min(38rem, 62svh) !important;
}

.informational-editorial-page[data-page-kind='blog-index'] :deep(.min-h-screen > section:first-child h1),
.informational-editorial-page[data-page-kind='blog-detail'] :deep(.min-h-screen > section:first-of-type h1),
.informational-editorial-page[data-page-kind='about'] :deep(section:first-child h1),
.informational-editorial-page[data-page-kind='story'] :deep(section:first-child h1),
.informational-editorial-page[data-page-kind='custom-page'] :deep(.custom-page > section:first-child h1) {
  max-width: 15ch;
  color: white !important;
  font-weight: 650;
  letter-spacing: -0.035em;
}

.informational-editorial-page[data-page-kind='blog-index'] :deep(.min-h-screen > section:not(:first-child)),
.informational-editorial-page[data-page-kind='blog-detail'] :deep(.min-h-screen > section:not(:first-child)),
.informational-editorial-page[data-page-kind='custom-page'] :deep(.custom-page > section:not(:first-child)) {
  border-bottom: 1px solid var(--editorial-rule);
}

.informational-editorial-page[data-page-kind='blog-index'] :deep(a.group),
.informational-editorial-page[data-page-kind='blog-detail'] :deep(a.group) {
  border: 0 !important;
  border-top: 1px solid var(--editorial-rule) !important;
  border-radius: 0 !important;
  background: transparent !important;
  padding-top: 1rem;
}

.informational-editorial-page[data-page-kind='blog-index'] :deep(a.group img),
.informational-editorial-page[data-page-kind='blog-detail'] :deep(a.group img) {
  filter: saturate(0.82) contrast(1.04);
}

.informational-editorial-page[data-page-kind='blog-detail'] :deep(article),
.informational-editorial-page[data-page-kind='custom-page'] :deep(.max-w-2xl),
.informational-editorial-page[data-page-kind='custom-page'] :deep(.max-w-3xl) {
  max-width: 72ch;
}

.informational-editorial-page[data-page-kind='blog-detail'] :deep(.post-prose) {
  color: var(--editorial-text);
  font-size: 1.0625rem;
  line-height: 1.85;
}

.informational-editorial-page[data-page-kind='blog-detail'] :deep(.post-prose h2),
.informational-editorial-page[data-page-kind='blog-detail'] :deep(.post-prose h3) {
  color: var(--editorial-ink);
  font-weight: 650;
}

.informational-editorial-page[data-page-kind='blog-detail'] :deep(.post-prose blockquote) {
  border-left: 1px solid var(--editorial-ink);
  background: color-mix(in srgb, var(--editorial-marker) 22%, white);
  color: var(--editorial-ink);
  font-style: normal;
  padding: 1rem 1.25rem;
}

.informational-editorial-page[data-page-kind='blog-detail'] :deep(.post-prose th) {
  background: var(--editorial-ink);
  color: white;
}

.informational-editorial-page[data-page-kind='blog-detail'] :deep(.post-prose th),
.informational-editorial-page[data-page-kind='blog-detail'] :deep(.post-prose td) {
  border-color: var(--editorial-rule);
}

.informational-editorial-page[data-page-kind='custom-page'] :deep(.custom-page) {
  background: var(--editorial-paper);
  color: var(--editorial-text);
}

.informational-editorial-page :deep(input),
.informational-editorial-page :deep(textarea),
.informational-editorial-page :deep(select) {
  border-color: var(--editorial-rule) !important;
  border-radius: 0.25rem !important;
  background: var(--editorial-paper-raised) !important;
  color: var(--editorial-text) !important;
  caret-color: var(--editorial-accent);
}

@media (max-width: 767px) {
  .informational-editorial-page[data-page-kind='home'] :deep(.hero) {
    min-height: 68svh !important;
  }

  .informational-editorial-page[data-page-kind='blog-detail'] :deep(.post-prose) {
    font-size: 1rem;
    line-height: 1.75;
  }
}

@media (prefers-reduced-motion: reduce) {
  .informational-editorial-page :deep(.hero-stagger),
  .informational-editorial-page :deep(.category-stagger),
  .informational-editorial-page :deep(.reveal),
  .informational-editorial-page :deep(.reveal-from-left),
  .informational-editorial-page :deep(.reveal-from-right) {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}

@media (max-width: 640px) {
  .informational-editorial-page :deep(input),
  .informational-editorial-page :deep(textarea),
  .informational-editorial-page :deep(select) {
    font-size: 1rem !important;
  }
}
</style>
