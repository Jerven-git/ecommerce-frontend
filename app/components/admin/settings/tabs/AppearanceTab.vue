<template>
  <AdminSettingsTheme v-model="form.theme" />
</template>

<script setup lang="ts">
defineProps<{
  form: Record<string, any>
}>()
</script>
