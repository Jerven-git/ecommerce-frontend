<template>
  <div v-if="viewModel.configError" class="studio-error-grid min-h-screen px-6 py-16">
    <section class="mx-auto flex min-h-[70vh] w-full max-w-5xl items-end" aria-labelledby="service-studio-unavailable-title" role="alert">
      <div class="max-w-xl border-t border-current pt-6">
        <p class="text-sm font-semibold uppercase tracking-[0.18em]">Website status</p>
        <h1 id="service-studio-unavailable-title" class="mt-5 text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-6xl">
          This website is temporarily unavailable.
        </h1>
        <p class="mt-5 max-w-lg text-base leading-7 text-stone-700">
          We couldn’t load this provider’s information. Check your connection and try again.
        </p>
        <button
          type="button"
          class="studio-action mt-8"
          :disabled="viewModel.configPending"
          @click="$emit('retry')"
        >
          <Icon :name="viewModel.configPending ? 'heroicons:arrow-path' : 'heroicons:signal'" class="h-4 w-4" :class="viewModel.configPending ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
          {{ viewModel.configPending ? 'Trying again…' : 'Try again' }}
        </button>
      </div>
    </section>
  </div>

  <div v-else class="service-studio-shell">
    <slot name="header">
      <Header />
    </slot>

    <div class="studio-wayfinding" aria-hidden="true">
      <span>{{ viewModel.siteConfig?.site_name || 'Services' }}</span>
      <span class="studio-wayfinding__line" />
      <span>{{ routeLabel }}</span>
    </div>

    <main>
      <slot />
    </main>

    <slot name="footer-banner">
      <FooterBanner />
    </slot>
    <slot name="footer">
      <Footer />
    </slot>
    <slot v-if="viewModel.showWelcomePopup" name="popup">
      <WelcomePopup />
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { StorefrontShellViewModel } from '~/themes/contracts'
import { themeRouteLabel } from '~/themes/presentation'

defineProps<{
  viewModel: StorefrontShellViewModel
}>()

defineEmits<{
  retry: []
}>()

const route = useRoute()
useHead({ bodyAttrs: { class: 'service-studio-active' } })
const routeLabel = computed(() => themeRouteLabel(route.path, 'Overview'))
</script>

<style scoped>
.service-studio-shell,
.studio-error-grid {
  --studio-paper: #f3f0e7;
  --studio-paper-raised: #fbfaf6;
  --studio-ink: #17201d;
  --studio-muted: #59655f;
  --studio-rule: #c9cec7;
  --studio-accent: var(--color-primary-700, #355f55);
  background: var(--studio-paper);
  color: var(--studio-ink);
}

.service-studio-shell {
  min-height: 100vh;
}

.service-studio-shell ::selection,
.studio-error-grid ::selection {
  background: color-mix(in srgb, var(--studio-accent) 28%, var(--studio-paper));
  color: var(--studio-ink);
}

.studio-wayfinding {
  display: grid;
  grid-template-columns: auto minmax(2rem, 1fr) auto;
  align-items: center;
  gap: 1rem;
  min-height: 2.75rem;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--studio-rule);
  background: var(--studio-paper);
  color: var(--studio-muted);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.studio-wayfinding__line {
  height: 1px;
  background: var(--studio-rule);
}

.studio-action {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  background: var(--studio-ink);
  padding: 0.75rem 1.25rem;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
}

.studio-action:focus-visible {
  outline: 2px solid var(--studio-accent);
  outline-offset: 3px;
}

.studio-action:disabled {
  cursor: wait;
  opacity: 0.58;
}

:deep(header) {
  border-bottom-color: var(--studio-rule) !important;
  background: color-mix(in srgb, var(--studio-paper-raised) 96%, transparent) !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

:deep(header .nav-link) {
  color: var(--studio-ink) !important;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

:deep(header .nav-link-active) {
  color: var(--studio-accent) !important;
}

:deep(header button),
:deep(header a) {
  border-radius: 0.75rem;
}

:global(body.service-studio-active #mobile-menu-dialog) {
  background: var(--studio-paper-raised, #fbfaf6) !important;
  color: var(--studio-ink, #17201d) !important;
}

:global(body.service-studio-active #mobile-menu-dialog a),
:global(body.service-studio-active #mobile-menu-dialog button),
:global(body.service-studio-active #mobile-menu-dialog p),
:global(body.service-studio-active #mobile-menu-dialog span) {
  color: inherit;
}

:deep(footer) {
  border-top: 0 !important;
  background: var(--studio-ink) !important;
  color: #f8faf9;
}

:deep(footer h2),
:deep(footer h3),
:deep(footer p),
:deep(footer a),
:deep(footer button),
:deep(footer li) {
  color: inherit !important;
}

:deep(footer a),
:deep(footer button) {
  text-decoration-color: color-mix(in srgb, var(--studio-accent) 75%, white);
  text-underline-offset: 0.25em;
}

@media (min-width: 1024px) {
  .studio-wayfinding {
    padding-inline: max(2rem, calc((100vw - 80rem) / 2));
  }
}

@media (prefers-reduced-motion: reduce) {
  .service-studio-shell :deep(*) {
    scroll-behavior: auto !important;
  }
}
</style>
