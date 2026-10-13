<template>
  <div class="rounded-xl border border-admin-border bg-admin-soft p-3">
    <div class="mb-2 flex items-center justify-between gap-3">
      <span class="text-[11px] font-semibold text-admin-muted">{{ label }}</span>
      <button type="button" class="min-h-9 rounded-lg px-2 text-[11px] font-semibold text-admin-danger hover:bg-admin-danger-soft" @click="$emit('remove')">Remove</button>
    </div>
    <div class="space-y-2"><slot /></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()
defineEmits<{ remove: [] }>()
</script>
