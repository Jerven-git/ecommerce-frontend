<template>
  <div v-if="viewModel.configError" class="editorial-error min-h-screen px-6 py-16">
    <section class="mx-auto grid min-h-[70vh] w-full max-w-6xl content-end border-t border-current pt-8" aria-labelledby="editorial-unavailable-title" role="alert">
      <div class="max-w-2xl">
        <h1 id="editorial-unavailable-title" class="text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-6xl">
          This information is temporarily unavailable.
        </h1>
        <p class="mt-5 max-w-xl text-base leading-7 text-slate-700">
          We couldn’t load this website’s published information. Check your connection and try again.
        </p>
        <button type="button" class="editorial-action mt-8" :disabled="viewModel.configPending" @click="$emit('retry')">
          <Icon :name="viewModel.configPending ? 'heroicons:arrow-path' : 'heroicons:arrow-path-rounded-square'" class="h-4 w-4" :class="viewModel.configPending ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
          {{ viewModel.configPending ? 'Trying again…' : 'Try again' }}
        </button>
      </div>
    </section>
  </div>

  <div v-else class="informational-editorial-shell">
    <slot name="header">
      <Header />
    </slot>

    <div class="editorial-running-head">
      <span>{{ viewModel.siteConfig?.site_name || 'Information' }}</span>
      <span aria-hidden="true">{{ folioNumber }}</span>
      <span>{{ routeLabel }}</span>
    </div>

    <nav v-if="indexItems.length" class="editorial-index" aria-label="Information index">
      <ul>
        <li v-for="item in indexItems" :key="item.id">
          <NuxtLink :to="item.to" :aria-current="isActive(item.to) ? 'page' : undefined" :class="{ 'editorial-index__active': isActive(item.to) }">
            <span aria-hidden="true">{{ item.number }}</span>
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

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
import { isThemeRouteActive, themeNavigationLinks, themeRouteLabel } from '~/themes/presentation'

const props = defineProps<{
  viewModel: StorefrontShellViewModel
}>()

defineEmits<{
  retry: []
}>()

const route = useRoute()
useHead({ bodyAttrs: { class: 'informational-editorial-active' } })

const routeLabel = computed(() => themeRouteLabel(route.path, 'Overview'))

const folioNumber = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  return `Folio ${String(Math.max(1, segments.length + 1)).padStart(2, '0')}`
})

const indexItems = computed(() => themeNavigationLinks(props.viewModel.siteConfig?.navigation)
  .map((item, index) => ({
    ...item,
    number: String(index + 1).padStart(2, '0'),
  })))

function isActive(path: string): boolean {
  return isThemeRouteActive(route.path, path)
}
</script>

<style scoped>
.informational-editorial-shell,
.editorial-error {
  --editorial-paper: #f7f8f4;
  --editorial-paper-raised: #ffffff;
  --editorial-ink: #12263f;
  --editorial-text: #172431;
  --editorial-muted: #526273;
  --editorial-rule: #b8c5d0;
  --editorial-marker: #f2c14e;
  --editorial-accent: var(--color-primary-700, #315f9a);
  background: var(--editorial-paper);
  color: var(--editorial-text);
}

.informational-editorial-shell {
  min-height: 100vh;
}

.informational-editorial-shell ::selection,
.editorial-error ::selection {
  background: color-mix(in srgb, var(--editorial-marker) 68%, white);
  color: var(--editorial-ink);
}

.editorial-running-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  min-height: 2.5rem;
  border-bottom: 1px solid var(--editorial-rule);
  background: var(--editorial-paper);
  color: var(--editorial-muted);
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: 0.11em;
  padding-inline: 1.5rem;
  text-transform: uppercase;
}

.editorial-running-head span:nth-child(2) {
  border-inline: 1px solid var(--editorial-rule);
  padding-inline: 1rem;
}

.editorial-running-head span:last-child {
  text-align: right;
}

.editorial-index {
  overflow-x: auto;
  border-bottom: 1px solid var(--editorial-rule);
  background: var(--editorial-paper-raised);
  scrollbar-color: var(--editorial-accent) var(--editorial-paper);
}

.editorial-index ul {
  display: flex;
  min-width: max-content;
  margin: 0 auto;
  max-width: 80rem;
  padding: 0 1.5rem;
}

.editorial-index li + li {
  border-left: 1px solid var(--editorial-rule);
}

.editorial-index a {
  display: flex;
  min-height: 3.25rem;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--editorial-ink);
  font-size: 0.8125rem;
  font-weight: 650;
  text-decoration: none;
}

.editorial-index a span {
  color: var(--editorial-muted);
  font-size: 0.625rem;
  font-variant-numeric: tabular-nums;
}

.editorial-index a:hover,
.editorial-index a:focus-visible,
.editorial-index__active {
  background: color-mix(in srgb, var(--editorial-marker) 44%, white) !important;
}

.editorial-index a:focus-visible,
.editorial-action:focus-visible {
  outline: 2px solid var(--editorial-accent);
  outline-offset: -2px;
}

.editorial-action {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid var(--editorial-ink);
  border-radius: 0.25rem;
  background: var(--editorial-ink);
  padding: 0.75rem 1.25rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
}

.editorial-action:disabled {
  cursor: wait;
  opacity: 0.58;
}

:deep(header) {
  border-bottom-color: var(--editorial-rule) !important;
  background: var(--editorial-paper-raised) !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

:deep(header .nav-link) {
  color: var(--editorial-ink) !important;
  font-size: 0.75rem;
  font-weight: 700;
}

:deep(header .nav-link-active) {
  color: var(--editorial-accent) !important;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.45em;
}

:deep(header button),
:deep(header a) {
  border-radius: 0.25rem;
}

:global(body.informational-editorial-active #mobile-menu-dialog) {
  background: #f7f8f4 !important;
  color: #12263f !important;
}

:global(body.informational-editorial-active #mobile-menu-dialog a),
:global(body.informational-editorial-active #mobile-menu-dialog button),
:global(body.informational-editorial-active #mobile-menu-dialog p),
:global(body.informational-editorial-active #mobile-menu-dialog span) {
  color: inherit;
}

:deep(footer) {
  border-top: 0 !important;
  background: var(--editorial-ink) !important;
  color: #f7f8f4;
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
  text-decoration-color: var(--editorial-marker);
  text-underline-offset: 0.3em;
}

@media (min-width: 1024px) {
  .editorial-running-head {
    padding-inline: max(2rem, calc((100vw - 80rem) / 2));
  }
}

@media (max-width: 640px) {
  .editorial-running-head {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .editorial-running-head span:nth-child(2) {
    border-right: 0;
    padding-right: 0;
  }

  .editorial-running-head span:last-child {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .informational-editorial-shell :deep(*) {
    scroll-behavior: auto !important;
  }
}
</style>
