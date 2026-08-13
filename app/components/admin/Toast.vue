<template>
  <Teleport to="body">
    <div
      class="admin-toast-stack"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="admin-toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :role="t.variant === 'error' ? 'alert' : 'status'"
          class="admin-toast"
        >
          <span
            class="admin-toast__icon"
            :class="chip[t.variant]"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="glyph[t.variant]" />
            </svg>
          </span>

          <div class="min-w-0 flex-1">
            <p class="break-words text-sm font-medium leading-5 text-admin-text">{{ t.message }}</p>
            <button
              v-if="t.action"
              type="button"
              class="mt-1 text-xs font-semibold text-admin-accent hover:text-admin-accent-strong focus-visible:outline-none focus-visible:underline"
              @click="runAction(t)"
            >
              {{ t.action.label }}
            </button>
          </div>

          <button
            type="button"
            class="admin-toast__dismiss"
            aria-label="Dismiss notification"
            @click="dismiss(t.id)"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { AdminToast } from '~/composables/useAdminToast'

const { toasts, dismiss } = useAdminToast()

const chip: Record<AdminToast['variant'], string> = {
  success: 'bg-admin-success-soft text-admin-success',
  error: 'bg-admin-danger-soft text-admin-danger',
  info: 'bg-admin-accent-soft text-admin-accent',
}

const glyph: Record<AdminToast['variant'], string> = {
  success: 'M5 13l4 4L19 7',
  error: 'M12 9v3.75m0 3.25h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
  info: 'M12 16v-4m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
}

const runAction = (t: AdminToast) => {
  t.action?.handler()
  dismiss(t.id)
}
</script>

<style scoped>
.admin-toast-stack {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  display: flex;
  width: min(20rem, calc(100vw - 2rem));
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.admin-toast {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 3.25rem;
  padding: 0.625rem 0.625rem 0.625rem 0.75rem;
  border-radius: 0.75rem;
  color: var(--admin-text);
  background: var(--admin-surface);
  box-shadow: 0 12px 28px -14px rgb(15 23 42 / 38%);
  pointer-events: auto;
}

.admin-toast__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.375rem;
  height: 1.375rem;
  flex: 0 0 auto;
  border-radius: 9999px;
}

.admin-toast__dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  border-radius: 0.5rem;
  color: var(--admin-text-muted);
}

.admin-toast__dismiss:hover {
  color: var(--admin-text);
  background: var(--admin-surface-soft);
}

.admin-toast__dismiss:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 1px;
}

.admin-toast-enter-active,
.admin-toast-leave-active,
.admin-toast-move {
  transition: opacity 180ms ease, transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.admin-toast-leave-active {
  position: absolute;
  width: 100%;
}

.admin-toast-enter-from,
.admin-toast-leave-to {
  opacity: 0;
  transform: translateX(0.75rem);
}

@media (prefers-reduced-motion: reduce) {
  .admin-toast-enter-active,
  .admin-toast-leave-active,
  .admin-toast-move {
    transition: none;
  }
}
</style>
