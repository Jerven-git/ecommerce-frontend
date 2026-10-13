<template>
  <label class="flex min-h-11 items-center gap-3 rounded-xl border border-admin-border px-3 text-xs font-medium text-admin-text">
    <input :checked="checked" type="checkbox" class="h-4 w-4 accent-admin-accent" @change="$emit('change', ($event.target as HTMLInputElement).checked)" />
    {{ label }}
  </label>
</template>

<script setup lang="ts">
defineProps<{ checked: boolean; label: string }>()
defineEmits<{ change: [value: boolean] }>()
</script>
