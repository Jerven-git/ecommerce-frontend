<template>
  <Teleport to="body">
    <Transition name="auth-login-progress">
      <div
        v-if="transition.active.value"
        class="auth-login-progress"
        role="status"
        aria-live="polite"
        :aria-label="title"
      >
        <header class="auth-login-progress__header">
          <span class="auth-login-progress__brand">DATABASY</span>
          <span class="auth-login-progress__security">
            <Icon name="heroicons:lock-closed" aria-hidden="true" />
            Secure sign in
          </span>
        </header>

        <main class="auth-login-progress__body">
          <div class="auth-login-progress__mark" aria-hidden="true">
            <Icon :name="phaseIcon" />
          </div>
          <h2>{{ title }}</h2>
          <p>{{ message }}</p>
          <p v-if="transition.email.value" class="auth-login-progress__identity">{{ transition.email.value }}</p>

          <div class="auth-login-progress__track" aria-hidden="true"><span /></div>
          <ol class="auth-login-progress__steps" aria-hidden="true">
            <li :class="{ active: transition.phase.value === 'authenticating' }">Confirm account</li>
            <li :class="{ active: transition.phase.value === 'verification' }">Verify identity</li>
            <li :class="{ active: transition.phase.value === 'preparing' }">Open workspace</li>
          </ol>
        </main>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const transition = useAuthTransition()

const title = computed(() => ({
  authenticating: 'Signing you in.',
  verification: 'One last check.',
  preparing: 'Opening your workspace.',
}[transition.phase.value]))

const message = computed(() => ({
  authenticating: 'Confirming your account and starting a secure session.',
  verification: 'Your password is confirmed. Preparing secure verification.',
  preparing: 'Loading your settings and preparing the admin dashboard.',
}[transition.phase.value]))

const phaseIcon = computed(() => transition.phase.value === 'verification'
  ? 'heroicons:shield-check'
  : transition.phase.value === 'preparing'
    ? 'heroicons:squares-2x2'
    : 'heroicons:arrow-right-end-on-rectangle',
)

let previousOverflow = ''

watch(transition.active, (active) => {
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
.auth-login-progress {
  position: fixed;
  z-index: 11900;
  inset: 0;
  display: flex;
  min-height: 100svh;
  flex-direction: column;
  overflow: hidden;
  background: var(--apex-canvas, #fcfcfc);
  color: var(--apex-text, #1a1a1a);
  font-family: 'Space Grotesk', var(--font-body);
}

.auth-login-progress__header {
  display: flex;
  min-height: 5rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--apex-border-soft, #ececec);
  padding: 0.75rem clamp(1.25rem, 4vw, 4.5rem);
}

.auth-login-progress__brand {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.035em;
}

.auth-login-progress__security {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--apex-text-caption, #626262);
  font-size: 0.75rem;
  font-weight: 600;
}

.auth-login-progress__security svg { width: 1rem; height: 1rem; }

.auth-login-progress__body {
  display: flex;
  width: min(100% - 2.5rem, 52rem);
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-inline: auto;
  padding-block: 4rem;
}

.auth-login-progress__mark {
  display: grid;
  width: 3rem;
  height: 3rem;
  margin-bottom: 1.75rem;
  place-items: center;
  border: 1px solid var(--apex-border-strong, #cfcfca);
  border-radius: 0.75rem;
}

.auth-login-progress__mark svg { width: 1.25rem; height: 1.25rem; }

.auth-login-progress h2 {
  max-width: 13ch;
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2.8rem, 7vw, 5.25rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.auth-login-progress p {
  max-width: 36rem;
  margin: 1.15rem 0 0;
  color: var(--apex-text-muted, #525252);
  font-size: 1rem;
  line-height: 1.65;
}

.auth-login-progress .auth-login-progress__identity {
  margin-top: 0.45rem;
  color: var(--apex-text-caption, #626262);
  font-size: 0.78rem;
  font-weight: 600;
}

.auth-login-progress__track {
  position: relative;
  width: min(100%, 30rem);
  height: 1px;
  margin-top: 2.5rem;
  overflow: hidden;
  background: var(--apex-border-strong, #cfcfca);
}

.auth-login-progress__track span {
  position: absolute;
  inset: 0;
  background: var(--apex-text, #1a1a1a);
  transform: scaleX(0);
  transform-origin: left;
  animation: auth-login-track 1.15s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.auth-login-progress__steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.5rem;
  margin: 1rem 0 0;
  padding: 0;
  color: var(--apex-text-caption, #626262);
  font-size: 0.7rem;
  font-weight: 600;
  list-style: none;
}

.auth-login-progress__steps li { transition: color 180ms ease; }
.auth-login-progress__steps li.active { color: var(--apex-text, #1a1a1a); }

.auth-login-progress-enter-active { transition: opacity 180ms ease-out; }
.auth-login-progress-leave-active { transition: opacity 160ms ease-in; }
.auth-login-progress-enter-from,
.auth-login-progress-leave-to { opacity: 0; }

@keyframes auth-login-track {
  0% { transform: scaleX(0); transform-origin: left; }
  48% { transform: scaleX(1); transform-origin: left; }
  52% { transform: scaleX(1); transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
}

@media (max-width: 560px) {
  .auth-login-progress__header { min-height: 4.5rem; }
  .auth-login-progress__security { font-size: 0.7rem; }
  .auth-login-progress__body { padding-block: 3rem; }
  .auth-login-progress h2 { font-size: clamp(2.7rem, 14vw, 4rem); }
}

@media (prefers-reduced-motion: reduce) {
  .auth-login-progress *,
  .auth-login-progress *::before,
  .auth-login-progress *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .auth-login-progress__track span { transform: scaleX(0.72); }
}
</style>
