<template>
  <div class="space-y-5">
    <AdminSettingsWebsiteEditorNotice
      description="Popup visibility, heading, and body text are managed and previewed in Website Editor. The discount rule remains operational configuration here."
      :editor-to="{ path: '/admin/website-editor', query: { page: 'popup', section: 'welcome-popup' } }"
    />
    <AdminSettingsWelcomePopup v-model="form.welcome_popup" settings-only />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  form: Record<string, any>
}>()
</script>
