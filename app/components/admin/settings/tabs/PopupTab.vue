<template>
  <AdminSettingsWelcomePopup v-model="form.welcome_popup" />
</template>

<script setup lang="ts">
defineProps<{
  form: Record<string, any>
}>()
</script>
