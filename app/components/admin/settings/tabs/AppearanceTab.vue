<template>
  <AdminSettingsTheme
    v-model="form.theme"
    :saved-theme="savedTheme"
    :saved-hero="savedHero"
    @preset-applied="$emit('preset-applied', $event)"
  />
</template>

<script setup lang="ts">
import type { ThemeForm } from '~/components/admin/settings/Theme.vue'

defineProps<{
  form: Record<string, any>
  savedTheme: ThemeForm
  savedHero: { image: string, mime: string }
}>()

defineEmits<{
  'preset-applied': [value: { heroImage: string, heroMediaMime: string }]
}>()
</script>
