<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to || undefined"
    :type="to ? undefined : (type as any)"
    :disabled="to ? undefined : disabled"
    :aria-label="ariaLabel"
    :title="tooltip || ariaLabel"
    class="inline-flex items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      sizeClasses,
      variantClasses,
    ]"
    @click="$emit('click', $event)"
  >
    <span class="shrink-0 [&_svg]:h-4 [&_svg]:w-4" v-html="icon" aria-hidden="true" />
    <span v-if="label" class="text-xs font-semibold tracking-tight">{{ label }}</span>
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon: string
  ariaLabel: string
  tooltip?: string
  label?: string
  variant?: 'ghost' | 'soft' | 'accent' | 'danger'
  size?: 'sm' | 'md'
  to?: string
  disabled?: boolean
  type?: string
}>(), {
  variant: 'ghost',
  size: 'md',
  type: 'button',
})

defineEmits<{ click: [e: MouseEvent] }>()

const NuxtLink = resolveComponent('NuxtLink')

const sizeClasses = computed(() => {
  if (props.label) return 'h-9 gap-1.5 px-3'
  if (props.size === 'sm') return 'h-8 w-8'
  return 'h-9 w-9'
})

const variantClasses = computed(() => ({
  ghost: 'border-transparent bg-transparent text-admin-muted hover:bg-admin-soft hover:text-admin-text hover:border-admin-border',
  soft: 'border-admin-border bg-admin-surface text-admin-muted hover:bg-admin-soft hover:text-admin-text',
  accent: 'border-admin-accent/20 bg-admin-accent-soft text-admin-accent hover:bg-admin-accent hover:text-admin-on-accent hover:border-admin-accent',
  danger: 'border-transparent bg-transparent text-admin-muted hover:bg-admin-danger-soft hover:text-admin-danger',
}[props.variant]))
</script>
