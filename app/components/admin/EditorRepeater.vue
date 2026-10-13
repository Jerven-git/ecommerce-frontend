<template>
  <section>
    <div class="mb-2 flex items-center justify-between gap-3">
      <h4 class="text-xs font-semibold text-admin-text">{{ title }}</h4>
      <button type="button" :disabled="!canAdd" class="min-h-9 rounded-lg px-2 text-[11px] font-semibold text-admin-accent-strong hover:bg-admin-soft disabled:cursor-not-allowed disabled:opacity-50" @click="$emit('add')">
        {{ addLabel }}
      </button>
    </div>
    <div class="space-y-3"><slot /></div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; addLabel: string; canAdd: boolean }>()
defineEmits<{ add: [] }>()
</script>
