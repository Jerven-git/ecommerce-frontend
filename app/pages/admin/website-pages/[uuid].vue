<template><AdminWebsiteEditorLoading /></template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const route = useRoute()
await navigateTo({ path: '/admin/website-editor', query: { customPage: String(route.params.uuid) } }, { replace: true })
</script>
