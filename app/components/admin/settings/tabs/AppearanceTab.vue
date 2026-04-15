<template>
  <AdminSettingsTheme v-model="form.theme" :saved-theme="savedTheme" />
</template>

<script setup lang="ts">
import type { ThemeForm } from '~/components/admin/settings/Theme.vue'

defineProps<{
  form: Record<string, any>
  savedTheme: ThemeForm
}>()
</script>
