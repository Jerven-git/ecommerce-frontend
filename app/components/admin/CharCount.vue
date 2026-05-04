<template>
  <span class="text-[11px] tabular-nums" :class="colorClass">
    {{ length }}<span v-if="hard"> / {{ hard }}</span>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  value?: string | null
  /** Soft warning threshold — turns amber once length exceeds this. */
  soft?: number
  /** Hard limit — turns red once length exceeds this. */
  hard?: number
}>()

const length = computed(() => (props.value ?? '').length)

const colorClass = computed(() => {
  const len = length.value
  if (props.hard != null && len > props.hard) return 'text-red-500 font-semibold'
  if (props.soft != null && len > props.soft) return 'text-amber-500'
  return 'text-gray-400'
})
</script>
