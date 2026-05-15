<template>
  <AdminSettingsTheme
    v-model="form.theme"
    :saved-theme="savedTheme"
    :saved-hero="savedHero"
    :saved-covers="savedCovers"
    @preset-applied="$emit('preset-applied', $event)"
  />
</template>

<script setup lang="ts">
import type { ThemeForm } from '~/components/admin/settings/Theme.vue'

interface PresetCovers {
  about: string
  blog: string
  services: string
  contact: string
}

defineProps<{
  form: Record<string, any>
  savedTheme: ThemeForm
  savedHero: { image: string, mime: string }
  savedCovers: PresetCovers
}>()

defineEmits<{
  'preset-applied': [value: { heroImage: string, heroMediaMime: string, covers: PresetCovers }]
}>()
</script>
