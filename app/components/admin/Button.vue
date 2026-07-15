<template>
  <component
    :is="tag"
    v-bind="boundAttrs"
    class="admin-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
    :class="[variantClass, sizeClass, { 'w-full': block, 'admin-btn--busy': loading }]"
    :aria-busy="loading || undefined"
  >
    <!-- Spinner crossfades in over the label. The label stays in the DOM (only
         its opacity drops), so the button never changes width mid-action. -->
    <Transition name="admin-btn-spin">
      <span v-if="loading" class="admin-btn__spinner" aria-hidden="true">
        <span class="admin-btn__ring" />
      </span>
    </Transition>

    <span class="admin-btn__label" :class="{ 'is-hidden': loading }">
      <slot name="icon" />
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
// The one admin action button. Every state lives here — hover, focus, active,
// disabled, and a loading state that overlays a spinner without reflowing the
// label — so the vocabulary stays identical across every super-admin surface.
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'danger' | 'ghost' | 'secondary'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
  /** Render as a NuxtLink instead of a <button> (loading/disabled don't apply). */
  to?: string
  block?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  block: false,
})

const NuxtLink = resolveComponent('NuxtLink')
const tag = computed(() => (props.to ? NuxtLink : 'button'))

const boundAttrs = computed(() =>
  props.to
    ? { to: props.to }
    : { type: props.type, disabled: props.disabled || props.loading },
)

const variantClass = computed(() => ({
  primary: 'text-white bg-purple-600 hover:bg-purple-700 shadow-sm shadow-purple-600/20 focus-visible:ring-purple-500',
  outline: 'text-purple-700 bg-white border border-purple-200 hover:bg-purple-50 hover:border-purple-300 focus-visible:ring-purple-500',
  danger: 'text-red-600 hover:bg-red-50 focus-visible:ring-red-400',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400',
  secondary: 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus-visible:ring-gray-400',
}[props.variant]))

const sizeClass = computed(() => ({
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
}[props.size]))
</script>

<style scoped>
.admin-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  line-height: 1.25rem;
  white-space: nowrap;
  user-select: none;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    color 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
}
.admin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
/* A loading button is active work, not a disabled control — keep it full-strength. */
.admin-btn.admin-btn--busy:disabled {
  opacity: 1;
  cursor: wait;
}
/* Tactile press: quick and subtle, never bouncy. */
.admin-btn:not(:disabled):active {
  transform: scale(0.97);
}

/* Label sits under the spinner and fades — staying in the DOM keeps width stable. */
.admin-btn__label {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  transition: opacity 0.15s ease;
}
.admin-btn__label.is-hidden {
  opacity: 0;
}

.admin-btn__spinner {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
/* Ring inherits the button's text colour via currentColor, so it reads on every
   variant (white on primary, purple on outline, red on danger). */
.admin-btn__ring {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  border: 2px solid color-mix(in srgb, currentColor 25%, transparent);
  border-top-color: currentColor;
  animation: admin-btn-spin 0.6s linear infinite;
}
@keyframes admin-btn-spin {
  to {
    transform: rotate(360deg);
  }
}

.admin-btn-spin-enter-active,
.admin-btn-spin-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.admin-btn-spin-enter-from,
.admin-btn-spin-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

@media (prefers-reduced-motion: reduce) {
  .admin-btn,
  .admin-btn__label,
  .admin-btn-spin-enter-active,
  .admin-btn-spin-leave-active {
    transition: none;
  }
  .admin-btn:not(:disabled):active {
    transform: none;
  }
  /* Keep the loading cue — it's essential feedback — just slower. */
  .admin-btn__ring {
    animation-duration: 1.1s;
  }
}
</style>
