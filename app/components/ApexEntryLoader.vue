<template>
  <Transition name="apex-entry">
    <div
      v-if="active"
      class="apex-entry-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading DATABASY"
      data-apex-entry-loader
    >
      <header class="apex-entry-loader__header">
        <span class="apex-entry-loader__brand">DATABASY</span>
        <span class="apex-entry-loader__status">
          <span aria-hidden="true" />
          Preparing your view
        </span>
      </header>

      <div class="apex-entry-loader__body">
        <p class="apex-entry-loader__statement">
          Everything you need,<br>
          <span>coming into view.</span>
        </p>

        <div class="apex-entry-loader__progress" aria-hidden="true">
          <span />
        </div>
      </div>

      <footer class="apex-entry-loader__footer">
        <span>Storefronts that feel like yours.</span>
        <span>One place to run them.</span>
      </footer>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const requestUrl = useRequestURL()
const baseDomain = String(useRuntimeConfig().public.storefrontBaseDomain || '').toLowerCase()
const host = requestUrl.hostname.toLowerCase()
const route = useRoute()

const excludedPrefixes = [
  '/admin',
  '/super-admin',
  '/payment',
  '/backorder/pay',
]

const isApexHost = !!baseDomain && (host === baseDomain || host === `www.${baseDomain}`)
const isTenantStorefrontPath = (path: string) => !isApexHost && !excludedPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`))

// Tenant storefronts already have their configured branded loader. This is
// the complementary entry state, covering Apex pages plus every auth, admin,
// payment, and utility URL without allowing both overlays to appear together.
const active = ref(!isTenantStorefrontPath(route.path))

const minimumVisibleMs = 420
const shownAt = Date.now()
let hideTimer: ReturnType<typeof setTimeout> | undefined
let fallbackTimer: ReturnType<typeof setTimeout> | undefined
let hiding = false

function setDocumentBusy(busy: boolean) {
  if (!import.meta.client) return

  if (busy) document.documentElement.setAttribute('aria-busy', 'true')
  else document.documentElement.removeAttribute('aria-busy')
}

function hide() {
  if (!active.value || hiding) return
  hiding = true

  const remaining = Math.max(0, minimumVisibleMs - (Date.now() - shownAt))
  hideTimer = setTimeout(() => {
    active.value = false
    setDocumentBusy(false)
  }, remaining)
}

useRuntimeHook('page:finish', () => {
  if (import.meta.client) hide()
})

onMounted(() => {
  if (!active.value) return

  setDocumentBusy(true)
  requestAnimationFrame(hide)
  fallbackTimer = setTimeout(hide, 6000)
})

onBeforeUnmount(() => {
  clearTimeout(hideTimer)
  clearTimeout(fallbackTimer)
  setDocumentBusy(false)
})
</script>

<style scoped>
.apex-entry-loader {
  position: fixed;
  z-index: 11000;
  inset: 0;
  display: flex;
  min-height: 100svh;
  flex-direction: column;
  overflow: hidden;
  background: var(--apex-canvas, #fcfcfc);
  color: var(--apex-text, #1a1a1a);
  font-family: 'Space Grotesk', var(--font-body);
}

.apex-entry-loader__header,
.apex-entry-loader__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-inline: clamp(1.25rem, 4vw, 4.5rem);
}

.apex-entry-loader__header {
  min-height: 5rem;
  border-bottom: 1px solid var(--apex-border-soft, #e9e9e7);
}

.apex-entry-loader__brand {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.apex-entry-loader__status {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--apex-text-caption, #626262);
  font-size: 0.75rem;
  font-weight: 600;
}

.apex-entry-loader__status > span {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: var(--apex-accent, #285095);
  animation: apex-entry-pulse 900ms ease-in-out infinite alternate;
}

.apex-entry-loader__body {
  display: flex;
  width: min(100% - 2.5rem, 78rem);
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-inline: auto;
  padding-block: 3rem;
}

.apex-entry-loader__statement {
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(3rem, 7.5vw, 6rem);
  font-weight: 600;
  line-height: 1.04;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.apex-entry-loader__statement span {
  color: var(--apex-text-muted, #676767);
}

.apex-entry-loader__progress {
  position: relative;
  width: min(100%, 32rem);
  height: 1px;
  margin-top: clamp(2rem, 5vw, 4rem);
  overflow: hidden;
  background: var(--apex-border-strong, #cfcfca);
}

.apex-entry-loader__progress span {
  position: absolute;
  inset: 0;
  background: var(--apex-text, #1a1a1a);
  transform: scaleX(0);
  transform-origin: left;
  animation: apex-entry-progress 1.15s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.apex-entry-loader__footer {
  min-height: 4.5rem;
  border-top: 1px solid var(--apex-border-soft, #e9e9e7);
  color: var(--apex-text-caption, #626262);
  font-size: 0.72rem;
  font-weight: 600;
}

.apex-entry-leave-active { transition: opacity 240ms ease; }
.apex-entry-leave-to { opacity: 0; }

@keyframes apex-entry-progress {
  0% { transform: scaleX(0); transform-origin: left; }
  48% { transform: scaleX(1); transform-origin: left; }
  52% { transform: scaleX(1); transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
}

@keyframes apex-entry-pulse {
  from { opacity: 0.35; transform: scale(0.78); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 560px) {
  .apex-entry-loader__header { min-height: 4.5rem; }
  .apex-entry-loader__body { padding-block: 2.5rem; }
  .apex-entry-loader__statement { font-size: clamp(2.8rem, 14vw, 4.25rem); }
  .apex-entry-loader__footer { align-items: flex-start; flex-direction: column; justify-content: center; gap: 0.2rem; }
}

@media (prefers-reduced-motion: reduce) {
  .apex-entry-loader *,
  .apex-entry-loader *::before,
  .apex-entry-loader *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .apex-entry-loader__progress span { transform: scaleX(0.72); }
}
</style>
