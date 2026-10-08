<template>
  <Teleport to="body">
    <Transition name="impersonation-progress">
      <div
        v-if="impersonation.transitioning"
        class="impersonation-progress"
        role="status"
        aria-live="polite"
        :aria-label="progressLabel"
      >
        <header class="impersonation-progress__header">
          <span class="impersonation-progress__brand">DATABASY</span>
          <span class="impersonation-progress__security">
            <Icon :name="isLeaving ? 'heroicons:arrow-path-rounded-square' : 'heroicons:shield-check'" aria-hidden="true" />
            {{ isLeaving ? 'Restoring platform access' : 'Secure merchant access' }}
          </span>
        </header>

        <main class="impersonation-progress__body">
          <div class="impersonation-progress__mark" aria-hidden="true">
            <Icon :name="isLeaving ? 'heroicons:arrow-left-start-on-rectangle' : 'heroicons:arrow-right-end-on-rectangle'" />
          </div>
          <h2>{{ heading }}</h2>
          <p>{{ phaseMessage }}</p>
          <p v-if="targetEmail" class="impersonation-progress__target">{{ targetEmail }}</p>

          <div class="impersonation-progress__track" aria-hidden="true">
            <span />
          </div>

          <ol class="impersonation-progress__steps" aria-hidden="true">
            <li :class="{ active: impersonation.transitionPhase === 'authorizing' }">{{ firstStep }}</li>
            <li :class="{ active: impersonation.transitionPhase === 'preparing' }">{{ secondStep }}</li>
          </ol>
        </main>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const impersonation = useImpersonationStore()
const isLeaving = computed(() => impersonation.transitionKind === 'leaving')

const workspaceName = computed(() =>
  impersonation.pendingTarget?.store?.name
    ?? impersonation.pendingTarget?.name
    ?? 'merchant workspace',
)
const targetEmail = computed(() => impersonation.pendingTarget?.email ?? '')
const heading = computed(() => isLeaving.value
  ? 'Returning to Super Admin.'
  : `Opening ${workspaceName.value}.`,
)
const progressLabel = computed(() => isLeaving.value
  ? 'Leaving impersonation and returning to Super Admin'
  : `Opening ${workspaceName.value}`,
)
const phaseMessage = computed(() => {
  if (isLeaving.value) {
    return impersonation.transitionPhase === 'preparing'
      ? 'Loading the platform dashboard and restoring your operator controls.'
      : 'Ending the merchant session and restoring your platform identity.'
  }

  return impersonation.transitionPhase === 'preparing'
    ? 'Loading store settings and preparing the merchant dashboard.'
    : 'Confirming your platform access and starting the secure session.'
})
const firstStep = computed(() => isLeaving.value ? 'End merchant session' : 'Verify access')
const secondStep = computed(() => isLeaving.value ? 'Restore control room' : 'Prepare dashboard')

let previousOverflow = ''

watch(() => impersonation.transitioning, (active) => {
  if (!import.meta.client) return

  if (active) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.setAttribute('aria-busy', 'true')
  } else {
    document.body.style.overflow = previousOverflow
    document.documentElement.removeAttribute('aria-busy')
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.body.style.overflow = previousOverflow
  document.documentElement.removeAttribute('aria-busy')
})
</script>

<style scoped>
.impersonation-progress {
  position: fixed;
  z-index: 12000;
  inset: 0;
  display: flex;
  min-height: 100svh;
  flex-direction: column;
  overflow: hidden;
  background: var(--apex-canvas, #fcfcfc);
  color: var(--apex-text, #1a1a1a);
  font-family: 'Space Grotesk', var(--font-body);
}

.impersonation-progress__header {
  display: flex;
  min-height: 5rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--apex-border-soft, #ececec);
  padding: 0.75rem clamp(1.25rem, 4vw, 4.5rem);
}

.impersonation-progress__brand {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.035em;
}

.impersonation-progress__security {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--apex-text-caption, #626262);
  font-size: 0.75rem;
  font-weight: 600;
}

.impersonation-progress__security svg { width: 1rem; height: 1rem; }

.impersonation-progress__body {
  display: flex;
  width: min(100% - 2.5rem, 52rem);
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-inline: auto;
  padding-block: 4rem;
}

.impersonation-progress__mark {
  display: grid;
  width: 3rem;
  height: 3rem;
  margin-bottom: 1.75rem;
  place-items: center;
  border: 1px solid var(--apex-border-strong, #cfcfca);
  border-radius: 0.75rem;
}

.impersonation-progress__mark svg { width: 1.25rem; height: 1.25rem; }

.impersonation-progress h2 {
  max-width: 13ch;
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2.8rem, 7vw, 5.25rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.impersonation-progress p {
  max-width: 36rem;
  margin: 1.15rem 0 0;
  color: var(--apex-text-muted, #525252);
  font-size: 1rem;
  line-height: 1.65;
}

.impersonation-progress .impersonation-progress__target {
  margin-top: 0.45rem;
  color: var(--apex-text-caption, #626262);
  font-size: 0.78rem;
  font-weight: 600;
}

.impersonation-progress__track {
  position: relative;
  width: min(100%, 30rem);
  height: 1px;
  margin-top: 2.5rem;
  overflow: hidden;
  background: var(--apex-border-strong, #cfcfca);
}

.impersonation-progress__track span {
  position: absolute;
  inset: 0;
  background: var(--apex-text, #1a1a1a);
  transform: scaleX(0);
  transform-origin: left;
  animation: impersonation-track 1.15s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.impersonation-progress__steps {
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0 0;
  padding: 0;
  color: var(--apex-text-caption, #626262);
  font-size: 0.7rem;
  font-weight: 600;
  list-style: none;
}

.impersonation-progress__steps li { transition: color 180ms ease; }
.impersonation-progress__steps li.active { color: var(--apex-text, #1a1a1a); }

.impersonation-progress-enter-active { transition: opacity 180ms ease-out; }
.impersonation-progress-leave-active { transition: opacity 160ms ease-in; }
.impersonation-progress-enter-from,
.impersonation-progress-leave-to { opacity: 0; }

@keyframes impersonation-track {
  0% { transform: scaleX(0); transform-origin: left; }
  48% { transform: scaleX(1); transform-origin: left; }
  52% { transform: scaleX(1); transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
}

@media (max-width: 560px) {
  .impersonation-progress__header { min-height: 4.5rem; }
  .impersonation-progress__security { font-size: 0.7rem; }
  .impersonation-progress__body { padding-block: 3rem; }
  .impersonation-progress h2 { font-size: clamp(2.7rem, 14vw, 4rem); }
}

@media (prefers-reduced-motion: reduce) {
  .impersonation-progress *,
  .impersonation-progress *::before,
  .impersonation-progress *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .impersonation-progress__track span { transform: scaleX(0.72); }
}
</style>
