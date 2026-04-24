<template>
  <AdminSettingsModules v-model="form.modules_enabled" />
</template>

<script setup lang="ts">
defineProps<{
  form: Record<string, any>
}>()
</script>
