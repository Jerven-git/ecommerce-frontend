<template>
  <BaseModal :open="open" title="Leave without saving?" size="md" hide-close @close="emit('cancel')">
    <p class="text-sm leading-6 text-admin-muted">You have unsaved changes. Leaving now will discard changes made since your last save.</p>
    <template #footer>
      <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="admin-focus min-h-11 whitespace-nowrap rounded-lg border border-admin-border bg-admin-surface px-4 text-sm font-semibold text-admin-text hover:bg-admin-soft" @click="emit('cancel')">Stay in editor</button>
        <button type="button" class="admin-focus min-h-11 whitespace-nowrap rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700" @click="emit('leave')">Leave without saving</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ cancel: []; leave: [] }>()
</script>
