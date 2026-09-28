<template>
  <component
    :is="to ? NuxtLinkComponent : 'div'"
    :to="to || undefined"
    class="group block rounded-2xl border border-admin-border bg-admin-surface transition-colors"
    :class="[hero ? 'p-6' : 'p-5', to ? 'admin-tile-link hover:border-admin-accent' : '']"
  >
    <div class="flex items-start justify-between gap-3 mb-4">
      <p class="text-[11px] font-semibold uppercase tracking-[0.04em] text-admin-muted">{{ label }}</p>
      <span
        class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
        :class="chipClass"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            v-for="(d, i) in iconPaths"
            :key="i"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="d"
          />
        </svg>
      </span>
    </div>
    <p class="truncate font-bold tabular-nums text-admin-text" :class="hero ? 'text-3xl' : 'text-2xl'">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs truncate" :class="hintClass">{{ hint }}</p>
  </component>
</template>

<script setup lang="ts">
// A single metric. Tone is semantic and restrained — reach for a non-neutral
// tone only when the colour means something (money = brand, needs-action = amber).
const props = withDefaults(defineProps<{
  label: string
  value: string | number
  hint?: string
  tone?: 'brand' | 'positive' | 'attention' | 'neutral'
  /** One or more SVG path `d` strings for the corner glyph. */
  icon: string | string[]
  /** Optional destination — renders the tile as a link with a hover affordance. */
  to?: string
  /** Larger value + padding for a primary metric. */
  hero?: boolean
  /** Colour the hint with the tone (for attention-worthy hints). */
  emphasizeHint?: boolean
}>(), { tone: 'neutral', hero: false, emphasizeHint: false })

const NuxtLinkComponent = resolveComponent('NuxtLink')

const iconPaths = computed(() => (Array.isArray(props.icon) ? props.icon : [props.icon]))

const chipClass = computed(() => ({
  brand: 'bg-admin-accent-soft text-admin-accent-strong',
  positive: 'bg-admin-success-soft text-admin-success',
  attention: 'bg-admin-warning-soft text-admin-warning',
  neutral: 'bg-admin-soft text-admin-muted',
}[props.tone]))

const hintClass = computed(() => {
  if (!props.emphasizeHint) return 'text-admin-muted'
  return {
    brand: 'text-admin-accent-strong font-medium',
    positive: 'text-admin-success font-medium',
    attention: 'text-admin-warning font-medium',
    neutral: 'text-admin-muted',
  }[props.tone]
})
</script>
