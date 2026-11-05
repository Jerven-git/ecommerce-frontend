<template>
  <div v-if="viewModel.configError" class="market-error min-h-screen px-6 py-16">
    <section class="mx-auto flex min-h-[70vh] w-full max-w-6xl items-end border-t border-current pt-8" aria-labelledby="market-unavailable-title" role="alert">
      <div class="max-w-2xl">
        <p class="market-register-label">Catalogue unavailable</p>
        <h1 id="market-unavailable-title" class="mt-5 text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-6xl">
          This shop is temporarily unavailable.
        </h1>
        <p class="mt-5 max-w-xl text-base leading-7">
          We couldn’t load this store’s published catalogue. Check your connection and try again.
        </p>
        <button type="button" class="market-action mt-8" :disabled="viewModel.configPending" @click="$emit('retry')">
          <Icon :name="viewModel.configPending ? 'heroicons:arrow-path' : 'heroicons:arrow-path-rounded-square'" class="h-4 w-4" :class="viewModel.configPending ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
          {{ viewModel.configPending ? 'Trying again…' : 'Try again' }}
        </button>
      </div>
    </section>
  </div>

  <div v-else class="commerce-market-shell">
    <slot name="header">
      <Header />
    </slot>

    <div class="market-register" aria-label="Catalogue context">
      <span>{{ viewModel.siteConfig?.site_name || 'Store' }}</span>
      <span class="market-register__centre">Catalogue</span>
      <span>{{ routeLabel }}</span>
    </div>

    <nav v-if="catalogueItems.length" class="market-index" aria-label="Store catalogue">
      <ul>
        <li v-for="item in catalogueItems" :key="item.id">
          <NuxtLink
            :to="item.to"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            :class="{ 'market-index__active': isActive(item.to) }"
          >
            <span class="market-index__mark" aria-hidden="true" />
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
useHead({ bodyAttrs: { class: 'commerce-market-active' } })

const routeLabel = computed(() => themeRouteLabel(route.path, 'Front counter'))

const catalogueItems = computed(() => themeNavigationLinks(props.viewModel.siteConfig?.navigation))

function isActive(path: string): boolean {
  return isThemeRouteActive(route.path, path)
}
</script>

<style scoped>
.commerce-market-shell,
.market-error {
  --market-paper: #f2ede3;
  --market-sheet: #fffdf8;
  --market-ink: #202820;
  --market-muted: #5b6258;
  --market-rule: #aaa99d;
  --market-register: #a33d2e;
  --market-action: var(--color-primary-700, #315f6b);
  background: var(--market-paper);
  color: var(--market-ink);
}

.commerce-market-shell {
  min-height: 100vh;
}

.commerce-market-shell ::selection,
.market-error ::selection {
  background: color-mix(in srgb, var(--market-action) 28%, var(--market-sheet));
  color: var(--market-ink);
}

.market-register {
  display: grid;
  min-height: 2.625rem;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  border-bottom: 1px solid var(--market-rule);
  background: var(--market-paper);
  color: var(--market-muted);
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  font-weight: 750;
  letter-spacing: 0.13em;
  padding-inline: 1.5rem;
  text-transform: uppercase;
}

.market-register__centre {
  border-inline: 1px solid var(--market-rule);
  padding-inline: 1.25rem;
  color: var(--market-register);
}

.market-register span:last-child {
  text-align: right;
}

.market-register-label {
  color: var(--market-register);
  font-size: 0.6875rem;
  font-weight: 750;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.market-index {
  overflow-x: auto;
  border-bottom: 1px solid var(--market-rule);
  background: var(--market-sheet);
  scrollbar-color: var(--market-action) var(--market-paper);
}

.market-index ul {
  display: flex;
  min-width: max-content;
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.market-index li + li {
  border-left: 1px solid var(--market-rule);
}

.market-index a {
  display: flex;
  min-height: 3.25rem;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1.125rem;
  color: var(--market-ink);
  font-size: 0.8125rem;
  font-weight: 700;
  text-decoration: none;
}

.market-index__mark {
  width: 0.5rem;
  height: 0.5rem;
  border: 1px solid var(--market-rule);
  background: transparent;
}

.market-index a:hover,
.market-index a:focus-visible,
.market-index__active {
  background: color-mix(in srgb, var(--market-action) 10%, var(--market-sheet));
}

.market-index__active .market-index__mark {
  border-color: var(--market-register);
  background: var(--market-register);
}

.market-index a:focus-visible,
.market-action:focus-visible {
  outline: 2px solid var(--market-action);
  outline-offset: -2px;
}

.market-action {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid var(--market-ink);
  border-radius: 0.125rem;
  background: var(--market-ink);
  padding: 0.75rem 1.25rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
}

.market-action:disabled {
  cursor: wait;
  opacity: 0.58;
}

:deep(header) {
  border-bottom-color: var(--market-rule) !important;
  background: var(--market-sheet) !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

:deep(header .nav-link) {
  color: var(--market-ink) !important;
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

:deep(header .nav-link-active) {
  color: var(--market-action) !important;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.4em;
}

:deep(header button),
:deep(header a) {
  border-radius: 0.125rem;
}

:global(body.commerce-market-active #mobile-menu-dialog) {
  background: #fffdf8 !important;
  color: #202820 !important;
}

:global(body.commerce-market-active #mobile-menu-dialog a),
:global(body.commerce-market-active #mobile-menu-dialog button),
:global(body.commerce-market-active #mobile-menu-dialog p),
:global(body.commerce-market-active #mobile-menu-dialog span) {
  color: inherit;
}

:deep(footer) {
  border-top: 0 !important;
  background: var(--market-ink) !important;
  color: var(--market-paper);
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
  text-decoration-color: color-mix(in srgb, var(--market-action) 70%, white);
  text-underline-offset: 0.3em;
}

@media (min-width: 1024px) {
  .market-register {
    padding-inline: max(2rem, calc((100vw - 80rem) / 2));
  }
}

@media (max-width: 640px) {
  .market-register {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .market-register__centre {
    border-right: 0;
    padding-right: 0;
  }

  .market-register span:last-child {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .commerce-market-shell :deep(*) {
    scroll-behavior: auto !important;
  }
}
</style>
