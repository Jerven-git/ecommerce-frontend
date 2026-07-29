<template>
  <div role="alert" class="px-5 py-10 text-center">
    <p class="text-sm font-semibold text-admin-danger">{{ title }}</p>
    <p class="mx-auto mt-1 max-w-md text-sm text-admin-muted">{{ message }}</p>
    <AdminButton class="mt-4" variant="secondary" @click="$emit('retry')">
      Try again
    </AdminButton>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  message: string
}>(), {
  title: 'Couldn’t load this view',
})

defineEmits<{ retry: [] }>()
</script>
