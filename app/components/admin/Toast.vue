<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(24rem,calc(100vw-2rem))] pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-3"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-200 ease-in absolute w-full"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-3"
        move-class="transition-transform duration-200"
      >
        <div
          v-for="t in toasts"
          :key="t.id"
          :role="t.variant === 'error' ? 'alert' : 'status'"
          class="pointer-events-auto flex items-start gap-3 rounded-xl border border-admin-border bg-admin-surface px-4 py-3 shadow-lg"
        >
          <span
            class="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            :class="chip[t.variant]"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="glyph[t.variant]" />
            </svg>
          </span>

          <div class="min-w-0 flex-1">
            <p class="break-words text-sm font-medium text-admin-text">{{ t.message }}</p>
            <button
              v-if="t.action"
              type="button"
              class="mt-1 min-h-11 text-xs font-semibold text-admin-accent hover:text-admin-accent-strong focus-visible:outline-none focus-visible:underline"
              @click="runAction(t)"
            >
              {{ t.action.label }}
            </button>
          </div>

          <button
            type="button"
            class="-mr-1 -mt-1 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
            aria-label="Dismiss notification"
            @click="dismiss(t.id)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
@media (prefers-reduced-motion: reduce) {
  [class*='transition'] {
    transition-duration: 0.01ms !important;
  }
}
</style>
