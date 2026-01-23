<template>
  <!-- Parent wrapper for all /admin/* routes -->
  <NuxtPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})
</script>
