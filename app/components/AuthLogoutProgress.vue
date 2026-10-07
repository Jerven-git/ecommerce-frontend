<template>
  <Teleport to="body">
    <Transition name="auth-exit">
      <div
        v-if="visible"
        class="auth-logout-progress"
        role="status"
        aria-live="polite"
        aria-label="Signing you out"
      >
        <header class="auth-logout-progress__header">
          <span class="auth-logout-progress__brand">DATABASY</span>
          <span class="auth-logout-progress__security">
            <Icon name="heroicons:lock-closed" aria-hidden="true" />
            Secure sign out
          </span>
        </header>

        <div class="auth-logout-progress__body">
          <div class="auth-logout-progress__mark" aria-hidden="true">
            <Icon name="heroicons:arrow-right-start-on-rectangle" />
          </div>
          <h2>Signing you out.</h2>
          <p>Closing your workspace securely and returning you to DATABASY.</p>
          <div class="auth-logout-progress__track" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()
</script>

<style scoped>
.auth-logout-progress {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: flex;
  min-height: 100svh;
  flex-direction: column;
  background: var(--apex-canvas, #fcfcfc);
  color: var(--apex-text, #1a1a1a);
  font-family: 'Space Grotesk', var(--font-body);
}

.auth-logout-progress__header {
  display: flex;
  min-height: 5rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--apex-border-soft, #ececec);
  padding: 0.75rem clamp(1.25rem, 4vw, 4.5rem);
}

.auth-logout-progress__brand {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.auth-logout-progress__security {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--apex-text-caption, #626262);
  font-size: 0.75rem;
  font-weight: 600;
}

.auth-logout-progress__security svg { width: 1rem; height: 1rem; }

.auth-logout-progress__body {
  display: flex;
  width: min(100% - 2.5rem, 42rem);
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-inline: auto;
  padding-block: 4rem;
}

.auth-logout-progress__mark {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 1.75rem;
  place-items: center;
  border: 1px solid var(--apex-border-strong, #cfcfca);
  border-radius: 50%;
}

.auth-logout-progress__mark svg { width: 1.4rem; height: 1.4rem; }

.auth-logout-progress h2 {
  max-width: 11ch;
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(3rem, 7vw, 5rem);
  font-weight: 600;
  line-height: 1.06;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.auth-logout-progress p {
  max-width: 34rem;
  margin: 1.2rem 0 0;
  color: var(--apex-text-muted, #525252);
  font-size: 1rem;
  line-height: 1.65;
}

.auth-logout-progress__track {
  position: relative;
  width: min(100%, 28rem);
  height: 1px;
  margin-top: 3rem;
  overflow: hidden;
  background: var(--apex-border-strong, #cfcfca);
}

.auth-logout-progress__track span {
  position: absolute;
  inset: 0;
  background: var(--apex-text, #1a1a1a);
  transform: scaleX(0);
  transform-origin: left;
  animation: auth-logout-progress 1.35s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.auth-exit-enter-active { transition: opacity 220ms ease; }
.auth-exit-leave-active { transition: opacity 140ms ease; }
.auth-exit-enter-from, .auth-exit-leave-to { opacity: 0; }

@keyframes auth-logout-progress {
  0% { transform: scaleX(0); transform-origin: left; }
  48% { transform: scaleX(1); transform-origin: left; }
  52% { transform: scaleX(1); transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
}

@media (max-width: 480px) {
  .auth-logout-progress__header { min-height: 4.5rem; }
  .auth-logout-progress__body { width: min(100% - 2.5rem, 42rem); padding-block: 3rem; }
  .auth-logout-progress h2 { font-size: clamp(2.8rem, 15vw, 4rem); }
  .auth-logout-progress__security { font-size: 0.7rem; }
}

@media (prefers-reduced-motion: reduce) {
  .auth-logout-progress *,
  .auth-logout-progress *::before,
  .auth-logout-progress *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }

  .auth-logout-progress__track span { transform: scaleX(0.72); }
}
</style>
